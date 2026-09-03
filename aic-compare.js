/* Compare candidates — ported from TA_Scheduling_Nudge-UX (FloatingInputPanel v4 + Oda4ComparePanel).
   Reads C / COMP_DEFS / BATCH_AVG / picked from the main leaderboard script. */
(function(){
const el = id=>document.getElementById(id);
const COLM = {red:'#c15151',yellow:'#858707',green:'#1999ac',orange:'#c97e19',blue:'#2c8cc9',violet:'#5962b7',yellow2:'#a88f00',red2:'#d26743',magenta:'#b5548e'};
const PILL_BASE = ["Who's the best match?",'Summarize strengths'];
const PILL_BY_INT = {
  '360 Interview': ['Where do they differ most?','Who handled pushback best?','Safer hire vs. higher ceiling','Rank on problem solving'],
  'Coding round':  ['Who wrote the cleanest solution?','Compare test pass rates','Who reasoned about trade-offs?','Rank on coding proficiency'],
  'Role fit':      ['Who is the better fit for a lead role?','Compare ownership signals','Who communicates most clearly?','Rank on communication'],
  'Case study':    ['Who showed stronger craft?','Compare how they framed the problem','Who explored more alternatives?','Rank on design craft'],
  'Communication': ['Who is the clearest communicator?','Compare how they handled probing','Who listened rather than defended?','Rank on collaboration']
};
const curInt = ()=>{ const l = el('intLbl'); return (l && PILL_BY_INT[l.textContent.trim()]) ? l.textContent.trim() : '360 Interview'; };
const pills = ()=>[...PILL_BASE, ...PILL_BY_INT[curInt()]];
const SUGG = ['Compare their overall interview performance','Identify who has stronger problem solving','Assess each candidate\u2019s leadership potential','Analyze diversity in backgrounds and experience','Compare how each handled pushback'];
const STEPS = ['Reading the scored interviews','Lining up the criteria','Writing the comparison'];
let open=false, wide=false, busyC=false, subj=[], stripOn=false, suggOn=false, draft='';
let turns=[], tSeq=0;
const cmpPick = new Set();
const shareLbl = ()=>{ const l = document.querySelector('.cc-acts .ca.hm .lbl'); return l ? l.textContent.trim() : 'Share with HM'; };

const crits = c => COMP_DEFS.map(d=>({d, v:d.get(c)})).filter(x=>x.v!=null).sort((a,b)=>b.v-a.v);
const nameList = a => a.length<2 ? (a[0]||'') : a.slice(0,-1).join(', ')+' and '+a[a.length-1];
const av = (c, extra)=>`<span class="cmp-av${extra?' '+extra:''}" style="background:${COLM[c.col]||'#5962b7'}">${c.init}</span>`;
const dots = s=>`<span class="cmp-dots">${[1,2,3,4,5].map(i=>`<span class="cmp-dot${i<=Math.round(s)?' f':''}"></span>`).join('')}</span>`;
const sel = ()=>[...picked].sort((a,b)=>C[b].score-C[a].score).map(i=>C[i]);

/* ===== floating bar ===== */
function syncBar(){
  const bar = el('cmpBar'); if (!bar) return;
  const list = sel();
  const show = list.length>1 && !open;
  bar.classList.toggle('on', show);
  if (!show){ if (!open) bar.innerHTML = bar.innerHTML; return; }
  const shown = list.slice(0,2), more = list.length-2;
  bar.innerHTML =
    `<span class="cmp-avs">${shown.map(c=>av(c)).join('')}${more>0?`<span class="cmp-av more">+${more}</span>`:''}</span>`+
    `<span class="cmp-pills" id="cmpPills">${pills().map(p=>`<button class="cmp-pill" data-cmpq="${p.replace(/"/g,'&quot;')}">${p}</button>`).join('')}</span>`+
    `<button class="cmp-scroll" id="cmpMore" title="More prompts"><span class="material-icons-round">chevron_right</span></button>`+
    `<button class="cmp-ask" id="cmpAsk"><span class="material-icons-round">add</span>Ask AI</button>`;
}

