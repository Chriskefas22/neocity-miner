const state = {
  view: "home",
  audio: true
};

const phases = [
  ["MIDNIGHT", 0, 5, "00:00 – 05:59"],
  ["MORNING", 6, 11, "06:00 – 11:59"],
  ["DAY", 12, 16, "12:00 – 16:59"],
  ["EVENING", 17, 19, "17:00 – 19:59"],
  ["NIGHT", 20, 23, "20:00 – 23:59"]
];

const $ = (q) => document.querySelector(q);
const $$ = (q) => [...document.querySelectorAll(q)];

function toast(message){
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2100);
}

function showView(view){
  const target = $("#view-" + view);
  if(!target) return;

  state.view = view;

  $$(".view").forEach(v => v.classList.toggle("active", v === target));
  $$("[data-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));

  if (view === "home") {
    document.body.classList.remove("inner-view");
  } else {
    document.body.classList.add("inner-view");
  }

  const side = $("#sideNav");
  const overlay = $("#mobileOverlay");
  side?.classList.remove("open");
  overlay?.classList.remove("show");

  window.scrollTo({top:0, behavior:"smooth"});
}

function updatePhase(){
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone:"Asia/Jakarta",
    hour:"numeric",
    hour12:false
  }).formatToParts(now);
  const hour = Number(parts.find(p=>p.type==="hour")?.value || 0);

  const phase = phases.find(p => hour >= p[1] && hour <= p[2]) || phases[2];

  ["#heroPhase","#networkPhase"].forEach(sel => { if($(sel)) $(sel).textContent = phase[0]; });
  ["#heroPhaseRange","#networkPhaseRange"].forEach(sel => { if($(sel)) $(sel).textContent = phase[3]; });
}

function updateClock(){
  const now = new Date();
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone:"Asia/Jakarta",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit",
    hour12:false
  }).format(now);
  if($("#serverClock")) $("#serverClock").textContent = time;
  updatePhase();
}

function animateMetrics(){
  const t = Date.now()/1000;
  const core = Math.round(82 + Math.sin(t/2.7)*1.2);
  const hash = Math.round(1000 + Math.sin(t/2.1)*22);
  const grid = Math.min(100, 99 + Math.round(Math.abs(Math.sin(t/3.2))));
  const coin = Math.round(15250 + Math.sin(t/4.4)*18);

  if($("#metricCore")) $("#metricCore").innerHTML = `${core}<small>%</small>`;
  if($("#metricHash")) $("#metricHash").innerHTML = `${hash.toLocaleString()}<small> H/s</small>`;
  if($("#metricGrid")) $("#metricGrid").innerHTML = `${grid}<small>%</small>`;
  if($("#metricCoin")) $("#metricCoin").innerHTML = `${coin.toLocaleString()}<small> N COIN</small>`;

  requestAnimationFrame(animateMetrics);
}

function wireNavigation(){
  $$("[data-view]").forEach(btn => btn.addEventListener("click", e => {
    e.preventDefault();
    showView(btn.dataset.view);
  }));
}

function wireMenu(){
  $("#menuButton")?.addEventListener("click", () => {
    $("#sideNav")?.classList.add("open");
    $("#mobileOverlay")?.classList.add("show");
  });

  $("#mobileOverlay")?.addEventListener("click", () => {
    $("#sideNav")?.classList.remove("open");
    $("#mobileOverlay")?.classList.remove("show");
  });
}

function wireAudio(){
  const toggle = $("#audioToggle");
  const label = $("#audioLabel");

  toggle?.addEventListener("click", () => {
    state.audio = !state.audio;
    toggle.classList.toggle("on", state.audio);
    toggle.setAttribute("aria-pressed", String(state.audio));
    label.textContent = state.audio ? "AUDIO ON" : "AUDIO OFF";
    toast(state.audio ? "City ambience enabled" : "City ambience disabled");
  });
}

function wireActions(){
  const messages = {
    daily:"Daily Bonus visual flow is ready. Final reward validation will be server-side.",
    faucet:"Free Hashrate Spin visual flow is ready. Production cooldown: 3 hours.",
    spin:"Spin ready. Large visual jackpot values are presentation-only; production rewards remain capped.",
    bonus:"Daily Bonus visual flow is ready.",
    topup:"Top Up will use the production crypto payment flow later.",
    upgrade:"Core Upgrade UI is ready for the production economy integration.",
    boost:"Core Boost UI is ready. No production reward is created in visual mode.",
    maintenance:"Core maintenance check completed in visual mode.",
    "reserve-history":"Reserve history will be connected to the server ledger later.",
    settlement:"Settlement queue is a production backend feature.",
    offers:"Offer completion will be credited only after a verified provider callback.",
    pages:"Page mission is visual-only in this build.",
    bounty:"Bounty system will reward qualifying community growth without guaranteeing a loss-making payout.",
    contest:"Contest prize pools will be budgeted from realized revenue.",
    "referral-rules":"Referral rules will use qualification, anti-abuse and realized-revenue checks.",
    "referral-history":"Referral history will come from the referral ledger.",
    deposit:"Deposit UI ready. Minimum deposit is $0.01; withdrawal eligibility requires $1 cumulative qualifying top-up.",
    withdraw:"Withdrawal UI ready. Minimum withdrawal is $1.00 and remains admin-approved.",
    "wallet-balance":"Wallet balance screen is ready.",
    "deposit-history":"Deposit history will come from the production ledger.",
    "withdraw-history":"Withdrawal history will come from the production ledger.",
    transactions:"Transaction history will come from wallet_ledger.",
    exchange:"N Coin → H/s exchange will reset level to 0 after a successful conversion.",
    security:"Security will use server-side rules and anti-abuse controls.",
    "shop-starter":"Starter package preview.",
    "shop-growth":"Growth package preview.",
    "shop-premium":"Premium membership preview.",
    "shop-network":"Network package preview.",
    referrals:"Referral system preview.",
    shop:"Shop preview.",
    leaderboard:"Leaderboard preview.",
    news:"NeoCity Network ONLINE.",
    settings:"Settings preview.",
    help:"Help Center preview."
  };

  $$("[data-action]").forEach(btn => btn.addEventListener("click", () => {
    const key = btn.dataset.action;
    toast(messages[key] || "NeoCity action ready.");
  }));

  $("#copyReferral")?.addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText("NEO7X9B2");
      toast("Referral code copied");
    }catch{
      toast("Referral code: NEO7X9B2");
    }
  });

  $("#notifyButton")?.addEventListener("click", () => toast("NeoCity network is online."));
}

function updateResetTimer(){
  const node = $("#resetTimer");
  if(!node) return;

  const now = new Date();
  const end = new Date(now);
  end.setHours(24,0,0,0);

  const ms = Math.max(0, end - now);
  const h = String(Math.floor(ms/3600000)).padStart(2,"0");
  const m = String(Math.floor(ms%3600000/60000)).padStart(2,"0");
  const s = String(Math.floor(ms%60000/1000)).padStart(2,"0");
  node.textContent = `${h} : ${m} : ${s}`;
}

function boot(){
  wireNavigation();
  wireMenu();
  wireAudio();
  wireActions();
  updateClock();
  updateResetTimer();
  animateMetrics();
  setInterval(updateClock,1000);
  setInterval(updateResetTimer,1000);
}

document.addEventListener("DOMContentLoaded", boot);
