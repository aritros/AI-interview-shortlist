/* ===== AI Interview Center v3 — guided ===== */
const __R = window.__resources || {};
const PHOTOS = [__R.photo0, __R.photo1, __R.photo2, __R.photo3, __R.photo4, __R.photo5];
const COLS = ['violet','green','orange','blue','magenta','red','yellow2','red2','yellow'];
const BASE = [
  ['Priya Venkatesh','Principal Designer',4.6],['Charles Berg','Product Designer',4.4],['Melissa Tang','Systems Designer',4.3],
  ['Aiden Park','Product Designer',4.2],['Zara Ahmed','Design Lead',4.1],['Sophie Williams','UX Designer',4.0],
  ['Marcus Chen','Design Manager',3.9],['Olivia Brooks','Interaction Designer',3.8],['Raj Kumar','Senior UX Designer',3.7],
  ['Diego Martinez','UX Designer',3.6],['Hana Okafor','Visual Designer',3.5],['Ryan Day','UX Designer',3.4],
  ['Lena Novak','Mobile Designer',3.3],['Sven Conti','UX Designer',3.2],['Jin Andersson','Systems Designer',3.1],
  ['Nadia Schmidt','UX Designer',3.0],['Tomas Rivera','UX Researcher',2.9],['Grace Obi','Product Designer',2.7],
  ['Kenji Mori','UX Designer',2.5],['Ana Costa','Junior Designer',2.3]
];
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const C = BASE.map((b,i)=>{
  const [name,role,score] = b;
  const coding = +clamp(score + [0.2,-0.3,0.35,0.55,-0.45,0.1][i%6], 1, 4.9).toFixed(1);
  const comm   = +clamp(score + [-0.45,0.4,-0.15,-0.1,0.5,0.25][i%6], 1, 4.8).toFixed(1);
  const ps     = +clamp(score + [0.1,0.25,-0.2,0.4,-0.1,-0.35][i%6], 1, 4.85).toFixed(1);
  const total = 13, passed = coding>=4 ? 13 : clamp(Math.round(coding*2.7), 3, 12);
  const proctor = !(i%5===3 || score<2.7);
  return {
    i, name, role, score, coding, comm, ps,
    first: name.split(' ')[0],
    init: name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
    col: COLS[i%9], photo: PHOTOS[i%6],
    dsa: Math.min(5, Math.round(coding)), syntaxOk: coding>=3.2,
    passed, total, proctor,
    caseNA: i%4===0, caseScore: +clamp(score+0.2,1,4.75).toFixed(1),
    dur: (2+(i*7)%3)+':'+String(10+(i*13)%50).padStart(2,'0'),
    status: null, stage: null, when: null, notes: []
  };
});
/* seed acted-upon state */
C[1].status='hm'; C[1].when='2 days ago';
C[1].notes = [{who:'Dana Whitmore · Hiring Manager', when:'Yesterday', txt:'Strong systems thinking and a clean portfolio. Happy to move to onsite.'}];
C[4].status='hm'; C[4].when='Yesterday';
C[2].status='adv'; C[2].stage='Recruiter Screen'; C[2].when='2 days ago';
C[2].notes = [{who:'You · Recruiter', when:'2 days ago', txt:'Advanced after portfolio review.'}];

