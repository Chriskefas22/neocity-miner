(() => {
  "use strict";
  const $=q=>document.querySelector(q);
  const esc=v=>String(v??"").replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));
  const assetMap=[
    "./assets/neocity/03-holographic-core.svg",
    "./assets/neocity/06-mining-core-panel.svg",
    "./assets/neocity/07-yield-visualization.svg",
    "./assets/neocity/05-energy-grid.svg"
  ];

  async function request(url, options={}) {
    const session=await window.NeoAuth?.getSession?.();
    const headers=new Headers(options.headers||{});
    if(session?.access_token) headers.set("Authorization",`Bearer ${session.access_token}`);
    const r=await fetch(url,{...options,headers});
    const d=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(d?.message||d?.error||`HTTP_${r.status}`);
    return d;
  }

  async function loadMiners() {
    const g=$("#minerGrid"), p=$("#poolGrid");
    if(!g||!p)return;
    try{
      const d=await request(window.NEOCITY_CONFIG.endpoints.miners);
      const products=d.products||[], pools=d.pools||[];
      $("#minerNetworkStatus")&&($("#minerNetworkStatus").textContent=d.network_status||"UNKNOWN");
      $("#minerActivePools")&&($("#minerActivePools").textContent=pools.filter(x=>x.pool_status==="active").length);
      g.innerHTML=products.length?products.map((x,i)=>`<article class="miner-card glass"><div class="miner-image"><img src="${esc(x.metadata?.image_url||assetMap[i%assetMap.length])}" alt=""><span>${esc(String(x.product_type||"MINER").toUpperCase())}</span></div><div class="miner-body"><small>${esc(x.product_key)}</small><h3>${esc(x.product_name)}</h3><div class="miner-stat"><b>${Number(x.hashrate||0).toLocaleString()} H/s</b><span>${esc(x.price_currency||"USD")} ${x.price==null?"—":Number(x.price).toLocaleString()}</span></div><p>${esc(x.description||"NeoCity mining power.")}</p><button class="secondary-btn" data-action="buy-miner" data-listing="${esc(x.product_key)}">VIEW / BUY</button></div></article>`).join("")
      : `<article class="glass empty-state"><b>Miner catalog is not populated yet.</b><span>The production UI will not invent prices or hashrates.</span></article>`;
      p.innerHTML=pools.map(x=>`<article class="pool-card glass"><div><small>${esc(x.algorithm||"NCOIN")}</small><b>${esc(x.pool_name)}</b></div><span>${Number(x.total_hashrate||0).toLocaleString()} H/s</span><small>${Number(x.active_miners||0).toLocaleString()} active miners · ${(Number(x.pool_fee_rate||0)*100).toFixed(2)}% fee</small></article>`).join("");
      $("#minerEffectiveHs")&&await updateOwnHashrate();
    }catch(e){
      g.innerHTML=`<article class="glass empty-state"><b>Miner catalog unavailable.</b><span>${esc(e.message)}</span></article>`;
      p.innerHTML=`<article class="glass empty-state"><b>Pool state unavailable.</b><span>${esc(e.message)}</span></article>`;
    }
  }

  async function updateOwnHashrate(){
    try{
      const s=await window.NeoAuth.getSession();if(!s)return;
      const r=await fetch(window.NEOCITY_CONFIG.endpoints.me,{headers:{Authorization:`Bearer ${s.access_token}`}});
      const d=await r.json();
      $("#minerEffectiveHs")&&($("#minerEffectiveHs").textContent=Number(d.effective_hashrate||0).toLocaleString());
    }catch{}
  }

  async function loadShop(tab="miners"){
    const g=$("#shopCatalog"); if(!g)return;
    g.setAttribute("aria-busy","true");
    try{
      const d=await request(`${window.NEOCITY_CONFIG.endpoints.catalog}?type=${encodeURIComponent(tab)}`);
      const rows=d.items||[];
      g.innerHTML=rows.length?rows.map((x,i)=>`<article class="shop-card glass catalog-card"><div class="catalog-image"><img src="${esc(x.image_url||assetMap[i%assetMap.length])}" alt=""></div><span>${esc(x.badge||x.item_type||"CATALOG")}</span><h3>${esc(x.name)}</h3><p>${esc(x.description||"NeoCity catalog item.")}</p><strong>${x.price_usd==null?"—":"$"+Number(x.price_usd).toLocaleString()}</strong>${x.hashrate?`<small>${Number(x.hashrate).toLocaleString()} H/s</small>`:""}<button class="primary-btn" data-action="shop-buy" data-id="${esc(x.id||"")}">VIEW / BUY</button></article>`).join("")
      : `<article class="glass empty-state"><b>No active ${esc(tab)} listings.</b><span>Catalog data is authoritative and not fabricated client-side.</span></article>`;
    }catch(e){g.innerHTML=`<article class="glass empty-state"><b>Catalog unavailable.</b><span>${esc(e.message)}</span></article>`}
    g.removeAttribute("aria-busy");
  }

  async function loadReferrals(){
    const data=await request(window.NEOCITY_CONFIG.endpoints.referrals);
    $("#referralCode")&&($("#referralCode").textContent=data.referral_code||"—");
    $("#refInvited")&&($("#refInvited").textContent=Number(data.invited||0).toLocaleString());
    $("#refActive")&&($("#refActive").textContent=Number(data.active||0).toLocaleString());
    $("#refEarned")&&($("#refEarned").textContent=Number(data.earned||0).toLocaleString());
  }

  async function loadBounties(){
    const g=$("#bountyGrid");if(!g)return;
    try{
      const data=await request(window.NEOCITY_CONFIG.endpoints.bounties);
      const rows=data.bounties||[];
      g.innerHTML=rows.length?rows.map(x=>`<article class="bounty-card glass"><span>${esc(x.status||"ACTIVE")}</span><h3>${esc(x.bounty_name)}</h3><p>${esc(x.description||"Community bounty.")}</p><div><b>${Number(x.ncoin_reward||0).toLocaleString()} N Coin</b><small>Target ${Number(x.target_value||1).toLocaleString()}</small></div><button class="secondary-btn" data-action="bounty-submit" data-id="${esc(x.id)}">SUBMIT / OPEN</button></article>`).join("")
      : `<article class="glass empty-state"><b>No active bounties.</b><span>New bounties will appear here when published.</span></article>`;
    }catch(e){g.innerHTML=`<article class="glass empty-state"><b>Bounty service unavailable.</b><span>${esc(e.message)}</span></article>`}
  }

  document.addEventListener("DOMContentLoaded",()=>{
    loadMiners();loadShop();loadBounties();
    document.querySelectorAll(".catalog-tab").forEach(b=>b.addEventListener("click",()=>{
      document.querySelectorAll(".catalog-tab").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");loadShop(b.dataset.catalog);
    }));
    document.querySelector('[data-view="referrals"]')?.addEventListener("click",()=>loadReferrals().catch(()=>{}));
  });

  window.NeoModules=Object.freeze({loadMiners,loadShop,loadReferrals,loadBounties});
})();
