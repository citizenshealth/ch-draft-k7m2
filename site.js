if(!document.documentElement.lang)document.documentElement.lang="en";
/* Shared behavior for every prototype page: header menus, site search, "next draft" notices. */
(function(){
  var $=function(id){return document.getElementById(id)};

  // Always start a new page at the top (or at its #section), instead of keeping the last scroll position
  try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}
  function toStart(){
    var h=(location.hash||'').slice(1), el=h&&document.getElementById(h);
    if(el&&!el.closest('dialog')) el.scrollIntoView(); else if(!h||!el) window.scrollTo(0,0);
  }
  toStart(); window.addEventListener('load',toStart); window.addEventListener('pageshow',toStart);

  // "Next draft" notice for pages not built yet
  var toast=$('toast'),tt;
  function say(msg){if(!toast)return;toast.textContent=msg;toast.hidden=false;clearTimeout(tt);tt=setTimeout(function(){toast.hidden=true},2600)}
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-soon]');
    if(a){e.preventDefault();say('That page comes in the next draft of the prototype.')}
  });

  // Mobile menu
  var menuBtn=$('menuBtn'),nav=$('mainnav');
  if(menuBtn&&nav) menuBtn.addEventListener('click',function(){var o=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',o)});

  // Mega menus: click to open (hover also opens on desktop via CSS)
  var mms=[].slice.call(document.querySelectorAll('.mm'));
  function closeAll(except){mms.forEach(function(m){if(m!==except){m.classList.remove('open');m.querySelector('.mm-btn').setAttribute('aria-expanded','false')}})}
  mms.forEach(function(m){
    var b=m.querySelector('.mm-btn');
    b.addEventListener('click',function(e){e.stopPropagation();var o=!m.classList.contains('open');closeAll(m);m.classList.toggle('open',o);b.setAttribute('aria-expanded',o)});
  });
  document.addEventListener('click',function(e){if(!e.target.closest('.mm'))closeAll()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeAll();var hs=$('hsearch');if(hs&&!hs.hidden){hs.hidden=true;$('searchBtn').setAttribute('aria-expanded','false')}}});

  // Header search panel
  var sBtn=$('searchBtn'),hs=$('hsearch');
  if(sBtn&&hs) sBtn.addEventListener('click',function(){hs.hidden=!hs.hidden;sBtn.setAttribute('aria-expanded',!hs.hidden);if(!hs.hidden)$('hq').focus()});

  // Site search index
  var idx=[
    ['Obstetrics & Maternity Suites','Service','obstetrics.html','pregnancy prenatal delivery baby birth ob labor maternity'],
    ['Emergency Room','Service','emergency.html','er trauma emergency 24'],
    ['Urgent Care','Service','index.html#care','walk in sick injury same day'],
    ['General Surgery','Service','surgery.html','surgeon operation hernia gallbladder colonoscopy'],
    ['Specialty Clinic','Service','specialty-clinic.html','specialist cardiology neurology urology ent'],
    ['Oncology & Infusion','Service','oncology-infusion.html','oncology cancer infusion chemotherapy hematology KU Cancer Center iv'],
    ['Imaging & Radiology','Service','imaging.html','x-ray ct mri ultrasound mammogram dexa pet'],
    ['Laboratory','Service','laboratory.html','lab blood test drug test'],
    ['Rehabilitation','Service','rehabilitation.html','physical therapy occupational speech massage'],
    ['Respiratory Therapy','Service','respiratory-therapy.html','lung breathing ekg stress test sleep'],
    ['Home Medical Equipment','Service','medical-equipment.html','walker wheelchair oxygen cpap crutches dme'],
    ['Medications during pregnancy','Page','obstetrics.html#medications','safe medicine tylenol pregnant'],
    ['Lactation counselors','Page','obstetrics.html#after','breastfeeding lactation'],
    ['Visiting hours','Page','medical-center.html#visiting','visit visitors wifi'],
    ['Phone directory','Page','medical-center.html#directory','phone number department call'],
    ['Pay a Bill','Page','https://mychart.ochin.org/cmciks/billing/guestpay','billing payment pay my bill'],
    ['MyChart','Page','https://www.cmciks.com/patients-visitors/patient-portal/','patient portal login'],
    ['Citizens Medical Center','Location','medical-center.html','hospital'],
    ['Family Center for Health Care','Location','index.html#locations','clinic fchc'],
    ['Prairie Senior','Location','prairie-senior.html','senior long-term care nursing home rehabilitation'],
    ['Special Care Unit (memory care)','Prairie Senior','prairie-senior.html#scu','alzheimers dementia memory care'],
    ['Paying for long-term care','Prairie Senior','prairie-senior.html#paying','medicaid kancare cost'],
    ['Citizens Foundation','Give','foundation.html','donate give gift foundation'],
    ['Careers & open jobs','Careers','careers.html','jobs employment hiring work apply bamboo'],
    ['All services A–Z','Services','services.html','services list directory a-z all departments'],
    ['Información en español','Español','espanol.html','espanol español spanish ayuda'],
    ['Accessibility','About','accessibility.html','accessibility ada screen reader interpreter'],
    ['Sam McLemore, DPT','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Tina Harris, PT, DPT','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Josh Pearson, PT, DPT','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Karly Pearson, DPT','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Halie Forbes, OTR/L','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Mikayla Simons, OTD, CLT','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Mackenzie Best, M.S., CCC-SLP','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Derick Bacon, PTA','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Jennifer Bacon, PTA','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Jeremiah Moss, PTA','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Mandee Hilbrink, PTA','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Sam Sabatka, PTA','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Melissa Schmidt, PTA','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Emily Slinger, PTA','Rehab team','rehabilitation.html#team','rehab therapist physical occupational speech'],
    ['Michael Goode, CRNA','Pain management','sc-pain-management.html','pain management injections'],
    ['Specialty Clinic','Service','specialty-clinic.html','specialists visiting specialty clinic'],
    ['Planning your hospital stay','Patients','hospital-stay.html','hospital stay what to bring admission registration'],
    ['Orthopedics','Services','orthopedics.html','orthopedics ortho joint knee hip replacement sports injury bone fracture'],
    ['Emergency & trauma care','Services','emergency.html','emergency er trauma 911 stroke'],
    ['Schedule an appointment','Patients','schedule.html','schedule appointment book visit'],
    ['For health care professionals','Professionals','professionals.html','refer referral fax orders credentialing medical staff professionals'],
    ['Contact us','About','contact.html','contact phone email message address'],
    ['About Citizens Health','About','about.html','about story mission history'],
    ['Classes & events','About','about.html#events','classes events calendar birthing'],
    ['Common questions (FAQ)','About','about.html#faq','faq questions what to bring hospital stay'],
    ['Student rotations & classes','Careers','careers.html#education','acls pals tncc student clinical observation education'],
    ['Physician recruitment','Careers','careers.html#providers','physician recruit provider practice'],
    ['Memorial gifts','Give','foundation.html#memorials','memorial in memory honor'],
    ['Scholarships','Give','foundation.html#scholarships','scholarship nursing student'],
    ['Volunteer','Give','foundation.html#volunteer','volunteer'],
    ['Palace Drug Store','Location','palace-drug.html','pharmacy prescriptions drug store'],
    ['Prescription refills','Palace Drug Store','palace-drug.html#refills','refill pharmacy rx medication']
  ];
  (window.CH_SERVICES||[]).forEach(function(s){if(!idx.some(function(r){return r[0].toLowerCase()===s.n.toLowerCase()}))idx.push([s.n,'Service',s.u,s.d+' '+(s.k||'')])});
  (window.CH_PROVIDERS||[]).forEach(function(p){idx.push([p.name+(p.cred?', '+p.cred:''),'Provider','providers.html#'+p.id,(p.aka||'')+' '+p.role+' '+p.spec.join(' ')+' '+p.type])});
  (window.CH_VISITING||[]).forEach(function(v){idx.push([v.name,'Specialist','providers.html#visiting',v.spec])});
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function run(input){
    var out=$(input.dataset.results),v=input.value.trim().toLowerCase();
    if(!v){out.hidden=true;out.innerHTML='';return}
    var words=v.split(/\s+/).filter(Boolean);
    function re(x){return x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
    function has(hay,w){if(new RegExp('(^|[^a-z0-9])'+re(w)).test(hay))return true;if(w.length>5){var stem=w.slice(0,Math.max(5,w.length-4));return new RegExp('(^|[^a-z0-9])'+re(stem)).test(hay)}return false}
    var hits=idx.map(function(r){var name=r[0].toLowerCase(),hay=(r[0]+' '+r[1]+' '+r[3]).toLowerCase();
      if(!words.every(function(w){return has(hay,w)}))return null;
      function whole(h,w){return new RegExp('(^|[^a-z0-9])'+re(w)+'([^a-z0-9]|$)').test(h)}
      var score=words.every(function(w){return whole(name,w)})?0:words.every(function(w){return whole(hay,w)})?1:name.indexOf(v)===0?2:name.indexOf(v)>-1?3:4;
      return [score,r]}).filter(Boolean).sort(function(a,b){return a[0]-b[0]}).map(function(x){return x[1]}).slice(0,7);
    out.innerHTML=hits.length?hits.map(function(r){return '<li><a href="'+r[2]+'"><span>'+esc(r[0])+'</span><span class="kind">'+r[1]+'</span></a></li>'}).join(''):'<li class="empty">No matches yet. Try a provider name, a service, or "bill".</li>';
    out.hidden=false;
  }
  [].slice.call(document.querySelectorAll('.js-search')).forEach(function(i){i.addEventListener('input',function(){run(i)})});
  document.addEventListener('click',function(e){
    var c=e.target.closest('.chip[data-for]');
    if(c){var i=$(c.dataset.for);i.value=c.textContent;run(i);i.focus()}
  });
})();

