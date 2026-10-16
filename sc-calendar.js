/* Specialty Clinic calendar.
   Prototype: RAW holds a copy of October 2026 from the Specialty Clinic's Google Calendar, typed the way staff enter it.
   Live site: the server reads the Google Calendar feed every hour and fills RAW the same way. */
(function(){
  var YEAR=2026, MONTH=10;
  var RAW={1:["KANADE-T","ADAM HORINEK-SKIN CARE","DEIBERT","HAERI-T","AMBER WITHINGTON","PACK","LARSON","SASHA EDWARDS-T"],2:["DEIBERT","AMBER WITHINGTON","LARSON","FITZPATRICK"],3:["AMBER/KU CONFERENCE***"],5:["HERRENBRUCK-OR","ADAM HORINEK-OR","AMBER WITHINGTON","**CRAWLEY","JONES","LARSON","CLIFFORD***"],6:["ADAM HORINEK-CLINIC","**JANIF","AMBER WITHINGTON","LARSON","FITZPATRICK","SASHA EDWARDS-T","HERRENBRUCK-CLINIC"],7:["ADAM HORINEK-CLINIC","GABEL","AMBER WITHINGTON","LEIS-T","DEIBERT","HINZE","GEORGE","SASHA EDWARDS-T"],8:["DEIBERT","ADAM HORINEK-SKIN CARE","WITMAN","AMBER WITHINGTON","LARSON","SASHA EDWARDS-T"],9:["DEIBERT","AMBER WITHINGTON","LARSON"],12:["WITMAN","ADAM HORINEK-OR","AMBER WITHINGTON","HORINEK-OR","DASSOUKI","LARSON","**M. GUBITOSO","CRAWLEY"],13:["ADAM HORINEK-CLINIC","HORINEK-CLINIC","AMBER WITHINGTON","LARSON","FITZPATRICK","SASHA EDWARDS-T"],14:["DEIBERT","ADAM HORINEK-CLINIC","LEIS-T","GABEL","AMBER WITHINGTON","CHASNOW","DAVIS","SASHA EDWARDS-T"],15:["ADAM HORINEK-SKIN CARE","DEIBERT","AMBER WITHINGTON","HAERI-T","LARSON","**TILDEN-T","SASHA EDWARDS-T"],16:["AMBER WITHINGTON","LARSON/OUT AT 10:30","HINZE","DEIBERT"],19:["GRAUERHOLZ-OR","ADAM HORINEK-OR","AMBER WITHINGTON","LARSON","PACK","DAVIS"],20:["ADAM HORINEK-CLINIC","TANGEL","SMITH","AMBER WITHINGTON","GRAUERHOLZ-CLINIC","LARSON","PACK","FITZPATRICK","SASHA EDWARDS-T"],21:["DEIBERT","ADAM HORINEK-CLINIC","GABEL","SMITH OR","HINZE","AMBER WITHINGTON","LEIS-T","GEORGE","SASHA EDWARDS-T"],22:["ADAM HORINEK-SKIN CARE","**CRAWLEY","AMBER WITHINGTON","LARSON","SMITH OR","DEIBERT","WITMAN","SASHA EDWARDS-T"],23:["**CLIFFORD-OR","AMBER WITHINGTON","SMITH","LARSON","DEIBERT"],26:["NITKA","WITMAN***","SMAIRAT","ADAM HORINEK-OR","AMBER WITHINGTON","LARSON","HORINEK-OR"],27:["ADAM HORINEK-CLINIC","HORINEK-CLINIC","AMBER WITHINGTON","NITKA","LARSON","FITZPATRICK","SASHA EDWARDS-T"],28:["NITKA","HINZE-OR","EBY","DEIBERT","ADAM HORINEK-CLINIC","LEIS","KORMAN","GABEL","AMBER WITHINGTON","LEUNG","SASHA EDWARDS-T"],29:["ADAM HORINEK-SKIN CARE","AMBER WITHINGTON","LARSON","DEIBERT","SASHA EDWARDS-T"],30:["KANADE-T","DEIBERT","AMBER WITHINGTON","LARSON"]};
  /* Lookup list: the short name staff type -> who it is. New providers get one line here. */
  var WHO={
    'KANADE':['Dr. Kanade','Nephrology','sc-nephrology.html'],
    'ADAM HORINEK':['Adam Horinek, PA-C','Orthopedics','orthopedics.html'],
    'HORINEK':['Dr. Horinek','Orthopedics','orthopedics.html'],
    'HAERI':['Dr. Haeri','Maternal-Fetal Medicine','sc-maternal-fetal-medicine.html'],
    'AMBER WITHINGTON':['Amber Withington, APRN','Oncology & Infusion','oncology-infusion.html'],
    'PACK':['Dr. Pack','Neurology','sc-neurology.html'],
    'NITKA':['Dr. Nitka','Neurology','sc-neurology.html'],
    'LARSON':['Dr. Larson','Audiology','sc-audiology.html'],
    'SASHA EDWARDS':['Sasha Edwards, ARNP','Psychiatry','sc-psychiatry.html'],
    'FITZPATRICK':['Dr. Fitzpatrick','Ear, Nose & Throat','sc-ear-nose-throat.html'],
    'HERRENBRUCK':['Dr. Herrenbruck','Orthopedics','orthopedics.html'],
    'GRAUERHOLZ':['Dr. Grauerholz','Orthopedics','orthopedics.html'],
    'CRAWLEY':['Dr. Crawley','Cardiology','sc-cardiology.html'],
    'JONES':['Christy Jones, APRN','Cardiology','sc-cardiology.html'],
    'JANIF':['Dr. Janif','Cardiology','sc-cardiology.html'],
    'DASSOUKI':['Dr. Dassouki','Cardiology','sc-cardiology.html'],
    'SMAIRAT':['Dr. Smairat','Cardiology','sc-cardiology.html'],
    'CLIFFORD':['Dr. Clifford','Ophthalmology','sc-ophthalmology.html'],
    'LEIS':['Claire Leis, RDN','Nutrition','sc-nutrition.html'],
    'HINZE':['Dr. Hinze','Podiatry','sc-podiatry.html'],
    'GEORGE':['Dr. George','Oncology & Infusion','oncology-infusion.html'],
    'WITMAN':['Angie Witman, LCMFT','Counseling','sc-counseling.html'],
    'TILDEN':['Dr. Tilden','Endocrinology','sc-endocrinology.html'],
    'TANGEL':['Dr. Tangel','Pulmonology','sc-pulmonology.html'],
    'EBY':['Dr. Eby','Spine Surgery','sc-spine-surgery.html'],
    'KORMAN':['Dr. Korman','Rheumatology','sc-rheumatology.html'],
    'LEUNG':['Dr. Leung','Vascular Surgery','sc-vascular-surgery.html']
  };
  function parse(raw){
    var s=raw.replace(/\*/g,'').trim().toUpperCase();
    if(/CONFERENCE|CLOSED|HOLIDAY/.test(s)) return null;
    var note='';
    var m=s.match(/^([^/]+)\/\s*OUT AT ([0-9:]+)/); if(m){s=m[1].trim();note='Until '+m[2].toLowerCase()+'am'}
    if(/(-|\s)OR$/.test(s)) return null;              /* surgery days aren't clinic visits */
    var tele=/-T$/.test(s); s=s.replace(/-(T|CLINIC)$/,'');
    var label=''; m=s.match(/-SKIN CARE$/); if(m){s=s.replace(/-SKIN CARE$/,'');label='Skin care'}
    var w=WHO[s.trim()]; if(!w) return {unknown:s.trim()};
    return {name:w[0],spec:label||w[1],url:w[2],tele:tele,note:note};
  }
  var DAYS={},UNKNOWN={};
  Object.keys(RAW).forEach(function(d){var seen={};DAYS[d]=RAW[d].map(parse).filter(function(e){
    if(!e) return false; if(e.unknown){UNKNOWN[e.unknown]=1;return false}
    var k=e.name+e.spec; if(seen[k]) return false; seen[k]=1; return true;
  }).sort(function(a,b){return a.spec.localeCompare(b.spec)})});
  window.CH_SC_UNKNOWN=Object.keys(UNKNOWN);
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var WD=['Mon','Tue','Wed','Thu','Fri'];
  function today(){var n=new Date();return (n.getFullYear()===YEAR&&n.getMonth()+1===MONTH)?n.getDate():0}
  function entry(e){return '<li><a href="'+e.url+'"><b>'+esc(e.spec)+'</b><span>'+esc(e.name)+(e.tele?' <em class="sc-tele">Video visit</em>':'')+(e.note?' · '+esc(e.note):'')+'</span></a></li>'}
  window.chScMonth=function(id){
    var box=document.getElementById(id); if(!box) return;
    var specs={}; Object.keys(DAYS).forEach(function(d){DAYS[d].forEach(function(e){specs[e.spec]=1})});
    var opts=Object.keys(specs).sort();
    box.innerHTML='<div class="sc-tools"><h3>'+MN[MONTH-1]+' '+YEAR+'</h3><label class="sc-filter">Show <select>'+'<option value="">All specialties</option>'+opts.map(function(o){return '<option>'+esc(o)+'</option>'}).join('')+'</select></label></div><div class="sc-body"></div>';
    var sel=box.querySelector('select'), body=box.querySelector('.sc-body');
    function render(){
      var f=sel.value, first=new Date(YEAR,MONTH-1,1), last=new Date(YEAR,MONTH,0).getDate(), t=today();
      var lead=(first.getDay()+6)%7; /* Monday=0 */
      var cells=[], d;
      for(var i=0;i<lead;i++) if(i<5) cells.push('<div class="sc-day sc-off"></div>');
      for(d=1;d<=last;d++){
        var wd=(new Date(YEAR,MONTH-1,d).getDay()+6)%7; if(wd>4) continue;
        var L=(DAYS[d]||[]).filter(function(e){return !f||e.spec===f});
        cells.push('<div class="sc-day'+(d===t?' sc-today':'')+(L.length?'':' sc-empty')+'"><div class="sc-date"><span class="sc-wd">'+WD[wd]+', '+MN[MONTH-1].slice(0,3)+' </span>'+d+(d===t?' <span class="sc-now">Today</span>':'')+'</div>'+(L.length?'<ul>'+L.map(entry).join('')+'</ul>':'<p class="sc-none">'+(f?'Not here this day':'No visiting providers')+'</p>')+'</div>');
      }
      body.innerHTML='<div class="sc-grid">'+'<div class="sc-head">'+WD.map(function(w){return '<span>'+w+'</span>'}).join('')+'</div>'+cells.join('')+'</div>';
    }
    sel.addEventListener('change',render); render();
  };
  /* Week list for the Medical Center page */
  window.chScWeek=function(id){
    var box=document.getElementById(id); if(!box) return;
    var t=today()||16, base=new Date(YEAR,MONTH-1,t), wd=(base.getDay()+6)%7; if(wd>4){base.setDate(base.getDate()+7-wd);wd=0}
    var mon=new Date(base); mon.setDate(base.getDate()-wd);
    var rows=[];
    for(var i=0;i<5;i++){var dt=new Date(mon);dt.setDate(mon.getDate()+i);if(dt.getMonth()+1!==MONTH)continue;
      var L=DAYS[dt.getDate()]||[]; var sp={}; L.forEach(function(e){sp[e.spec]=1});
      rows.push('<li><b>'+WD[i]+'</b><span>'+Object.keys(sp).map(esc).join(', ')+'</span></li>')}
    box.innerHTML='<ul class="sc-week">'+rows.join('')+'</ul>';
  };
})();
