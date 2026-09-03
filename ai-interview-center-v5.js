/* ===== AI Interview Center v5 — chat-driven leaderboard ===== */
const COLS = ['violet','green','orange','blue','magenta','red','yellow2','red2','yellow'];
const COMPANIES = ['Netflix','Airbnb','Spotify','Google','Uber','Figma','Adobe','Stripe','Meta','Canva','Atlassian','Shopify','Dropbox','Pinterest','Slack','Notion','Zoom','Intuit','Salesforce','LinkedIn'];
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
  const coding = +clamp(score + [0.2,-0.3,0.35,0.55,-0.45,0.1][i%6],1,4.9).toFixed(1);
  const comm = +clamp(score + [-0.45,0.4,-0.15,-0.1,0.5,0.25][i%6],1,4.8).toFixed(1);
  const ps = +clamp(score + [0.1,0.25,-0.2,0.4,-0.1,-0.35][i%6],1,4.85).toFixed(1);
  const caseNA = i%4===0, caseScore = +clamp(score+0.2,1,4.75).toFixed(1);
  const total = 13, passed = coding>=4 ? 13 : clamp(Math.round(coding*2.7),3,12);
  const crits = [['Problem solving',ps],['Coding',coding],['Communication',comm],['Design craft',caseNA?null:caseScore]];
  let comps = crits.filter(c=>c[1]!=null&&c[1]>=3.75).map(c=>c[0]);
  if (comps.length<2) comps = crits.filter(c=>c[1]!=null).sort((a,b)=>b[1]-a[1]).slice(0,2).map(c=>c[0]);
  return { i, name, role, score, coding, comm, ps, caseNA, caseScore, passed, total,
    proctor: !(i%5===3 || score<2.7), first: name.split(' ')[0],
    init: name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),
    col: COLS[i%9], company: COMPANIES[i], comps: comps.slice(0,3), status:null, stage:null };
});
const $ = id=>document.getElementById(id);
const avg = a=>a.length?(a.reduce((s,c)=>s+c.score,0)/a.length):0;

/* ===== state ===== */
let tokens = [], hlI = null;
const matches = ()=>C.filter(c=>tokens.every(t=>t.f(c))).sort((a,b)=>b.score-a.score);

/* ===== board render ===== */
function statCard(l,v,d,q){ return `<div class="stat${q?' q':''}"><div class="l">${l}</div><div class="v">${v}</div><div class="d">${d}</div></div>`; }
function renderStats(){
  const m = matches();
  const el = $('stats');
  if (!tokens.length){
    const flags = C.filter(c=>!c.proctor).length;
    el.innerHTML = statCard('All interviews','20','Completed and scored')
      + statCard('Average score', avg(C).toFixed(1)+'<small> /5</small>','Across the batch')
      + statCard('Score 4.0+', C.filter(c=>c.score>=4).length,'Above your hiring bar')
      + statCard('Proctoring flags', flags,'Sessions to verify');
  } else {
    const top = m[0];
    el.innerHTML = statCard('Matches', `${m.length}<small> of 20</small>`,'For your query', true)
      + statCard('Average score', m.length?avg(m).toFixed(1)+'<small> /5</small>':'—','Within matches')
      + statCard('Top match', top?top.first+' '+top.name.split(' ').slice(1).join(' '):'—', top?top.score.toFixed(1)+'/5 · '+top.company:'No one fits yet')
      + statCard('Score 4.0+', m.filter(c=>c.score>=4).length,'Within matches');
  }
}
function renderShowing(){
  $('showing').innerHTML = tokens.length
    ? 'Showing' + tokens.map((t,ti)=>`<span class="fchip">${t.label}<span class="material-icons-round" data-tok="${ti}" title="Remove">close</span></span>`).join('') + `<button class="clear-all" id="clearAll">Clear all</button>`
    : 'Showing all 20 interviewed candidates — ask on the left to refine.';
}
function renderRows(){
  const m = matches();
  $('rows').innerHTML = m.map((c,j)=>`
    <div class="frow${c.i===hlI?' hl':''}" data-i="${c.i}" style="animation-delay:${Math.min(j*0.02,0.2)}s">
      <div class="rk">${j+1}</div>
      <div class="avatar ${c.col}">${c.init}</div>
      <div style="min-width:0"><div class="nm">${c.name}</div><div class="rl">${c.role} · ${c.company}</div></div>
      <div class="sc ${c.score<3.4?'low':''}">${c.score.toFixed(1)}<small>/5</small>${c.proctor?'':'<span class="flag-chip"><span class="material-icons-round">flag</span>Flag</span>'}</div>
      <div class="comp-cell" title="${c.comps.join(' · ')}">${c.comps.join(' · ')}</div>
      ${c.status ? `<span class="status-chip ${c.status}" style="position:absolute;right:14px;top:50%;transform:translateY(-50%)"><span class="material-icons-round">${c.status==='adv'?'check':'send'}</span>${c.status==='adv'?c.stage:'With HM'}</span>`
      : `<div class="row-acts"><button class="ract" data-adv="${c.i}">Advance stage</button><button class="ract hm" data-hm="${c.i}">Share with HM</button></div>`}
    </div>`).join('') || `<div class="empty"><span class="material-icons-round">search_off</span>No candidates match all of that. Remove a filter, or ask me to relax one.</div>`;
}
function renderBoard(){ renderStats(); renderShowing(); renderRows(); }

