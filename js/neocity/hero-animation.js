/* NeoCity V4.2 — 01 Hero City Core animation */
(()=>{const root=document.querySelector('.nc-hero');if(!root)return;
const L={lights:root.querySelector('.nc-hero__lights'),platform:root.querySelector('.nc-hero__platform'),
glow:root.querySelector('.nc-hero__core-glow'),core:root.querySelector('.nc-hero__core'),
vehicleGlow:root.querySelector('.nc-hero__vehicles-glow'),vehicles:root.querySelector('.nc-hero__vehicles'),
reflections:root.querySelector('.nc-hero__reflections'),particles:root.querySelector('.nc-hero__particles')};
let raf=0,t=0;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function frame(){t+=.012;const pulse=1+Math.sin(t*1.4)*.012,drift=Math.sin(t*.55)*5,drift2=Math.cos(t*.38)*3;
if(!reduce){if(L.glow)L.glow.style.transform=`scale(${pulse})`;
if(L.core)L.core.style.transform=`translate3d(${drift2}px,${Math.sin(t*.7)*2}px,0) scale(${1+Math.sin(t)*.006})`;
if(L.platform)L.platform.style.transform=`translate3d(${drift2*.45}px,0,0)`;
if(L.lights)L.lights.style.transform=`translate3d(${drift*.35}px,${Math.cos(t*.5)*2}px,0)`;
if(L.vehicleGlow)L.vehicleGlow.style.transform=`translate3d(${drift*1.1}px,${Math.cos(t*.8)*4}px,0)`;
if(L.vehicles)L.vehicles.style.transform=`translate3d(${drift*1.4}px,${Math.cos(t*.8)*4}px,0)`;
if(L.reflections)L.reflections.style.transform=`translate3d(${drift*.25}px,0,0)`;
if(L.particles)L.particles.style.transform=`translate3d(${drift*.8}px,${Math.sin(t*.9)*5}px,0)`}
raf=requestAnimationFrame(frame)}
const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){if(!raf)raf=requestAnimationFrame(frame)}
else if(raf){cancelAnimationFrame(raf);raf=0}}, {threshold:.05});io.observe(root)})();
