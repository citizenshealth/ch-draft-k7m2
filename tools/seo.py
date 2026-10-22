#!/usr/bin/env python3
"""Search engine and link-preview tags for every page, plus sitemap.xml.

Run from the repo root after editing pages:  python3 tools/seo.py
Safe to re-run: it replaces the block between <!-- seo --> and <!-- /seo -->.

At launch:
  - set BASE to the live domain
  - set PROTOTYPE = False (removes the noindex tag so Google can list the site)
"""
import glob, html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

BASE = 'https://citizenshealth.github.io/ch-draft-k7m2/'
PROTOTYPE = True
DEFAULT_IMG = 'img/photos/cmc-exterior.jpg'
ADDR = {'@type': 'PostalAddress', 'streetAddress': '1525 S. Franklin Ave.', 'addressLocality': 'Colby',
        'addressRegion': 'KS', 'postalCode': '67701', 'addressCountry': 'US'}
GEO_PAGES = ('sc-', 'fc-')
LOCAL_TITLE = set(['emergency.html', 'family-center.html', 'medical-center.html', 'obstetrics.html', 'orthopedics.html',
                   'surgery.html', 'imaging.html', 'laboratory.html', 'rehabilitation.html', 'respiratory-therapy.html',
                   'oncology-infusion.html', 'specialty-clinic.html', 'medical-equipment.html', 'palace-drug.html',
                   'prairie-senior.html'])

# Descriptions written by hand where the page has no usable lead sentence, or where a short one needs place context.
OVERRIDE = {
    'index.html': 'Citizens Medical Center and Family Center for Health Care in Colby, Kansas, with a 24-hour Emergency Room, Maternity Suites, and visiting specialists.',
    'providers.html': 'Find a provider at Citizens Health in Colby, Kansas. Search our family medicine, obstetrics, surgery, and emergency providers, and visiting specialists.',
    'hospital-stay.html': 'What to bring, what to expect, and who to call during a stay at Citizens Medical Center in Colby, Kansas.',
    'emergency.html': 'The Emergency Room at Citizens Medical Center in Colby, Kansas, is open 24 hours a day, every day. For a life-threatening emergency, call 911.',
    'palace-drug.html': 'Your hometown pharmacy in downtown Colby, part of Citizens Health, for prescriptions, refills, and transfers.',
    'foundation.html': 'The Citizens Foundation supports Citizens Health in Colby, Kansas, through community giving, memorials, and volunteers.',
}

