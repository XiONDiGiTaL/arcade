/* =========================================================
   XiØN Arcade — interaction layer
   - synthesised interface sounds (no audio files)
   - genre filters for the game wall
   - pointer spotlight + scroll reveal
   - system clock
   ========================================================= */

(function () {
  "use strict";

  /* -------------------------------------------------------
     Interface sound
     ------------------------------------------------------- */

  const SFX_KEY = "arcade:sfx";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const AudioCtx = window.AudioContext || window.webkitAudioContext;

  const sfx = {
    enabled: localStorage.getItem(SFX_KEY) !== "off",
    ctx: null,
    last: 0,

    init() {
      if (!AudioCtx || this.ctx) return;
      this.ctx = new AudioCtx();
    },

    // a soft "bubble" — sine with a small upward glide and a fast decay
    tone({ from, to, dur = 0.12, type = "sine", peak = 0.05, delay = 0 }) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const ctx = this.ctx;
      if (ctx.state === "suspended") ctx.resume();

      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(from, t0);
      osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },

    hover() {
      const now = performance.now();
      if (now - this.last < 55) return; // keep it from chattering
      this.last = now;
      this.tone({ from: 620, to: 880, dur: 0.1, peak: 0.045 });
    },

    select() {
      this.tone({ from: 340, to: 520, dur: 0.11, type: "triangle", peak: 0.06 });
    },

    nudge() {
      this.tone({ from: 300, to: 190, dur: 0.16, type: "triangle", peak: 0.07 });
    },

    launch() {
      this.tone({ from: 420, to: 660, dur: 0.1, peak: 0.05 });
      this.tone({ from: 660, to: 990, dur: 0.14, peak: 0.045, delay: 0.07 });
    },
  };

  const sfxToggle = document.getElementById("sfxToggle");

  function paintSfx() {
    if (!sfxToggle) return;
    sfxToggle.setAttribute("aria-pressed", String(sfx.enabled));
    sfxToggle.title = sfx.enabled ? "Interface sound: on" : "Interface sound: off";
  }

  if (sfxToggle) {
    paintSfx();
    sfxToggle.addEventListener("click", function () {
      sfx.enabled = !sfx.enabled;
      localStorage.setItem(SFX_KEY, sfx.enabled ? "on" : "off");
      paintSfx();
      if (sfx.enabled) sfx.select();
    });
  }

  // Browsers only allow audio after a gesture — unlock quietly on the first one.
  ["pointerdown", "keydown"].forEach(function (evt) {
    window.addEventListener(
      evt,
      function () {
        sfx.init();
        if (sfx.ctx && sfx.ctx.state === "suspended") sfx.ctx.resume();
      },
      { once: true, passive: true }
    );
  });

  /* -------------------------------------------------------
     Hover / click sounds
     ------------------------------------------------------- */

  const hoverables = document.querySelectorAll(
    ".game, .filter, .btn, .topbar__link, .about__link, .footer__link, .sfx, .brand"
  );

  hoverables.forEach(function (el) {
    el.addEventListener("pointerenter", function () {
      sfx.hover();
    });
  });

  document.querySelectorAll(".game").forEach(function (card) {
    card.addEventListener("click", function () {
      sfx.launch();
    });
  });

  /* -------------------------------------------------------
     Pointer spotlight on cards
     ------------------------------------------------------- */

  document.querySelectorAll(".game").forEach(function (card) {
    card.addEventListener("pointermove", function (event) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", event.clientX - rect.left + "px");
      card.style.setProperty("--my", event.clientY - rect.top + "px");
    });
  });

  /* -------------------------------------------------------
     Genre filters
     ------------------------------------------------------- */

  const filters = Array.from(document.querySelectorAll(".filter"));
  const cards = Array.from(document.querySelectorAll(".game"));
  const empty = document.getElementById("wallEmpty");

  function applyFilter(value) {
    let visible = 0;

    filters.forEach(function (button) {
      const active = button.dataset.filter === value;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    cards.forEach(function (card) {
      const tags = (card.dataset.tags || "").split(/\s+/);
      const show = value === "all" || tags.indexOf(value) !== -1;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (empty) empty.hidden = visible > 0;
  }

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      applyFilter(button.dataset.filter);
      sfx.select();
    });
  });

  /* -------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------- */

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    cards.forEach(function (card, index) {
      card.classList.add("reveal");
      card.style.setProperty("--d", (index % 3) * 70 + "ms");
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    cards.forEach(function (card) {
      observer.observe(card);
    });
  }

  /* -------------------------------------------------------
     Clock
     ------------------------------------------------------- */

  const clockEl = document.getElementById("clock");
  const dateEl = document.getElementById("date");
  const yearEl = document.getElementById("year");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const now = new Date();

    if (clockEl) {
      clockEl.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    }
    if (dateEl) {
      dateEl.textContent =
        days[now.getDay()] + " · " + pad(now.getDate()) + " " + months[now.getMonth()] + " " + now.getFullYear();
    }
    if (yearEl) yearEl.textContent = String(now.getFullYear());
  }

  tick();
  setInterval(tick, 1000);
})();