/* Rotate the homepage "Try:" suggestions on each page load */
(function(){
  var box=document.querySelector('.hsearch-in .chips'); if(!box) return;
  var pool=['Obstetrics','Imaging','Pay a Bill','Urgent Care','Physical therapy','MRI','Mammography','Lab','Orthopedics','Careers','Medical records','Refills','Visiting hours','Cardiology','Audiology','Memory care','Price estimate','Walk-in'];
  try{(window.CH_PROVIDERS||[]).filter(function(p){return p.accepting===true}).forEach(function(p){pool.push(p.name.split(' ').pop())})}catch(e){}
  for(var i=pool.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=pool[i];pool[i]=pool[j];pool[j]=t}
  var names=[];try{names=(window.CH_PROVIDERS||[]).map(function(p){return p.name.split(' ').pop()})}catch(e){}
  var pick=[],np=0;pool.forEach(function(w){if(pick.length>=4)return;var isName=names.indexOf(w)>-1;if(isName&&np)return;if(isName)np++;pick.push(w)});
  box.querySelectorAll('.chip').forEach(function(b){b.remove()});
  pick.forEach(function(w){var b=document.createElement('button');b.className='chip';b.type='button';b.setAttribute('data-for','q');b.textContent=w;box.appendChild(b)});
})();

