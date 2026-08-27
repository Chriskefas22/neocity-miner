(() => {
  "use strict";
  const $=q=>document.querySelector(q), C=window.NEOCITY_CONFIG;

  function esc(v){return String(v??"").replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));}

  async function loadTurnstileScript(){
    if(window.turnstile) return true;
    try{
      const r=await fetch(C.endpoints.publicConfig);
      const d=await r.json();
      if(!d.turnstileSiteKey)return false;
      await new Promise((resolve,reject)=>{
        const s=document.createElement("script");
        s.src="https://challenges.cloudflare.com/turnstile/v0/api.js";
        s.async=true;s.defer=true;
        s.onload=resolve;s.onerror=reject;
        document.head.appendChild(s);
      });
      return !!window.turnstile;
    }catch{return false}
  }

  function ensureModal(){
    if($("#authModal"))return;
    const d=document.createElement("dialog");
    d.id="authModal";d.className="neo-modal";
    d.innerHTML=`
      <div class="modal-card glass auth-card">
        <button class="modal-close" data-auth-close aria-label="Close">×</button>
        <small class="eyebrow">NEOCITY IDENTITY</small>
        <h3 id="authTitle">Enter NeoCity</h3>

        <div class="auth-providers">
          <button type="button" data-auth-provider="google">Continue with Google</button>
          <button type="button" data-auth-provider="x">Continue with X</button>
          <button type="button" data-auth-provider="telegram">Continue with Telegram</button>
        </div>

        <div class="auth-separator"><span>OR</span></div>

        <form id="authForm" class="modal-form">
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
          <label>Password<input name="password" type="password" minlength="8" autocomplete="current-password" required></label>
          <label id="referralLabel" hidden>Referral code (optional)<input name="referral_code" maxlength="32" placeholder="NEO…"></label>
          <div id="authTurnstile" class="turnstile-container"></div>
          <button class="primary-btn" id="authSubmit" type="submit">SIGN IN</button>
          <button class="link-btn" id="authMode" type="button">Create new account</button>
        </form>

        <button class="secondary-btn auth-signout" id="authSignout" type="button" hidden>SIGN OUT</button>
        <div class="modal-message" id="authMessage"></div>
      </div>`;
    document.body.appendChild(d);

    let mode="signin";
    let turnstileToken="";

    async function renderCaptcha(){
      const holder=$("#authTurnstile"); if(!holder)return;
      holder.innerHTML="";
      if(!C.protection?.turnstileRequiredForAuth)return;
      const ready=await loadTurnstileScript(); if(!ready)return;
      const r=await fetch(C.endpoints.publicConfig); const cfg=await r.json().catch(()=>({}));
      if(!cfg.turnstileSiteKey)return;
      try{
        window.turnstile.render(holder,{
          sitekey:cfg.turnstileSiteKey,
          callback:t=>turnstileToken=t,
          "expired-callback":()=>turnstileToken=""
        });
      }catch{}
    }

    d.addEventListener("click",async e=>{
      if(e.target.closest("[data-auth-close]")){d.close();return}
      const p=e.target.closest("[data-auth-provider]");
      if(p){
        const name=p.dataset.authProvider;
        const provider=name==="telegram"?(C.auth.telegramProvider||"custom:telegram"):name;
        const referral=$("#authForm input[name=referral_code]")?.value.trim()||"";
        localStorage.setItem("neo_referral_code",referral);
        const {error}=await window.NeoAuth.signInWithOAuth(provider);
        if(error)$("#authMessage").textContent=error.message;
      }
      if(e.target.id==="authMode"){
        mode=mode==="signin"?"signup":"signin";
        $("#authTitle").textContent=mode==="signin"?"Enter NeoCity":"Create your NeoCity ID";
        $("#authSubmit").textContent=mode==="signin"?"SIGN IN":"CREATE ACCOUNT";
        $("#authMode").textContent=mode==="signin"?"Create new account":"Already have an account?";
        $("#referralLabel").hidden=mode==="signin";
        if(mode==="signup")renderCaptcha();
      }
      if(e.target.id==="authSignout"){
        await window.NeoAuth.signOut();
        d.close();
        window.NeoCity?.toast("Signed out");
      }
    });

    $("#authForm").addEventListener("submit",async e=>{
      e.preventDefault();
      const f=new FormData(e.currentTarget), email=String(f.get("email")||"").trim(), pass=String(f.get("password")||""), referral=String(f.get("referral_code")||"").trim();
      const msg=$("#authMessage");
      try{
        if(mode==="signup"){
          if(C.protection?.turnstileRequiredForAuth && !turnstileToken){
            msg.textContent="Please complete the security check."; return;
          }
          localStorage.setItem("neo_referral_code",referral);
          const {error}=await window.NeoAuth.signUp(email,pass,{referral_code:referral},turnstileToken);
          if(error)throw error;
          msg.textContent="Account created. Check email confirmation if enabled.";
        }else{
          const {error}=await window.NeoAuth.signInPassword(email,pass);
          if(error)throw error;
          msg.textContent="Signed in.";
          setTimeout(()=>d.close(),300);
        }
      }catch(err){msg.textContent=err?.message||"Authentication failed."}
    });

    window.NeoAuthUI={
      async open(){
        const session=await window.NeoAuth?.getSession?.();
        $("#authTitle").textContent=session?"NeoCity account":"Enter NeoCity";
        $("#authSignout").hidden=!session;
        $("#authForm").hidden=!!session;
        d.showModal();
        if(!session)await renderCaptcha();
      }
    };
  }

  async function hydrate(){
    try{
      const session=await window.NeoAuth.getSession();
      $("#profileName")&&($("#profileName").textContent=session?.user?.user_metadata?.full_name||session?.user?.email?.split("@")[0]||"NeoMiner");
      if(session){
        const r=await fetch(C.endpoints.me,{headers:{Authorization:`Bearer ${session.access_token}`}});
        const d=await r.json().catch(()=>({})),p=d.profile||{};
        if($("#profileName"))$("#profileName").textContent=p.display_name||p.username||session.user.email?.split("@")[0]||"NeoMiner";
        if($("#profileId"))$("#profileId").textContent=`ID: ${String(p.id||session.user.id).slice(0,8).toUpperCase()}`;
        if($("#referralCode"))$("#referralCode").textContent=p.referral_code||"—";
      }
    }catch{}
  }

  document.addEventListener("DOMContentLoaded",async()=>{
    ensureModal();
    await loadTurnstileScript();
    await hydrate();

    window.NeoSupabase?.auth?.onAuthStateChange?.((_event)=>{
      hydrate();
      const ref=localStorage.getItem("neo_referral_code");
      if(ref) setTimeout(async()=>{
        try{
          const s=await window.NeoAuth.getSession();
          if(s){await fetch(C.endpoints.referrals,{method:"POST",headers:{"Authorization":`Bearer ${s.access_token}`,"Content-Type":"application/json"},body:JSON.stringify({referral_code:ref})});localStorage.removeItem("neo_referral_code")}
        }catch{}
      },700);
    });

    $("#profileButton")?.addEventListener("click",e=>{e.preventDefault();window.NeoAuthUI.open()});
  });
})();