/* ===== helpers ===== */
const $ = id=>document.getElementById(id);
const fresh = ()=>C.filter(c=>!c.status).sort((a,b)=>b.score-a.score);
const HMS = ()=>C.filter(c=>c.status==='hm');
const ADV = ()=>C.filter(c=>c.status==='adv');
function criteriaFor(c){
  const rows = [
    ['Problem solving','30%', c.ps],
    ['Coding proficiency','25%', c.coding],
    ['Communication','20%', c.comm],
    ['Design craft','15%', c.caseNA ? null : c.caseScore],
    ['Collaboration','10%', clamp(c.comm + (c.i%3)*0.15 - 0.1, 1, 4.75)]
  ];
  const scored = rows.filter(r=>r[2]!=null);
  const fit = scored.reduce((s,r)=>s + r[2]*parseInt(r[1]), 0) / scored.reduce((s,r)=>s+parseInt(r[1]),0);
  return { rows, fit };
}
function watchFor(c){
  const w=[];
  if (!c.proctor) w.push('interview flags to review');
  if (c.passed<c.total) w.push('some coding tests failed');
  if (c.comm<3.25) w.push('hard to follow at times');
  if (c.caseNA) w.push('skipped the case study');
  return w;
}
const listWords = a => a.length===1 ? a[0] : a.slice(0,-1).join(', ') + ' and ' + a[a.length-1];
function critWords(c){
  const rows = criteriaFor(c).rows;
  const nm = s=>s.toLowerCase().replace('coding proficiency','coding');
  const ex=[], ok=[], lo=[]; let missed=null;
  rows.forEach(r=>{ if(r[2]==null) missed=nm(r[0]); else if(r[2]>=3.75) ex.push(nm(r[0])); else if(r[2]>=3) ok.push(nm(r[0])); else lo.push(nm(r[0])); });
  const parts=[];
  if (ex.length) parts.push(`Above your bar on ${listWords(ex)}.`);
  if (ok.length) parts.push(`Meets it on ${listWords(ok)}.`);
  if (lo.length) parts.push(`Falls short on ${listWords(lo)}.`);
  if (missed) parts.push(`Skipped the ${missed} exercise.`);
  return parts.join(' ');
}
function signalFor(c){
  const top = [['problem solving',c.ps],['coding',c.coding],['communication',c.comm]].sort((a,b)=>b[1]-a[1])[0][0];
  const w = watchFor(c)[0];
  if (c.score>=4) return {cls:'strong', lbl:'Strong hire signal', txt:`Stood out on ${top}${w?`; worth checking — ${w}`:', with nothing flagged'}.`};
  if (c.score>=3.4) return {cls:'mod', lbl:'Promising', txt:`Solid on ${top}; ${w?`review before advancing — ${w}`:'a steady interview across the board'}.`};
  return {cls:'low', lbl:'Weak signal', txt:`Did not meet the bar this round${w?` — ${w}`:''}.`};
}
const MOMENTS = [
  [{t:'0:42',tag:'Problem solving',q:'I map the edge cases before I write a single line.'},{t:'2:10',tag:'Communication',q:'Let me play that back to make sure I heard the requirement right.'}],
  [{t:'0:28',tag:'Coding',q:'A hash map gets this down to one pass — I will trade a little memory for speed.'},{t:'1:36',tag:'Collaboration',q:'I would rather ship the smaller, safer change and iterate.'}],
  [{t:'0:15',tag:'Prioritisation',q:'The loudest stakeholder is not always the most urgent problem.'},{t:'1:52',tag:'Problem solving',q:'When the numbers surprised me, I re-checked the data before blaming the model.'}]
];

/* ===== state ===== */
let tab='fresh', bucket=0, aiF=null, noteI=null, drawerI=null;
const selected = new Set();
const openHl = new Set();
const BUCKETS = [
  {t:'Ready to advance', d:'Scored 4.0+ with no red flags', f:c=>c.score>=4&&c.proctor&&c.passed===c.total},
  {t:'Send for HM review', d:'Good scores, with something worth a second opinion', f:c=>(c.score>=3.4&&c.score<4)||(c.score>=4&&(!c.proctor||c.passed<c.total))},
  {t:'Proctoring flags', d:'Suspicious activity flagged during the interview', f:c=>!c.proctor},
  {t:'Below your bar', d:'Did not meet the bar this round', f:c=>c.score<3.4}
];
const FILTERS = {
  dsa: { label:'Scored 3+ on DSA and wrote syntactically correct code', f:c=>c.dsa>=3 && c.syntaxOk },
  allTests: { label:'Passed all tests', f:c=>c.passed===c.total },
  ps: { label:'Strong problem solving', f:c=>c.ps>=3.75 },
  comm: { label:'Great communicators', f:c=>c.comm>=3.75 }
};

