/* The seven layer map's behaviour. Served as its own file: the site's security policy runs no inline script
   (Phase 11 moved it out; inline, it had been blocked on production since the policy shipped). */
/* ─── LAYERS ─── */
const LAYERS = {
  1: { tag:'L01', title:'Data Access', hue:'var(--h1)',
    lede:'The foundation: unified reads across CRM, orders, billing, knowledge, and conversation history.',
    levers:[
      ['source','Consolidated view across 9 systems of record'],
      ['freshness','Sub-second materialized cache for live reads'],
      ['entitlements','Row-level ACLs by agent tier + customer region'],
    ],
    roles:{
      leader:['applicable','Approves data strategy, vendor consolidation, residency'],
      manager:['applicable','Monitors data freshness alerts, resolves outages'],
      agent:['n/a','Benefits passively: accurate data surfaces in UI'],
      iva:['applicable','Reads via governed APIs; no direct DB access'],
    }},
  2: { tag:'L02', title:'Workflow Execution', hue:'var(--h2)',
    lede:'The hands: tool calls that read, write, and change the world. Idempotent, logged, reversible.',
    levers:[
      ['idempotency','Every write keyed: safe on retry'],
      ['reversal','One-click rollback for last 90 days of ops'],
      ['audit','Signed receipt per action · WORM storage'],
    ],
    roles:{
      leader:['applicable','Reviews auto-execution scope + audit exception rate'],
      manager:['applicable','Tunes which workflows auto-run vs require approval'],
      agent:['applicable','Triggers sensitive workflows (refunds, overrides)'],
      iva:['applicable','Executes low-risk workflows autonomously'],
    }},
  3: { tag:'L03', title:'Policy & Guardrails', hue:'var(--h3)',
    lede:'Rules of engagement: PII redaction, refund caps, tone enforcement, escalation triggers.',
    levers:[
      ['pii','Auto-redact 14 PII classes in transcripts'],
      ['refund cap','IVA $50 · Agent $500 · Manager unlimited'],
      ['tone','Brand-voice scorer on every IVA utterance'],
    ],
    roles:{
      leader:['applicable','Sets policy bands, compliance posture, risk tolerance'],
      manager:['applicable','Tunes caps by queue; approves exceptions'],
      agent:['applicable','Overrides within their tier; documents exceptions'],
      iva:['applicable','Obeys policies; flags for handoff when blocked'],
    }},
  4: { tag:'L04', title:'Reasoning & Planning', hue:'var(--h4)',
    lede:'The brain: decomposing requests into steps, selecting tools, plotting shortest path to resolution.',
    levers:[
      ['model','Haiku for routing · Sonnet for complex reasoning'],
      ['tool set','47 tools · scoped by policy + agent tier'],
      ['self-critique','Plan reviewed before execution; low-conf → human'],
    ],
    roles:{
      leader:['applicable','Approves model vendors, spend envelope, eval bar'],
      manager:['applicable','Reviews plan-failure trends; reports patterns back'],
      agent:['applicable','Sees the plan; can edit / approve / override'],
      iva:['applicable','Generates + executes plans within guardrails'],
    }},
  5: { tag:'L05', title:'Conversation Management', hue:'var(--h5)',
    lede:'Turn-by-turn dialogue across voice, chat, email: memory, interruption, language.',
    levers:[
      ['channels','Voice · Chat · Email · SMS · WhatsApp'],
      ['memory','30-day session memory · GDPR right-to-forget'],
      ['barge-in','Sub-200ms interruption for voice'],
    ],
    roles:{
      leader:['n/a','Strategic only: selects channel investments'],
      manager:['applicable','Staffs by channel load; tunes IVA persona'],
      agent:['applicable','Lives here: speaks, listens, summarizes'],
      iva:['applicable','Lives here: speaks, listens, summarizes'],
    }},
  6: { tag:'L06', title:'Routing & Orchestration', hue:'var(--h6)',
    lede:'Who handles this, on what channel, and how clean is the handoff? Warm-transfers AI→human with full context.',
    levers:[
      ['routing','Skill · language · value · sentiment · IVA confidence'],
      ['handoff','Full transcript + plan + state in < 300ms'],
      ['sla guard','Auto-escalate at 80% SLA burn'],
    ],
    roles:{
      leader:['applicable','Sets routing strategy, tier definitions, SLA targets'],
      manager:['applicable','Adjusts in real-time; reassigns skills, breaks ties'],
      agent:['applicable','Accepts warm transfers with full context'],
      iva:['applicable','Requests handoff when confidence drops below bar'],
    }},
  7: { tag:'L07', title:'Analytics, Feedback & Governance', hue:'var(--h7)',
    lede:'Every interaction becomes evidence, QA, sentiment, drift, compliance, coaching, looped back into L3/L4/L6.',
    levers:[
      ['qa coverage','100% auto-scored · 5% human-sampled'],
      ['drift','Weekly eval vs gold set · alert on > 3% drop'],
      ['coaching','Per-agent deltas vs peer median'],
    ],
    roles:{
      leader:['applicable','Primary home: ROI, containment, CSAT, vendor scorecards'],
      manager:['applicable','Team + agent-level analytics, coaching loops'],
      agent:['applicable','Sees own scorecard; coaching nudges in-app'],
      iva:['applicable','Feeds its own retraining signal via labeled outcomes'],
    }},
};

