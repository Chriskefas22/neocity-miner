(() => {
  "use strict";
  const C=window.NEOCITY_CONFIG;
  const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
  const state={view:"home",audio:true};

  const phases=[
    ["MIDNIGHT",0,5,"00:00 – 05:59","NeoCity is in quiet operations."],
    ["MORNING",6,11,"06:00 – 11:59","Traffic and energy systems are ramping up."],
    ["DAY",12,16,"12:00 – 16:59","NeoCity is fully active and productive."],
    ["EVENING",17,19,"17:00 – 19:59","City demand is rising."],
    ["NIGHT",20,23,"20:00 – 23:59","Night operations remain online."]
  ];

  const esc=v=>String(v??"").replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));

  function toast(msg){
    const n=$("#toast");if(!n)return;
    n.textContent=msg;n.classList.add("show");clearTimeout(toast.t);
    toast.t=setTimeout(()=>n.classList.remove("show"),3000);
  }

  function showView(view){
    const target=$("#view-"+view);if(!target)return;
    state.view=view;
    $$(".view").forEach(v=>v.classList.toggle("active",v===target));
    $$("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
    $("#sideNav")?.classList.remove("open");$("#mobileOverlay")?.classList.remove("show");
    if(view==="miners")window.NeoModules?.loadMiners?.();
    if(view==="shop")window.NeoModules?.loadShop?.("miners");
    if(view==="referrals")window.NeoModules?.loadReferrals?.();
    if(view==="bounty")window.NeoModules?.loadBounties?.();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function tickClock(){
    const now=new Date();
    const time=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Jakarta",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now);
    const hour=Number(new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Jakarta",hour:"numeric",hour12:false}).formatToParts(now).find(p=>p.type==="hour")?.value||0);
    const p=phases.find(x=>hour>=x[1]&&hour<=x[2])||phases[2];
    $("#serverClock")&&($("#serverClock").textContent=time);
    $("#heroPhase")&&($("#heroPhase").textContent=p[0]);$("#heroPhaseRange")&&($("#heroPhaseRange").textContent=p[3]);$("#heroPhaseCopy")&&($("#heroPhaseCopy").textContent=p[4]);
    $("#networkPhase")&&($("#networkPhase").textContent=p[0]);$("#networkPhaseRange")&&($("#networkPhaseRange").textContent=p[3]);
  }

  function tickReset(){
    const n=$("#resetTimer");if(!n)return;
    const now=new Date(),end=new Date(now);end.setHours(24,0,0,0);const ms=Math.max(0,end-now);
    n.textContent=`${String(Math.floor(ms/3600000)).padStart(2,"0")} : ${String(Math.floor(ms%3600000/60000)).padStart(2,"0")} : ${String(Math.floor(ms%60000/1000)).padStart(2,"0")}`;
  }

  async function api(path,options={}){
    const session=await window.NeoAuth?.getSession?.();
    const h=new Headers(options.headers||{});
    if(session?.access_token)h.set("Authorization",`Bearer ${session.access_token}`);
    h.set("Content-Type","application/json");
    const r=await fetch(path,{...options,headers:h});
    const d=await r.json().catch(()=>({}));
    if(r.status===401){window.NeoAuthUI?.open?.();throw new Error("AUTH_REQUIRED")} if(!r.ok)throw new Error(d?.message||d?.error||`HTTP_${r.status}`);
    return d;
  }

  async function refreshMe(){
    try{
      const d=await api(C.endpoints.me);
      const p=d.profile||{},w=d.wallet||{},pr=d.progress||{};
      const coin=Number(w.neocoin_balance??0),hs=Number(d.effective_hashrate??0),lv=Number(pr.current_level??0);
      $("#profileName")&&($("#profileName").textContent=p.display_name||p.username||"NeoMiner");
      $("#profileId")&&($("#profileId").textContent=`ID: ${String(p.id||"").slice(0,8).toUpperCase()}`);
      $("#metricCoin")&&($("#metricCoin").innerHTML=`${coin.toLocaleString()}<small> N COIN</small>`);
      $("#walletNcoin")&&($("#walletNcoin").innerHTML=`${coin.toLocaleString()} <i>N COIN</i>`);
      $("#economyNcoin")&&($("#economyNcoin").textContent=coin.toLocaleString());
      $("#metricHash")&&($("#metricHash").innerHTML=`${hs.toLocaleString()}<small> H/s</small>`);
      $("#coreHashrate")&&($("#coreHashrate").innerHTML=`${hs.toLocaleString()} <i>H/s</i>`);
      $("#powerHashrate")&&($("#powerHashrate").innerHTML=`${hs.toLocaleString()} <i>H/s</i>`);
      $("#economyHashrate")&&($("#economyHashrate").textContent=`${hs.toLocaleString()} H/s`);
      $("#economyLevel")&&($("#economyLevel").textContent=lv);
      $("#levelCurrent")&&($("#levelCurrent").textContent=lv);
      $("#minerEffectiveHs")&&($("#minerEffectiveHs").textContent=hs.toLocaleString());
      $("#referralCode")&&($("#referralCode").textContent=p.referral_code||"—");
    }catch{}
  }

  function wireNav(){
    $$("[data-view]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();showView(b.dataset.view);}));
    $("#menuButton")?.addEventListener("click",()=>{$("#sideNav")?.classList.add("open");$("#mobileOverlay")?.classList.add("show")});
    $("#mobileOverlay")?.addEventListener("click",()=>{$("#sideNav")?.classList.remove("open");$("#mobileOverlay")?.classList.remove("show")});
  }

  function wireAudio(){
    $("#audioToggle")?.addEventListener("click",()=>{
      state.audio=!state.audio;$("#audioToggle").classList.toggle("on",state.audio);$("#audioToggle").setAttribute("aria-pressed",String(state.audio));
      $("#audioLabel").textContent=state.audio?"AUDIO ON":"AUDIO OFF";toast(state.audio?"City ambience enabled":"City ambience disabled");
    });
  }

  function wireWallet(){
    $$("[data-action=deposit]").forEach(b=>b.addEventListener("click",()=>window.NeoWalletUI?.open("deposit")));
    $$("[data-action=withdraw]").forEach(b=>b.addEventListener("click",()=>window.NeoWalletUI?.open("withdraw")));
    $("#depositForm")?.addEventListener("submit",async e=>{
      e.preventDefault();const form=new FormData(e.currentTarget);
      try{const d=await api(C.endpoints.deposit,{method:"POST",body:JSON.stringify(Object.fromEntries(form.entries()))});$("#modalMessage").textContent=d.message;toast("Deposit request created");}
      catch(x){$("#modalMessage").textContent=x.message}
    });
    $("#withdrawForm")?.addEventListener("submit",async e=>{
      e.preventDefault();const form=new FormData(e.currentTarget);
      try{const d=await api(C.endpoints.withdraw,{method:"POST",body:JSON.stringify(Object.fromEntries(form.entries()))});$("#modalMessage").textContent=d.message;toast("Withdrawal request submitted");}
      catch(x){$("#modalMessage").textContent=x.message}
    });
  }


  function openBountyModal(id){
    const d=$("#bountyModal");if(!d)return;
    d.showModal();
    const input=d.querySelector('input[name="bounty_id"]');if(input)input.value=id||"";
  }

  function wireActions(){
    $$("[data-action]").forEach(b=>{
      if(["deposit","withdraw","auth"].includes(b.dataset.action))return;
      b.addEventListener("click",async()=>{
        const a=b.dataset.action;
        try{
          if(a==="spin"){
            const d=await api(C.endpoints.spin,{method:"POST",body:"{}"});toast(d.message||"Spin completed");return refreshMe();
          }
          if(a==="welcome"){
            const d=await api(C.endpoints.welcome,{method:"POST",body:"{}"});toast(d.message||"Welcome bonus claimed");return refreshMe();
          }
          if(a==="daily"){
            const d=await api(C.endpoints.daily,{method:"POST",body:"{}"});toast(d.message||"Daily Bonus completed");return refreshMe();
          }
          if(a==="exchange"){
            const d=await api(C.endpoints.exchange,{method:"POST",body:"{}"});toast(d.message||"Exchange completed");return refreshMe();
          }
          if(a==="referral-history"){showView("referrals");return}
          if(a==="buy-miner"||a==="shop-buy"){toast("Purchase is server-authorized and opens after a configured payment listing exists.");return}
          if(a==="bounty-submit"){openBountyModal(b.dataset.id);return}
          const m={
            offers:"Offer credit requires a verified provider callback.",
            pages:"Page activity is tracked server-side.",
            security:"Security controls remain server-side.",
            "shop-starter":"Catalog data is server-sourced.",
            "shop-growth":"Catalog data is server-sourced.",
            "shop-premium":"Membership data is server-sourced.",
            "shop-network":"Catalog data is server-sourced."
          };
          toast(m[a]||"NeoCity action ready.");
        }catch(e){toast(e.message||"Action unavailable")}
      })
    });

    $("#copyReferral")?.addEventListener("click",async()=>{
      const code=$("#referralCode")?.textContent||"";
      if(!code||code==="—")return toast("Referral code is unavailable.");
      try{await navigator.clipboard.writeText(code);toast("Referral code copied")}catch{toast(code)}
    });
    $("#notifyButton")?.addEventListener("click",()=>toast("NeoCity network is online."));
    $("#bountyForm")?.addEventListener("submit",async e=>{
      e.preventDefault();
      const f=new FormData(e.currentTarget);
      try{
        const d=await api(C.endpoints.bounties,{method:"POST",body:JSON.stringify(Object.fromEntries(f.entries()))});
        $("#bountyMessage").textContent=d.message||"Submitted.";
        toast("Bounty submitted");
        setTimeout(()=>$("#bountyModal")?.close(),450);
      }catch(x){$("#bountyMessage").textContent=x.message}
    });
    $("#bountyModal")?.addEventListener("click",e=>{if(e.target.id==="bountyModal"||e.target.closest("[data-bounty-close]"))$("#bountyModal").close()});

  }

  function boot(){
    wireNav();wireAudio();wireWallet();wireActions();
    tickClock();tickReset();setInterval(tickClock,1000);setInterval(tickReset,1000);
    refreshMe();window.NeoModules?.loadMiners?.();window.NeoModules?.loadShop?.("miners");window.NeoModules?.loadBounties?.();
  }

  document.addEventListener("DOMContentLoaded",boot);
  window.NeoCity=Object.freeze({showView,toast,refreshMe});
})();