/* Pin header (and on-page section tabs) to the top while scrolling.
   Uses fixed positioning with placeholders, so it works even inside frames where CSS sticky can't. */
(function(){
  var hdr=document.querySelector('header.site'); if(!hdr) return;
  var subs=[].slice.call(document.querySelectorAll('.subnav,.aztools'));
  function wrap(el){var ph=document.createElement('div');ph.className='pin-ph';el.parentNode.insertBefore(ph,el);return {el:el,ph:ph}}
  var items=[wrap(hdr)].concat(subs.map(wrap));
  function update(){
    var off=0;
    items.forEach(function(it,i){
      var el=it.el,ph=it.ph,pinned=el.classList.contains('pinned');
      var h=el.offsetHeight;
      var top=ph.getBoundingClientRect().top;
      if(top<=off){ if(!pinned){ph.style.height=h+'px';el.classList.add('pinned');} el.style.top=off+'px'; off+=el.offsetHeight; }
      else if(pinned){ el.classList.remove('pinned');el.style.top='';ph.style.height='0px'; }
    });
  }
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',function(){items.forEach(function(it){if(it.el.classList.contains('pinned'))it.ph.style.height=it.el.offsetHeight+'px'});update()});
  update();
})();

/* Show a fade on the on-page tab bar when more tabs are hidden off to the right */
(function(){
  [].slice.call(document.querySelectorAll('.subnav')).forEach(function(n){
    var w=n.querySelector('.wrap'); if(!w) return;
    function upd(){n.classList.toggle('more-right', w.scrollWidth-w.clientWidth-w.scrollLeft>4)}
    w.addEventListener('scroll',upd,{passive:true}); window.addEventListener('resize',upd); upd();
  });
})();

