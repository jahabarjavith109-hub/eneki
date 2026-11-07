/* ==========================================================================
   app.js — header, mobile nav, reveals, tracking + quote form delivery
   ========================================================================== */
(function () {
  const D = window.ENKEI;
  const C = D.company;

  /* ---------- header solid state + mobile nav ---------------------------- */
  const header = document.getElementById("header");
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  const onScroll = () => header.classList.toggle("is-solid", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", e => {
    if (e.target.closest("a")) {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- reveal on scroll ------------------------------------------ */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.16 });
  const observeReveals = () => document.querySelectorAll(".reveal:not(.is-in)").forEach(el => io.observe(el));

  /* ---------- stats strip ---------------------------------------------- */
  document.getElementById("statsGrid").innerHTML = (D.stats || []).map(s => `
    <div class="stat reveal">
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join("");

  /* ---------- services grid --------------------------------------------- */
  const grid = document.getElementById("servicesGrid");
  grid.innerHTML = D.services.map((s, i) => `
    <article class="service reveal">
      <div class="service-img" style="background-image:url('assets/img/${s.plate}-s.webp')"></div>
      <span class="service-no">${String(i + 1).padStart(2, "0")}</span>
      <h3 class="service-title">${s.title}</h3>
      <p class="service-body">${s.body}</p>
      <div class="tags">${s.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
    </article>`).join("");

  /* ---------- network ---------------------------------------------------- */
  document.getElementById("networkTitle").textContent = D.network.title;
  document.getElementById("networkBody").textContent = D.network.body;
  document.getElementById("regionList").innerHTML = D.network.regions.map(r => `
    <div class="region-row">
      <span class="region-group">${r.group}</span>
      <div class="region-places">${r.places.map(p => `<span>${p}</span>`).join("")}</div>
    </div>`).join("");

  /* ---------- other businesses ------------------------------------------ */
  const OB = D.otherBusinesses;
  document.getElementById("otherBizTitle").textContent = OB.title;
  document.getElementById("otherBizSubtitle").textContent = OB.subtitle;
  document.getElementById("otherBizBody").textContent = OB.body;
  document.getElementById("otherBizGrid").innerHTML = OB.items.map(b => `
    <a class="other-biz-card reveal" href="${b.url}" target="_blank" rel="noopener">
      <div class="other-biz-tag">${b.tag}</div>
      <h3 class="other-biz-name">${b.name}</h3>
      <p class="other-biz-body">${b.body}</p>
    </a>`).join("");

  /* ---------- security helpers ------------------------------------------ */
  const sanitize = (v) => String(v == null ? "" : v)
    .replace(/[<>\"'`]/g, "")
    .replace(/javascript:/gi, "")
    .trim()
    .slice(0, 500);
  const validEmail = (v) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(v);
  const validPhone = (v) => v === "" || /^[+\\d\\s()\\-]{6,24}$/.test(v);
  const cooldown = (btn, ms) => {
    if (btn.dataset.busy === "1") return false;
    btn.dataset.busy = "1";
    btn.disabled = true;
    const orig = btn.textContent;
    let left = Math.ceil(ms / 1000);
    btn.textContent = `Please wait ${left}s…`;
    const iv = setInterval(() => {
      left -= 1;
      if (left <= 0) { clearInterval(iv); btn.disabled = false; btn.dataset.busy = "0"; btn.textContent = orig; }
      else { btn.textContent = `Please wait ${left}s…`; }
    }, 1000);
    return true;
  };

  /* ---------- tracking form --------------------------------------------- */
  const T = D.tracking;
  document.getElementById("trackTitle").textContent = T.title;
  document.getElementById("trackBody").textContent = T.body;
  document.getElementById("trackRefLabel").textContent = T.refLabel;
  document.getElementById("trackRef").placeholder = T.refPlaceholder;
  document.getElementById("trackContactLabel").textContent = T.contactLabel;
  document.getElementById("trackContact").placeholder = T.contactPlaceholder;
  document.getElementById("trackNote").textContent = T.note;
  document.querySelector("#trackForm button").firstChild.textContent = T.button + " ";

  const trackStatus = document.getElementById("trackStatus");
  const trackBtn = document.querySelector("#trackForm button");
  document.getElementById("trackForm").addEventListener("submit", e => {
    e.preventDefault();
    if (!cooldown(trackBtn, 4000)) return;
    const ref = sanitize(document.getElementById("trackRef").value);
    const who = sanitize(document.getElementById("trackContact").value);
    if (!ref || !who) {
      trackStatus.textContent = "Please fill in both the reference and where to reply.";
      trackStatus.classList.add("is-on");
      return;
    }
    const msg = `Shipment location request — Ref: ${ref} — reply to: ${who}`;
    const wa = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
    const mail = `mailto:${C.email}?subject=${encodeURIComponent("Tracking: " + ref)}&body=${encodeURIComponent(msg)}`;
    trackStatus.innerHTML = `Opening WhatsApp… if nothing happens, <a href="${mail}" style="color:var(--orange-hi)">send it by email instead</a>.`;
    trackStatus.classList.add("is-on");
    open(wa, "_blank", "noopener");
  });

  /* ---------- quote form ------------------------------------------------- */
  document.getElementById("quoteTitle").textContent = D.quote.title;
  document.getElementById("quoteBody").textContent = D.quote.body;
  document.getElementById("sendWhatsApp").firstChild.textContent = D.quote.sendWhatsApp + " ";
  document.getElementById("sendEmail").textContent = D.quote.sendEmail;

  const fieldsEl = document.getElementById("quoteFields");
  fieldsEl.innerHTML = D.quote.fields.map(f => {
    const id = `q-${f.name}`;
    const req = f.required ? " required" : "";
    let control;
    if (f.type === "textarea") {
      control = `<textarea id="${id}" name="${f.name}" placeholder="${f.placeholder || ""}"${req}></textarea>`;
    } else if (f.type === "select") {
      control = `<select id="${id}" name="${f.name}"${req}>${f.options.map(o => `<option>${o}</option>`).join("")}</select>`;
    } else {
      control = `<input id="${id}" name="${f.name}" type="${f.type}" placeholder="${f.placeholder || ""}"${req}>`;
    }
    // pair up text fields two-per-row for tidiness
    return `<div class="field"><label for="${id}">${f.label}${f.required ? " *" : ""}</label>${control}</div>`;
  }).join("");

  // pair consecutive short fields two-per-row
  (() => {
    const fields = [...fieldsEl.querySelectorAll(".field")];
    let i = 0;
    while (i < fields.length) {
      const a = fields[i];
      const aShort = !a.querySelector("textarea");
      const b = fields[i + 1];
      const bShort = b && !b.querySelector("textarea");
      if (aShort && bShort) {
        const wrap = document.createElement("div");
        wrap.className = "form-row";
        a.after(wrap);
        wrap.append(a, b);
        i += 2;
      } else { i += 1; }
    }
  })();

  const quoteStatus = document.getElementById("quoteStatus");
  const collect = () => {
    const raw = Object.fromEntries(new FormData(document.getElementById("quoteForm")).entries());
    const out = {};
    Object.keys(raw).forEach(k => { out[k] = sanitize(raw[k]); });
    return out;
  };
  const validate = () => {
    const form = document.getElementById("quoteForm");
    const missing = [...form.querySelectorAll("[required]")].filter(el => !el.value.trim());
    if (missing.length) {
      missing[0].focus();
      quoteStatus.textContent = "Please add your name and email so we can reply.";
      quoteStatus.classList.add("is-on");
      return null;
    }
    const email = sanitize(form.querySelector('[name="email"]').value);
    if (!validEmail(email)) {
      form.querySelector('[name="email"]').focus();
      quoteStatus.textContent = "Please enter a valid email address.";
      quoteStatus.classList.add("is-on");
      return null;
    }
    const phone = sanitize(form.querySelector('[name="phone"]').value);
    if (!validPhone(phone)) {
      form.querySelector('[name="phone"]').focus();
      quoteStatus.textContent = "Please enter a valid phone number.";
      quoteStatus.classList.add("is-on");
      return null;
    }
    return collect();
  };
  const body = v => Object.entries(v)
    .filter(([, val]) => String(val).trim())
    .map(([k, val]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${val}`)
    .join("\n");

  const waBtn = document.getElementById("sendWhatsApp");
  const emBtn = document.getElementById("sendEmail");
  waBtn.addEventListener("click", () => {
    if (!cooldown(waBtn, 4000)) return;
    const v = validate(); if (!v) return;
    const text = `Quote request — ${v.company || v.name}\n\n${body(v)}`;
    open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    quoteStatus.textContent = "Opening WhatsApp with your details… we'll take it from there.";
    quoteStatus.classList.add("is-on");
  });

  emBtn.addEventListener("click", () => {
    if (!cooldown(emBtn, 4000)) return;
    const v = validate(); if (!v) return;
    const subj = `Quote request — ${v.company || v.name}`;
    location.href = `mailto:${C.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body(v))}`;
    quoteStatus.textContent = `Opening your email app addressed to ${C.email}…`;
    quoteStatus.classList.add("is-on");
  });

  /* ---------- footer ----------------------------------------------------- */
  document.getElementById("footerBlurb").textContent = D.footer.blurb;
  document.getElementById("footerLegal").innerHTML =
    `${C.legal}<br />Co. Registration no. ${C.reg}<br />${C.address[0]}<br />${C.address[1]}`;
  document.getElementById("footerLinksTitle").textContent = D.footer.linksTitle;
  document.getElementById("footerContactTitle").textContent = D.footer.contactTitle;
  document.getElementById("year").textContent = new Date().getFullYear();

  observeReveals();
})();