/* ===== chat ===== */
function addMsg(who, html, chips){
  const t = $('thread');
  const d = document.createElement('div');
  d.className = 'msg'+(who==='user'?' user':'');
  d.innerHTML = who==='user' ? `<div class="body">${html}</div>`
    : `<div class="ai-av"><span class="material-icons-round">auto_awesome</span></div><div class="body">${html}${chips?`<div class="chips">${chips.map(c=>`<button class="chip">${c}</button>`).join('')}</div>`:''}</div>`;
  t.appendChild(d);
  t.scrollTop = t.scrollHeight;
  return d;
}
let typingEl = null;
function showTyping(){ typingEl = addMsg('ai','<span class="typing"><i></i><i></i><i></i></span>'); }
function hideTyping(){ if (typingEl){ typingEl.remove(); typingEl = null; } }

/* ===== intent parsing ===== */
function parse(q){
  const l = q.toLowerCase();
  if (/(clear|reset|show all|start over|everyone)/.test(l)) return {type:'reset'};
  const person = C.find(c=>l.includes(c.name.toLowerCase())) || C.find(c=>l.includes(c.first.toLowerCase()));
  if (person && /(advance|move)/.test(l)) return {type:'action', act:'adv', c:person};
  if (person && /(share|send)/.test(l)) return {type:'action', act:'hm', c:person};
  if (person) return {type:'profile', c:person};
  const toks = [];
  const th = (l.match(/(\d(?:\.\d)?)\s*\+/)||[])[1];
  const bar = th?parseFloat(th):null;
  if (/problem/.test(l)) toks.push({label:`Problem solving ${bar||3.75}+`, f:c=>c.ps>=(bar||3.75)});
  if (/communicat/.test(l)) toks.push({label:`Communication ${bar||3.75}+`, f:c=>c.comm>=(bar||3.75)});
  if (/(coding|code|test)/.test(l)) toks.push({label:'All coding tests passed', f:c=>c.passed===c.total});
  if (/(case|exercise|craft|portfolio)/.test(l)) toks.push({label:'Completed the design exercise', f:c=>!c.caseNA});
  if (/(no flag|clean session|without flag)/.test(l)) toks.push({label:'No proctoring flags', f:c=>c.proctor});
  else if (/(flag|proctor|suspicious|integrity)/.test(l)) toks.push({label:'Proctoring flags', f:c=>!c.proctor});
  const comp = COMPANIES.find(x=>l.includes(x.toLowerCase()));
  if (comp) toks.push({label:'At '+comp, f:c=>c.company===comp});
  if (!toks.length && bar) toks.push({label:`Score ${bar}+`, f:c=>c.score>=bar});
  if (!toks.length && /(top|best|strongest|ready)/.test(l)) toks.push({label:'Score 4+', f:c=>c.score>=4});
  return toks.length ? {type:'filter', toks} : {type:'fallback'};
}
function groupReply(refined){
  const m = matches();
  if (!m.length) return `No one matches all of that. The tightest constraint is <b>${tokens[tokens.length-1].label}</b> — remove it above, or ask me to relax it.`;
  const top = m[0];
  let r = `${refined?'Refined it — ':''}<b>${m.length} candidate${m.length>1?'s':''}</b> match${m.length===1?'es':''}, averaging <b>${avg(m).toFixed(1)}/5</b>. `;
  r += `Top match is <b>${top.name}</b> (${top.score.toFixed(1)}, ${top.role} at ${top.company}).`;
  const flagged = m.filter(c=>!c.proctor).length;
  if (flagged) r += ` Heads up: ${flagged} of them ${flagged===1?'has':'have'} a proctoring flag to verify.`;
  return r;
}
function profileReply(c){
  const rank = [...C].sort((a,b)=>b.score-a.score).findIndex(x=>x.i===c.i)+1;
  const crits = [['problem solving',c.ps],['coding',c.coding],['communication',c.comm]].sort((a,b)=>b[1]-a[1]);
  return `<b>${c.name}</b> — ${c.score.toFixed(1)}/5, ranked #${rank} of 20. ${c.role} at ${c.company}. Strongest on ${crits[0][0]} (${crits[0][1]}) and ${crits[1][0]} (${crits[1][1]}). ${c.caseNA?'Did not submit the design exercise.':'Completed the design exercise ('+c.caseScore+').'} ${c.proctor?'Clean session, no flags.':'Has a proctoring flag worth verifying.'}`;
}
function handle(q){
  addMsg('user', q.replace(/</g,'&lt;'));
  showTyping();
  setTimeout(()=>{
    hideTyping();
    const r = parse(q);
    if (r.type==='reset'){ tokens=[]; hlI=null; renderBoard(); addMsg('ai','Cleared — showing all 20 interviewed candidates again.'); return; }
    if (r.type==='action'){
      const c = r.c;
      c.status = r.act; c.stage = 'Recruiter Screen';
      hlI = c.i; renderBoard();
      toast(r.act==='adv' ? `${c.first} advanced to Recruiter Screen` : `${c.first} shared with your hiring manager`);
      addMsg('ai', r.act==='adv' ? `Done — <b>${c.first}</b> is advanced to <b>Recruiter Screen</b>. The status is on their row.` : `Done — <b>${c.first}</b> is shared with your hiring manager for approval. Their reply will land in notes.`);
      return;
    }
    if (r.type==='profile'){
      hlI = r.c.i; renderBoard();
      const b = $('board'); const row = document.querySelector(`.frow[data-i="${r.c.i}"]`);
      if (row) b.scrollTop = Math.max(0, row.offsetTop - 220);
      addMsg('ai', profileReply(r.c), [`Advance ${r.c.first}`, `Share ${r.c.first} with HM`]);
      return;
    }
    if (r.type==='fallback'){ addMsg('ai','I can filter by <b>problem solving</b>, <b>communication</b>, <b>coding tests</b>, the <b>design exercise</b>, <b>proctoring flags</b> or a score bar like <b>4+</b> — or ask about a specific candidate by name.'); return; }
    const refined = tokens.length>0;
    hlI = null;
    for (const t of r.toks) if (!tokens.some(x=>x.label===t.label)) tokens.push(t);
    renderBoard();
    const m = matches();
    const chips = m.length ? [`Tell me about ${m[0].first}`, refined?'Clear all filters':'Only with no proctoring flags'] : ['Clear all filters'];
    addMsg('ai', groupReply(refined), chips);
  }, 650);
}