/* ===== render ===== */
function visibleFresh(){
  const pool = fresh();
  if (aiF) return pool.filter(aiF.f);
  if (bucket!=null) return pool.filter(BUCKETS[bucket].f);
  return pool;
}
function render(){
  for (const i of [...selected]) if (C[i].status) selected.delete(i);
  $('freshCount').textContent = fresh().length;
  $('actedCount').textContent = HMS().length + ADV().length;
  $('guidedTitle').textContent = `${fresh().length} fresh candidates to review`;
  document.querySelectorAll('.ia-tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
  $('freshView').hidden = tab!=='fresh';
  $('actedView').hidden = tab!=='acted';
  $('fltFab').classList.toggle('off', tab!=='fresh');
  if (tab==='fresh'){ renderBuckets(); renderFresh(); } else renderActed();
  if (drawerI!=null) renderDrawer();
  updateBar();
}
function updateBar(){
  const n = selected.size;
  $('selCnt').textContent = `${n} selected`;
  $('selBar').classList.toggle('on', n>0);
  $('fltFab').classList.toggle('raised', n>0);
}
/* ===== detail drawer ===== */
function openDrawer(i){
  drawerI = i;
  document.querySelector('.page').classList.add('drawer-open');
  $('dtDrawer').hidden = false;
  renderDrawer();
  if (tab==='fresh') renderFresh(); else renderActed();
}
function closeDrawer(){
  if (drawerI==null) return;
  drawerI = null;
  document.querySelector('.page').classList.remove('drawer-open');
  $('dtDrawer').hidden = true;
  if (tab==='fresh') renderFresh(); else renderActed();
}
function renderDrawer(){
  const c = C[drawerI];
  const sig = signalFor(c);
  let st = '';
  if (c.status==='hm') st = `<span class="status-chip hm"><span class="material-icons-round">send</span>With your hiring manager · ${c.when}</span>`;
  if (c.status==='adv') st = `<span class="status-chip adv"><span class="material-icons-round">check</span>${c.stage} · ${c.when}</span>`;
  const acts = (c.status==='adv' ? '' : `<button class="ract" data-adv="${c.i}">Advance Stage<span class="material-icons-round">expand_more</span></button>` + (c.status?'':`<button class="ract hm" data-hm="${c.i}"><span class="material-icons-round">send</span>Send to HM</button>`));
  $('dtDrawer').innerHTML = `
  <div class="dw-top"><button class="icon-btn" id="dwClose" title="Close"><span class="material-icons-round">close</span></button></div>
  <div class="dw-id">
    <div class="avatar ${c.col}">${c.init}</div>
    <div style="min-width:0;"><div class="dw-nm">${c.name}</div><div class="dw-rl">${c.role} · 360 Interview</div></div>
    <div class="dw-score"><span class="v">${c.score.toFixed(1)}</span><small>/5</small></div>
  </div>
  ${st?`<div class="dw-status">${st}</div>`:''}
  <div class="hlp-reel dw-reel"><img src="${c.photo}" alt="${c.name} highlight reel" /><span class="tag">HIGHLIGHT REEL</span><span class="vp"><span class="material-icons-round">play_arrow</span></span><span class="dur">${c.dur}</span></div>
  <div class="dw-sec"><div class="hlp-h">AI summary<span class="fit ${sig.cls}">${sig.lbl}</span></div>
  <div class="hlp-sum">${sig.txt}</div>
  <div class="hlp-crit"><b>Against your criteria:</b> ${critWords(c)}</div></div>
  <div class="dw-sec"><div class="hlp-h">Key moments</div>
  <div class="km-list">${kmHtml(c)}</div></div>
  <div class="dw-acts">${acts}${noteBtn(c)}</div>`;
  $('dwClose').onclick = closeDrawer;
}
function renderBuckets(){
  const pool = fresh();
  $('buckets').innerHTML = BUCKETS.map((b,j)=>{
    const m = pool.filter(b.f);
    const avg = m.length ? (m.reduce((s,c)=>s+c.score,0)/m.length).toFixed(1) : '—';
    return `<div class="bkt ${bucket===j&&!aiF?'sel':''}" data-bkt="${j}">
      <div class="num-row"><span class="num">${m.length}</span><span class="avg">Avg score ${avg}</span></div>
      <div class="t">${b.t}</div><div class="d">${b.d}</div></div>`;
  }).join('');
}
const noteBtn = c => `<button class="note-btn" data-note="${c.i}" title="Add note"><span class="material-icons-round">sticky_note_2</span>${c.notes.length?`<b>${c.notes.length}</b>`:''}</button>`;
const kmHtml = c => MOMENTS[c.i%3].map(k=>`<div class="km" title="Play this moment"><span class="kt"><span class="material-icons-round">play_arrow</span>${k.t}</span><div class="kq">“${k.q}”<span class="ktag">${k.tag}</span></div></div>`).join('');
function hlPanel(c){
  const sig = signalFor(c);
  return `<div class="hl-panel" data-hlp="${c.i}" ${openHl.has(c.i)?'':'hidden'}>
    <div class="hlp-reel"><img src="${c.photo}" alt="${c.name} highlight reel" /><span class="tag">HIGHLIGHT REEL</span><span class="vp"><span class="material-icons-round">play_arrow</span></span><span class="dur">${c.dur}</span></div>
    <div>
      <div class="hlp-h">AI summary<span class="fit ${sig.cls}">${sig.lbl}</span></div>
      <div class="hlp-sum">${sig.txt}</div>
      <div class="hlp-crit"><b>Against your criteria:</b> ${critWords(c)}</div>
      <div class="hlp-h" style="margin-top:14px;">Key moments</div>
      <div class="km-list">${kmHtml(c)}</div>
    </div>
  </div>`;
}
function renderFresh(){
  const arr = visibleFresh();
  const label = aiF ? aiF.label : bucket!=null ? BUCKETS[bucket].t : 'All fresh candidates';
  const allSel = arr.length>0 && arr.every(c=>selected.has(c.i));
  $('freshHead').innerHTML = `<div class="cb${allSel?' checked':''}" id="cbAll" title="Select all"></div>${label} <span style="letter-spacing:0;text-transform:none;font-weight:500;">· ${arr.length} of ${fresh().length}</span>${(aiF||bucket!=null)?`<button class="lh-link" id="clearF">View all fresh</button>`:''}`;
  $('freshRows').innerHTML = arr.map((c,j)=>`
    <div class="lrow${c.i===drawerI?' sel':''}" data-i="${c.i}">
      <div class="cb${selected.has(c.i)?' checked':''}" data-cb="${c.i}"></div>
      <div class="rk">${j+1}</div>
      <div class="avatar ${c.col}">${c.init}</div>
      <div class="who"><div class="nm">${c.name}</div><div class="rl">${c.role}</div></div>
      <button class="vthumb-s" data-hl="${c.i}" title="Play highlights"><img src="${c.photo}" alt="" /><span class="vp"><span class="material-icons-round">play_arrow</span></span><span class="dur">${c.dur}</span></button>
      <div class="sc ${c.score<3.4?'low':''}">${c.score.toFixed(1)}<small>/5</small></div>
      <button class="hl-btn ${openHl.has(c.i)?'on':''}" data-hl="${c.i}">Highlights<span class="material-icons-round">expand_more</span></button>
      <div class="row-acts">
        <button class="ract" data-adv="${c.i}">Advance Stage<span class="material-icons-round">expand_more</span></button>
        <button class="ract hm" data-hm="${c.i}"><span class="material-icons-round">send</span>Send to HM</button>
      </div>
      ${noteBtn(c)}
    </div>${hlPanel(c)}`).join('') || `<div class="empty"><span class="material-icons-round">task_alt</span>No fresh candidates match. View all fresh to reset.</div>`;
}
function renderActed(){
  const hms = HMS(), advs = ADV();
  $('hmCount').textContent = hms.length;
  $('advCount').textContent = advs.length;
  $('hmRows').innerHTML = hms.map(c=>{
    const hmNote = c.notes.find(n=>n.who.includes('Hiring Manager'));
    return `<div class="lrow${c.i===drawerI?' sel':''}" data-i="${c.i}">
      <div class="avatar ${c.col}">${c.init}</div>
      <div class="who"><div class="nm">${c.name}</div><div class="rl">${c.role}</div></div>
      <div class="sc">${c.score.toFixed(1)}<small>/5</small></div>
      <span class="status-chip ${hmNote?'adv':'wait'}"><span class="material-icons-round">${hmNote?'mark_email_read':'hourglass_empty'}</span>${hmNote?'HM responded':'Awaiting response'}</span>
      ${hmNote?`<div class="hm-note"><span class="material-icons-round">format_quote</span><span><b>${hmNote.who.split(' ·')[0]}:</b> ${hmNote.txt}</span></div>`:`<span class="when">Sent ${c.when}</span>`}
      <div class="row-acts"><button class="ract" data-adv="${c.i}">Advance Stage<span class="material-icons-round">expand_more</span></button></div>
      ${noteBtn(c)}
    </div>`;
  }).join('') || `<div class="empty"><span class="material-icons-round">send</span>No candidates with your hiring manager. Send strong candidates for approval.</div>`;
  $('advRows').innerHTML = advs.map(c=>`
    <div class="lrow${c.i===drawerI?' sel':''}" data-i="${c.i}">
      <div class="avatar ${c.col}">${c.init}</div>
      <div class="who"><div class="nm">${c.name}</div><div class="rl">${c.role}</div></div>
      <div class="sc">${c.score.toFixed(1)}<small>/5</small></div>
      <span class="status-chip adv"><span class="material-icons-round">check</span>${c.stage}</span>
      <span class="when">Advanced ${c.when}</span>
      <div class="row-acts"></div>
      ${noteBtn(c)}
    </div>`).join('') || `<div class="empty"><span class="material-icons-round">arrow_upward</span>No candidates advanced yet. Start with the Ready to advance bucket.</div>`;
}

/* ===== stage dropdown ===== */
const STAGES = [['fact_check','Recruiter Screen'],['supervisor_account','Hiring Manager Screen'],['groups','Onsite Interview'],['local_offer','Offer']];
const smCss = document.createElement('style');
smCss.textContent = '.stage-menu{position:fixed;z-index:120;width:236px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(26,33,46,0.16),0 2px 8px rgba(26,33,46,0.08);padding:6px;display:none}.stage-menu .sm-h{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#69717f;padding:8px 12px 4px}.stage-menu .sm-i{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;font-size:14px;font-weight:500;color:#343c4c;cursor:pointer}.stage-menu .sm-i:hover{background:#f6f7f8}.stage-menu .sm-i .material-icons-round{font-size:18px;color:#69717f}';
document.head.appendChild(smCss);
const stageMenu = document.createElement('div');
stageMenu.className = 'stage-menu';
stageMenu.innerHTML = '<div class="sm-h">Advance to stage</div>' + STAGES.map(s=>`<div class="sm-i" data-stage="${s[1]}"><span class="material-icons-round">${s[0]}</span>${s[1]}</div>`).join('');
document.body.appendChild(stageMenu);
let stageIds = [], stageBulk = false;
function openStageMenu(anchor, ids, bulk){
  stageIds = ids; stageBulk = !!bulk;
  const r = anchor.getBoundingClientRect();
  stageMenu.style.display = 'block';
  const mw = stageMenu.offsetWidth, mh = stageMenu.offsetHeight;
  let left = Math.max(12, Math.min(r.left, innerWidth - mw - 12));
  let top = r.bottom + 6;
  if (top + mh > innerHeight - 12) top = r.top - mh - 6;
  stageMenu.style.left = left + 'px';
  stageMenu.style.top = top + 'px';
}
function hideStageMenu(){ stageMenu.style.display = 'none'; }
stageMenu.addEventListener('click', e=>{
  e.stopPropagation();
  const it = e.target.closest('[data-stage]');
  if (!it) return;
  const stage = it.dataset.stage;
  stageIds.forEach(i=>{ const c=C[i]; c.status='adv'; c.stage=stage; c.when='Just now'; });
  toast(`${stageIds.length===1?C[stageIds[0]].first:stageIds.length+' candidates'} advanced to ${stage}`);
  if (stageBulk) selected.clear();
  hideStageMenu(); render();
});

/* ===== notes popover ===== */
function openNotes(anchor, i){
  noteI = i;
  const c = C[i];
  $('npTitle').textContent = `Notes · ${c.name}`;
  renderNotes();
  const pop = $('notesPop');
  pop.classList.add('on');
  const r = anchor.getBoundingClientRect();
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  let left = Math.max(12, Math.min(r.right - pw, innerWidth - pw - 12));
  let top = r.bottom + 8;
  if (top + ph > innerHeight - 12) top = Math.max(12, r.top - ph - 8);
  pop.style.left = left + 'px';
  pop.style.top = top + 'px';
}
function renderNotes(){
  const c = C[noteI];
  $('npList').innerHTML = c.notes.length ? c.notes.map(n=>`<div class="note-item"><div class="nw">${n.who}<em>${n.when}</em></div>${n.txt}</div>`).join('') : '<div class="np-empty">No notes yet. Your hiring manager\'s responses will appear here.</div>';
}
function closeNotes(){ $('notesPop').classList.remove('on'); $('npInput').value=''; }
$('npX').onclick = closeNotes;
$('npAdd').onclick = ()=>{
  const t = $('npInput').value.trim();
  if (!t || noteI==null) return;
  C[noteI].notes.push({who:'You · Recruiter', when:'Just now', txt:t});
  $('npInput').value='';
  renderNotes(); render();
  toast(`Note added to ${C[noteI].first}'s profile`);
};

/* ===== AI filter ===== */
function applyFilter(key, freeText){
  const def = FILTERS[key] || FILTERS.dsa;
  aiF = { label: freeText || def.label, f: def.f };
  bucket = null;
  $('fltFab').classList.remove('open');
  render();
}
function sendQuery(){
  const q = $('aiInput').value.trim();
  if (!q) return;
  const l = q.toLowerCase();
  let key = 'dsa';
  if (l.includes('communicat')) key='comm';
  else if (l.includes('test')) key='allTests';
  else if (l.includes('problem')) key='ps';
  applyFilter(key, q);
  $('aiInput').value='';
}
$('aiSend').onclick = sendQuery;
$('aiInput').addEventListener('keydown', e=>{ if(e.key==='Enter') sendQuery(); });
document.querySelectorAll('.sug-chip').forEach(ch=>{ ch.onclick = ()=>applyFilter(ch.dataset.q); });

/* ===== delegated events ===== */
document.addEventListener('click', e=>{
  const cb = e.target.closest('[data-cb]');
  if (cb){
    const i = +cb.dataset.cb;
    selected.has(i) ? selected.delete(i) : selected.add(i);
    cb.classList.toggle('checked', selected.has(i));
    updateBar();
    return;
  }
  if (e.target.closest('#cbAll')){
    const arr = visibleFresh().map(c=>c.i);
    const all = arr.length && arr.every(i=>selected.has(i));
    arr.forEach(i=> all ? selected.delete(i) : selected.add(i));
    renderFresh(); updateBar();
    return;
  }
  const tabEl = e.target.closest('.ia-tab');
  if (tabEl){ tab = tabEl.dataset.tab; render(); return; }
  const bk = e.target.closest('[data-bkt]');
  if (bk){
    const j = +bk.dataset.bkt;
    aiF = null;
    bucket = (bucket===j) ? null : j;
    render(); return;
  }
  if (e.target.closest('#clearF')){ bucket=null; aiF=null; render(); return; }
  const hl = e.target.closest('[data-hl]');
  if (hl){
    const i = +hl.dataset.hl;
    openHl.has(i) ? openHl.delete(i) : openHl.add(i);
    const panel = document.querySelector(`[data-hlp="${i}"]`);
    if (panel) panel.hidden = !openHl.has(i);
    document.querySelectorAll(`.hl-btn[data-hl="${i}"]`).forEach(b=>b.classList.toggle('on', openHl.has(i)));
    return;
  }
  const adv = e.target.closest('[data-adv]');
  if (adv){ openStageMenu(adv, [+adv.dataset.adv], false); return; }
  const hm = e.target.closest('[data-hm]');
  if (hm){
    const c = C[+hm.dataset.hm];
    c.status='hm'; c.when='Just now';
    toast(`${c.first} sent to your hiring manager for approval`);
    render(); return;
  }
  const nt = e.target.closest('[data-note]');
  if (nt){ openNotes(nt, +nt.dataset.note); return; }
  const row = e.target.closest('.lrow');
  if (row && row.dataset.i!=null){ hideStageMenu(); closeNotes(); openDrawer(+row.dataset.i); return; }
  if (e.target.closest('#guidedX')){ $('guided').remove(); return; }
  if (!e.target.closest('.stage-menu')) hideStageMenu();
  if (!e.target.closest('.notes-pop')) closeNotes();
  if (!e.target.closest('.ver-fab')) $('verFab').classList.remove('open');
  if (!e.target.closest('.pos-wrap')) $('posWrap').classList.remove('open');
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ hideStageMenu(); closeNotes(); closeDrawer(); $('fltFab').classList.remove('open'); } });

