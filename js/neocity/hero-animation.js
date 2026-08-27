/* NeoCity V4.3 — Hero-only motion. No economy mutations. */
(() => {
  const root = document.querySelector(".nc-hero");
  if (!root) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const layer = {
    lights: root.querySelector(".nc-hero__lights"),
    platform: root.querySelector(".nc-hero__platform"),
    glow: root.querySelector(".nc-hero__core-glow"),
    core: root.querySelector(".nc-hero__core"),
    vehicleGlow: root.querySelector(".nc-hero__vehicles-glow"),
    vehicles: root.querySelector(".nc-hero__vehicles"),
    reflections: root.querySelector(".nc-hero__reflections"),
    particles: root.querySelector(".nc-hero__particles")
  };

  let raf = 0;
  let t = 0;

  function frame() {
    t += 0.012;
    const drift = Math.sin(t * 0.55) * 5;
    const drift2 = Math.cos(t * 0.38) * 3;
    const pulse = 1 + Math.sin(t * 1.4) * 0.012;

    if (layer.glow) layer.glow.style.transform = `scale(${pulse})`;
    if (layer.core) layer.core.style.transform = `translate3d(${drift2}px,${Math.sin(t * .7) * 2}px,0)`;
    if (layer.platform) layer.platform.style.transform = `translate3d(${drift2 * .45}px,0,0)`;
    if (layer.lights) layer.lights.style.transform = `translate3d(${drift * .35}px,${Math.cos(t * .5) * 2}px,0)`;
    if (layer.vehicleGlow) layer.vehicleGlow.style.transform = `translate3d(${drift * 1.1}px,${Math.cos(t * .8) * 4}px,0)`;
    if (layer.vehicles) layer.vehicles.style.transform = `translate3d(${drift * 1.4}px,${Math.cos(t * .8) * 4}px,0)`;
    if (layer.reflections) layer.reflections.style.transform = `translate3d(${drift * .25}px,0,0)`;
    if (layer.particles) layer.particles.style.transform = `translate3d(${drift * .8}px,${Math.sin(t * .9) * 5}px,0)`;

    raf = requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !raf) raf = requestAnimationFrame(frame);
    if (!entry.isIntersecting && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }, { threshold: 0.05 });

  observer.observe(root);
})();