/* ===== events ===== */
const input = $('chatIn');
function send(){ const q = input.value.trim(); if (!q) return; input.value=''; input.style.height='auto'; handle(q); }
$('chatSend').addEventListener('click', send);
input.addEventListener('keydown', e=>{ if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } });
input.addEventListener('input', ()=>{ input.style.height='auto'; input.style.height = Math.min(input.scrollHeight,96)+'px'; });
document.addEventListener('click', e=>{
  const chip = e.target.closest('.chip');
  if (chip){ handle(chip.textContent); return; }
  const tok = e.target.closest('[data-tok]');
  if (tok){ tokens.splice(+tok.dataset.tok,1); renderBoard(); return; }
  if (e.target.closest('#clearAll')){ tokens=[]; hlI=null; renderBoard(); return; }
  const adv = e.target.closest('[data-adv]');
  if (adv){ const c = C[+adv.dataset.adv]; c.status='adv'; c.stage='Recruiter Screen'; renderRows(); toast(`${c.first} advanced to Recruiter Screen`); return; }
  const hm = e.target.closest('[data-hm]');
  if (hm){ const c = C[+hm.dataset.hm]; c.status='hm'; renderRows(); toast(`${c.first} shared with your hiring manager`); return; }
  const row = e.target.closest('.frow');
  if (row){ handle(`Tell me about ${C[+row.dataset.i].first}`); return; }
  if (!e.target.closest('.ver-fab')) $('verFab').classList.remove('open');
});

/* ===== toast ===== */
let toastTimer;
function toast(msg){ $('toastTxt').textContent = msg; $('toast').classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(()=>$('toast').classList.remove('on'), 2600); }

/* ===== init ===== */
renderBoard();
addMsg('ai', `Twenty fresh AI interviews are scored for <b>User Experience Designer</b> — the batch averages <b>3.5/5</b> and five candidates are at 4.0 or above. Tell me who you're looking for and I'll update the leaderboard as we talk.`,
  ['Strong problem solvers','Great communicators with clean coding','Completed the design exercise','Any proctoring flags?']);