/* ===== bulk bar ===== */
document.querySelectorAll('.sel-bar [data-bulk]').forEach(b=>{
  b.onclick = (e)=>{
    e.stopPropagation();
    if (!selected.size) return;
    if (b.dataset.bulk==='adv'){ openStageMenu(b, [...selected], true); }
    else {
      const ids = [...selected];
      ids.forEach(i=>{ C[i].status='hm'; C[i].when='Just now'; });
      toast(`${ids.length===1?C[ids[0]].first:ids.length+' candidates'} sent to your hiring manager for approval`);
      selected.clear(); render();
    }
  };
});
$('selClear').onclick = ()=>{ selected.clear(); renderFresh(); updateBar(); };

/* ===== centers dropdown ===== */
const cBtn = $('centersBtn'), cMenu = $('centersMenu');
cBtn.addEventListener('click', e=>{
  e.stopPropagation();
  const open = cMenu.classList.toggle('open');
  cBtn.classList.toggle('open', open);
  cBtn.setAttribute('aria-expanded', open);
});
document.addEventListener('click', e=>{ if(!cMenu.contains(e.target) && e.target!==cBtn){ cMenu.classList.remove('open'); cBtn.classList.remove('open'); } });

/* ===== toast ===== */
let toastTimer;
function toast(msg){
  $('toastTxt').textContent = msg;
  $('toast').classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>$('toast').classList.remove('on'), 2600);
}

render();