/* ===== comparison copy ===== */
function summary(q, list){
  if (!list.length) return 'Select two or more candidates to compare them.';
  const ql = (q||'').toLowerCase();
  const best = list[0], rest = list.slice(1);
  const bc = crits(best);
  const nm = c=>`<b>${c.name}</b>`;
  const D = k=>COMP_DEFS.find(d=>d.k===k), g = (c,k)=>D(k).get(c);
  const rankOn = (k, why)=>{
    const scored = list.filter(c=>g(c,k)!=null).sort((a,b)=>g(b,k)-g(a,k)), na = list.filter(c=>g(c,k)==null);
    return `Ranked on ${D(k).n.toLowerCase()}: ${scored.map((c,i)=>`${i+1}. ${nm(c)} ${g(c,k).toFixed(1)}`).join(', ')}${na.length?` \u2014 ${nameList(na.map(c=>c.name))} skipped the design case, so craft wasn\u2019t assessed`:''}. ${why}`;
  };
  if (/differ/.test(ql)){
    const spread = COMP_DEFS.map(d=>{ const vs = list.map(c=>d.get(c)).filter(v=>v!=null); return {d, s: vs.length>1 ? Math.max(...vs)-Math.min(...vs) : 0}; }).sort((a,b)=>b.s-a.s);
    const top = spread[0], tight = spread[spread.length-1];
    const hi = list.filter(c=>top.d.get(c)!=null).sort((a,b)=>top.d.get(b)-top.d.get(a));
    return `The biggest gap is on ${top.d.n.toLowerCase()} \u2014 ${top.s.toFixed(1)} points between ${nm(hi[0])} (${top.d.get(hi[0]).toFixed(1)}) and ${nm(hi[hi.length-1])} (${top.d.get(hi[hi.length-1]).toFixed(1)}). They are closest on ${tight.d.n.toLowerCase()} (${tight.s.toFixed(1)} apart), so that criterion won\u2019t separate them.`;
  }
  if (/safer|ceiling/.test(ql)){
    const cons = [...list].sort((a,b)=>{ const sp = c=>{ const v = crits(c).map(x=>x.v); return Math.max(...v)-Math.min(...v) + (c.proctor?0:0.5); }; return sp(a)-sp(b); })[0];
    const peak = [...list].sort((a,b)=>crits(b)[0].v-crits(a)[0].v)[0];
    const pk = crits(peak)[0];
    return cons===peak
      ? `${nm(cons)} is both \u2014 the most even profile across the criteria and the highest single peak (${pk.d.n.toLowerCase()} ${pk.v.toFixed(1)}), with ${cons.proctor?'a clean session':'proctoring flags to review'}.`
      : `${nm(cons)} is the safer hire \u2014 the most even profile across the criteria${cons.proctor?' and a clean session':''}. ${nm(peak)} has the higher ceiling on ${pk.d.n.toLowerCase()} at ${pk.v.toFixed(1)}${peak.proctor?'':', with proctoring flags to review'}; the question is whether ${pk.d.n.toLowerCase()} is what this role most needs.`;
  }
  if (/test/.test(ql)){
    const byT = [...list].sort((a,b)=>b.passed-a.passed);
    return `Test pass rates: ${byT.map(c=>`${nm(c)} ${c.passed}/${c.total}`).join(', ')}. ${nameList(byT.filter(c=>c.passed===c.total).map(c=>c.name))||'None of them'} passed every case${byT.some(c=>c.passed<c.total)?`; ${nameList(byT.filter(c=>c.passed<c.total).map(c=>`${c.name} (${c.total-c.passed} failed)`))} worth a look at the failing cases before deciding`:''}.`;
  }
  if (/clean|solution|code quality|coding/.test(ql)) return rankOn('coding', `${nm(list.slice().sort((a,b)=>b.coding-a.coding)[0])} wrote the cleanest solution \u2014 correct, readable and narrated while writing.`);
  if (/trade-?off|reason/.test(ql)){
    const by = [...list].sort((a,b)=>(b.ps+b.coding)-(a.ps+a.coding));
    return `${nm(by[0])} reasoned about trade-offs most explicitly \u2014 named the approach\u2019s cost unprompted (problem solving ${by[0].ps.toFixed(1)}, coding ${by[0].coding.toFixed(1)}). ${nameList(by.slice(1).map(c=>c.name))} reached working answers but talked through alternatives only when asked.`;
  }
  if (/craft|framed|framing|alternativ/.test(ql)){
    const k = /framed|framing|alternativ/.test(ql) ? 'ps' : 'craft';
    return rankOn(k, k==='craft' ? `Craft is read from the submitted design case \u2014 states, hierarchy and how each choice was defended.` : `Framing is read from how they unpacked the brief before sketching \u2014 users, constraints and metrics first.`);
  }
  if (/lead role|ownership|fit for/.test(ql)){
    const by = [...list].sort((a,b)=>(g(b,'comm')+g(b,'collab')+b.ps)-(g(a,'comm')+g(a,'collab')+a.ps));
    return `For a lead role, ${nm(by[0])} reads strongest \u2014 communication ${g(by[0],'comm').toFixed(1)}, collaboration ${g(by[0],'collab').toFixed(1)} and problem solving ${by[0].ps.toFixed(1)}, the signals that carry ownership. ${nameList(by.slice(1).map(c=>c.name))} ${by.length===2?'is':'are'} stronger as individual contributors on this evidence.`;
  }
  if (/clear|communicat/.test(ql)) return rankOn('comm', `Read from how they played requirements back and whether the final walkthrough needed follow-ups.`);
  if (/problem/.test(ql)) return rankOn('ps', `Problem solving carries 30% of the weighted score, the largest single criterion.`);
  if (/gap|weak|risk|miss/.test(ql)){
    return list.map(c=>{
      const k = crits(c), low = k[k.length-1];
      const tests = c.passed<c.total ? `, ${c.total-c.passed} of ${c.total} coding tests failed` : '';
      const skip = c.caseNA ? ', design case skipped' : '';
      return `${nm(c)} is weakest on ${low.d.n.toLowerCase()} at ${low.v.toFixed(1)}${tests}${skip}.`;
    }).join(' ');
  }
  if (/experience|rank|tenure|seniority/.test(ql)){
    return `Ranked on the weighted overall score: ${list.map((c,i)=>`${i+1}. ${nm(c)} ${c.score.toFixed(1)}`).join(', ')}. The batch average is ${BATCH_AVG}, so ${nameList(list.filter(c=>c.score>=+BATCH_AVG).map(c=>c.name))||'none of them'} sit${list.filter(c=>c.score>=+BATCH_AVG).length===1?'s':''} above it.`;
  }
  if (/strength|summar/.test(ql)){
    return list.map(c=>{
      const k = crits(c);
      return `${nm(c)} leads on ${k[0].d.n.toLowerCase()} (${k[0].v.toFixed(1)}) and ${k[1].d.n.toLowerCase()} (${k[1].v.toFixed(1)})`;
    }).join('; ') + `. ${nm(best)} carries the higher overall at ${best.score.toFixed(1)}.`;
  }
  if (/cultur|collab|pushback|feedback|probing|listen|defend/.test(ql)){
    const byCollab = [...list].sort((a,b)=>{
      const g = x=>COMP_DEFS.find(d=>d.k==='collab').get(x);
      return g(b)-g(a);
    });
    const g = x=>COMP_DEFS.find(d=>d.k==='collab').get(x).toFixed(1);
    return `On collaboration and communication, ${nm(byCollab[0])} reads strongest — ${g(byCollab[0])} on collaboration against ${byCollab.slice(1).map(c=>`${c.name}\u2019s ${g(c)}`).join(', ')}. Both signals come from how they handled probing questions, not the headline score.`;
  }
  const gapCrit = bc[0];
  return `${nm(best)} is the stronger fit of the ${list.length} \u2014 ${best.score.toFixed(1)} against a ${BATCH_AVG} batch average, ahead on ${gapCrit.d.n.toLowerCase()} at ${gapCrit.v.toFixed(1)}. ${nameList(rest.map(c=>c.name))} ${rest.length===1?'trails':'trail'} on the weighted criteria, making ${nm(best)} the better fit for this role.`;
}

