/* ===== AI Interview Center v3 — guided ===== */
const PHOTOS = [
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=560&fit=crop&crop=faces&auto=format&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=900&h=560&fit=crop&crop=faces&auto=format&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&h=560&fit=crop&crop=faces&auto=format&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=560&fit=crop&crop=faces&auto=format&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&h=560&fit=crop&crop=faces&auto=format&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=560&fit=crop&crop=faces&auto=format&q=80'
];
const COLS = ['violet','green','orange','blue','magenta','red','yellow2','red2','yellow'];
const BASE = [
  ['Priya Venkatesh','Principal Designer',4.6],['Charles Berg','Product Designer',4.4],['Melissa Tang','Systems Designer',4.3],
  ['Aiden Park','Product Designer',4.2],['Zara Ahmed','Design Lead',4.1],['Sophie Williams','UX Designer',4.0],
  ['Marcus Chen','Design Manager',4.1],['Olivia Brooks','Interaction Designer',4.0],['Raj Kumar','Senior UX Designer',3.7],
  ['Diego Martinez','UX Designer',3.6],['Hana Okafor','Visual Designer',3.5],['Ryan Day','UX Designer',3.4],
  ['Lena Novak','Mobile Designer',3.3],['Sven Conti','UX Designer',3.2],['Jin Andersson','Systems Designer',3.1],
  ['Nadia Schmidt','UX Designer',3.0],['Tomas Rivera','UX Researcher',2.9],['Grace Obi','Product Designer',2.7],
  ['Kenji Mori','UX Designer',2.5],['Ana Costa','Junior Designer',2.3]
];
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const COMPS = ['Visual design','Interaction design','User research','Prototyping','Design systems','Usability testing','Information architecture','Design strategy','Accessibility','Stakeholder management','Communication','Problem solving'];
const C = BASE.map((b,i)=>{
  const [name,role,score] = b;
  const coding = +clamp(score + [0.2,-0.3,0.35,0.55,-0.45,0.1][i%6], 1, 4.9).toFixed(1);
  const comm   = +clamp(score + [-0.45,0.4,-0.15,-0.1,0.5,0.25][i%6], 1, 4.8).toFixed(1);
  const ps     = +clamp(score + [0.1,0.25,-0.2,0.4,-0.1,-0.35][i%6], 1, 4.85).toFixed(1);
  const total = 13, passed = coding>=4 ? 13 : clamp(Math.round(coding*2.7), 3, 12);
  const proctor = !((i%5===3 && i!==3) || score<2.7);
  return {
    i, name, role, score, coding, comm, ps,
    first: name.split(' ')[0],
    init: name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
    col: COLS[i%9], photo: PHOTOS[i%6],
    dsa: Math.min(5, Math.round(coding)), syntaxOk: coding>=3.2,
    passed, total, proctor,
    caseNA: i%4===0, caseScore: +clamp(score+0.2,1,4.75).toFixed(1),
    dur: (2+(i*7)%3)+':'+String(10+(i*13)%50).padStart(2,'0'),
    comps: [COMPS[i%12], COMPS[(i+4)%12], COMPS[(i+7)%12]].concat(i%2?[COMPS[(i+9)%12]]:[]),
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
const kmHtml = c => MOMENTS[c.i%3].map(k=>`<div class="km" title="Play this moment"><span class="kt"><span class="material-icons-round">play_arrow</span>${k.t}</span><div class="kq">“${k.q}”<span class="ktag">${k.tag}</span></div></div>`).join('');
/* ===== competency-first evaluation ===== */
const COMP_DEFS = [
  {k:'ps', n:'Problem solving', w:'30%', get:c=>c.ps},
  {k:'coding', n:'Coding proficiency', w:'25%', get:c=>c.coding},
  {k:'comm', n:'Communication', w:'20%', get:c=>c.comm},
  {k:'craft', n:'Design craft', w:'15%', get:c=>c.caseNA?null:c.caseScore},
  {k:'collab', n:'Collaboration', w:'10%', get:c=>clamp(c.comm + (c.i%3)*0.15 - 0.1, 1, 4.75)}
];
const AVGS = COMP_DEFS.map(d=>{ const vs=C.map(d.get).filter(v=>v!=null); return vs.reduce((s,v)=>s+v,0)/vs.length; });
const EVID = {
  ps:{
    good:[['Reframed the brief before sketching — asked why users drop off at all, then drove the case unprompted.','Alternatives thinned at the edges; one concept carried most of the weight.'],['Laid out personas and friction points up front, then walked three distinct concepts.',null]],
    mid:[['Structured pass at the case — personas, frictions, one workable concept.','Segments surfaced only when pressed and never drove a design decision.'],['Named the core user problem cleanly.','Stuck with the first idea; ran long on setup, leaving no room to stress-test it.']],
    poor:[['Understood the task once clarified.','Needed the same prompt repeated; time expired mid-answer.'],['Followed the interviewer\'s scaffolding.','Couldn\'t connect observations to a design direction.']]
  },
  coding:{
    good:[['Clean, syntactically correct solution — named the trade-off in the approach while writing it.',null],['Correct, readable code; walked the logic aloud without prompting.',null]],
    mid:[['Reached a working solution with sound logic.',null],['Got to a working answer after one hint.',null]],
    poor:[['Attempted the exercise in pseudocode.',null],['Grasped the brute-force path.',null]]
  },
  comm:{
    good:[['Played the requirement back before answering; the final walkthrough needed no follow-ups.',null],['Narrated decisions as they were made — easy to evaluate throughout.',null]],
    mid:[['Clear when narrating their own work.','Answers drifted under probing questions.'],['Kept the interviewer oriented through the case.','Long pauses; several answers needed a re-ask.']],
    poor:[['Engaged once questions were repeated.','Hard to follow throughout — the same question was asked multiple times.'],['Short answers kept the interview moving.','Rarely explained the why behind choices.']]
  },
  craft:{
    good:[['States, hierarchy and empty cases covered in the mock; every choice defended.',null],['Concept landed as integrated, not bolted-on — strong judgment on visual weight.',null]],
    mid:[['A workable concept with sensible layout.','Stayed low-fidelity; key interactions left unspecified.'],['Good instincts on hierarchy.','No states or edge cases in the mock.']],
    poor:[['Produced a rough sketch of the idea.','Craft signal too thin to evaluate against the bar.'],['Talked through the concept verbally.','Nothing concrete enough to assess.']]
  },
  collab:{
    good:[['Volunteered a trade-off unprompted and invited pushback on it.',null],['Built on the interviewer\'s hint instead of defending the first idea.',null]],
    mid:[['Took feedback without friction.','Hints were absorbed, not extended.'],['Open to redirection.','Waited for prompts rather than testing ideas aloud.']],
    poor:[['Stayed engaged through corrections.','Defended the first idea instead of exploring the hint.'],['Polite, professional exchange.','Treated probing as criticism; the conversation stalled.']]
  }
};
function compEval(c,d,v){
  if (v==null) return {plus:null, minus:'Skipped the case exercise — no design-craft signal this round.'};
  const band = v>=3.75?'good':v>=3?'mid':'poor';
  const pool = EVID[d.k][band];
  let [p,m] = pool[c.i%pool.length];
  if (d.k==='coding'){
    const f = c.total - c.passed;
    if (f>0) m = `${f} of ${c.total} tests failed${band==='good'?' — worth a look despite the strong run':band==='poor'?'; needed hints to run':' on edge cases'}.`;
  }
  return {plus:p, minus:m};
}
const TAG2COMP = {'Problem solving':'ps','Prioritisation':'ps','Coding':'coding','Communication':'comm','Collaboration':'collab'};
function verdictFor(c){
  const avg = (C.reduce((s,x)=>s+x.score,0)/C.length).toFixed(1);
  const s = c.score.toFixed(1);
  const skip = c.caseNA ? ', with one exercise skipped' : '';
  if (c.score>=4.3) return {cls:'strong', lbl:'Meets all assessed criteria', txt:`Drove the case end to end — ${s} against a ${avg} batch average, at or above your bar on every assessed criterion${skip}.`};
  if (c.score>=4)   return {cls:'strong', lbl:'Meets assessed criteria', txt:`A strong pass — ${s} vs the ${avg} batch average. Verify the flagged gap below, then move.`};
  if (c.score>=3.4) return {cls:'mod', lbl:'Mixed vs criteria', txt:`A middle-of-the-pack pass — ${s} vs the ${avg} batch average, with real gaps below. Better shared with your HM than advanced outright.`};
  if (c.score>=2.8) return {cls:'low', lbl:'Below criteria', txt:`Below your bar at ${s} — consistent gaps across the weighted criteria this round.`};
  return {cls:'low', lbl:'Well below criteria', txt:`Well below the bar at ${s} — did not engage with the core of the case.`};
}

/* ===== state ===== */
let tab='fresh', bucket=1, aiTokens=[], noteI=null, drawerI=null, openCmps=new Set(), sortAsc=false;
const selected = new Set();
const BUCKETS = [
  {t:'All interviews', d:'Interviews completed', cls:'c-all', ic:'inbox', f:()=>true},
  {t:'Ready to advance', d:'Score 4.0+ and no flags', cls:'c-adv', ic:'verified', f:c=>c.score>=4&&c.proctor},
  {t:'Share for HM review', d:'3.4–3.9, no flags', cls:'c-hm', ic:'forward_to_inbox', f:c=>c.score>=3.4&&c.score<4&&c.proctor},
  {t:'Proctoring flags', d:'Session flags to verify before deciding', cls:'c-flag', ic:'flag', noAvg:true, f:c=>!c.proctor},
  {t:'Below your bar', d:'Under 3.4 on the position rubric', cls:'c-bar', ic:'trending_down', f:c=>c.score<3.4&&c.proctor}
];
const FILTERS = {
  psCraft: { tokens:[{label:'Problem solving 4+', f:c=>c.ps>=4},{label:'Design craft 3.5+', f:c=>!c.caseNA&&c.caseScore>=3.5}] },
  exercise: { tokens:[{label:'Completed the design exercise', f:c=>!c.caseNA}] },
  comm: { tokens:[{label:'Communication 3.75+', f:c=>c.comm>=3.75}] },
  cleanCode: { tokens:[{label:'All coding tests passed', f:c=>c.passed===c.total}] }
};

/* ===== render ===== */
function visibleFresh(){
  const pool = fresh();
  if (aiTokens.length) return pool.filter(c=>aiTokens.every(t=>t.f(c)));
  if (bucket!=null) return pool.filter(BUCKETS[bucket].f);
  return pool;
}
function render(){
  for (const i of [...selected]) if (C[i].status) selected.delete(i);
  $('freshCount').textContent = fresh().length;
  $('actedCount').textContent = HMS().length + ADV().length;
  const gt = $('guidedTitle');
  if (gt) gt.textContent = `${fresh().length} fresh candidates to review`;
  document.querySelectorAll('.ia-tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
  $('freshView').hidden = tab!=='fresh';
  $('actedView').hidden = tab!=='acted';
  if (tab!=='fresh') $('aiPanel').hidden = true;
  if (tab==='fresh'){ renderBuckets(); renderFresh(); } else renderActed();
  if (drawerI!=null) renderDrawer();
  updateBar();
}
function updateBar(){
  $('bulkBar').classList.toggle('on', selected.size>0 && tab==='fresh');
}
function renderBuckets(){
  const pool = fresh();
  $('buckets').innerHTML = BUCKETS.map((b,j)=>{
    const m = pool.filter(b.f);
    const avg = m.length ? (m.reduce((s,c)=>s+c.score,0)/m.length).toFixed(1) : '—';
    return `${j?'<div class="bkt-sep"></div>':''}<div class="bkt ${b.cls}${bucket===j&&!aiTokens.length?' sel':''}" data-bkt="${j}">
      <div class="num-row"><span class="num">${m.length}</span>${b.noAvg?'':`<span class="avg">(Avg ${avg})</span>`}</div>
      <div class="t"><span class="material-icons-round bkt-ic">${b.ic}</span>${b.t}</div><div class="d">${b.d}</div></div>`;
  }).join('');
}
const noteBtn = c => `<button class="note-btn" data-note="${c.i}" title="Add note"><span class="material-icons-round">description</span>${c.notes.length?`<b>${c.notes.length}</b>`:''}</button>`;
function renderFresh(){
  let arr = visibleFresh();
  if (sortAsc) arr = arr.slice().reverse();
  const allSel = arr.length>0 && arr.every(c=>selected.has(c.i));
  const someSel = arr.some(c=>selected.has(c.i));
  $('freshHead').innerHTML = `<div class="cb${allSel?' checked':someSel?' mixed':''}" id="cbAll" title="Select all"></div>
    <div class="fh-cand">Candidates ${selected.size?`<span class="count-tag sel">${selected.size} selected</span><button class="sel-lnk red" id="selNone">Clear selection</button>`:`<span class="count-tag">${arr.length} of ${fresh().length}</span>`}${aiTokens.map((t,ti)=>`<span class="fchip"><span class="lbl">${t.label}</span><span class="material-icons-round" data-tok="${ti}" title="Remove">close</span></span>`).join('')}</div>
    <div><button class="fh-sort" id="sortBtn" title="Sort by score">Score<span class="material-icons-round">${sortAsc?'arrow_upward':'arrow_downward'}</span></button></div><div class="fh-comp">Core competencies</div><button class="fh-ai" id="aiOpen"><span class="material-icons-round">auto_awesome</span>Filter with AI</button>`;
  $('freshRows').innerHTML = arr.map(c=>`
    <div class="frow${c.i===drawerI?' sel':''}" data-i="${c.i}">
      <div class="cb${selected.has(c.i)?' checked':''}" data-cb="${c.i}"></div>
      <div class="avatar ${c.col}">${c.init}</div>
      <div class="who"><div class="nm">${c.name}</div><div class="rl">${c.role}</div></div>
      <div class="sc ${c.score<3.4?'low':''}">${c.score.toFixed(1)}<small>/5</small></div>
      <div class="comp-cell" title="${c.comps.join(' · ')}">${c.comps.slice(0,3).join(' · ')}</div>
      <div class="row-acts">
        <button class="ract hm" data-hm="${c.i}">Share with HM</button>
        <button class="ract gy" data-adv="${c.i}">Advance stage<span class="material-icons-round">expand_more</span></button>
        ${noteBtn(c)}
      </div>
    </div>`).join('') || `<div class="empty"><span class="material-icons-round">task_alt</span>No fresh candidates match. Select All interviews to reset.</div>`;
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
      <div class="row-acts"><button class="ract gy" data-adv="${c.i}">Advance stage<span class="material-icons-round">expand_more</span></button></div>
      ${noteBtn(c)}
    </div>`;
  }).join('') || `<div class="empty"><span class="material-icons-round">send</span>No candidates with your hiring manager. Share strong candidates for approval.</div>`;
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
/* ===== detail drawer ===== */
function openDrawer(i){
  drawerI = i;
  const cc = C[i];
  let weak = 0, wv = 9;
  COMP_DEFS.forEach((d,di)=>{ const v = d.get(cc); if (v!=null && v<wv){ wv=v; weak=di; } });
  openCmps = new Set([weak]);
  document.querySelector('.page').classList.add('drawer-open');
  renderDrawer();
  if (tab==='fresh') renderFresh(); else renderActed();
}
function closeDrawer(){
  if (drawerI==null) return;
  drawerI = null;
  document.querySelector('.page').classList.remove('drawer-open');
  if (tab==='fresh') renderFresh(); else renderActed();
}
function renderDrawer(){
  const c = C[drawerI];
  const rpool = c.status ? C : fresh();
  const rank = [...rpool].sort((a,b)=>b.score-a.score).findIndex(x=>x.i===c.i)+1;
  const v = verdictFor(c);
  let st = '';
  if (c.status==='hm') st = `<span class="status-chip hm"><span class="material-icons-round">send</span>With your hiring manager · ${c.when}</span>`;
  if (c.status==='adv') st = `<span class="status-chip adv"><span class="material-icons-round">check</span>${c.stage} · ${c.when}</span>`;
  const rec = c.score>=4 && c.proctor ? 'adv' : 'hm';
  const share = c.status ? '' : `<button class="ract ${rec==='hm'?'pri':'hm'}" data-hm="${c.i}">Share with HM</button>`;
  const advB = c.status==='adv' ? '' : `<button class="ract ${(!c.status&&rec==='adv')?'pri':'gy'}" data-adv="${c.i}">Advance stage<span class="material-icons-round">expand_more</span></button>`;
  const quote = MOMENTS[c.i%3][0];
  const moments = {};
  MOMENTS[c.i%3].slice(1).forEach(k=>{ const key = TAG2COMP[k.tag]||'ps'; (moments[key]=moments[key]||[]).push(k); });
  const plus = [];
  COMP_DEFS.forEach(d=>{ const val = d.get(c); if (val!=null && val>=3.75) plus.push(d.n); });
  if (c.passed===c.total) plus.push('All tests passed');
  const watch = watchFor(c).map(w=>w[0].toUpperCase()+w.slice(1)).slice(0,3);
  const blocks = COMP_DEFS.map((d,di)=>{
    const val = d.get(c), avg = AVGS[di], ev = compEval(c,d,val);
    const band = val==null?null:val>=3.75?'g':val>=3?'o':'r';
    const mom = (moments[d.k]||[])[0];
    return `<div class="cmp${openCmps.has(di)?' open':''}" data-cmp="${di}">
      <div class="cmp-head"><span class="cmp-n">${d.n} <small>· ${d.w}</small></span>${val==null?`<span class="cmp-sc na" style="margin-left:auto">Not assessed</span>`:`<span class="cmp-mini"><i class="${band}" style="width:${val*20}%"></i><em style="left:${(avg*20).toFixed(1)}%" title="Batch average ${avg.toFixed(1)}"></em></span><span class="cmp-sc">${val.toFixed(1)}<small>/5</small></span>`}<span class="material-icons-round cmp-chev">expand_more</span></div>
      <div class="cmp-body">${val==null?'<div class="cmp-pt" style="color:var(--grey-color-60,#69717f)"><b>·</b><span>Not assessed — excluded from the overall score; weight redistributed.</span></div>':''}${ev.plus?`<div class="cmp-pt plus"><b>+</b><span>${ev.plus}</span></div>`:''}${ev.minus?`<div class="cmp-pt minus"><b>–</b><span>${ev.minus}</span></div>`:''}${mom?`<div class="km" title="Play this moment"><span class="kt"><span class="material-icons-round">play_arrow</span>${mom.t}</span><div class="kq">“${mom.q}”<span class="ktag">${mom.tag}</span></div></div>`:''}</div>
    </div>`;
  }).join('');
  const f = c.total - c.passed;
  const nb = fresh().find(x=>x.i!==c.i) || [...C].sort((a,b)=>b.score-a.score).find(x=>x.i!==c.i);
  let navList = (tab==='fresh' ? visibleFresh() : HMS().concat(ADV()));
  let setLbl = (tab==='fresh') ? (aiTokens.length ? 'Filtered' : (bucket!=null ? BUCKETS[bucket].t : 'All fresh')) : 'Acted upon';
  let ni = navList.findIndex(x=>x.i===c.i);
  if (ni<0){ navList = [...C].sort((a,b)=>b.score-a.score); setLbl = 'All interviewed'; ni = navList.findIndex(x=>x.i===c.i); }
  $('dtDrawer').innerHTML = `
  <div class="dw-in">
  <div class="dw-top"><span class="dw-sw"><button class="icon-btn" id="dwPrev" title="Previous candidate" ${ni<=0?'disabled':''}><span class="material-icons-round">chevron_left</span></button><span class="sw-t">${setLbl} · ${ni+1} of ${navList.length}</span><button class="icon-btn" id="dwNext" title="Next candidate" ${ni>=navList.length-1?'disabled':''}><span class="material-icons-round">chevron_right</span></button></span><button class="icon-btn" id="dwClose" title="Close"><span class="material-icons-round">close</span></button></div>
  <div class="dw-id">
    <div class="avatar ${c.col}">${c.init}</div>
    <div style="min-width:0;"><div class="dw-nm">${c.name}</div><div class="dw-rl">${c.role} · 360 Interview</div></div>
    <div class="dw-score"><span class="v">${c.score.toFixed(1)}</span><small>/5</small></div>
  </div>
  ${st?`<div class="dw-status">${st}</div>`:''}
  <div class="dw-ai">
    <div class="ai-row">
      <div class="ai-main">
        <div class="ai-k"><span class="material-icons-round">auto_awesome</span>AI interview summary</div>
        <div class="vh2"><span class="fit ${v.cls}">${v.lbl}</span><span>Ranked #${rank} of ${rpool.length} ${c.status?'interviewed':'in this batch'}</span></div>
        <div class="vt">${v.txt}</div>
      </div>
      <button class="vthumb-s" data-reel="${c.i}" title="Play highlight reel"><img src="${c.photo}" alt="" /><span class="vp"><span class="material-icons-round">play_arrow</span></span><span class="dur">${c.dur}</span></button>
    </div>
    <div class="dw-quote"><span class="qm">“</span>${quote.q}<span class="qm">”</span><span class="qt" data-reel="${c.i}"><span class="material-icons-round" style="font-size:14px">play_arrow</span>Standout moment · ${quote.t}</span></div>
    <div class="pl-row">${plus.slice(0,3).map(x=>`<span class="pc plus">+ ${x}</span>`).join('')}${watch.map(x=>`<span class="pc watch">– ${x}</span>`).join('')}${c.caseNA?'<span class="pc na">No case study submitted</span>':''}</div>
    ${c.proctor?'':'<div class="dw-flag"><span class="material-icons-round">flag</span>Proctoring flags on this interview — review before deciding.</div>'}
  </div>
  <div class="dw-sec"><div class="hlp-h">Hiring criteria evaluation<span class="lg"><em class="tkd"></em>batch average</span></div>
  <div style="margin-top:10px">${blocks}</div></div>
  <div class="dw-ask-wrap"><div class="ask-panel">
    <div style="display:flex;align-items:center;font-size:13px;font-weight:600;color:var(--grey-color-90,#1a212e);margin-bottom:8px">Ask AI about ${c.first}<button class="icon-btn" id="askX" title="Close" style="margin-left:auto;width:24px;height:24px"><span class="material-icons-round" style="font-size:16px">close</span></button></div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      <button class="sug-chip ask-chip" data-q="How did they handle probing questions?">Probing questions</button>
      <button class="sug-chip ask-chip" data-q="${f>0?`Why did ${f} tests fail?`:'How clean was the coding round?'}">${f>0?`Why did ${f} tests fail?`:'Coding round'}</button>
      ${nb?`<button class="sug-chip ask-chip" data-q="Compare with ${nb.name}">Compare with ${nb.first}</button>`:''}
    </div>
    <div class="ask-in"><input id="askIn" type="text" placeholder="Ask about any parameter or compare..." /><button class="ai-send" id="askSend" title="Ask"><span class="material-icons-round">send</span></button></div>
    <div class="ask-a" id="askA"></div>
  </div>
  <button class="ask-btn" id="askBtn"><span class="material-icons-round">auto_awesome</span>Ask AI</button></div>
  <div style="height:16px"></div>
  </div>
  <div class="dw-acts">${share}${advB}${noteBtn(c)}</div>`;
  $('dwClose').onclick = closeDrawer;
  const pv = $('dwPrev'), nx = $('dwNext');
  if (pv && ni>0) pv.onclick = ()=>openDrawer(navList[ni-1].i);
  if (nx && ni<navList.length-1) nx.onclick = ()=>openDrawer(navList[ni+1].i);
  const ain = $('askIn');
  if (ain) ain.addEventListener('keydown', ev=>{ if (ev.key==='Enter' && ain.value.trim()){ runAsk(ain.value.trim()); ain.value=''; } });
}
function askAnswer(c,q){
  const l = q.toLowerCase();
  const words = l.split(/[^a-z]+/);
  const other = C.find(x=>x.i!==c.i && (words.includes(x.first.toLowerCase()) || words.includes(x.name.split(' ')[1].toLowerCase())));
  if (l.includes('compare') || other){
    const o = other || fresh().find(x=>x.i!==c.i) || C[0];
    const lead = c.score>=o.score ? c : o;
    return `<b>${c.first} vs ${o.first}:</b> overall ${c.score.toFixed(1)} vs ${o.score.toFixed(1)}. Problem solving ${c.ps.toFixed(1)} vs ${o.ps.toFixed(1)} · coding ${c.coding.toFixed(1)} vs ${o.coding.toFixed(1)} · communication ${c.comm.toFixed(1)} vs ${o.comm.toFixed(1)}. ${lead.first} is the stronger interview against this position's criteria${lead.caseNA?', though the skipped case exercise leaves a craft gap':''}.`;
  }
  if (l.includes('test') || l.includes('cod')){ const f = c.total-c.passed; return `<b>Coding · ${c.coding.toFixed(1)}/5:</b> ${f? f+' of '+c.total+' tests failed — edge cases under time pressure; the core approach was sound. The reel at 0:28 shows the reasoning.' : 'All '+c.total+' tests passed on a clean run, with the trade-off named unprompted.'}`; }
  if (l.includes('communicat') || l.includes('probing')) return `<b>Communication · ${c.comm.toFixed(1)}/5:</b> ${compEval(c,COMP_DEFS[2],c.comm).plus} ${c.comm<3.75?'Under probing, answers drifted — the second half of the interview shows it.':'Held up well under probing follow-ups.'}`;
  if (l.includes('problem') || l.includes('case')) return `<b>Problem solving · ${c.ps.toFixed(1)}/5:</b> ${compEval(c,COMP_DEFS[0],c.ps).plus}`;
  if (l.includes('flag') || l.includes('proctor')) return c.proctor ? 'No proctoring flags on this interview.' : '<b>Proctoring:</b> the session raised flags — repeated gaze away from screen and a second voice at 12:40. Review the flagged segments before deciding.';
  return `<b>Overall:</b> ${verdictFor(c).txt}`;
}
function runAsk(q){
  const a = $('askA');
  if (!a) return;
  a.classList.add('on');
  a.innerHTML = `<b style="color:var(--grey-color-90,#1a212e)">${q}</b><div style="margin-top:5px;color:var(--grey-color-60,#69717f)">Thinking…</div>`;
  const who = drawerI;
  setTimeout(()=>{ const a2 = $('askA'); if (a2 && drawerI===who) a2.innerHTML = `<b style="color:var(--grey-color-90,#1a212e)">${q}</b><div style="margin-top:5px">${askAnswer(C[who], q)}</div>`; }, 500);
}
let reelTimer=null, reelPos=0, reelDurS=0, reelPlaying=false;
const t2s = t=>{ const p=t.split(':').map(Number); return p[0]*60+p[1]; };
const s2t = s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function updReel(){ $('rcFill').style.width = (reelDurS? reelPos/reelDurS*100 : 0)+'%'; $('rcTime').textContent = s2t(reelPos)+' / '+s2t(reelDurS); }
function setReelPlay(p){
  reelPlaying = p;
  $('reelStage').classList.toggle('playing', p);
  $('rcPlayIc').textContent = p?'pause':'play_arrow';
  clearInterval(reelTimer);
  if (p) reelTimer = setInterval(()=>{ reelPos = Math.min(reelDurS, reelPos+0.25); updReel(); if (reelPos>=reelDurS) setReelPlay(false); }, 250);
}
function closeReel(){ $('reelModal').classList.remove('on'); setReelPlay(false); }
function openReel(i){
  const c = C[i];
  $('reelTitle').textContent = `${c.name} · Highlight reel`;
  $('reelImg').src = c.photo;
  reelDurS = t2s(c.dur); reelPos = 0; setReelPlay(false);
  const tk = $('rcTrack');
  tk.querySelectorAll('.rc-mark').forEach(m=>m.remove());
  MOMENTS[c.i%3].forEach(k=>{
    const el = document.createElement('span');
    el.className = 'rc-mark';
    el.dataset.lbl = `${k.tag} · ${k.t}`;
    el.dataset.t = t2s(k.t);
    el.style.left = (t2s(k.t)/reelDurS*100)+'%';
    tk.appendChild(el);
  });
  updReel();
  $('reelModal').classList.add('on');
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
  const snap = stageIds.map(i=>({i, status:C[i].status, stage:C[i].stage, when:C[i].when}));
  stageIds.forEach(i=>{ const c=C[i]; c.status='adv'; c.stage=stage; c.when='Just now'; });
  toast(`${stageIds.length===1?C[stageIds[0]].first:stageIds.length+' candidates'} advanced to ${stage}`, ()=>snap.forEach(s=>{ const cc=C[s.i]; cc.status=s.status; cc.stage=s.stage; cc.when=s.when; }));
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
function applyFilter(key){
  const def = FILTERS[key] || FILTERS.psCraft;
  bucket = null;
  aiTokens = [{label:'Interpreting…', f:()=>true}];
  render();
  setTimeout(()=>{ aiTokens = def.tokens.slice(); render(); }, 450);
}
function sendQuery(){
  const q = $('aiInput').value.trim();
  if (!q) return;
  const l = q.toLowerCase();
  let key = 'psCraft';
  if (l.includes('communicat')) key='comm';
  else if (l.includes('test')||l.includes('cod')) key='cleanCode';
  else if (l.includes('exercise')||l.includes('case')) key='exercise';
  applyFilter(key);
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
    renderFresh(); updateBar();
    return;
  }
  if (e.target.closest('#selAll2')){ visibleFresh().forEach(c=>selected.add(c.i)); renderFresh(); updateBar(); return; }
  if (e.target.closest('#selNone')){ selected.clear(); renderFresh(); updateBar(); return; }
  const bb = e.target.closest('[data-bulk]');
  if (bb){
    if (!selected.size) return;
    if (bb.dataset.bulk==='adv'){ openStageMenu(bb, [...selected], true); }
    else {
      const ids = [...selected];
      const snap = ids.map(i=>({i, status:C[i].status, when:C[i].when}));
      ids.forEach(i=>{ C[i].status='hm'; C[i].when='Just now'; });
      toast(`${ids.length===1?C[ids[0]].first:ids.length+' candidates'} shared with your hiring manager for approval`, ()=>snap.forEach(s=>{ C[s.i].status=s.status; C[s.i].when=s.when; }));
      selected.clear(); render();
    }
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
    aiTokens = [];
    bucket = (bucket===j) ? null : j;
    render(); return;
  }
  const tok = e.target.closest('[data-tok]');
  if (tok){ aiTokens.splice(+tok.dataset.tok,1); render(); return; }
  if (e.target.closest('#sortBtn')){ sortAsc=!sortAsc; renderFresh(); return; }
  if (e.target.closest('#aiOpen')){ const p=$('aiPanel'); p.hidden=!p.hidden; if(!p.hidden) $('aiInput').focus(); return; }
  if (e.target.closest('#aiClose')){ $('aiPanel').hidden=true; return; }
  const adv = e.target.closest('[data-adv]');
  if (adv){ openStageMenu(adv, [+adv.dataset.adv], false); return; }
  const hm = e.target.closest('[data-hm]');
  if (hm){
    const c = C[+hm.dataset.hm];
    const snap = {status:c.status, when:c.when};
    c.status='hm'; c.when='Just now';
    toast(`${c.first} shared with your hiring manager for approval`, ()=>{ c.status=snap.status; c.when=snap.when; });
    render(); return;
  }
  const nt = e.target.closest('[data-note]');
  if (nt){ openNotes(nt, +nt.dataset.note); return; }
  const rl = e.target.closest('[data-reel]');
  if (rl){ openReel(+rl.dataset.reel); return; }
  if (e.target.closest('#reelX') || e.target === $('reelModal')){ closeReel(); return; }
  if (e.target.closest('#reelPlay') || e.target.closest('#rcPlay')){ setReelPlay(!reelPlaying); return; }
  const mk = e.target.closest('.rc-mark');
  if (mk){ reelPos = +mk.dataset.t; updReel(); if (!reelPlaying) setReelPlay(true); return; }
  const tk2 = e.target.closest('#rcTrack');
  if (tk2){ const r = tk2.getBoundingClientRect(); reelPos = Math.max(0, Math.min(1, (e.clientX-r.left)/r.width))*reelDurS; updReel(); return; }
  const chd = e.target.closest('.cmp-head');
  if (chd){ const el = chd.parentNode, di = +el.dataset.cmp; el.classList.toggle('open'); openCmps.has(di) ? openCmps.delete(di) : openCmps.add(di); return; }
  if (e.target.closest('#askBtn')){ document.querySelector('.dw-ask-wrap').classList.toggle('open'); return; }
  const ac = e.target.closest('.ask-chip');
  if (ac){ runAsk(ac.dataset.q); return; }
  if (e.target.closest('#askX')){ document.querySelector('.dw-ask-wrap').classList.remove('open'); return; }
  if (e.target.closest('#askSend')){ const vq = $('askIn').value.trim(); if (vq){ runAsk(vq); $('askIn').value=''; } return; }
  if (e.target.closest('.ask-panel')) return;
  const row = e.target.closest('.frow, .lrow');
  if (row && row.dataset.i!=null){ hideStageMenu(); closeNotes(); openDrawer(+row.dataset.i); return; }
  if (e.target.closest('#guidedX')){ localStorage.setItem('aic4_banner_dismissed_v2','1'); $('guided').remove(); return; }
  if (!e.target.closest('.stage-menu')) hideStageMenu();
  if (!e.target.closest('.notes-pop')) closeNotes();
  if (!e.target.closest('.ver-fab')) $('verFab').classList.remove('open');
  if (!e.target.closest('.pos-wrap')) $('posWrap').classList.remove('open');
  if (!e.target.closest('.dw-ask-wrap')){ const aw = document.querySelector('.dw-ask-wrap'); if (aw) aw.classList.remove('open'); }
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ hideStageMenu(); closeNotes(); closeDrawer(); $('aiPanel').hidden = true; closeReel(); } });

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
let toastTimer, toastUndoFn = null;
function toast(msg, undo){
  $('toastTxt').textContent = msg;
  toastUndoFn = undo || null;
  $('toastUndo').style.display = undo ? 'inline' : 'none';
  $('toast').classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>$('toast').classList.remove('on'), undo ? 4200 : 2600);
}
$('toastUndo').addEventListener('click', ()=>{ if (toastUndoFn){ toastUndoFn(); toastUndoFn = null; render(); } $('toast').classList.remove('on'); });

if (localStorage.getItem('aic4_banner_dismissed_v2')){ const g = $('guided'); if (g) g.remove(); }
render();
