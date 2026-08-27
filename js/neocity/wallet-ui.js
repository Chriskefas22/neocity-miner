(() => {
  "use strict";
  const C=window.NEOCITY_CONFIG, $=q=>document.querySelector(q);

  async function ensureTurnstile(){
    if(window.turnstile)return true;
    try{
      const r=await fetch(C.endpoints.publicConfig),cfg=await r.json();
      if(!cfg.turnstileSiteKey)return false;
      await new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="https://challenges.cloudflare.com/turnstile/v0/api.js";s.async=true;s.defer=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
      return !!window.turnstile;
    }catch{return false}
  }

  async function render(kind){
    const holder=$(kind==="deposit"?"#depositTurnstile":"#withdrawTurnstile");
    if(!holder)return;
    holder.innerHTML="";
    if(!C.protection.turnstileRequiredForFinancialActions)return;
    const ready=await ensureTurnstile();if(!ready)return;
    const r=await fetch(C.endpoints.publicConfig),cfg=await r.json().catch(()=>({}));
    if(!cfg.turnstileSiteKey)return;
    window.turnstile.render(holder,{sitekey:cfg.turnstileSiteKey,callback:t=>{
      const form=$(kind==="deposit"?"#depositForm":"#withdrawForm");
      if(form){let i=form.querySelector("input[name=turnstile_token]");if(!i){i=document.createElement("input");i.type="hidden";i.name="turnstile_token";form.appendChild(i)}i.value=t}
    },"expired-callback":()=>{
      const form=$(kind==="deposit"?"#depositForm":"#withdrawForm");const i=form?.querySelector("input[name=turnstile_token]");if(i)i.value="";
    }});
  }

  function open(kind){
    const d=$("#walletModal");if(!d)return;
    $("#depositForm").hidden=kind!=="deposit";$("#withdrawForm").hidden=kind!=="withdraw";
    $("#modalTitle").textContent=kind==="deposit"?"Create deposit request":"Request withdrawal";
    $("#modalEyebrow").textContent=kind==="deposit"?"DEPOSIT":"WITHDRAWAL";
    $("#modalMessage").textContent="";
    if(kind==="withdraw"){
      const s=$("#withdrawForm select[name=currency]");
      s.innerHTML=C.crypto.symbols.map(x=>`<option value="${x}">${x}</option>`).join("");
    }
    d.showModal(); render(kind);
  }

  document.addEventListener("DOMContentLoaded",()=>{
    document.querySelectorAll("[data-close-modal]").forEach(b=>b.addEventListener("click",()=>$("#walletModal")?.close()));
  });

  window.NeoWalletUI=Object.freeze({open});
})();