/* which criteria the card should lead with, read from the query that was asked */
function focusOf(q){
  const ql = (q||'').toLowerCase();
  if (/proctor|flag|integrity|cheat/.test(ql)) return {keys:[]};
  if (/test|pass rate/.test(ql)) return {keys:['coding'], t:'Coding \u0026 tests'};
  if (/clean|solution|coding|code quality/.test(ql)) return {keys:['coding'], t:'Coding proficiency'};
  if (/pushback|feedback|probing|listen|defend|collab|cultur/.test(ql)) return {keys:['collab','comm'], t:'Collaboration \u0026 communication'};
  if (/clear|communicat/.test(ql)) return {keys:['comm'], t:'Communication'};
  if (/craft/.test(ql)) return {keys:['craft'], t:'Design craft'};
  if (/framed|framing|alternativ/.test(ql)) return {keys:['ps','craft'], t:'Framing \u0026 craft'};
  if (/problem|reason|trade-?off/.test(ql)) return {keys:['ps'], t:'Problem solving'};
  if (/lead role|ownership|fit for/.test(ql)) return {keys:['comm','collab'], t:'Ownership signals'};
  return {keys:null};
}
function critRow(c, k){
  const d = COMP_DEFS.find(x=>x.k===k), v = d.get(c);
  if (v==null) return `<div class="cmp-row no"><span class="material-icons-round">cancel</span><span><b>${d.n} not assessed</b><span class="cmp-note">Design case skipped this round.</span></span></div>`;
  const ok = v >= +BATCH_AVG;
  const e = typeof compEval === 'function' ? compEval(c, d, v) : {};
  const note = ok ? (e.plus || '') : (e.minus || '');
  return `<div class="cmp-row ${ok?'ok':'no'}"><span class="material-icons-round">${ok?'check_circle':'cancel'}</span><span><b>${d.n} ${v.toFixed(1)}</b>${note?`<span class="cmp-note">${note}</span>`:''}</span></div>`;
}
function card(c, pickable, q){
  const k = crits(c), low = k[k.length-1];
  const testsOk = c.passed===c.total;
  const on = cmpPick.has(c.i);
  const f = focusOf(q);
  const sessionSec = `<div class="cmp-sec"><span class="cmp-sec-t">Interview session</span>
      <div class="cmp-row ${testsOk?'ok':'no'}"><span class="material-icons-round">${testsOk?'check_circle':'cancel'}</span><span>${c.passed} of ${c.total} coding tests passed</span></div>
      <div class="cmp-row ${c.proctor?'ok':'no'}"><span class="material-icons-round">${c.proctor?'check_circle':'cancel'}</span><span>${c.proctor?'Clean proctoring session':'Proctoring flags on this session'}</span></div>
    </div>`;
  const strengthsSec = `<div class="cmp-sec"><span class="cmp-sec-t">Strengths</span>
      <div class="cmp-row ok"><span class="material-icons-round">check_circle</span><span>${k[0].d.n} ${k[0].v.toFixed(1)}, ${k[1].d.n.toLowerCase()} ${k[1].v.toFixed(1)}</span></div>
      <div class="cmp-row no"><span class="material-icons-round">cancel</span><span>${c.caseNA ? 'Design case skipped \u2014 no craft signal' : `${low.d.n} ${low.v.toFixed(1)} \u2014 weakest criterion`}</span></div>
    </div>`;
  const secs = (f.keys && f.keys.length)
    ? [`<div class="cmp-sec"><span class="cmp-sec-t">${f.t}</span>${f.keys.map(x=>critRow(c,x)).join('')}</div>`, sessionSec]
    : f.keys ? [sessionSec] : [strengthsSec, sessionSec];
  return `<div class="cmp-cc${pickable&&on?' picked':''}">
    <div class="cmp-cc-head">${pickable?`<button class="cmp-cc-pick" data-cmppick="${c.i}" aria-pressed="${on}" title="${on?'Deselect':'Select'} ${c.name}"><span class="cb${on?' checked':''}"></span></button>`:''}${av(c,'big')}<div class="cmp-cc-info">
      <div class="cmp-cc-nm"><b>${c.name}</b><span class="cmp-sc${c.score<3.4?' low':''}" title="AI Interview score">${c.score.toFixed(1)}<small>/5</small></span></div>
      <span class="cmp-cc-role">${c.role} \u00b7 ${c.company}</span></div></div>
    <div class="cmp-div"></div>
    ${secs.join('<div class="cmp-div"></div>')}
  </div>`;
}

