#!/usr/bin/env python3
"""Build one static page per local provider (<first>-<last>.html) from providers.js,
plus a short link (<last>.html) that forwards to it when no one else shares that last name.
These pages are for brochures, business cards and Google; the Find a Provider pop-up does not link to them.

Run from the repo root:  python3 tools/provider_pages.py
To remove the feature: run with --remove (deletes every page this script made).
"""
import html, json, re, subprocess, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

data = json.loads(subprocess.check_output(
    ['node', '-e', "global.window={};require('./providers.js');process.stdout.write(JSON.stringify(window.CH_PROVIDERS))"]))

LOC = {
    'fchc': ('Family Center for Health Care', '1525 S. Franklin Ave.', '(785) 462-6184', 'family-center.html'),
    'cmc': ('Citizens Medical Center', '1525 S. Franklin Ave.', '(785) 462-7511', 'medical-center.html'),
    'sc': ('Specialty Clinic, Citizens Medical Center', '1525 S. Franklin Ave.', '(785) 460-1223', 'specialty-clinic.html'),
}
BASE = 'https://citizenshealth.github.io/ch-draft-k7m2/'  # swap for the live domain at launch

def slug(p):
    return re.sub(r'[^a-z0-9]+', '-', p['name'].lower()).strip('-') + '.html'

MANIFEST = 'tools/provider-pages.json'
import sys

def e(s):
    return html.escape(str(s), quote=True)

src = open('providers.html', encoding='utf-8').read()
head = src[:src.index('<main id="main">')]
tail = src[src.index('</main>') + len('</main>'):]
tail = tail[:tail.index('<div class="toast"')] if '<div class="toast"' in tail else tail[:tail.index('<script')]
scripts = '\n'.join(re.findall(r'<script src="(?:services-data|site)\.js[^"]*"></script>', src))
PAGE_CSS = """<style>
.pfpage{max-width:880px;padding:8px 0 72px}
.pfpage .pf-head{grid-template-columns:200px minmax(0,1fr)}
.pfpage .pf-head .ph{width:200px}
.pfpage h1{font-size:clamp(32px,4.4vw,46px);font-weight:800;letter-spacing:-.02em}
.pfpage .back{display:inline-block;margin-top:8px;color:var(--action);font-weight:700}
@media (max-width:520px){.pfpage .pf-head{grid-template-columns:120px minmax(0,1fr)}.pfpage .pf-head .ph{width:120px}}
</style>
"""

old = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else []
for f in old + glob.glob('provider-*.html'):
    if os.path.exists(f):
        os.remove(f)
if '--remove' in sys.argv:
    os.path.exists(MANIFEST) and os.remove(MANIFEST)
    sys.exit('removed %d pages' % len(old))