/* ─── SCENARIOS ─── */
const SCENARIOS = [
  {
    name:'Simple · "Where\'s my order?"',
    intro:{cust:'"hi, where\'s my order?"', agent:'monitoring · 3 convos', sys:'inbound chat · voice bridged', meta:'IVA'},
    steps:[
      {n:1,owner:'iva',cust:'authenticated',agent:'ambient',sys:'reads identity + last 3 orders + entitlements'},
      {n:2,owner:'iva',cust:'account resolved',agent:'watching',sys:'calls lookup_order(#A-91204) + fetch_tracking()'},
      {n:3,owner:'iva',cust:'PII masked in logs',agent:'watching',sys:'no shipping promise without ETA confidence ≥ 0.8'},
      {n:4,owner:'iva',cust:'intent: order_status',agent:'watching',sys:'plan: check_auth → lookup → estimate_eta → draft'},
      {n:5,owner:'iva',cust:'listening…',agent:'watching',sys:'"package is 2 stops away, ETA 4:30pm"'},
      {n:6,owner:'iva',cust:'satisfied',agent:'no handoff',sys:'keeps on IVA · high containment score'},
      {n:7,owner:'iva',cust:'"thanks!" · CSAT 5/5',agent:'closed',sys:'scores logged · retraining delta queued'},
    ],
    outro:{cust:'resolved · 11.3s',agent:'next in queue',sys:'loop complete · fully contained',meta:'DONE'},
  },
  {
    name:'Complex · "I want a refund" → human',
    intro:{cust:'"this is broken, I want a refund"', agent:'monitoring', sys:'sentiment −0.6 · priority high', meta:'IVA'},
    steps:[
      {n:1,owner:'iva',cust:'identity verified',agent:'watching',sys:'pulls order + warranty + prior tickets + LTV $4.2k'},
      {n:4,owner:'iva',cust:'intent: refund + frustration',agent:'watching',sys:'plan: verify → assess → refund OR escalate'},
      {n:3,owner:'iva',cust:'guardrails engage',agent:'alerted',sys:'refund_cap $50 (IVA) · item $340 → REQUIRES HUMAN'},
      {n:6,owner:'handoff',cust:'warm-transferring…',agent:'↗ accepting · context received',sys:'route → Tier-2 · skill=appliances · full transcript'},
      {n:5,owner:'agent',cust:'"Jordan here, let me help"',agent:'speaking · IVA drafts',sys:'human turn · IVA continues as co-pilot'},
      {n:2,owner:'agent',cust:'refund issued $340',agent:'executes override',sys:'issue_refund · policy exception logged'},
      {n:7,owner:'agent',cust:'CSAT 4/5 · recovered',agent:'wrap-up',sys:'saved customer · cap edge case → policy review'},
    ],
    outro:{cust:'resolved · 3m 40s',agent:'ready',sys:'handoff complete · policy team notified',meta:'HANDOFF'},
  },
  {
    name:'Complex · Multilingual + sensitive op',
    intro:{cust:'"ändern Sie meine Adresse nach Berlin"', agent:'monitoring', sys:'EN→DE detected · 2FA required', meta:'IVA'},
    steps:[
      {n:5,owner:'iva',cust:'DE · "kein Problem"',agent:'ambient',sys:'multilingual bridge engaged'},
      {n:4,owner:'iva',cust:'intent: update_address',agent:'watching',sys:'plan: verify_2fa → lookup → update → re-route orders'},
      {n:3,owner:'iva',cust:'verifying…',agent:'watching',sys:'sensitive op · 2FA + voice match required'},
      {n:1,owner:'iva',cust:'identity strong',agent:'watching',sys:'billing + shipping + 2 active orders loaded'},
      {n:6,owner:'handoff',cust:'sensitive op pause',agent:'↗ confirming policy',sys:'DE regulation → human confirmation'},
      {n:2,owner:'agent',cust:'address updated',agent:'re-routes orders',sys:'PATCH /customers/:id · 2 orders re-routed'},
      {n:7,owner:'agent',cust:'CSAT 5/5',agent:'closed',sys:'DE fluency sample saved for training'},
    ],
    outro:{cust:'resolved · 1m 18s',agent:'monitoring',sys:'handoff complete · DE policy reviewed',meta:'HANDOFF'},
  },
];

