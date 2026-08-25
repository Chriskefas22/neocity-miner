const state = { screen: "home", audio: false };

const phaseMap = [
  ["MIDNIGHT",0,5,"00:00 – 05:59"],["MORNING",6,11,"06:00 – 11:59"],
  ["DAY",12,16,"12:00 – 16:59"],["EVENING",17,19,"17:00 – 19:59"],["NIGHT",20,23,"20:00 – 23:59"]
];

function $(q){return document.querySelector(q)}
function showToast(text){
  const t=$("#toast"); t.textContent=text; t.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>t.classList.remove("show"),2200);
}
function showSheet(title,text){
  $("#sheetTitle").textContent=title; $("#sheetText").textContent=text; $("#sheet").classList.add("open");
}
function go(screen){
  const target=$("#screen-"+screen); if(!target)return;
  state.screen=screen;
  document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("active",x===target));
  document.querySelectorAll("[data-screen]").forEach(x=>x.classList.toggle("active",x.dataset.screen===screen));
  window.scrollTo({top:0,behavior:"smooth"});
}
function updateClock(){
  const now=new Date();
  const parts=new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:"Asia/Jakarta"}).formatToParts(now);
  const hour=Number(parts.find(x=>x.type==="hour")?.value||12);
  const phase=phaseMap.find(p=>hour>=p[1]&&hour<=p[2])||phaseMap[2];
  const name=$("#phaseName"), range=$("#phaseRange");
  if(name){name.textContent=phase[0];range.textContent=phase[3]}
}
function animateData(){
  const t=Date.now()/1000;
  const core=Math.round(82+Math.sin(t/2.7)*1.2);
  const hash=Math.round(1000+Math.sin(t/2)*22);
  const grid=Math.min(100,99+Math.round(Math.abs(Math.sin(t/3))));
  const coin=Math.round(15250+Math.sin(t/4)*18);
  if($("#coreValue"))$("#coreValue").innerHTML=`${core}<small>%</small>`;
  if($("#hashValue"))$("#hashValue").innerHTML=`${hash.toLocaleString()}<small> H/s</small>`;
  if($("#gridValue"))$("#gridValue").innerHTML=`${grid}<small>%</small>`;
  if($("#coinValue"))$("#coinValue").innerHTML=`${coin.toLocaleString()}<small> NCOIN</small>`;
  requestAnimationFrame(animateData);
}
function action(name){
  const messages={
    faucet:"Faucet flow is ready for the production reward layer.",
    spin:"Free Hashrate Spin: production cooldown and reward caps will be server-side.",
    bonus:"Daily Bonus is prepared for server-side validation.",
    topup:"Top Up opens the production payment flow when the backend is connected.",
    boost:"Core Boost is a visual demo. No production reward is created.",
    upgrade:"Core Upgrade is ready for the future backend economy.",
    maintenance:"Core maintenance check completed in demo mode.",
    referrals:"Referral system will use server-side attribution and reward rules.",
    shop:"Shop packages will connect to the production N Coin / hashrate economy.",
    leaderboard:"Leaderboard is currently a visual placeholder.",
    news:"NeoCity network status: ONLINE.",
    settings:"Settings will be expanded during the production integration phase.",
    help:"Help Center is ready for production content.",
    logout:"Demo logout only. Authentication is not connected yet.",
    offers:"Offer completion will be validated by the production provider callback.",
    pages:"Page mission recorded only in demo mode."
  };
  showSheet(name.replace(/^\w/,c=>c.toUpperCase()),messages[name]||"NeoCity action is ready.");
}

document.addEventListener("click",e=>{
  const screen=e.target.closest("[data-screen]"); if(screen){e.preventDefault();go(screen.dataset.screen);return}
  const act=e.target.closest("[data-action]"); if(act){action(act.dataset.action);return}
  if(e.target.closest("#notifyBtn")){showSheet("Notifications","NeoCity network is online. Production notifications will come from the server.");}
  if(e.target.closest("#menuBtn")){go("more");}
  if(e.target.closest("#sheetClose")||e.target.closest("#sheetOk")){$("#sheet").classList.remove("open");}
});
document.addEventListener("DOMContentLoaded",()=>{updateClock();setInterval(updateClock,1000);requestAnimationFrame(animateData)});