made = []
for p in data:
    if 'Leadership' in p['spec'] and len(p['spec']) == 1:
        continue  # leadership has its own page
    loc = LOC.get(p.get('loc'))
    er = 'Emergency' in p['spec']; uc = 'Urgent Care' in p['spec']
    if uc and not er:
        loc = LOC['fchc']
    full = p['name'] + (', ' + p['cred'] if p.get('cred') else '')
    photo = ('<img class="ph" src="img/people/%s.jpg" alt="Portrait of %s">' % (e(p['photo']), e(p['name']))
             if p.get('photo') else '<span class="ph" aria-hidden="true">%s</span>' % e(''.join(w[0] for w in p['name'].split()[:2])))
    if er:
        sched = '<div class="sched"><p>Sees patients in Urgent Care at Family Center and in our Emergency Room.</p></div>' if uc else ''
    elif p.get('accepting') is False:
        sched = '<div class="sched"><p>Not accepting new patients right now. Current patients can schedule through MyChart or by calling</p><b>%s</b></div>' % (loc[2] if loc else '(785) 462-6184')
    else:
        sched = '<div class="sched"><p>To schedule, call %s</p><b>%s</b><p>Current patients can also request appointments in MyChart.</p></div>' % (
            e(loc[0]) if loc else 'our main line', p.get('phone') or (loc[2] if loc else '(785) 462-7511'))
    facts = []
    if p.get('days'): facts.append(('Clinic days', e(p['days'])))
    if p.get('nurse'): facts.append(('Nurse', '%s<br><span style="font-weight:500;color:var(--muted)">%s</span>' % (e(p['nurse']), e(p.get('nursePhone', '')))))
    if p.get('accepting') is True: facts.append(('New patients', 'Yes'))
    elif p.get('accepting') is False: facts.append(('New patients', 'Not at this time'))
    if loc: facts.append(('Location', '<a href="%s">%s</a><br><span style="font-weight:500;color:var(--muted)">%s, Colby</span>' % (loc[3], e(loc[0]), e(loc[1]))))
    facts.append(('Specialties', e(', '.join(p['spec']))))
    dl = '<dl class="facts2">' + ''.join(
        '<div%s><dt>%s</dt><dd>%s</dd></div>' % (' style="grid-column:1/-1"' if i == len(facts) - 1 and len(facts) % 2 else '', k, v)
        for i, (k, v) in enumerate(facts)) + '</dl>'
    bio = ''
    if p.get('bio'):
        bio = '<div class="about"><h2 class="pfh" style="font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:8px">About</h2>' + ''.join('<p>%s</p>' % e(x) for x in p['bio'].split('\n\n')) + '</div>'
    edu = ''
    if p.get('edu'):
        items = []
        for x in p['edu']:
            k = x.split(' | ')
            items.append('<li>%s</li>' % ('<span class="edk">%s</span>%s' % (e(k[0]), e(k[1])) if len(k) > 1 else e(x)))
        edu = '<div><h2 style="font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:8px">Education &amp; training</h2><ul>%s</ul></div>' % ''.join(items)

    is_doc = bool(re.search(r'\b(M\.D\.|D\.O\.)', p.get('cred', '')))
    ld = {
        '@context': 'https://schema.org',
        '@type': 'Physician' if is_doc else 'Person',
        'name': full,
        'url': BASE + slug(p),
    }
    if p.get('photo'): ld['image'] = BASE + 'img/people/%s.jpg' % p['photo']
    if is_doc:
        ld['address'] = {'@type': 'PostalAddress', 'streetAddress': '1525 S. Franklin Ave.', 'addressLocality': 'Colby', 'addressRegion': 'KS', 'postalCode': '67701', 'addressCountry': 'US'}
        if loc: ld['telephone'] = loc[2]
        ld['isAcceptingNewPatients'] = p.get('accepting') is True
    else:
        ld['jobTitle'] = p['role']
        ld['worksFor'] = {'@type': 'MedicalOrganization', 'name': loc[0] if loc else 'Citizens Health'}

    where = loc[0] if loc else 'Citizens Health'
    if er and uc: where = 'Family Center for Health Care and the Citizens Medical Center Emergency Room'
    desc = '%s · %s · %s, Colby, Kansas.%s' % (full, p['role'], where, ' Accepting new patients.' if p.get('accepting') is True else '')
    body = ('<main id="main">\n  <div class="wrap">\n    <article class="pf pfpage" data-desc="' + e(desc) + '">\n'
            '      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><a href="providers.html">Find a Provider</a><span aria-hidden="true">/</span><span>%s</span></nav>\n'
            '      <div class="pf-head">%s<div><p class="eyebrow">%s</p><h1>%s</h1>%s<p class="role">%s</p>%s</div></div>\n'
            '      %s\n      %s\n      %s\n      %s\n'
            '      <p><a class="back" href="providers.html">← All providers</a></p>\n'
            '    </article>\n  </div>\n</main>\n') % (
        e(p['name']), photo, e(p['type']), e(p['name']),
        '<p class="cred">%s</p>' % e(p['cred']) if p.get('cred') else '', e(p['role']),
        '<span class="pill" style="margin-top:10px;display:inline-block">Accepting new patients</span>' if p.get('accepting') is True else '',
        sched, dl, bio, edu)
    page = head
    page = re.sub(r'<title>[^<]*</title>', '<title>%s · %s · Citizens Health, Colby KS</title>' % (e(full), e(p['role'])), page, count=1)
    page = page.replace('</head>', PAGE_CSS + '<script type="application/ld+json">%s</script>\n</head>' % json.dumps(ld), 1)
    page += body + tail + scripts + '\n</body>\n</html>\n'
    open(slug(p), 'w', encoding='utf-8').write(page)
    made.append((p['id'], slug(p)))

# Short links: last name only, skipped when two providers (local or visiting) share it
vis = json.loads(subprocess.check_output(
    ['node', '-e', "global.window={};require('./providers.js');process.stdout.write(JSON.stringify(window.CH_VISITING))"]))
def last_parts(name):
    return re.sub(r'[^a-z\-]', '', name.split(',')[0].split()[-1].lower()).split('-')
count = {}
for n in [p['name'] for p in data] + [v['name'] for v in vis]:
    for part in last_parts(n):
        count[part] = count.get(part, 0) + 1
existing = set(glob.glob('*.html')) - set(f for _, f in made)
aliases = []
for pid, f in made:
    p = next(x for x in data if x['id'] == pid)
    parts = last_parts(p['name'])
    short = '-'.join(parts) + '.html'
    if any(count[x] > 1 for x in parts) or short in existing or short == f:
        continue
    open(short, 'w').write('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>%s · Citizens Health</title>\n'
        '<meta http-equiv="refresh" content="0; url=%s">\n<link rel="canonical" href="%s">\n<meta name="robots" content="noindex">\n</head>\n'
        '<body><p><a href="%s">%s</a></p></body>\n</html>\n' % (e(p['name']), f, f, f, e(p['name'])))
    aliases.append(short)
json.dump([f for _, f in made] + aliases, open(MANIFEST, 'w'), indent=0)
print(len(made), 'provider pages,', len(aliases), 'short links')
skipped = [x for x in (next(p for p in data if p['id']==pid)['name'] for pid, _ in made)
           if '-'.join(last_parts(x)) + '.html' not in aliases]
print('no short link (name shared):', ', '.join(skipped))
