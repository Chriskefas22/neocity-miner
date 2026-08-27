(() => {
  "use strict";
  window.NeoEconomy = {
    levelRows() {
      const body = document.querySelector("#levelRows");
      if (!body) return;
      const min = Number(window.NEOCITY_CONFIG?.economy?.levels?.min ?? 0);
      const max = Number(window.NEOCITY_CONFIG?.economy?.levels?.max ?? 70);
      body.innerHTML = "";
      for (let level = min; level <= max; level++) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${level}</td><td>Server</td><td>Server</td><td>Server</td>`;
        body.appendChild(tr);
      }
    }
  };
  document.addEventListener("DOMContentLoaded", () => window.NeoEconomy.levelRows());
})();