def text(s):
    s = re.sub(r'<[^>]+>', '', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()

def lead(page):
    m = re.search(r'data-desc="([^"]*)"', page)
    if m:
        return html.unescape(m.group(1))
    m = re.search(r'<p class="lede"[^>]*>(.*?)</p>', page, re.S)
    if not m:
        m = re.search(r'<div class="pagehead">.*?<h1[^>]*>.*?</h1>\s*<p[^>]*>(.*?)</p>', page, re.S)
    return text(m.group(1)) if m else ''

def clip(s, n=160):
    if len(s) <= n:
        return s
    cut = s[:n - 1].rsplit(' ', 1)[0].rstrip(',;:')
    return cut + '…'

def ld_for(f, title, desc):
    org = {'@type': 'Organization', 'name': 'Citizens Health', 'url': BASE}
    if f == 'index.html':
        return {'@context': 'https://schema.org', '@type': 'MedicalOrganization', 'name': 'Citizens Health',
                'url': BASE, 'logo': BASE + 'img/logo.png', 'telephone': '(785) 462-7511', 'address': ADDR,
                'subOrganization': [{'@type': 'Hospital', 'name': 'Citizens Medical Center', 'url': BASE + 'medical-center.html'},
                                    {'@type': 'MedicalClinic', 'name': 'Family Center for Health Care', 'url': BASE + 'family-center.html'}]}
    if f == 'medical-center.html':
        return {'@context': 'https://schema.org', '@type': 'Hospital', 'name': 'Citizens Medical Center', 'url': BASE + f,
                'telephone': '(785) 462-7511', 'address': ADDR, 'parentOrganization': org,
                'image': BASE + 'img/photos/cmc-exterior.jpg'}
    if f == 'emergency.html':
        return {'@context': 'https://schema.org', '@type': 'EmergencyService', 'name': 'Citizens Medical Center Emergency Room',
                'url': BASE + f, 'telephone': '(785) 462-7511', 'address': ADDR, 'openingHours': 'Mo-Su 00:00-23:59',
                'parentOrganization': org}
    if f == 'family-center.html':
        return {'@context': 'https://schema.org', '@type': 'MedicalClinic', 'name': 'Family Center for Health Care',
                'url': BASE + f, 'telephone': '(785) 462-6184', 'address': ADDR, 'parentOrganization': org,
                'image': BASE + 'img/photos/fchc-facade.jpg'}
    return None

pages = sorted(f for f in glob.glob('*.html') if 'http-equiv="refresh"' not in open(f, encoding='utf-8').read())
report = []
for f in pages:
    page = open(f, encoding='utf-8').read()
    page = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', page, flags=re.S)
    m = re.search(r'<title>([^<]*)</title>', page)
    title = html.unescape(m.group(1))
    if f == 'index.html':
        title = 'Citizens Health · Hospital and Clinics in Colby, Kansas'
    elif (f in LOCAL_TITLE or f.startswith(GEO_PAGES)) and 'Colby' not in title:
        title = title.replace(' · Citizens Health', ' in Colby, KS · Citizens Health')
    page = page.replace(m.group(0), '<title>%s</title>' % html.escape(title, quote=False), 1)

    desc = OVERRIDE.get(f) or lead(page)
    if f.startswith('sc-') and 'Colby' not in desc:
        desc += ' At the Specialty Clinic in Colby, Kansas.'
    elif f.startswith('fc-') and 'Colby' not in desc:
        desc += ' At Family Center for Health Care in Colby, Kansas.'
    desc = clip(desc)

    im = re.search(r'class="hero-bg" src="([^"]+)"', page) or re.search(r'class="ph" src="(img/people/[^"]+)"', page) \
        or re.search(r'<img src="(img/photos/[^"]+)"', page)
    img = im.group(1) if im else DEFAULT_IMG
    lang = 'es_US' if f.startswith('es') else 'en_US'
    tags = ['<!-- seo -->',
            '<meta name="description" content="%s">' % html.escape(desc),
            '<meta property="og:site_name" content="Citizens Health">',
            '<meta property="og:type" content="%s">' % ('profile' if 'data-desc=' in page else 'website'),
            '<meta property="og:title" content="%s">' % html.escape(title),
            '<meta property="og:description" content="%s">' % html.escape(desc),
            '<meta property="og:url" content="%s">' % (BASE + ('' if f == 'index.html' else f)),
            '<meta property="og:image" content="%s">' % (BASE + img),
            '<meta property="og:locale" content="%s">' % lang,
            '<meta name="twitter:card" content="summary_large_image">',
            '<link rel="canonical" href="%s">' % (BASE + ('' if f == 'index.html' else f))]
    if PROTOTYPE:
        tags.append('<meta name="robots" content="noindex, nofollow">')
    ld = ld_for(f, title, desc)
    if ld:
        tags.append('<script type="application/ld+json">%s</script>' % json.dumps(ld))
    tags.append('<!-- /seo -->')
    page = page.replace('</title>', '</title>\n' + '\n'.join(tags), 1)
    open(f, 'w', encoding='utf-8').write(page)
    report.append((f, title, len(desc), desc))

urls = ''.join('  <url><loc>%s</loc></url>\n' % (BASE + ('' if f == 'index.html' else f)) for f in pages)
open('sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s</urlset>\n' % urls)
for r in report:
    print('%-34s %3d  %s\n%38s%s' % (r[0], r[2], r[1], '', r[3]))
