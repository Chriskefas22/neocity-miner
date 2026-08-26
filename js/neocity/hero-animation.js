
(() => {
  const init = (root) => {
    if (!root || root.dataset.ncHeroReady === "clean-v2") return;
    root.dataset.ncHeroReady = "clean-v2";
    const $ = s => root.querySelector(s);
    const l = {
      bg: $(".nc-hero__background"), lights: $(".nc-hero__lights"),
      platform: $(".nc-hero__platform"), glow: $(".nc-hero__core-glow"),
      core: $(".nc-hero__core"), vg: $(".nc-hero__vehicles-glow"),
      vehicles: $(".nc-hero__vehicles"), reflections: $(".nc-hero__reflections"),
      particles: $(".nc-hero__particles")
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx=0,ty=0,cx=0,cy=0,raf=0;
    const render = ms => {
      const t=ms/1000, w=root.clientWidth;
      const p=w<380?5:w<768?8:w<1200?12:16;
      const drift=w<768?2:w<1200?3:4;
      cx+=(tx-cx)*.055; cy+=(ty-cy)*.055;
      if(l.bg) l.bg.style.transform=`translate3d(${cx*.25}px,${cy*.25}px,0) scale(1.02)`;
      if(l.lights){l.lights.style.transform=`translate3d(${cx*.55}px,${cy*.42}px,0)`;l.lights.style.opacity=.66+Math.sin(t*.8)*.06}
      if(l.platform) l.platform.style.transform=`translate3d(${cx*.7}px,${cy*.45}px,0)`;
      const pulse=1+Math.sin(t*1.7)*(w<768?.012:.02);
      if(l.core) l.core.style.transform=`translate3d(${cx*.92}px,${cy*.68}px,0) scale(${pulse})`;
      if(l.glow){l.glow.style.transform=`translate3d(${cx*.95}px,${cy*.7}px,0) scale(${1.02+Math.sin(t*1.7)*.02})`;l.glow.style.opacity=.76+(Math.sin(t*1.7)+1)*.08}
      const d=Math.sin(t*.45)*drift;
      if(l.vehicles) l.vehicles.style.transform=`translate3d(${cx*1.15+d}px,${cy*.5}px,0)`;
      if(l.vg) l.vg.style.transform=`translate3d(${cx*1.18+d}px,${cy*.5}px,0)`;
      if(l.reflections){l.reflections.style.transform=`translate3d(${Math.sin(t*.7)*4}px,0,0)`;l.reflections.style.opacity=.50+Math.sin(t*.5)*.07}
      if(l.particles) l.particles.style.transform=`translate3d(${Math.sin(t*.18)*6+cx*1.25}px,${Math.cos(t*.25)*5+cy*.9}px,0)`;
      raf=requestAnimationFrame(render);
    };
    root.addEventListener("pointermove",e=>{const r=root.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*p;ty=((e.clientY-r.top)/r.height-.5)*p*.7},{passive:true});
    root.addEventListener("pointerleave",()=>{tx=0;ty=0},{passive:true});
    raf=requestAnimationFrame(render);
    addEventListener("pagehide",()=>cancelAnimationFrame(raf),{once:true});
  };
  document.querySelectorAll(".nc-hero").forEach(init);
})();
