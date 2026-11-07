/* ==========================================================================
   chat.js — in-corner company assistant
   Client-side agent with a knowledge base built from ENKEI data.
   Answers questions about Enkei Services and routes to quote/tracking.
   ========================================================================== */
(function () {
  const D = window.ENKEI;
  const C = D.company;

  /* ---------------- knowledge base (intent → answer) --------------------- */
  const TOPICS = [
    { keys: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
      a: () => `Hello! I'm the Enkei assistant. Ask me about our services, coverage, storage hubs, tracking or a quote.` },
    { keys: ["service", "what do you do", "what you do", "offer", "provide"],
      a: () => `We offer six services:\n${D.services.map((s, i) => `${i + 1}. ${s.title} — ${s.body}`).join("\n")}\n\nWhich one would you like to know more about?` },
    { keys: ["air freight", "air cargo", "by air", "flight"],
      a: () => `Air Freight: ${D.services[0].body} (${D.services[0].tags.join(", ")}). Want a quote?` },
    { keys: ["sea freight", "sea cargo", "ocean", "shipping by sea", "container"],
      a: () => `Sea Freight: ${D.services[1].body} (${D.services[1].tags.join(", ")}). Want a quote?` },
    { keys: ["storage", "warehouse", "hub", "hubs"],
      a: () => `Storage Hubs: ${D.services[2].body} (${D.services[2].tags.join(", ")}).` },
    { keys: ["supply chain", "singapore supply"],
      a: () => `Singapore Supply Chain: ${D.services[3].body}` },
    { keys: ["3pl", "third party", "third-party"],
      a: () => `3PL: ${D.services[4].body} (${D.services[4].tags.join(", ")}).` },
    { keys: ["local handling", "local delivery", "last mile", "customs", "trucking"],
      a: () => `Local Handling & Delivery: ${D.services[5].body} (${D.services[5].tags.join(", ")}).` },
    { keys: ["coverage", "where", "countries", "regions", "markets", "network"],
      a: () => `${D.network.title} ${D.network.body}\n\n${D.network.regions.map(r => `${r.group}: ${r.places.join(", ")}`).join("\n")}` },
    { keys: ["singapore", "malaysia", "indonesia", "india", "japan", "thailand", "hong kong", "myanmar", "philippines"],
      a: m => `Yes — we cover ${m} as part of our ${D.network.regions.find(r => r.places.some(p => p.toLowerCase().includes(m)))?.group || "network"}. Full list: ${D.network.regions.flatMap(r => r.places).join(", ")}.` },
    { keys: ["europe", "middle east", "africa"],
      a: m => `Yes — ${m.charAt(0).toUpperCase() + m.slice(1)} is part of our coverage. Full list: ${D.network.regions.flatMap(r => r.places).join(", ")}.` },
    { keys: ["track", "tracking", "where is my shipment", "status", "reference"],
      a: () => `${D.tracking.title} ${D.tracking.body} ${D.tracking.note}\n\nUse the tracking form on this page, or message us on WhatsApp with your reference.` },
    { keys: ["quote", "price", "rate", "cost", "how much"],
      a: () => `${D.quote.title} — ${D.quote.body} Rates usually same working day.\n\nUse the quote form on this page, or WhatsApp us directly.` },
    { keys: ["contact", "phone", "whatsapp", "email", "address", "office", "call"],
      a: () => ({ text: `Contact Enkei Services:\n📞 ${C.phone}\n💬 WhatsApp: https://wa.me/${C.whatsapp}\n✉️ ${C.email}\n📍 ${C.address.join(", ")}\nCo. Reg. ${C.reg}`, link: { label: "Open WhatsApp chat", href: `https://wa.me/${C.whatsapp}` } }) },
    { keys: ["other business", "other businesses", "sister", "group", "hmn", "aaa", "global brands", "global foods", "perfume", "toiletries", "foodstuff", "food stuffs"],
      a: () => ({ text: `Enkei is part of a wider group:\n\n1. HMN Global Brands Pte Ltd (hmn.sg) — Reliable brand partner since 1999. Singapore FMCG distributor dealing in perfumes & toiletries.\n2. AAA Global Foods Pte Ltd (aaagf.sg) — Brand-name foodstuffs distributor.\n\nVisit their sites for more.`, links: [{ label: "HMN Global Brands", href: "https://hmn.sg" }, { label: "AAA Global Foods", href: "https://aaagf.sg" }] }) },
    { keys: ["company", "about", "who are you", "who is enkei", "enkei"],
      a: () => `${C.legal} — ${D.footer.blurb} ${D.network.body}\nRegistration no. ${C.reg}, ${C.address.join(", ")}.` },
    { keys: ["hub", "dubai", "netherlands"],
      a: () => `Our storage hubs are in Singapore, Dubai and the Netherlands — bonded and general warehousing.` }
  ];

  const FALLBACK = () => ({ text: `I'm not sure about that, but I can help with: services, coverage, storage hubs, tracking, quotes and contact details.\n\nOr reach us directly: ${C.phone} · ${C.email}` , link: { label: "Open WhatsApp chat", href: `https://wa.me/${C.whatsapp}` } });

  function respond(text) {
    const q = text.toLowerCase().trim();
    let best = null, bestScore = 0;
    for (const t of TOPICS) {
      for (const k of t.keys) {
        if (q.includes(k)) {
          const score = k.length;
          if (score > bestScore) { bestScore = score; best = t; }
        }
      }
    }
    let res;
    if (best && best.keys.some(k => ["singapore","malaysia","indonesia","india","japan","thailand","hong kong","myanmar","philippines","europe","middle east","africa"].includes(k) && q.includes(k))) {
      const m = best.keys.find(k => q.includes(k));
      res = best.a(m);
    } else if (best) {
      res = best.a();
    } else {
      res = FALLBACK();
    }
    if (typeof res === "string") res = { text: res };
    return res;
  }

  /* ---------------- UI --------------------------------------------------- */
  const root = document.createElement("div");
  root.id = "chatRoot";
  root.innerHTML = `
    <button id="chatFab" aria-label="Chat with Enkei assistant" aria-expanded="false">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span class="chat-fab-label">Chat</span>
    </button>
    <div id="chatPanel" role="dialog" aria-label="Enkei assistant" hidden>
      <div class="chat-head">
        <div class="chat-head-info">
          <span class="chat-dot"></span>
          <div>
            <div class="chat-title">Enkei assistant</div>
            <div class="chat-sub">Replies instantly · humans on WhatsApp</div>
          </div>
        </div>
        <button id="chatClose" aria-label="Close chat">✕</button>
      </div>
      <div class="chat-body" id="chatBody"></div>
      <div class="chat-quick" id="chatQuick"></div>
      <form class="chat-input" id="chatForm">
        <input id="chatField" type="text" placeholder="Ask about services, coverage, tracking…" autocomplete="off" />
        <button type="submit" aria-label="Send">→</button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const fab = document.getElementById("chatFab");
  const panel = document.getElementById("chatPanel");
  const body = document.getElementById("chatBody");
  const quick = document.getElementById("chatQuick");
  const form = document.getElementById("chatForm");
  const field = document.getElementById("chatField");
  const closeBtn = document.getElementById("chatClose");

  const QUICK = ["Services", "Coverage", "Storage hubs", "Tracking", "Get a quote", "Contact"];

  function addMsg(text, who, links) {
    const m = document.createElement("div");
    m.className = "chat-msg " + (who === "user" ? "chat-msg-user" : "chat-msg-bot");
    m.textContent = text;
    body.appendChild(m);
    if (links && links.length) {
      const wrap = document.createElement("div");
      wrap.className = "chat-links";
      links.forEach(l => {
        const a = document.createElement("a");
        a.className = "chat-link";
        a.href = l.href;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = l.label;
        wrap.appendChild(a);
      });
      body.appendChild(wrap);
    }
    body.scrollTop = body.scrollHeight;
    return m;
  }

  function typeThen(res) {
    if (typeof res === "string") res = { text: res };
    const m = document.createElement("div");
    m.className = "chat-msg chat-msg-bot chat-typing";
    m.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    const delay = Math.min(900, 250 + res.text.length * 6);
    setTimeout(() => {
      m.remove();
      addMsg(res.text, "bot", res.links || (res.link ? [res.link] : null));
    }, delay);
  }

  function openPanel() {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    root.classList.add("chat-open");
    if (!body.children.length) {
      typeThen(`Hi! I'm the Enkei assistant. I can help with:\n• Our six services (air, sea, storage, supply chain, 3PL, local handling)\n• Coverage across 12 markets\n• Tracking a shipment\n• Getting a quote\n• Contact details\n\nWhat would you like to know?`);
    }
    field.focus();
  }
  function closePanel() {
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
    root.classList.remove("chat-open");
  }

  fab.addEventListener("click", () => panel.hidden ? openPanel() : closePanel());
  closeBtn.addEventListener("click", closePanel);

  form.addEventListener("submit", e => {
    e.preventDefault();
    const v = field.value.trim();
    if (!v) return;
    addMsg(v, "user");
    field.value = "";
    typeThen(respond(v));
  });

  quick.innerHTML = QUICK.map(q => `<button type="button" class="chat-chip">${q}</button>`).join("");
  quick.addEventListener("click", e => {
    const b = e.target.closest(".chat-chip");
    if (!b) return;
    field.value = b.textContent;
    form.requestSubmit();
  });

  // show the FAB only after the film (avoid clashing with the counter)
  const film = document.querySelector(".film");
  const updateFab = () => {
    const rect = film.getBoundingClientRect();
    const pastFilm = rect.bottom < window.innerHeight * 0.6;
    root.classList.toggle("chat-hidden", !pastFilm && window.scrollY < 80);
  };
  addEventListener("scroll", updateFab, { passive: true });
  updateFab();
})();
