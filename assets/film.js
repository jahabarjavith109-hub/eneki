/* ==========================================================================
   film.js — scroll → beat state machine
   Drives: plate crossfades, giant word, captions, rail, counter, callouts.
   Emits window.__beat = { index, progress } for scene.js (the 3D container).
   ========================================================================== */
(function () {
  const D = window.ENKEI;
  const film = document.querySelector(".film");
  const platesEl = document.getElementById("plates");
  const giant = document.getElementById("giant");
  const heroCopy = document.getElementById("heroCopy");
  const beatCopy = document.getElementById("beatCopy");
  const beatKicker = document.getElementById("beatKicker");
  const beatTitle = document.getElementById("beatTitle");
  const beatLine = document.getElementById("beatLine");
  const callouts = document.getElementById("callouts");
  const railStage = document.getElementById("railStage");
  const railTrack = document.getElementById("railTrack");
  const filmHint = document.getElementById("filmHint");
  const counterNow = document.getElementById("counterNow");
  const counterStage = document.getElementById("counterStage");

  const N = D.beats.length;                 // 7
  const plates = [...platesEl.children];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // hero copy from data
  document.getElementById("heroEyebrow").textContent = D.hero.eyebrow;
  const h1 = document.getElementById("heroTitle");
  h1.innerHTML = D.hero.title.map(l => `<span style="display:block">${l}</span>`).join("");
  document.getElementById("heroBody").textContent = D.hero.body;
  document.getElementById("heroPrimary").firstChild.textContent = D.hero.primary.label + " ";
  document.getElementById("heroSecondary").textContent = D.hero.secondary.label;
  document.getElementById("heroPrimary").setAttribute("href", D.hero.primary.href);
  document.getElementById("heroSecondary").setAttribute("href", D.hero.secondary.href);
  filmHint.textContent = D.hero.hint;

  // rail dots
  D.beats.forEach(() => {
    const d = document.createElement("span");
    d.className = "rail-dot";
    railTrack.appendChild(d);
  });
  const dots = [...railTrack.children];

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = t => t * t * (3 - 2 * t);
  const pad = n => String(n + 1).padStart(2, "0");

  let activeBeat = -1;
  let ticking = false;

  function render() {
    ticking = false;
    const rect = film.getBoundingClientRect();
    const total = film.offsetHeight - innerHeight;
    const p = clamp(-rect.top / total, 0, 1);        // 0..1 through the film
    const raw = p * (N - 1);                          // 0..6 continuous beat index
    const idx = Math.round(raw);                      // nearest beat
    const local = raw - Math.floor(raw);              // progress inside segment

    // ---- plates crossfade ------------------------------------------------
    plates.forEach((el, i) => {
      const d = Math.abs(raw - i);
      el.style.opacity = clamp(1 - d, 0, 1).toFixed(3);
    });

    // ---- hero copy: visible on beat 0, fades out across 0 → 1 -----------
    const heroOut = smooth(clamp(raw / 0.72, 0, 1));
    heroCopy.style.opacity = (1 - heroOut).toFixed(3);
    heroCopy.style.transform = `translateY(${-26 * heroOut}px)`;
    heroCopy.style.visibility = heroOut >= 1 ? "hidden" : "visible";
    filmHint.style.opacity = (1 - heroOut).toFixed(3);

    // ---- beat copy: in after beat 0, out at the very end -----------------
    const beatIn = smooth(clamp((raw - 0.55) / 0.5, 0, 1));
    const beatOut = smooth(clamp((raw - (N - 1) - 0.55) / 0.45, 0, 1));
    const beatVis = beatIn * (1 - clamp(beatOut, 0, 1));
    beatCopy.style.opacity = beatVis.toFixed(3);
    beatCopy.style.transform = `translateY(${24 * (1 - beatIn)}px)`;
    beatCopy.style.visibility = beatVis <= 0.01 ? "hidden" : "visible";

    // ---- MEASURED callouts (beat 1) --------------------------------------
    const c1 = clamp(1 - Math.abs(raw - 1) / 0.5, 0, 1);
    callouts.style.opacity = smooth(c1).toFixed(3);

    // ---- giant word + captions swap at the halfway point -----------------
    const wordIdx = clamp(Math.floor(raw + 0.5), 0, N - 1);
    if (wordIdx !== activeBeat) {
      activeBeat = wordIdx;
      const b = D.beats[wordIdx];
      giant.textContent = b.word;
      beatKicker.textContent = `${pad(wordIdx)} — ${b.stage}`;
      beatTitle.textContent = b.title;
      beatLine.textContent = b.line;
      railStage.textContent = b.stage;
      counterNow.textContent = pad(wordIdx);
      counterStage.textContent = b.stage;
      dots.forEach((d, i) => {
        d.classList.toggle("is-on", i === wordIdx);
        d.classList.toggle("is-past", i < wordIdx);
      });
      window.__beat = { index: wordIdx };
    }

    // giant word opacity: strong on beat 0 (behind hero), then per-beat
    const gw = wordIdx === 0
      ? 1 - smooth(clamp((raw - 0.1) / 0.6, 0, 1)) * 0.55
      : clamp(1 - Math.abs(raw - wordIdx) * 1.6, 0, 1);
    giant.style.opacity = (wordIdx === 0 ? 0.9 - heroOut * 0.35 : gw * 0.9).toFixed(3);

    // progress for the 3D scene
    window.__filmProgress = p;
    window.__beatFloat = raw;
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  // reveal-on-scroll + solid header live in app.js; kick the first frame here
  render();
  if (reduced) document.getElementById("scene")?.remove();
})();
