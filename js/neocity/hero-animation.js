
/* NeoCity V4.2 — 01 Hero City Core / clean responsive motion */
(() => {
  const init = (root) => {
    if (!root || root.dataset.ncHeroReady === "clean-production") return;
    root.dataset.ncHeroReady = "clean-production";

    const $ = (sel) => root.querySelector(sel);
    const layers = {
      bg: $(".nc-hero__background"),
      lights: $(".nc-hero__lights"),
      platform: $(".nc-hero__platform"),
      glow: $(".nc-hero__core-glow"),
      core: $(".nc-hero__core"),
      vg: $(".nc-hero__vehicles-glow"),
      vehicles: $(".nc-hero__vehicles"),
      reflections: $(".nc-hero__reflections"),
      particles: $(".nc-hero__particles")
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    const profile = () => {
      const w = root.clientWidth;
      if (w < 380) return { p: 4, drift: 1.2, pulse: .010 };
      if (w < 768) return { p: 7, drift: 1.8, pulse: .014 };
      if (w < 1200) return { p: 11, drift: 2.6, pulse: .018 };
      return { p: 15, drift: 3.6, pulse: .022 };
    };

    const render = (ms) => {
      const t = ms / 1000;
      const cfg = profile();

      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;

      if (layers.bg) {
        layers.bg.style.transform =
          `translate3d(${cx*.22}px,${cy*.18}px,0) scale(1.018)`;
      }

      if (layers.lights) {
        layers.lights.style.transform =
          `translate3d(${cx*.50}px,${cy*.34}px,0)`;
        layers.lights.style.opacity =
          String(.60 + Math.sin(t*.75)*.045);
      }

      if (layers.platform) {
        layers.platform.style.transform =
          `translate3d(${cx*.68}px,${cy*.28}px,0)`;
      }

      const pulse = 1 + Math.sin(t*1.65) * cfg.pulse;

      if (layers.core) {
        layers.core.style.transform =
          `translate3d(${cx*.90}px,${cy*.56}px,0) scale(${pulse})`;
      }

      if (layers.glow) {
        layers.glow.style.transform =
          `translate3d(${cx*.92}px,${cy*.58}px,0) scale(${1.018 + Math.sin(t*1.65)*.020})`;
        layers.glow.style.opacity =
          String(.74 + (Math.sin(t*1.65)+1)*.07);
      }

      const drift = Math.sin(t*.38) * cfg.drift;

      if (layers.vg) {
        layers.vg.style.transform =
          `translate3d(${cx*1.10+drift}px,${cy*.42}px,0)`;
      }

      if (layers.vehicles) {
        layers.vehicles.style.transform =
          `translate3d(${cx*1.10+drift}px,${cy*.42}px,0)`;
      }

      if (layers.reflections) {
        layers.reflections.style.transform =
          `translate3d(${Math.sin(t*.65)*3}px,0,0)`;
        layers.reflections.style.opacity =
          String(.50 + Math.sin(t*.55)*.06);
      }

      if (layers.particles) {
        layers.particles.style.transform =
          `translate3d(${Math.sin(t*.18)*5+cx*1.18}px,${Math.cos(t*.24)*4+cy*.82}px,0)`;
      }

      raf = requestAnimationFrame(render);
    };

    root.addEventListener("pointermove", (event) => {
      const r = root.getBoundingClientRect();
      tx = ((event.clientX-r.left)/r.width - .5) * cfgValue(profile().p);
      ty = ((event.clientY-r.top)/r.height - .5) * cfgValue(profile().p*.7);
    }, { passive: true });

    root.addEventListener("pointerleave", () => {
      tx = 0; ty = 0;
    }, { passive: true });

    const cfgValue = (n) => Number.isFinite(n) ? n : 0;
    raf = requestAnimationFrame(render);
    window.addEventListener("pagehide", () => cancelAnimationFrame(raf), { once: true });
  };

  document.querySelectorAll(".nc-hero").forEach(init);
})();
