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
    caseNA: i%4===0, caseScore: +clamp(score+0.2,1,4.75).toFixed(1),
    dur: (2+(i*7)%3)+':'+String(10+(i*13)%50).padStart(2,'0'),
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
  ps:       {k:'ps', label:'Strong problem solving', title:'Strongest problem solvers', f:c=>c.ps>=3.75,
             why:'Ranked on the problem-solving criterion alone (30% of the score), keeping everyone at 3.8 or above. Overall score was ignored, so a few mid-pack candidates surface here.'},
  comm:     {k:'comm', label:'Great communicators', title:'Clearest communicators', f:c=>c.comm>=3.75,
             why:'Scored on communication only (20% of the weighting) at 3.8 and above \u2014 candidates who stayed easy to follow under probing questions.'},
  allTests: {k:'allTests', label:'Passed all coding tests', title:'Passed every coding test', f:c=>c.passed===c.total,
             why:'A hard filter on the coding exercise: all 13 test cases green. No partial credit, so strong candidates who failed one edge case are excluded.'},
  craft:    {k:'craft', label:'Completed the design case', title:'Completed the design case', f:c=>!c.caseNA,
             why:'Everyone who submitted the design case, so craft could actually be assessed. Candidates who skipped it carry no craft signal and are left out.'}
};
const DEFAULT_CHIPS = '<button class="sug" data-q="ps">Strong problem solving</button><button class="sug" data-q="comm">Great communicators</button><button class="sug" data-q="allTests">Passed all coding tests</button><button class="sug" data-q="craft">Completed the design case</button>';
const REFINES = {
  clean:{label:'With clean proctoring only', short:'clean proctoring', f:c=>c.proctor, bit:'kept only sessions with no proctoring flags'},
  tests:{label:'Who passed every coding test', short:'all tests green', f:c=>c.passed===c.total, bit:'required all 13 coding tests to pass'},
  comm2:{label:'Who also communicate clearly', short:'clear communicators', f:c=>c.comm>=3.75, bit:'added a communication bar of 3.8+'},
  bar4:{label:'Scoring 4.0+ overall', short:'4.0+ overall', f:c=>c.score>=4, bit:'raised the overall bar to 4.0'},
  ps2:{label:'With strong problem solving', short:'strong problem solving', f:c=>c.ps>=3.75, bit:'added a problem-solving bar of 3.8+'}
};
const NEXTS = { ps:['comm2','tests','clean'], comm:['ps2','bar4','clean'], allTests:['ps2','comm2','clean'], craft:['ps2','bar4','clean'], _free:['bar4','clean','tests'] };
function chipsHtml(){
  if (!aiF) return DEFAULT_CHIPS;
  const used = aiF.chain || [];
  const pool = (NEXTS[aiF.baseK || aiF.k] || NEXTS._free).filter(x=>!used.includes(x));
  return pool.map(x=>`<button class="sug" data-refine="${x}">${REFINES[x].label}</button>`).join('');
}
function updX(){ $('fltX').hidden = !($('aiIn').value.trim() || aiF); }
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
const VIEWS = [
  {k:'top5',  t:'Top 5 candidates',  n:5},
  {k:'top10', t:'Top 10 candidates', n:10},
  {k:'all',   t:'All candidates'},
  {k:'adv',   t:'Like the ones you advanced', f:c=>c.score>=4 && c.proctor,
              why:'Scored 4.0 or higher with a clean proctoring session — the same bar the candidates you’ve advanced from this pipeline have cleared.'},
  {k:'flag',  t:'With proctoring flags', f:c=>!c.proctor},
  {k:'bar',   t:'Below your bar',        f:c=>c.score<3.4,
              why:'Scored under 3.4 against a 3.5 batch average, with gaps on multiple weighted criteria rather than one weak spot.'}
];
let view = 'top5';
const curView = ()=>VIEWS.find(v=>v.k===view) || VIEWS[0];
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
    render();
    $('cards').classList.add('settle');
    setTimeout(()=>{ $('fltChips').innerHTML = chipsHtml(); updX(); }, 450);
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
}
function barsHtml(c){
  return `<div class="cc-bars">${COMP_DEFS.map(d=>{
    const v = d.get(c);
    return `<div class="mb" title="${d.n} — ${v==null?'not assessed':v.toFixed(1)+'/5'} (${d.w}%)">
      <div class="mb-t"><i class="${band(v)}" style="width:${v==null?0:(v/5*100)}%"></i></div>
      <span class="mb-l">${d.short}</span></div>`;
  }).join('')}</div>`;
}
function shownOf(arr){
  if (aiF) return arr;
  const v = curView();
  const m = v.f ? arr.filter(v.f) : arr;
  return v.n ? m.slice(0, v.n) : m;
}
function renderList(arr){
  const shown = shownOf(arr);
  $('viewTitle').textContent = aiF ? (aiF.title || aiTitleFor(aiF.label)) : curView().t;
  $('viewWrap').classList.toggle('filtered', !!aiF);
  if (aiF) $('viewWrap').classList.remove('open');
  $('viewMenu').innerHTML = aiF ? '' : VIEWS.map(o=>{
    const m = o.f ? arr.filter(o.f) : arr;
    const n = o.n ? Math.min(o.n, m.length) : m.length;
    return `<div class="view-item${o.k===view?' cur':''}" data-view="${o.k}" role="menuitem"><span class="vn">${o.t}</span><span class="vc">${n}</span></div>`;
  }).join('');
  $('topCount').textContent = aiF ? `${shown.length} of ${live().length}` : `${shown.length} of ${arr.length}`;
  const why = $('aiWhy');
  const presetWhy = !aiF && curView().why;
  if (aiF){ why.innerHTML = `<svg class="spark" width="15" height="15" aria-hidden="true"><use href="#aiSparkle"></use></svg><span>${aiF.why || aiWhyFor(aiF.label, shown.length, live().length)}</span>`; why.hidden = false; }
  else if (presetWhy){ why.innerHTML = `<svg class="spark" width="15" height="15" aria-hidden="true"><use href="#aiSparkle"></use></svg><span>${presetWhy}</span>`; why.hidden = false; }
  else { why.hidden = true; why.innerHTML = ''; }
  $('fchip').innerHTML = aiF ? '<button class="oct-btn" id="clearF">Reset</button>' : '';
  const allSel = shown.length>0 && shown.every(c=>picked.has(c.i));
  const someSel = shown.some(c=>picked.has(c.i));
  const sa = $('selAll');
  sa.hidden = shown.length===0;
  sa.innerHTML = `<span class="cb${allSel?' checked':someSel?' some':''}"></span>${allSel?'Clear selection':'Select all'}`;
  $('cards').innerHTML = shown.map((c,n)=>`
    <article class="ccard${c.i===selI?' sel':''}" data-i="${c.i}" tabindex="0">
      <div class="cc-top">
        <span class="cb${picked.has(c.i)?' checked':''}" data-cb="${c.i}" role="checkbox" aria-checked="${picked.has(c.i)}" tabindex="0" title="Select"></span>
        <span class="rk">${n+1}</span>
        <span class="avatar ${c.col}">${c.init}</span>
        <span class="who"><span class="nm">${c.name}</span><span class="rl">${c.role} · ${c.company}</span></span>
        ${c.proctor?'':'<span class="flagdot" title="Proctoring flags to review"><span class="material-icons-round">flag</span></span>'}
        <span class="sc ${c.score<3.4?'low':''}">${c.score.toFixed(1)}<small>/5</small></span>
      </div>
      <p class="cc-line">${cardLine(c)}</p>
      ${barsHtml(c)}
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
  const vw = $('viewWrap');
  if (e.target.closest('#viewBtn')){ if (!aiF) vw.classList.toggle('open'); return; }
  const vi = e.target.closest('[data-view]');
  if (vi){ view = vi.dataset.view; vw.classList.remove('open'); picked.clear(); render(); return; }
  if (!e.target.closest('#viewWrap')) vw.classList.remove('open');
  const pi = e.target.closest('[data-pos]');
  if (pi){ $('posLbl').textContent = pi.dataset.pos; $('posWrap').classList.remove('open'); [...document.querySelectorAll('[data-pos]')].forEach(x=>x.classList.toggle('cur', x===pi)); return; }
  const ii = e.target.closest('[data-int]');
  if (ii){ $('intLbl').textContent = ii.dataset.int; $('intWrap').classList.remove('open'); [...document.querySelectorAll('[data-int]')].forEach(x=>x.classList.toggle('cur', x===ii)); return; }
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
  if (e.target.closest('#askX')){ $('askA').classList.remove('on'); $('askIn').value=''; queueClamp(); return; }
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
  if (e.target.closest('#clearF') || e.target.closest('#clearF2')){ stopFilter(); aiF=null; $('aiIn').value=''; setTyping(false); $('fltChips').innerHTML = chipsHtml(); updX(); render(); return; }
  if (e.target.closest('#fltX')){ stopFilter(); aiF=null; $('aiIn').value=''; setTyping(false); $('fltChips').innerHTML = chipsHtml(); updX(); render(); $('aiIn').focus(); return; }
  const rf = e.target.closest('[data-refine]');
  if (rf){
    if (busy || !aiF) return;
    const r = REFINES[rf.dataset.refine], cur = aiF;
    const nx = { k:cur.k, baseK:cur.baseK||cur.k, chain:[...(cur.chain||[]), rf.dataset.refine], label:r.label,
      title:(cur.title||aiTitleFor(cur.label))+' \u00b7 '+r.short,
      why:'Started from \u201C'+(cur.title||aiTitleFor(cur.label))+'\u201D and '+r.bit+' \u2014 the criteria are combined, so everyone here clears both bars.',
      f:c=>cur.f(c) && r.f(c) };
    $('aiIn').value = $('aiIn').value.trim() ? $('aiIn').value.trim() + ' + ' + r.label.charAt(0).toLowerCase() + r.label.slice(1) : r.label;
    setTyping(false); updX(); runFilter(nx); return;
  }
  const sug = e.target.closest('[data-q]');
  if (sug){ const f = FILTERS[sug.dataset.q]; $('aiIn').value = f.label; setTyping(false); updX(); runFilter(f); return; }
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
  if (!q){ stopFilter(); aiF=null; $('fltChips').innerHTML = chipsHtml(); updX(); render(); return; }
  const hit = Object.entries(FILTERS).find(([,f])=>f.label.toLowerCase().includes(q) || q.split(' ').some(w=>w.length>3 && f.label.toLowerCase().includes(w)));
  updX();
  runFilter(hit ? hit[1] : {k:'_free', label:raw, f:c=>c.score>=3.4});
}
const fltRow = ()=>$('aiIn').closest('.flt-row');
const setTyping = on => fltRow().classList.toggle('typing', on);
$('aiIn').addEventListener('focus', ()=>setTyping(true));
$('aiIn').addEventListener('blur', e=>setTyping(e.target.value.trim().length>0));
$('aiIn').addEventListener('input', e=>{ setTyping(true); updX(); });
$('aiIn').addEventListener('keydown', e=>{ if (e.key==='Enter') submitFilter(); });
$('aiGo').addEventListener('click', submitFilter);
function critLine(c, d, v){
  if (v==null) return `<span class="ask-p"><b>${d.n} — not assessed</b>${compEval(c,d,null).minus}</span>`;
  const e = compEval(c,d,v);
  return `<span class="ask-p"><b>${d.n} — ${v.toFixed(1)}/5</b>${e.plus||''}${e.minus?`<span class="am">${e.minus}</span>`:''}</span>`;
}
function answer(){
  const c = C[selI], q = $('askIn').value.trim();
  if (!q) return;
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
if (window.__initSel!=null) setSel(window.__initSel);