/* ─── Build UI ─── */
const stackIndex = document.getElementById('stackIndex');
for (let n = 1; n <= 7; n++) {
  const L = LAYERS[n];
  const el = document.createElement('div');
  el.className = 'layer-cell';
  el.dataset.n = n;
  el.style.setProperty('--hue', L.hue);
  el.innerHTML = `
    <div class="cell-owner mono">·</div>
    <div class="cell-n serif">${String(n).padStart(2,'0')}</div>
    <div class="cell-tag mono">${L.tag}</div>
    <div class="cell-title">${L.title}</div>
  `;
  el.addEventListener('click', () => jumpTo(n));
  stackIndex.appendChild(el);
}

/* Feedback loop SVG: arcs from L7 back to L3, L4, L6 */
function drawFeedback() {
  const svg = document.getElementById('feedbackSvg');
  const wrap = document.querySelector('.stack-wrap');
  const wrapRect = wrap.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${wrapRect.width} 28`);
  const cells = [...stackIndex.querySelectorAll('.layer-cell')];
  const positions = cells.map(c => {
    const r = c.getBoundingClientRect();
    return r.left - wrapRect.left + r.width/2;
  });
  const x7 = positions[6], x3 = positions[2], x4 = positions[3], x6 = positions[5];
  svg.innerHTML = '';
  [x3, x4, x6].forEach(tx => {
    const p = document.createElementNS('http://www.w3.org/2000/svg','path');
    const midX = (x7 + tx) / 2;
    p.setAttribute('d', `M ${x7} 26 C ${midX} 2, ${midX} 2, ${tx} 26`);
    p.classList.add('live');
    svg.appendChild(p);
    const arr = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    arr.setAttribute('points', `${tx-3},22 ${tx+3},22 ${tx},27`);
    arr.classList.add('arrow','live');
    svg.appendChild(arr);
  });
}

/* References */
const focusCard = document.getElementById('focusCard');
const focusBadge = document.getElementById('focusBadge');
const focusOwner = document.getElementById('focusOwner');
const focusTitle = document.getElementById('focusTitle');
const focusLede = document.getElementById('focusLede');
const focusBody = document.getElementById('focusBody');
const focusLevers = document.getElementById('focusLevers');
const focusRoles = document.getElementById('focusRoles');
const focusStep = document.getElementById('focusStep');
const focusBar = document.getElementById('focusBar');
const customerState = document.getElementById('customerState');
const agentState = document.getElementById('agentState');
const customerBook = document.getElementById('customerBook');
const agentBook = document.getElementById('agentBook');
const scenarioText = document.getElementById('scenarioText');
const scenarioSelect = document.getElementById('scenarioSelect');
const playBtn = document.getElementById('playBtn');
const copilotBody = document.getElementById('copilotBody');
const queueList = document.getElementById('queueList');
const agentsGrid = document.getElementById('agentsGrid');
const connectSvg = document.getElementById('connectSvg');

SCENARIOS.forEach((s, i) => {
  const opt = document.createElement('option');
  opt.value = i; opt.textContent = s.name;
  scenarioSelect.appendChild(opt);
});

/* Floor mock */
const FLOOR_QUEUES = [
  {ch:'VC', name:'Maya · order status', t:'0:11', live:true},
  {ch:'CH', name:'Luis · billing Q', t:'1:04'},
  {ch:'EM', name:'Priya · refund req', t:'2:42'},
  {ch:'VC', name:'Sam · warranty', t:'4:11', hot:true},
  {ch:'CH', name:'Noor · DE address', t:'0:32'},
  {ch:'WA', name:'Kai · order ETA', t:'0:08'},
  {ch:'CH', name:'Ivy · activation', t:'1:51'},
];
function renderFloor() {
  queueList.innerHTML = FLOOR_QUEUES.map(q => `
    <div class="queue-row ${q.hot?'hot':''} ${q.live?'live':''}">
      <span class="ch mono">${q.ch}</span>
      <span class="name">${q.name}</span>
      <span class="time mono">${q.t}</span>
    </div>
  `).join('');
  // agents grid: 18 slots
  const states = ['busy','busy','busy','avail','busy','break','busy','avail','self','busy','busy','avail','busy','break','busy','busy','avail','busy'];
  const inits = ['AM','JR','KT','·','DN','☕','BH','·','JO','LP','RY','·','MK','☕','TS','QN','·','ZV'];
  agentsGrid.innerHTML = states.map((s, i) => `<div class="agent-chip ${s}">${inits[i]}</div>`).join('');
}
renderFloor();

/* KPI jitter */
function jitterKPIs() {
  const live = document.getElementById('kpi-live');
  const n = 280 + Math.floor(Math.random() * 20);
  live.innerHTML = `${n}<span class="unit">convos</span>`;
}
setInterval(jitterKPIs, 2000);

/* ─── State machine ─── */
const STEP_MS = 3400;
let currentScenario = 0;
let stepIdx = -1;
let playing = true;
let stepTimer = null;
let progressTimer = null;
let stepStart = 0;

function setRoleRow(key, appl, text) {
  const app = appl === 'applicable';
  return `<div class="rv"><span class="rv-role ${app?'applicable':''}">${key}</span><span class="rv-act ${app?'applicable':''}">${app?'':'(n/a) '}${text}</span></div>`;
}

function renderCopilot(step, owner) {
  if (!step) {
    copilotBody.innerHTML = `
      <div class="suggestion kb"><div class="kind mono">Ready</div>Listening for customer signal: will surface KB, drafts, and sentiment in real-time.</div>
    `;
    return;
  }
  const L = LAYERS[step.n];
  // Contextual co-pilot suggestions based on layer + owner
  const agentMode = owner === 'agent' || owner === 'handoff';
  const items = [];
  if (step.n === 1) items.push({kind:'kb', text:'Identity verified · voiceprint · confidence 0.94'});
  if (step.n === 2) items.push({kind:'kb', text:`Tool queued: ${agentMode?'issue_refund($340)':'lookup_order() + fetch_tracking()'}`});
  if (step.n === 3) items.push({kind:'warn', text: agentMode?'Cap override requires supervisor note':'Policy flagged: prepare handoff packet'});
  if (step.n === 4) items.push({kind:'kb', text:`Plan: ${step.sys.replace(/^plan:\s*/,'')}`});
  if (step.n === 5) items.push({kind:'draft', text: agentMode?'Draft: "I understand. Let me apply the full refund now."':'Draft: "your package is 2 stops out, ETA 4:30pm"'});
  if (step.n === 6) items.push({kind:'kb', text: agentMode?'Context packet delivered · transcript + plan + state':'Routing: confidence high → keep on IVA'});
  if (step.n === 7) items.push({kind:'kb', text:'Logged: sentiment +0.6 · resolution 9.1 · delta → training'});
  // Always show sentiment line
  items.push({kind:'sent', text:`Sentiment: ${step.n<=3?'neutral':'positive'} · ${agentMode?'agent tone: empathetic':'IVA tone: on-brand'}`});

  copilotBody.innerHTML = items.slice(0,3).map(it => {
    const cls = it.kind === 'warn' ? 'warn' : it.kind === 'draft' ? '' : 'kb';
    const label = ({kb:'KB Lookup', warn:'Guardrail', draft:'Draft reply', sent:'Sentiment'})[it.kind];
    const footer = it.kind === 'draft' ? '<div class="suggestion-footer"><button>Send</button><button>Edit</button></div>' : '';
    return `<div class="suggestion ${cls}"><div class="kind mono">${label}</div>${it.text}${footer}</div>`;
  }).join('');
}

function renderStep() {
  const scen = SCENARIOS[currentScenario];
  const cells = [...stackIndex.querySelectorAll('.layer-cell')];

  if (stepIdx === -1) {
    cells.forEach(c => { c.className = 'layer-cell'; });
    focusBadge.innerHTML = `<i></i><span>${scen.intro.meta}</span>`;
    focusBadge.className = 'focus-badge owner-iva';
    focusOwner.style.display = 'none';
    focusCard.style.setProperty('--hue', 'var(--accent)');
    focusTitle.textContent = scen.name;
    focusLede.textContent = 'IVA takes the call. Watch the stack respond.';
    focusBody.style.display = 'none';
    focusStep.textContent = 'inbound';
    customerState.textContent = scen.intro.cust;
    agentState.textContent = scen.intro.agent;
    scenarioText.innerHTML = `<span class="sub">›</span> ${scen.intro.sys}`;
    customerBook.classList.add('active');
    agentBook.classList.remove('active');
    focusCard.classList.remove('pop'); void focusCard.offsetWidth; focusCard.classList.add('pop');
    drawConnectors(null, 'iva');
    renderCopilot(null, 'iva');
    return;
  }
  if (stepIdx >= scen.steps.length) {
    const lastOwner = scen.steps[scen.steps.length-1].owner;
    cells.forEach(c => { c.classList.remove('active'); c.classList.add('done'); });
    focusBadge.innerHTML = `<i></i><span>${scen.outro.meta}</span>`;
    focusBadge.className = 'focus-badge owner-iva';
    focusOwner.style.display = 'none';
    focusCard.style.setProperty('--hue', 'var(--h2)');
    focusTitle.textContent = 'Resolved';
    focusLede.textContent = scen.outro.sys;
    focusBody.style.display = 'none';
    focusStep.textContent = 'complete';
    customerState.textContent = scen.outro.cust;
    agentState.textContent = scen.outro.agent;
    scenarioText.innerHTML = `<span class="sub">›</span> ${scen.outro.sys}`;
    customerBook.classList.remove('active');
    agentBook.classList.toggle('active', lastOwner === 'agent');
    focusCard.classList.remove('pop'); void focusCard.offsetWidth; focusCard.classList.add('pop');
    drawConnectors(null, lastOwner === 'agent' ? 'agent' : 'iva');
    return;
  }

  const step = scen.steps[stepIdx];
  const L = LAYERS[step.n];

  cells.forEach(c => {
    c.classList.remove('active');
    c.classList.remove('owner-iva','owner-agent');
  });
  for (let k = 0; k < stepIdx; k++) {
    const pn = scen.steps[k].n; const pOwner = scen.steps[k].owner;
    const cell = stackIndex.querySelector(`.layer-cell[data-n="${pn}"]`);
    if (cell) {
      cell.classList.add('done');
      cell.classList.add(pOwner==='agent'||pOwner==='handoff'?'owner-agent':'owner-iva');
      cell.querySelector('.cell-owner').textContent = pOwner==='agent'||pOwner==='handoff'?'A':'i';
    }
  }
  const active = stackIndex.querySelector(`.layer-cell[data-n="${step.n}"]`);
  if (active) {
    active.classList.add('active');
    active.classList.remove('done');
    active.classList.add(step.owner==='agent'||step.owner==='handoff'?'owner-agent':'owner-iva');
    active.querySelector('.cell-owner').textContent = step.owner==='agent'||step.owner==='handoff'?'A':'i';
  }

  const ownerClass = 'owner-' + (step.owner === 'handoff' ? 'handoff' : step.owner);
  const ownerLabel = step.owner === 'agent' ? 'HUMAN AGENT' : step.owner === 'handoff' ? 'HANDOFF · IVA → HUMAN' : 'IVA';
  focusBadge.innerHTML = `<i></i><span>${L.tag} · ${L.title.toUpperCase()}</span>`;
  focusBadge.className = 'focus-badge';
  focusBadge.style.color = L.hue;
  focusBadge.style.background = `color-mix(in oklab, ${L.hue} 12%, transparent)`;
  focusOwner.style.display = '';
  focusOwner.className = 'focus-badge ' + ownerClass;
  focusOwner.innerHTML = `<i></i><span>${ownerLabel}</span>`;
  focusCard.style.setProperty('--hue', L.hue);
  focusTitle.textContent = L.title;
  focusLede.textContent = L.lede;
  focusBody.style.display = 'grid';
  focusLevers.innerHTML = L.levers.map(([k,v]) => `<div class="lever"><b>${k}</b><span>${v}</span></div>`).join('');
  focusRoles.innerHTML = [
    setRoleRow('Leader', L.roles.leader[0], L.roles.leader[1]),
    setRoleRow('Manager', L.roles.manager[0], L.roles.manager[1]),
    setRoleRow('Agent', L.roles.agent[0], L.roles.agent[1]),
    setRoleRow('IVA', L.roles.iva[0], L.roles.iva[1]),
  ].join('');
  focusStep.textContent = `step ${stepIdx+1} / ${scen.steps.length}`;

  customerState.textContent = step.cust;
  agentState.textContent = step.agent;
  scenarioText.innerHTML = `<span class="sub">› ${scen.name.split('·')[1]?.trim() || scen.name}</span>${step.sys}`;

  customerBook.classList.toggle('active', step.owner !== 'agent');
  agentBook.classList.toggle('active', step.owner === 'agent' || step.owner === 'handoff');

  focusCard.classList.remove('pop'); void focusCard.offsetWidth; focusCard.classList.add('pop');
  drawConnectors(step.n, step.owner);
  renderCopilot(step, step.owner);
}

function advance() {
  stepIdx++;
  const scen = SCENARIOS[currentScenario];
  if (stepIdx > scen.steps.length) stepIdx = -1;
  renderStep();
  runProgressBar();
}
function runProgressBar() {
  clearInterval(progressTimer);
  stepStart = performance.now();
  focusBar.style.width = '0%';
  progressTimer = setInterval(() => {
    const t = Math.min(1, (performance.now() - stepStart) / STEP_MS);
    focusBar.style.width = (t * 100) + '%';
    if (t >= 1) clearInterval(progressTimer);
  }, 60);
}
function startLoop() {
  clearTimeout(stepTimer); clearInterval(progressTimer);
  function tick() {
    if (!playing) return;
    advance();
    stepTimer = setTimeout(tick, STEP_MS);
  }
  tick();
}
function jumpTo(n) {
  const scen = SCENARIOS[currentScenario];
  const idx = scen.steps.findIndex(s => s.n === n);
  if (idx >= 0) {
    stepIdx = idx; renderStep(); runProgressBar();
    clearTimeout(stepTimer);
    if (playing) stepTimer = setTimeout(() => {
      advance();
      stepTimer = setTimeout(function loop(){ if(playing){advance(); stepTimer=setTimeout(loop, STEP_MS);} }, STEP_MS);
    }, STEP_MS);
  }
}

/* Connectors */
function drawConnectors(activeN, owner) {
  const stage = document.querySelector('.stage');
  const rect = stage.getBoundingClientRect();
  connectSvg.innerHTML = '';
  connectSvg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  connectSvg.setAttribute('width', rect.width); connectSvg.setAttribute('height', rect.height);

  const cust = customerBook.querySelector('.avatar').getBoundingClientRect();
  const ag = agentBook.querySelector('.avatar').getBoundingClientRect();
  const fc = focusCard.getBoundingClientRect();

  const cx = cust.right - rect.left;
  const cy = cust.top + cust.height/2 - rect.top;
  const ax = ag.left - rect.left;
  const ay = ag.top + ag.height/2 - rect.top;
  const fxL = fc.left - rect.left;
  const fxR = fc.right - rect.left;
  const fy = fc.top + fc.height/2 - rect.top;

  const mid1 = (cx + fxL) / 2;
  const p1 = document.createElementNS('http://www.w3.org/2000/svg','path');
  p1.setAttribute('d', `M ${cx} ${cy} C ${mid1} ${cy}, ${mid1} ${fy}, ${fxL} ${fy}`);
  if (activeN !== null) p1.classList.add('live');
  connectSvg.appendChild(p1);

  const mid2 = (fxR + ax) / 2;
  const p2 = document.createElementNS('http://www.w3.org/2000/svg','path');
  p2.setAttribute('d', `M ${fxR} ${fy} C ${mid2} ${fy}, ${mid2} ${ay}, ${ax} ${ay}`);
  if (activeN !== null && (owner === 'agent' || owner === 'handoff')) p2.classList.add('live','warm');
  else if (activeN !== null) p2.classList.add('live');
  connectSvg.appendChild(p2);
}

/* Role lens tabs */
document.querySelectorAll('.role-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.role-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.body.className = 'lens-' + t.dataset.lens;
  });
});

/* Controls */
scenarioSelect.addEventListener('change', e => {
  currentScenario = +e.target.value;
  stepIdx = -1; playing = true; playBtn.textContent = 'Pause';
  startLoop();
});
playBtn.addEventListener('click', () => {
  playing = !playing;
  playBtn.textContent = playing ? 'Pause' : 'Play';
  if (playing) startLoop();
  else { clearTimeout(stepTimer); clearInterval(progressTimer); }
});

window.addEventListener('load', () => {
  stepIdx = -1;
  renderStep();
  drawFeedback();
  startLoop();
});
window.addEventListener('resize', () => {
  drawFeedback();
  const scen = SCENARIOS[currentScenario];
  const step = (stepIdx >= 0 && stepIdx < scen.steps.length) ? scen.steps[stepIdx] : null;
  drawConnectors(step?.n ?? null, step?.owner ?? null);
});