/* Provider profile panel on any page: opens in place instead of leaving for providers.html */
(function(){
  if(/providers\.html$/.test(location.pathname)) return;
  var LOC={fchc:{n:'Family Center for Health Care',ph:'(785) 462-6184'},cmc:{n:'Citizens Medical Center',ph:'(785) 462-7511'},sc:{n:'the Specialty Clinic',ph:'(785) 460-1223'}};
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ini(n){return n.split(' ').map(function(w){return w[0]}).slice(0,2).join('')}
  function find(id){var P=window.CH_PROVIDERS||[];for(var i=0;i<P.length;i++)if(P[i].id===id)return P[i];return null}
  var dlg;
  function ensure(){
    if(dlg) return dlg;
    dlg=document.createElement('dialog');dlg.className='profile';dlg.id='chprof';dlg.setAttribute('aria-labelledby','chpf-name');
    dlg.innerHTML='<div class="pf" id="chpf"></div>';document.body.appendChild(dlg);
    dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
    return dlg;
  }
  window.chOpenProfile=function(id){
    var p=find(id); if(!p) return false;
    var L=p.loc?LOC[p.loc]:null, er=p.spec.indexOf('Emergency')>-1, uc=p.spec.indexOf('Urgent Care')>-1;
    if(uc&&!er) L=LOC.fchc;
    var ph=p.photo?'<img class="ph" src="img/people/'+p.photo+'.jpg" alt="Portrait of '+esc(p.name)+'">':'<span class="ph" aria-hidden="true">'+ini(p.name)+'</span>';
    var acc=p.accepting===true?'Yes':p.accepting===false?'Not at this time':'';
    var sched=er?(uc?'<div class="sched"><p>Sees patients in Urgent Care at Family Center and in our Emergency Room.</p></div>':'')
      : p.accepting===false?'<div class="sched"><p>Not accepting new patients right now. Current patients can schedule through MyChart or by calling</p><b>'+(L?L.ph:'(785) 462-6184')+'</b></div>'
      : '<div class="sched"><p>To schedule, call '+(L?esc(L.n):'our main line')+'</p><b>'+(p.phone||(L?L.ph:'(785) 462-7511'))+'</b><p>Current patients can also request appointments in MyChart.</p></div>';
    var f=[];
    if(p.days)f.push(['Clinic days',esc(p.days)]);
    if(p.nurse)f.push(['Nurse',esc(p.nurse)+'<br><span style="font-weight:500;color:var(--muted)">'+esc(p.nursePhone||'')+'</span>']);
    if(acc)f.push(['New patients',acc]);
    f.push(['Specialties',esc(p.spec.join(', '))]);
    var d=ensure();
    document.getElementById('chpf').innerHTML='<div class="pf-top"><span class="eyebrow">'+esc(p.type)+'</span><button class="pf-close" type="button">Close</button></div>'
      +'<div class="pf-head">'+ph+'<div><h2 id="chpf-name">'+esc(p.name)+'</h2>'+(p.cred?'<p class="cred">'+esc(p.cred)+'</p>':'')+'<p class="role">'+esc(p.role)+'</p>'+(p.accepting===true?'<span class="pill" style="margin-top:10px;display:inline-block">Accepting new patients</span>':'')+'</div></div>'
      +sched
      +'<dl class="facts2">'+f.map(function(x,i){return '<div'+(i===f.length-1&&f.length%2?' style="grid-column:1/-1"':'')+'><dt>'+x[0]+'</dt><dd>'+x[1]+'</dd></div>'}).join('')+'</dl>'
      +(p.bio?'<div class="about"><h3 class="pfh">About</h3>'+p.bio.split('\n\n').map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+'</div>':'')
      +(p.edu?'<div><h3 class="pfh">Education &amp; training</h3><ul class="pfedu">'+p.edu.map(function(e){var k=e.split(' | ');return '<li>'+(k.length>1?'<span class="edk">'+esc(k[0])+'</span>'+esc(k[1]):esc(e))+'</li>'}).join('')+'</ul></div>':'')
      +'<p><a class="more" href="providers.html">See all providers →</a></p>';
    d.querySelector('.pf-close').onclick=function(){d.close()};
    if(!d.open) d.showModal();
    d.scrollTop=0;
    return true;
  };
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="providers.html#"]'); if(!a||e.metaKey||e.ctrlKey||e.shiftKey) return;
    var id=a.getAttribute('href').split('#')[1]; if(!id||id==='visiting'||id==='accepting') return;
    if(window.chOpenProfile(id)) e.preventDefault();
  });
})();