const SK = `<div class="cmp-sk">
  <div class="cmp-sk-step"><svg class="spark" width="14" height="14" aria-hidden="true"><use href="#aiSparkle"></use></svg><span id="cmpStep">${STEPS[0]}\u2026</span></div>
  <span class="sk sk-l" style="width:64%"></span><span class="sk sk-l" style="width:88%"></span><span class="sk sk-l" style="width:47%"></span>
  <div class="cmp-sk-cards">${'<span class="sk sk-c"></span>'.repeat(2)}</div></div>`;

function actsHtml(){
  const n = cmpPick.size, off = n===0;
  const tip = 'Select candidates above to act on them';
  const d = off ? ` data-tip="${tip}" aria-disabled="true"` : '';
  return `<div class="cmp-acts">
    ${n?`<span class="cmp-acts-n">${n} selected</span>`:''}
    <button class="cmp-act adv${off?' off':''}" id="cmpAdv"${d}>Advance stage<span class="material-icons-round">expand_more</span></button>
    <button class="cmp-act hm${off?' off':''}" id="cmpShare"${d}>${shareLbl()}</button>
  </div>`;
}
function turnHtml(t, last){
  let body;
  if (last && busyC) body = SK;
  else {
    const cards = t.cardsOpen
      ? `<div class="cmp-strip-wrap"><div class="cmp-strip">${t.list.map(c=>card(c, last, t.q)).join('')}</div>${last ? actsHtml() : `<button class="cmp-cards-toggle" data-cmpturn="${t.id}"><span class="material-icons-round">expand_less</span>Hide candidate cards</button>`}</div>`
      : `<button class="cmp-cards-toggle" data-cmpturn="${t.id}"><span class="material-icons-round">expand_more</span>Show candidate cards (${t.list.length})</button>`;
    body = `<p class="cmp-sum">${t.ans}</p>${cards}`;
  }
  return `<div class="cmp-turn">
    <div class="cmp-q"><span class="cmp-me" aria-hidden="true"></span><span>${t.q}</span></div>
    <div class="cmp-a"><svg class="spark" width="22" height="22" aria-hidden="true"><use href="#aiSparkle"></use></svg>
      <div class="cmp-a-body">${body}</div></div>
  </div>`;
}
function panelHtml(){
  const list = subj;
  const shown = list.slice(0,1), more = list.length-1;
  return `<div class="cmp-head">
    <div class="cmp-head-txt"><h2>Compare candidates</h2><p>Information used from scored criteria, transcript evidence and proctoring</p></div>
    <div class="cmp-head-acts">
      <button class="cmp-ico" id="cmpWide" title="${wide?'Collapse':'Expand'}"><span class="material-icons-round">${wide?'close_fullscreen':'open_in_full'}</span></button>
      <button class="cmp-ico" id="cmpClose" title="Close"><span class="material-icons-round">close</span></button>
    </div></div>
  <div class="cmp-body"><div class="cmp-card">
    <div class="cmp-scrollarea"><div class="cmp-thread">${turns.map((t,k)=>turnHtml(t, k===turns.length-1)).join('')}</div></div>
    <div class="cmp-foot">
      <div class="cmp-sugg-row">
        <button class="cmp-sugg-link" id="cmpSuggLink" aria-expanded="${suggOn}">Suggested queries<span class="material-icons-round">${suggOn?'expand_less':'expand_more'}</span></button>
        <div class="cmp-sugg${suggOn?' on':''}">${SUGG.map(s=>`<button data-cmpq="${s.replace(/"/g,'&quot;')}">${s}</button>`).join('')}</div>
      </div>
      <div class="cmp-inbar">
        <div class="cmp-inbar-in">
          <div class="cmp-in-avs${stripOn?' on':''}">${shown.map(c=>av(c)).join('')}${more>0?`<span class="cmp-av more">+${more}</span>`:''}
            <button class="cmp-chev" id="cmpChev" title="${stripOn?'Hide candidates':'Show candidates'}"><span class="material-icons-round">${stripOn?'expand_less':'expand_more'}</span></button>
          </div>
          <div class="cmp-field"><input id="cmpIn" type="text" placeholder="Type custom query to compare candidates..." value="${draft.replace(/"/g,'&quot;')}" />
            <button class="cmp-send" id="cmpSend" title="Send"><span class="material-icons-round">arrow_upward</span></button></div>
        </div>
        <div class="cmp-strip-chips${stripOn?' on':''}">${list.map(c=>`<div class="cmp-chip">${av(c,'big')}<div class="cmp-chip-info">
          <div class="cmp-chip-nm"><span class="t">${c.name}</span>${dots(c.score)}</div>
          <span class="cmp-chip-role">${c.role} \u00b7 ${c.company}</span></div></div>`).join('')}</div>
      </div>
    </div>
  </div></div>`;
}

function paint(focus, toBottom){
  const p = el('cmpPanel');
  const prev = p.querySelector('.cmp-scrollarea');
  const keep = prev ? prev.scrollTop : 0;
  p.innerHTML = panelHtml();
  p.classList.toggle('wide', wide);
  const sp = el('split');
  sp.classList.toggle('has-cmp', open);
  if (focus) el('cmpIn').focus();
  const sa = p.querySelector('.cmp-scrollarea');
  if (sa){
    const upd = ()=>p.classList.toggle('scrolled', sa.scrollTop > 2);
    sa.addEventListener('scroll', upd, {passive:true});
    sa.scrollTop = toBottom ? sa.scrollHeight : keep;
    upd();
  }
  if (typeof queueClamp === 'function') queueClamp();
}

function run(q){
  const list = sel();
  if (list.length > 1) subj = list;
  if (subj.length < 2) return;
  const txt = q || 'Compare candidates';
  if (open) turns.forEach(t=>t.cardsOpen = false);
  else { turns = []; cmpPick.clear(); }
  for (const i of [...cmpPick]) if (!subj.some(c=>c.i===i)) cmpPick.delete(i);
  turns.push({id:++tSeq, q:txt, list:subj.slice(), ans:summary(txt, subj), cardsOpen:true});
  open = true; busyC = true; suggOn = false;
  if (typeof setSel === 'function' && typeof selI !== 'undefined' && selI != null) setSel(null);
  syncBar(); paint(false, true);
  let s = 0;
  clearInterval(run._i); clearTimeout(run._t);
  run._i = setInterval(()=>{ s++; const e = el('cmpStep'); if (e && STEPS[s]) e.textContent = STEPS[s]+'\u2026'; }, 520);
  run._t = setTimeout(()=>{ clearInterval(run._i); busyC = false; paint(false, true); }, 1600);
}
/* expand: slide the list column out to the left; the panel grows into the space it frees */
function setWide(v){
  const sp = el('split'), lc = document.querySelector('.list-col');
  wide = v;
  clearTimeout(setWide._t);
  if (!lc){ sp.classList.toggle('cmp-wide', v); paint(); return; }
  if (v){
    const w = Math.round(lc.getBoundingClientRect().width);
    lc.style.flex = `0 0 ${w}px`;
    lc.classList.remove('gone');
    void lc.offsetWidth;
    sp.classList.add('cmp-wide');
    lc.style.marginLeft = `-${w + 28}px`;
    setWide._t = setTimeout(()=>{ if (wide) lc.classList.add('gone'); }, 520);
  } else {
    lc.classList.remove('gone');
    void lc.offsetWidth;
    lc.style.marginLeft = '0px';
    sp.classList.remove('cmp-wide');
    setWide._t = setTimeout(()=>{ if (!wide){ lc.style.flex=''; lc.style.marginLeft=''; } }, 520);
  }
  paint();
  if (typeof queueClamp === 'function') queueClamp();
}
function close(){
  clearInterval(run._i); clearTimeout(run._t);
  open = false; busyC = false; stripOn = false; draft = ''; turns = []; cmpPick.clear();
  if (wide) setWide(false); else { wide = false; paint(); }
  syncBar();
}

document.addEventListener('click', e=>{
  const q = e.target.closest('[data-cmpq]');
  if (q){ draft=''; run(q.dataset.cmpq); return; }
  if (e.target.closest('#cmpAsk')){ draft=''; run('Compare candidates'); return; }
  if (e.target.closest('#cmpMore')){ const t = el('cmpPills'); if (t) t.scrollBy({left:200, behavior:'smooth'}); return; }
  if (e.target.closest('#cmpClose')){ close(); return; }
  const pk = e.target.closest('[data-cmppick]');
  if (pk){ const i = +pk.dataset.cmppick; cmpPick.has(i) ? cmpPick.delete(i) : cmpPick.add(i); paint(); return; }
  const tt = e.target.closest('[data-cmpturn]');
  if (tt){ const t = turns.find(x=>x.id === +tt.dataset.cmpturn); if (t){ t.cardsOpen = !t.cardsOpen; paint(); } return; }
  const adv = e.target.closest('#cmpAdv');
  if (adv){ if (!adv.classList.contains('off') && typeof openStage === 'function'){ e.stopPropagation(); openStage(adv, [...cmpPick]); } return; }
  const shb = e.target.closest('#cmpShare');
  if (shb){ if (!shb.classList.contains('off') && typeof openShare === 'function') openShare([...cmpPick]); return; }
  if (e.target.closest('#cmpWide')){ if (wide) stripOn = false; setWide(!wide); return; }
  if (e.target.closest('#cmpChev')){ stripOn = !stripOn; paint(); return; }
  if (e.target.closest('#cmpSuggLink')){ suggOn = !suggOn; paint(); return; }
  if (e.target.closest('#cmpSend')){ const v = el('cmpIn').value.trim(); if (v){ draft=''; run(v); } return; }
  if (open && cmpPick.size && (e.target.closest('[data-stage]') || e.target.closest('#shGo'))){ cmpPick.clear(); setTimeout(()=>{ if (open) paint(); }, 0); }
});
document.addEventListener('input', e=>{ if (e.target.id==='cmpIn') draft = e.target.value; });
document.addEventListener('keydown', e=>{
  if (e.key==='Escape' && open){ close(); return; }
  if (e.key==='Enter' && e.target.id==='cmpIn'){ const v = e.target.value.trim(); if (v){ draft=''; run(v); } }
});

window.syncCompare = syncBar;
syncBar();
})();
