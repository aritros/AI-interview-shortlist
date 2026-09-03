/* ===== AI Interview Center v6 — simplified leaderboard =====
   Data model, criteria and evidence logic forked from v3. */
const R = window.__resources || {};
const PHOTOS = [
  R.photo0 || 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&h=560&fit=crop&crop=faces&auto=format&q=80',
  R.photo1 || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=900&h=560&fit=crop&crop=faces&auto=format&q=80',
  R.photo2 || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&h=560&fit=crop&crop=faces&auto=format&q=80',
  R.photo3 || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=560&fit=crop&crop=faces&auto=format&q=80',
  R.photo4 || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&h=560&fit=crop&crop=faces&auto=format&q=80',
  R.photo5 || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=560&fit=crop&crop=faces&auto=format&q=80'
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
const COMPANIES = ['Netflix','Airbnb','Shopify','Atlassian','Figma','Adobe','Spotify','Uber','Intuit','Salesforce','Canva','Dropbox','LinkedIn','Stripe','Notion','Pinterest','Slack','Grammarly','DoorDash','Zendesk'];
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const C = BASE.map((b,i)=>{
  const [name,role,score] = b;
  const coding = +clamp(score + [0.2,-0.3,0.35,0.55,-0.45,0.1][i%6], 1, 4.9).toFixed(1);
  const comm   = +clamp(score + [-0.45,0.4,-0.15,-0.1,0.5,0.25][i%6], 1, 4.8).toFixed(1);
  const ps     = +clamp(score + [0.1,0.25,-0.2,0.4,-0.1,-0.35][i%6], 1, 4.85).toFixed(1);
  const total = 13, passed = coding>=4 ? 13 : clamp(Math.round(coding*2.7), 3, 12);
  return {
    i, name, role, score, coding, comm, ps, company: COMPANIES[i%20],
    init: name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
    col: COLS[i%9], photo: PHOTOS[i%6],
    dsa: Math.min(5, Math.round(coding)), syntaxOk: coding>=3.2,
    passed, total, proctor: !((i%5===3 && i!==3) || score<2.7),
    flags: ((i%5===3 && i!==3) || score<2.7) ? 1 + (i % 3) : 0,
    caseNA: i%4===0, caseScore: +clamp(score+0.2,1,4.75).toFixed(1),
    dur: (2+(i*7)%3)+':'+String(10+(i*13)%50).padStart(2,'0'),
    reviewed: i%3!==1, assist: i%7===2 || i===4,
    status: null
  };
});
const COMP_DEFS = [
  {k:'ps', n:'Problem solving', short:'Problem', w:30, get:c=>c.ps},
  {k:'coding', n:'Coding proficiency', short:'Coding', w:25, get:c=>c.coding},
  {k:'comm', n:'Communication', short:'Comms', w:20, get:c=>c.comm},
  {k:'craft', n:'Design craft', short:'Craft', w:15, get:c=>c.caseNA?null:c.caseScore},
  {k:'collab', n:'Collaboration', short:'Collab', w:10, get:c=>+clamp(c.comm + (c.i%3)*0.15 - 0.1, 1, 4.75).toFixed(1)}
];
const EVID = {
  ps:{
    good:[['Reframed the brief before sketching — asked why users drop off at all, then drove the case unprompted.','Alternatives thinned at the edges; one concept carried most of the weight.'],['Laid out personas and friction points up front, then walked three distinct concepts.',null]],
    mid:[['Structured pass at the case — personas, frictions, one workable concept.','Segments surfaced only when pressed and never drove a design decision.'],['Named the core user problem cleanly.','Stuck with the first idea; ran long on setup, leaving no room to stress-test it.']],
    poor:[['Understood the task once clarified.','Needed the same prompt repeated; time expired mid-answer.'],['Followed the interviewer\u2019s scaffolding.','Couldn\u2019t connect observations to a design direction.']]
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
    good:[['Volunteered a trade-off unprompted and invited pushback on it.',null],['Built on the interviewer\u2019s hint instead of defending the first idea.',null]],
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
/* deterministic timestamp per candidate + criterion + sign */
function tsFor(c,k,sign){
  const seed = (c.i*7 + k.length*13 + (sign==='+'?3:29)) % 210;
  return Math.floor(seed/60) + ':' + String(seed%60).padStart(2,'0');
}
const band = v => v==null ? 'na' : v>=3.75 ? 'g' : v>=3 ? 'o' : 'r';
const BATCH_AVG = (C.reduce((s,x)=>s+x.score,0)/C.length).toFixed(1);
function verdictFor(c){
  const s = c.score.toFixed(1);
  const skip = c.caseNA ? ', with one exercise skipped' : '';
  if (c.score>=4.3) return {cls:'strong', tag:'Strong', lbl:'Clear advance', txt:`Drove the case end to end — ${s} against a ${BATCH_AVG} batch average, at or above your bar on every assessed criterion${skip}.`};
  if (c.score>=4)   return {cls:'strong', tag:'Strong', lbl:'Advance', txt:`A strong pass — ${s} vs the ${BATCH_AVG} batch average. Verify the flagged gap below, then move.`};
  if (c.score>=3.4) return {cls:'mod', tag:'Mixed', lbl:'Second opinion', txt:`A middle-of-the-pack pass — ${s} vs the ${BATCH_AVG} batch average, with real gaps below. Better shared with your hiring manager than advanced outright.`};
  if (c.score>=2.8) return {cls:'low', tag:'Below bar', lbl:'Below bar', txt:`Below your bar at ${s} — consistent gaps across the weighted criteria this round.`};
  return {cls:'low', tag:'Below bar', lbl:'Well below bar', txt:`Well below the bar at ${s} — did not engage with the core of the case.`};
}
function cardLine(c){
  const scored = COMP_DEFS.map(d=>({n:d.short.toLowerCase(), v:d.get(c)})).filter(x=>x.v!=null);
  const top = scored.slice().sort((a,b)=>b.v-a.v)[0];
  const low = scored.slice().sort((a,b)=>a.v-b.v)[0];
  if (c.score>=4.3) return `Above your bar on every criterion, strongest on ${top.n}.`;
  if (c.score>=4)   return `Strong on ${top.n}; verify ${low.n} before advancing.`;
  if (c.score>=3.4) return `Solid on ${top.n}, short of the bar on ${low.n}.`;
  return `Below your bar this round, weakest on ${low.n}.`;
}
const FILTERS = {
  adv:      {k:'adv', label:'Like the ones you advanced', title:'Like the ones you advanced', f:c=>c.score>=4 && c.proctor,
             why:'Scored 4.0 or higher with a clean proctoring session \u2014 the same bar the candidates you\u2019ve advanced from this pipeline have cleared.'},
  clean:    {k:'clean', label:'Clean proctoring only', title:'Clean proctoring sessions', f:c=>c.proctor,
             why:'Kept only the sessions where proctoring found nothing \u2014 no tab switches, no second face detected. Scores played no part in this filter.'},
  bar4:     {k:'bar4', label:'Scoring 4.0+ overall', title:'Scoring 4.0 and above', f:c=>c.score>=4,
             why:'A hard cut on the weighted overall score at 4.0, against a 3.5 batch average. Every criterion counts at its normal weight.'},
  ps:       {k:'ps', label:'Strong problem solving', title:'Strongest problem solvers', f:c=>c.ps>=3.75,
             why:'Ranked on the problem-solving criterion alone (30% of the score), keeping everyone at 3.8 or above. Overall score was ignored, so a few mid-pack candidates surface here.'},
  comm:     {k:'comm', label:'Great communicators', title:'Clearest communicators', f:c=>c.comm>=3.75,
             why:'Scored on communication only (20% of the weighting) at 3.8 and above \u2014 candidates who stayed easy to follow under probing questions.'},
  allTests: {k:'allTests', label:'Passed all coding tests', title:'Passed every coding test', f:c=>c.passed===c.total,
             why:'A hard filter on the coding exercise: all 13 test cases green. No partial credit, so strong candidates who failed one edge case are excluded.'},
  craft:    {k:'craft', label:'Completed the design case', title:'Completed the design case', f:c=>!c.caseNA,
             why:'Everyone who submitted the design case, so craft could actually be assessed. Candidates who skipped it carry no craft signal and are left out.'},
  unrev:    {k:'unrev', label:'Feedback not reviewed', title:'Feedback not reviewed yet', f:c=>!c.reviewed,
             why:'Scored interviews where no human has opened the AI feedback yet. Ordered by score so the strongest unreviewed candidates surface first.'},
  assist:   {k:'assist', label:'Requested human assistance', title:'Requested human assistance', f:c=>c.assist,
             why:'Candidates who asked for a human during the session \u2014 a clarification, a technical issue or a request to speak to the recruiter. Their scores stand, but the ask is unanswered.'},
  skills:   {k:'skills', label:'Great at UX design, design thinking, UXR', title:'Great at UX design, design thinking, UXR', f:c=>!c.caseNA && c.ps>=3.5 && c.comm>=3.4,
             why:'Filtered on the criteria that carry this interview type \u2014 a submitted design case, problem solving at 3.5+ and communication at 3.4+.'}
};
const INT_SKILLS = {
  '360 Interview': {label:'Great at UX design, design thinking, UXR', f:c=>!c.caseNA && c.ps>=3.5 && c.comm>=3.4,
    why:'Filtered on the criteria that carry a 360 interview \u2014 a submitted design case, problem solving at 3.5+ and communication at 3.4+.'},
  'Coding round': {label:'Great at algorithms, code quality, debugging', f:c=>c.coding>=3.8 && c.passed===c.total,
    why:'Filtered on the coding round\u2019s own signals \u2014 coding proficiency at 3.8+ with every test case green.'},
  'Role fit': {label:'Great at stakeholder management, prioritization, ownership', f:c=>c.comm>=3.6 && c.ps>=3.4,
    why:'Filtered on the role-fit signals \u2014 communication at 3.6+ and problem solving at 3.4+, both drawn from how they reasoned about trade-offs.'},
  'Case study': {label:'Great at UX design, information architecture, prototyping', f:c=>!c.caseNA && c.caseScore>=3.8,
    why:'Filtered on the design case itself \u2014 submitted, and scored 3.8+ on craft.'},
  'Communication': {label:'Great at active listening, stakeholder comms, clarity', f:c=>c.comm>=3.7 && COMP_DEFS.find(d=>d.k==='collab').get(c)>=3.5,
    why:'Filtered on the two criteria this round scores \u2014 communication at 3.7+ and collaboration at 3.5+, both read from how they handled probing questions.'}
};
function applyInt(name){
  const s = INT_SKILLS[name] || INT_SKILLS['360 Interview'];
  Object.assign(FILTERS.skills, {label:s.label, title:s.label, f:s.f, why:s.why});
  if (aiF && aiF.baseK==='skills') aiF = buildF('skills', []);
  syncChips._s = null;
  render();
}
const SUGS = ['adv','skills','unrev','assist','bar4'];
const CAP = 10;
let cap = CAP;
const REFINES = {};
const NEXTS = {};
const cap1 = s=>s.charAt(0).toUpperCase()+s.slice(1);
const joinBits = a => a.length<2 ? a[0] : a.slice(0,-1).join(', ')+' and '+a[a.length-1];
function chipOn(label, ref, n){
  return `<button class="sug on" data-chipx="${ref}" title="Remove this filter"><span class="lbl">${label}</span><span class="sug-n">${n}</span><span class="sug-x" aria-hidden="true"><span class="material-icons-round">close</span></span></button>`;
}
function chipsHtml(){
  const pool = live();
  const out = [];
  const n = f => pool.filter(f).length;
  if (aiF && aiF.baseK === '_free') out.push(chipOn(aiF.label, 'base', n(aiF.f)));
  out.push(cap
    ? chipOn(`Top ${cap} candidates`, 'cap', Math.min(cap, pool.length))
    : `<button class="sug" data-cap="${CAP}">Top ${CAP} candidates<span class="sug-n">${Math.min(CAP, pool.length)}</span></button>`);
  SUGS.forEach(k=>out.push(aiF && aiF.baseK === k
    ? chipOn(FILTERS[k].label, 'base', n(FILTERS[k].f))
    : `<button class="sug" data-q="${k}">${FILTERS[k].label}<span class="sug-n">${n(FILTERS[k].f)}</span></button>`));
  return out.join('');
}
function syncChips(force){
  const sig = (cap||'') + '|' + (aiF ? aiF.baseK+':'+aiF.label : '') + '|' + live().length;
  if (!force && sig === syncChips._s) return;
  syncChips._s = sig;
  $('fltChips').innerHTML = chipsHtml();
}
function buildF(baseK, chain, freeLabel){
  const base = FILTERS[baseK] || {k:'_free', label:(freeLabel||'').trim(), f:c=>c.score>=3.4};
  return {
    baseK: FILTERS[baseK] ? baseK : '_free', freeLabel,
    baseF: base.f,
    label: base.label,
    title: base.title || aiTitleFor(base.label),
    why: base.why || null,
    f: base.f
  };
}
function updX(){ $('fltX').hidden = !$('aiIn').value.trim(); }
/* animated placeholder \u2014 cycles typeable examples */
const PH_BASE = 'Filter candidates by\u2026';
const PH = [
  'who handled pushback without getting defensive',
  'strong problem solvers who also communicate clearly',
  'anyone who passed every coding test',
  'scoring 4.0+ but light on craft',
  'clear communicators with clean proctoring',
  'better than the ones I advanced last week'
];
let phT = [], phI = 0;
const phIdle = ()=>!$('aiIn').value.trim() && document.activeElement !== $('aiIn');
function phStop(){ phT.forEach(clearTimeout); phT = []; }
function phSet(s){ $('aiIn').placeholder = s; }
function startPh(){
  phStop();
  if (matchMedia('(prefers-reduced-motion:reduce)').matches || !phIdle()){ phSet(PH_BASE); return; }
  typePh();
}
function typePh(){
  const full = 'Try \u201C' + PH[phI % PH.length] + '\u201D';
  let i = 0;
  const back = ()=>{
    if (!phIdle()){ phSet(PH_BASE); return; }
    i -= 3; phSet(full.slice(0, Math.max(0,i)));
    if (i > 0) phT.push(setTimeout(back, 16));
    else { phI++; phT.push(setTimeout(typePh, 340)); }
  };
  const step = ()=>{
    if (!phIdle()){ phSet(PH_BASE); return; }
    i++; phSet(full.slice(0, i));
    if (i < full.length) phT.push(setTimeout(step, 24 + Math.random()*26));
    else phT.push(setTimeout(back, 2000));
  };
  phT.push(setTimeout(step, 60));
}
function aiTitleFor(q){
  const t = q.trim();
  if (!t) return 'Matching candidates';
  const s = t.replace(/^(show|find|give)\s+me\s+/i,'').replace(/^(candidates?|people|those)\s+(with|who)\s+/i,'').replace(/[?.]+$/,'').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function aiWhyFor(q, n, total){
  return `Read all ${total} scored interviews and matched them against \u201C${q.trim()}\u201D, weighting the transcript evidence over the headline score. ${n} candidate${n===1?'':'s'} cleared the bar.`;
}

/* ===== state ===== */
const $ = id=>document.getElementById(id);
let selI = null, aiF = null, openK = new Set(), undo = null, busy = false;
let stageIds = null;
const picked = new Set();
const live = ()=>C.filter(c=>!c.status).sort((a,b)=>b.score-a.score);
const visible = ()=>{ const p = live(); return aiF ? p.filter(aiF.f) : p; };

/* ===== render ===== */
function clampRail(){
  const rail = $('rail');
  if (!rail) return;
  if (selI==null){ rail.style.maxHeight=''; return; }
  const rt = rail.getBoundingClientRect().top;
  rail.style.maxHeight = Math.max(220, Math.round(innerHeight - rt - 20)) + 'px';
}
let clampQ = false;
const queueClamp = ()=>{ if (clampQ) return; clampQ = true; requestAnimationFrame(()=>{ clampQ=false; clampRail(); }); };
addEventListener('scroll', queueClamp, {passive:true});
addEventListener('resize', queueClamp);
function setSel(i){
  selI = i;
  openK.clear();
  document.querySelectorAll('.ccard').forEach(el=>el.classList.toggle('sel', +el.dataset.i===selI));
  if (selI!=null) renderRail();
  $('split').classList.toggle('has-sel', selI!=null);
  clampRail();
  setTimeout(clampRail, 560);
}
const SKEL = n => Array.from({length:n}, ()=>`<article class="ccard skel" aria-hidden="true">
  <div class="cc-top"><span class="sk sk-cb"></span><span class="sk sk-rk"></span><span class="sk sk-av"></span>
    <span class="who"><span class="sk sk-nm"></span><span class="sk sk-rl"></span></span><span class="sk sk-sc"></span></div>
  <p class="sk sk-line"></p>
  <div class="cc-bars">${'<div class="mb"><div class="sk sk-bar"></div><span class="sk sk-lbl"></span></div>'.repeat(5)}</div>
</article>`).join('');
const STEPS = ['Reading 20 scored interviews', 'Matching transcript evidence', 'Ranking against your criteria'];
function runFilter(next){
  busy = true;
  picked.clear();
  setSel(null);
  $('lstHead').classList.add('thinking');
  $('viewTitle').textContent = '';
  $('topCount').textContent = '';
  const why = $('aiWhy');
  why.hidden = false;
  why.innerHTML = `<svg class="spark" width="15" height="15" aria-hidden="true"><use href="#aiSparkle"></use></svg><span class="step" id="aiStep">${STEPS[0]}\u2026</span>`;
  $('cards').innerHTML = SKEL(5);
  $('fltChips').innerHTML = '<span class="sk sk-chip"></span><span class="sk sk-chip"></span><span class="sk sk-chip"></span>';
  $('bulkBar').classList.remove('on');
  let s = 0;
  clearInterval(runFilter._i);
  runFilter._i = setInterval(()=>{ s++; const el = $('aiStep'); if (el && STEPS[s]) el.textContent = STEPS[s]+'\u2026'; }, 800);
  clearTimeout(runFilter._t);
  runFilter._t = setTimeout(()=>{
    clearInterval(runFilter._i);
    busy = false;
    aiF = next;
    $('lstHead').classList.remove('thinking');
    syncChips._s = null;
    render();
    $('cards').classList.add('settle');
    setTimeout(()=>$('cards').classList.remove('settle'), 800);
  }, 2400);
}
function stopFilter(){ clearTimeout(runFilter._t); clearInterval(runFilter._i); busy=false; $('lstHead').classList.remove('thinking'); }
function render(){
  if (busy) return;
  for (const i of [...picked]) if (C[i].status) picked.delete(i);
  const arr = visible();
  if (selI!=null && C[selI].status) selI = null;
  if (selI!=null && aiF && !arr.some(c=>c.i===selI)) selI = null;
  $('split').classList.toggle('has-sel', selI!=null);
  renderList(arr);
  renderRail();
  $('bulkBar').classList.toggle('on', picked.size>0);
  $('bulkCount').textContent = picked.size===1 ? '1 candidate selected' : `${picked.size} candidates selected`;
  if (window.syncCompare) window.syncCompare();
}
function barsHtml(c){
  return `<div class="cc-bars">${COMP_DEFS.map(d=>{
    const v = d.get(c);
    return `<div class="mb" title="${d.n} — ${v==null?'not assessed':v.toFixed(1)+'/5'} (${d.w}%)">
      <div class="mb-t"><i class="${band(v)}" style="width:${v==null?0:(v/5*100)}%"></i></div>
      <span class="mb-l">${d.short}</span></div>`;
  }).join('')}</div>`;
}
function shownOf(arr){ return cap ? arr.slice(0, cap) : arr; }
function renderList(arr){
  const shown = shownOf(arr);
  $('viewTitle').textContent = aiF ? (aiF.title || aiTitleFor(aiF.label)) : (cap ? `Top ${cap} candidates` : 'All candidates');
  syncChips();
  $('topCount').textContent = aiF ? `${shown.length} of ${live().length}` : `${shown.length} of ${arr.length}`;
  const why = $('aiWhy');
  const presetWhy = null;
  if (aiF){ why.innerHTML = `<svg class="spark" width="15" height="15" aria-hidden="true"><use href="#aiSparkle"></use></svg><span>${aiF.why || aiWhyFor(aiF.label, shown.length, live().length)}</span>`; why.hidden = false; }
  else if (presetWhy){ why.innerHTML = `<svg class="spark" width="15" height="15" aria-hidden="true"><use href="#aiSparkle"></use></svg><span>${presetWhy}</span>`; why.hidden = false; }
  else { why.hidden = true; why.innerHTML = ''; }
  $('fchip').innerHTML = '';
  const allSel = shown.length>0 && shown.every(c=>picked.has(c.i));
  const someSel = shown.some(c=>picked.has(c.i));
  const sa = $('selAll');
  sa.hidden = shown.length===0;
  sa.innerHTML = `<span class="cb${allSel?' checked':someSel?' some':''}"></span>`;
  sa.title = allSel ? 'Clear selection' : 'Select all';
  $('cards').innerHTML = shown.map((c,n)=>`
    <article class="ccard${c.i===selI?' sel':''}" data-i="${c.i}" tabindex="0">
      <div class="cc-top">
        <span class="cb${picked.has(c.i)?' checked':''}" data-cb="${c.i}" role="checkbox" aria-checked="${picked.has(c.i)}" tabindex="0" title="Select"></span>
        <span class="rk">${n+1}</span>
        <span class="avatar ${c.col}">${c.init}</span>
        <span class="who"><span class="nm">${c.name}</span><span class="rl">${c.role} · ${c.company}</span></span>
        <span class="sc ${c.score<3.4?'low':''}">${c.score.toFixed(1)}<small>/5</small></span>
      </div>
      <p class="cc-line">${cardLine(c)}</p>
      ${barsHtml(c)}
      <div class="cc-state">
        ${c.flags?`<span class="cst flag" title="${c.flags} proctoring issue${c.flags===1?'':'s'} found"><span class="material-icons-round">flag</span>${c.flags}</span>`:''}
        ${c.assist?'<span class="cst ask" title="Requested human assistance during the session"><span class="material-icons-round">support_agent</span></span>':''}
      </div>
      <div class="cc-acts">
        <button class="ca adv" data-cadv="${c.i}">Advance stage<span class="material-icons-round">expand_more</span></button>
        <button class="ca hm" data-cact="hm" data-ci="${c.i}" title="Share with hiring manager"><span class="material-icons-round">send</span><span class="lbl">Share with HM</span><span class="lbl-s">Share</span></button>
      </div>
    </article>`).join('') || `<div class="empty"><span class="material-icons-round">filter_alt_off</span>No candidates match that filter.<button class="lnk" id="clearF2">Clear the filter</button></div>`;
}
function railCrit(c){
  return COMP_DEFS.map(d=>{
    const v = d.get(c), e = compEval(c,d,v), open = openK.has(d.k);
    return `<div class="crit${open?' open':''}" data-k="${d.k}">
      <button class="crit-h">
        <span class="crit-n">${d.n}</span>
        <span class="crit-t"><i class="${band(v)}" style="width:${v==null?0:(v/5*100)}%"></i></span>
        <span class="crit-v${v==null?' na':''}">${v==null?'n/a':v.toFixed(1)}</span>
        <span class="material-icons-round chev">expand_more</span>
      </button>
      <div class="crit-b">
        ${e.plus?`<div class="ev plus"><b>+</b><span>${e.plus}</span><button class="ts" data-ts="${tsFor(c,d.k,'+')}"><span class="material-icons-round">play_arrow</span>${tsFor(c,d.k,'+')}</button></div>`:''}
        ${e.minus?`<div class="ev minus"><b>–</b><span>${e.minus}</span><button class="ts" data-ts="${tsFor(c,d.k,'-')}"><span class="material-icons-round">play_arrow</span>${tsFor(c,d.k,'-')}</button></div>`:''}
      </div>
    </div>`;
  }).join('');
}
function renderRail(){
  if (selI==null) return; /* keep last content while it slides out */
  const c = C[selI], v = verdictFor(c);
  $('rail').innerHTML = `
    <div class="rail-scroll">
      <div class="rl-id">
        <span class="avatar ${c.col}">${c.init}</span>
        <span class="rl-who"><a class="rl-nm" href="#" onclick="return false;" title="View candidate profile">${c.name}</a><span class="rl-rl">${c.role} · ${c.company}</span></span>
        <span class="rl-sc"><b>${c.score.toFixed(1)}</b><small>/5</small></span>
        <button class="rl-x" id="railX" title="Close"><span class="material-icons-round">close</span></button>
      </div>
      <div class="rl-verdict ${v.cls}">
        <div class="rv-k"><span class="rv-kl"><span class="material-icons-round">auto_awesome</span>AI summary</span><span class="rv-tag">${v.tag}</span></div>
        <p class="rv-t">${v.txt}</p>
      </div>
      <div class="rl-ask" id="askBox">
        <div class="ask-in"><svg class="spark" width="16" height="16" aria-hidden="true"><use href="#aiSparkle"></use></svg><input id="askIn" type="text" placeholder="Ask about ${c.name.split(' ')[0]}..." /><button class="ask-go" id="askGo" title="Ask"><span class="material-icons-round">arrow_forward</span></button></div>
        <div class="ask-sugs">
          <button class="ask-sug">Strongest &amp; weakest areas</button>
          <button class="ask-sug">Handling of pushback</button>
          <button class="ask-sug">Vs. batch average</button>
        </div>
        <div class="ask-a" id="askA"></div>
      </div>
      ${c.proctor?'':`<div class="rl-flag"><span class="material-icons-round">flag</span><span><b>Proctoring flags on this session.</b> Tab switches and a second face were detected. Review the replay before you advance.</span></div>`}
      <div class="rl-sec">
        <h3>Hiring criteria</h3>
        <div class="crit-list">${railCrit(c)}</div>
      </div>
      <div class="rl-sec">
        <h3><svg class="spark" width="16" height="16" aria-hidden="true"><use href="#aiSparkle"></use></svg>Video highlights</h3>
        <div class="vid-card">
          <button class="rl-vid" id="railVid" title="Play highlight reel">
            <img src="${c.photo}" alt="" />
            <span class="rl-vp"><span class="material-icons-round">play_arrow</span></span>
            <span class="rl-dur">${c.dur}</span>
          </button>
          <div class="vid-tx">
            <span>${c.dur.split(':')[0]} minute video showcasing top highlights from ${c.name.split(' ')[0]}&rsquo;s interview</span>
            <a class="rl-cta" href="#" onclick="return false;">View detailed feedback<span class="material-icons-round">arrow_forward</span></a>
          </div>
        </div>
      </div>
    </div>
    <div class="rail-acts" id="railActs">
      <button class="ract adv" id="advBtn">Advance<span class="lbl2">&nbsp;stage</span><span class="material-icons-round">expand_more</span></button>
      <button class="ract hm" data-act="hm">Share with HM</button>
    </div>`;
  queueClamp();
}

/* ===== actions ===== */
const VERB = {adv:'advanced', hm:'shared with your hiring manager'};
function act(ids, kind, stage){
  if (!ids.length) return;
  const snap = ids.map(i=>({i, prev:C[i].status, prevStage:C[i].stage}));
  ids.forEach(i=>{ C[i].status = kind; C[i].stage = kind==='adv' ? (stage||null) : null; });
  picked.clear();
  undo = ()=>{ snap.forEach(s=>{ C[s.i].status = s.prev; C[s.i].stage = s.prevStage; }); undo=null; render(); };
  const who = ids.length===1 ? C[ids[0]].name : `${ids.length} candidates`;
  toast(`${who} ${kind==='adv' && stage ? `advanced to ${stage}` : VERB[kind]}.`);
  render();
}
function openStage(btn, ids){
  if (!ids.length) return;
  const m = $('stageMenu');
  if (stageIds && m.classList.contains('on') && openStage._btn===btn){ closeStage(); return; }
  stageIds = ids;
  openStage._btn = btn;
  m.classList.add('on');
  const r = btn.getBoundingClientRect(), h = m.offsetHeight, w = m.offsetWidth;
  let top = r.bottom + 8;
  if (top + h > innerHeight - 12) top = Math.max(12, r.top - h - 8);
  m.style.top = top + 'px';
  m.style.left = Math.max(12, Math.min(r.left, innerWidth - w - 14)) + 'px';
}
const closeStage = ()=>{ $('stageMenu').classList.remove('on'); stageIds = null; openStage._btn = null; };
function toast(msg){
  $('toastTxt').textContent = msg;
  const t = $('toast'); t.classList.add('on');
  clearTimeout(toast._h); toast._h = setTimeout(()=>t.classList.remove('on'), 5200);
}
$('toastUndo').addEventListener('click', ()=>{ if (undo) undo(); $('toast').classList.remove('on'); });

/* ===== events ===== */
document.addEventListener('click', e=>{
  const chx = e.target.closest('[data-chipx]');
  if (chx){
    if (busy) return;
    const ref = chx.dataset.chipx;
    if (ref === 'cap'){ cap = null; picked.clear(); render(); return; }
    stopFilter(); aiF = null; picked.clear(); render(); return;
  }
  const capc = e.target.closest('[data-cap]');
  if (capc){ stopFilter(); aiF = null; cap = +capc.dataset.cap; picked.clear(); render(); return; }
  const pi = e.target.closest('[data-pos]');
  if (pi){ $('posLbl').textContent = pi.dataset.pos; $('posWrap').classList.remove('open'); [...document.querySelectorAll('[data-pos]')].forEach(x=>x.classList.toggle('cur', x===pi)); return; }
  const ii = e.target.closest('[data-int]');
  if (ii){ $('intLbl').textContent = ii.dataset.int; $('intWrap').classList.remove('open'); [...document.querySelectorAll('[data-int]')].forEach(x=>x.classList.toggle('cur', x===ii)); applyInt(ii.dataset.int); return; }
  if (!e.target.closest('#posWrap')) $('posWrap').classList.remove('open');
  if (!e.target.closest('#intWrap')) $('intWrap').classList.remove('open');
  const si = e.target.closest('[data-stage]');
  if (si){ const ids = stageIds || []; closeStage(); act(ids, 'adv', si.dataset.stage); return; }
  const cadv = e.target.closest('[data-cadv]');
  if (cadv){ e.stopPropagation(); openStage(cadv, [+cadv.dataset.cadv]); return; }
  if (e.target.closest('#advBtn')){ e.stopPropagation(); openStage($('advBtn'), selI==null?[]:[selI]); return; }
  if (e.target.closest('#bulkAdv')){ e.stopPropagation(); openStage($('bulkAdv'), [...picked]); return; }
  if (!e.target.closest('.stage-menu')) closeStage();
  const cact = e.target.closest('[data-cact]');
  if (cact){ e.stopPropagation(); act([+cact.dataset.ci], cact.dataset.cact); return; }
  if (e.target.closest('#askX')){ clearTimeout(answer._t); clearInterval(answer._i); $('askA').classList.remove('on'); $('askIn').value=''; queueClamp(); return; }
  const asug = e.target.closest('.ask-sug');
  if (asug){ $('askIn').value = asug.textContent; answer(); queueClamp(); return; }
  if (e.target.closest('#selAll')){
    const shown = shownOf(visible());
    const allSel = shown.length>0 && shown.every(c=>picked.has(c.i));
    shown.forEach(c=>allSel ? picked.delete(c.i) : picked.add(c.i));
    render(); return;
  }
  const cb = e.target.closest('[data-cb]');
  if (cb){ e.stopPropagation(); const i=+cb.dataset.cb; picked.has(i)?picked.delete(i):picked.add(i); render(); return; }
  const card = e.target.closest('.ccard');
  if (card){ const i = +card.dataset.i; setSel(selI===i ? null : i); return; }
  if (e.target.closest('#railX')){ setSel(null); return; }
  const ch = e.target.closest('.crit-h');
  if (ch){ const k = ch.closest('.crit').dataset.k; openK.has(k)?openK.delete(k):openK.add(k); renderRail(); return; }
  const ts = e.target.closest('[data-ts]');
  if (ts){ e.stopPropagation(); openReel(C[selI], ts.dataset.ts); return; }
  if (e.target.closest('#railVid')){ openReel(C[selI]); return; }
  const ra = e.target.closest('[data-act]');
  if (ra){ const i = selI; act([i], ra.dataset.act); return; }
  const ba = e.target.closest('[data-bulk]');
  if (ba){ act([...picked], ba.dataset.bulk); return; }
  if (e.target.closest('#clearF') || e.target.closest('#clearF2')){ stopFilter(); aiF=null; $('aiIn').value=''; setTyping(false); updX(); startPh(); render(); return; }
  if (e.target.closest('#fltX')){ $('aiIn').value=''; setTyping(false); updX(); startPh(); $('aiIn').focus(); return; }
  const sug = e.target.closest('[data-q]');
  if (sug){ if (busy) return; cap = null; $('aiIn').value=''; setTyping(false); updX(); startPh(); runFilter(buildF(sug.dataset.q, [])); return; }
  if (e.target.closest('#askGo')){ answer(); return; }
  if (e.target.closest('#reelX') || e.target === $('reelModal')){ $('reelModal').classList.remove('on'); return; }
});
document.addEventListener('keydown', e=>{
  if (e.key==='Enter' && e.target.id==='askIn'){ e.preventDefault(); answer(); queueClamp(); return; }
  if (e.key==='Escape'){
    if ($('reelModal').classList.contains('on')) $('reelModal').classList.remove('on');
    else if (selI!=null) setSel(null);
  }
  if (e.key===' ' && e.target.matches('[data-cb]')){ e.preventDefault(); e.target.click(); }
  if (e.key==='Enter' && e.target.matches('.ccard')){ const i = +e.target.dataset.i; setSel(selI===i ? null : i); }
});
function submitFilter(){
  const raw = $('aiIn').value.trim(), q = raw.toLowerCase();
  setTyping(false);
  if (!q){ startPh(); return; }
  const hit = Object.entries(FILTERS).find(([,f])=>f.label.toLowerCase().includes(q) || q.split(' ').some(w=>w.length>3 && f.label.toLowerCase().includes(w)));
  $('aiIn').value = '';
  updX(); startPh();
  cap = null;
  runFilter(buildF(hit ? hit[0] : '_free', [], raw));
}
const fltRow = ()=>$('aiIn').closest('.flt-row');
const setTyping = on => fltRow().classList.toggle('typing', on);
$('aiIn').addEventListener('focus', ()=>{ setTyping(true); phStop(); phSet(PH_BASE); });
$('aiIn').addEventListener('blur', e=>{ setTyping(e.target.value.trim().length>0); startPh(); });
$('aiIn').addEventListener('input', e=>{ setTyping(true); updX(); });
$('aiIn').addEventListener('keydown', e=>{ if (e.key==='Enter') submitFilter(); });
$('aiGo').addEventListener('click', submitFilter);
function critLine(c, d, v){
  if (v==null) return `<span class="ask-p"><b>${d.n} — not assessed</b>${compEval(c,d,null).minus}</span>`;
  const e = compEval(c,d,v);
  return `<span class="ask-p"><b>${d.n} — ${v.toFixed(1)}/5</b>${e.plus||''}${e.minus?`<span class="am">${e.minus}</span>`:''}</span>`;
}
function answer(){
  const c = C[selI], q = $('askIn').value.trim(), myI = selI;
  if (!q) return;
  clearTimeout(answer._t); clearInterval(answer._i);
  const ASTEPS = ['Reading the transcript', 'Checking the scored criteria', 'Pulling the evidence'];
  const sa = $('askA');
  sa.innerHTML = `<button class="ask-x" id="askX" title="Clear"><span class="material-icons-round">close</span></button>
    <span class="ask-t">${q}</span>
    <span class="ask-sk"><span class="ask-step"><svg class="spark" width="14" height="14" aria-hidden="true"><use href="#aiSparkle"></use></svg><span id="askStep">${ASTEPS[0]}\u2026</span></span>
      <span class="sk sk-h"></span><span class="sk sk-r"></span><span class="sk sk-r r2"></span>
      <span class="sk sk-h h2"></span><span class="sk sk-r"></span><span class="sk sk-r r3"></span></span>`;
  sa.classList.add('on');
  let s = 0;
  answer._i = setInterval(()=>{ s++; const el = $('askStep'); if (el && ASTEPS[s]) el.textContent = ASTEPS[s]+'\u2026'; }, 560);
  answer._t = setTimeout(()=>{ clearInterval(answer._i); if (selI===myI) renderAnswer(c, q); queueClamp(); }, 1500);
}
function renderAnswer(c, q){
  const ql = q.toLowerCase();
  const scored = COMP_DEFS.map(d=>({d, v:d.get(c)})).filter(x=>x.v!=null).sort((a,b)=>b.v-a.v);
  const named = COMP_DEFS.find(d=>ql.includes(d.short.toLowerCase()) || ql.includes(d.n.toLowerCase()));
  let parts;
  if (/batch|average|compare|vs\.?|rank|others|pool/.test(ql)){
    parts = [`<span class="ask-p"><b>${c.score.toFixed(1)}/5 against a ${BATCH_AVG} batch average</b>${verdictFor(c).txt}</span>`];
  } else if (/pushback|feedback|collab|disagree|challenge|hint/.test(ql)){
    const a = COMP_DEFS.find(x=>x.k==='collab'), b = COMP_DEFS.find(x=>x.k==='comm');
    parts = [critLine(c,a,a.get(c)), critLine(c,b,b.get(c))];
  } else if (/proctor|flag|integrity|cheat/.test(ql)){
    parts = [c.proctor
      ? `<span class="ask-p"><b>No proctoring flags</b>The session ran clean — no tab switches or second-face detections.</span>`
      : `<span class="ask-p"><b>Proctoring flags on this session</b>Tab switches and a second face were detected. Review the replay before you advance.</span>`];
  } else if (named){
    parts = [critLine(c, named, named.get(c))];
  } else {
    const top = scored[0], low = scored[scored.length-1];
    parts = [critLine(c, top.d, top.v), critLine(c, low.d, low.v)];
  }
  const a = $('askA');
  a.innerHTML = `<button class="ask-x" id="askX" title="Clear"><span class="material-icons-round">close</span></button>
    <span class="ask-t">${q}</span>
    <span class="ask-b">${parts.join('')}</span>`;
  a.classList.add('on');
}
function openReel(c, ts){
  $('reelTitle').textContent = `${c.name} · highlight reel${ts?` — ${ts}`:''}`;
  $('reelImg').src = c.photo;
  $('reelModal').classList.add('on');
}
C.forEach(c=>{ const im = new Image(); im.src = c.photo; });
render();
setTimeout(startPh, 1500);
if (window.__initSel!=null) setSel(window.__initSel);