/* Message panel: "Send us a message" opens a form on the current page */
(function(){
  if(/contact\.html$/.test(location.pathname)) return;
  var TO=['Citizens Medical Center','Family Center for Health Care','Prairie Senior','Palace Drug Store','Citizens Foundation','Billing & Financial Services','Careers & Human Resources'];
  var dlg;
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function open(to,topic){
    if(!dlg){dlg=document.createElement('dialog');dlg.className='profile msgpanel';dlg.setAttribute('aria-labelledby','mp-h');document.body.appendChild(dlg);
      dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()})}
    var opts=TO.slice(); if(to&&opts.indexOf(to)<0) opts.unshift(to);
    dlg.innerHTML='<div class="pf"><div class="pf-top"><span class="eyebrow">Send a message</span><button class="pf-close" type="button">Close</button></div>'
      +'<div><h2 id="mp-h">'+esc(topic||'Send us a message')+'</h2><p class="mp-sub">We\'ll get back to you within two business days.</p></div>'
      +'<form class="cform mpform"><div class="two"><div><label for="mp1">First name</label><input id="mp1" required autocomplete="given-name"></div><div><label for="mp2">Last name</label><input id="mp2" required autocomplete="family-name"></div></div>'
      +'<div class="two"><div><label for="mp3">Email</label><input id="mp3" type="email" required autocomplete="email"></div><div><label for="mp6">Phone <span class="opt">(optional)</span></label><input id="mp6" type="tel" autocomplete="tel"></div></div>'
      +'<div><label for="mp4">Who should receive this?</label><select id="mp4" required><option value="">Choose one</option>'+opts.map(function(o){return '<option'+(o===to?' selected':'')+'>'+esc(o)+'</option>'}).join('')+'</select></div>'
      +'<div><label for="mp5">Message</label><textarea id="mp5" rows="5"></textarea></div>'
      +'<p class="warn">Please don\'t include medical details. For questions about your care, message your provider in MyChart.</p>'
      +'<div><button class="btn btn-dark" type="submit">Send message</button></div></form></div>';
    dlg.querySelector('.pf-close').onclick=function(){dlg.close()};
    dlg.querySelector('form').addEventListener('submit',function(e){e.preventDefault();
      this.outerHTML='<div class="sent" role="status"><b>Thanks. This is a prototype, so nothing was sent.</b><br>On the live site, this form goes straight to '+esc(this.querySelector('select').value)+', and you stay on this page.</div><p><button class="btn btn-dark mp-done" type="button">Back to the page</button></p>';
      dlg.querySelector('.mp-done').onclick=function(){dlg.close()}});
    if(!dlg.open) dlg.showModal();
    dlg.querySelector('#mp1').focus();
  }
  window.chOpenMessage=open;
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-msg],a[href^="contact.html#message"]'); if(!a||e.metaKey||e.ctrlKey) return;
    e.preventDefault(); open(a.getAttribute('data-to')||'',a.getAttribute('data-topic')||'');
  });
})();

/* Links that leave the site (and PDFs) open in a new tab so visitors keep their place */
(function(){
  function mark(a){
    if(a.dataset.ext) return; var h=a.getAttribute('href')||'';
    if(!/^https?:\/\//i.test(h)&&!/\.pdf(\?|#|$)/i.test(h)) return;
    try{ if(/^https?:/i.test(h) && new URL(h).host===location.host) return; }catch(e){ return; }
    a.dataset.ext='1'; a.target='_blank'; a.rel='noopener';
    if(!a.querySelector('.sr-only')){var s=document.createElement('span');s.className='sr-only';s.textContent=' (opens in a new tab)';a.appendChild(s)}
  }
  function scan(root){(root.querySelectorAll?root:document).querySelectorAll('a[href]').forEach(mark)}
  scan(document);
  new MutationObserver(function(m){m.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType===1){if(n.matches&&n.matches('a[href]'))mark(n);scan(n)}})})}).observe(document.body,{childList:true,subtree:true});
})();
