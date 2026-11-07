/* ============================================================================
   ENKEI SERVICES PTE LTD — all site copy lives here.
   Edit this file to change text, services, regions, beats and contacts.
   ========================================================================== */

window.ENKEI = {
  company: {
    name: "Enkei Services",
    legal: "Enkei Services Pte Ltd",
    reg: "201509336R",
    address: ["10 Ubi Crescent, #06-51 Lobby C", "Singapore 408564"],
    phone: "+65 8158 6235",
    phoneHref: "+6581586235",
    whatsapp: "6581586235",
    email: "info@enkeiservices.com",
    hub: "Storage hubs — Singapore · Dubai · Netherlands"
  },

  nav: [
    { label: "Services", href: "#services" },
    { label: "Tracking", href: "#tracking" },
    { label: "Quote", href: "#quote" }
  ],

  hero: {
    eyebrow: "— SEA, AIR, ROAD AND WAREHOUSING",
    title: ["Precision,", "delivered."],
    body: "Air and sea freight, storage hubs and last-mile handling across Asia, the Middle East, Europe and Africa — one team, every box exactly where it should be.",
    primary: { label: "Get a quote", href: "#quote" },
    secondary: { label: "Track a shipment", href: "#tracking" },
    hint: "SCROLL TO FOLLOW THE CARGO"
  },

  /* The seven beats of the scroll film.
     stage = right-hand rail label · word = giant outlined display word
     plate = background photograph in assets/img/                                  */
  beats: [
    { stage: "LIFTED",   word: "PRECISION",  plate: "port-dusk",
      title: "Straight off the quay",
      line: "Collected from port or airport by the people who booked it — no hand-offs, no waiting agent." },
    { stage: "MEASURED", word: "CONTROL",    plate: "control-room",
      title: "Checked before it moves",
      line: "Dimensions, weight and documents verified before a single kilometre is covered." },
    { stage: "OPENED",   word: "OPENNESS",   plate: "cargo-inside",
      title: "Opened and accounted for",
      line: "Cargo inspected, counted and re-sealed inside our hubs, with the record sent straight back to you." },
    { stage: "ON BOARD", word: "CAPACITY",   plate: "ship-aerial",
      title: "Set into its slot",
      line: "FCL, LCL and consolidation loaded for the crossing on the lanes we run every week." },
    { stage: "IN THE AIR", word: "SPEED",    plate: "air-cargo",
      title: "Flown when it can't wait",
      line: "Priority and economy air cargo on the Asia–Middle East–Europe corridors." },
    { stage: "ON THE ROAD", word: "REACH",   plate: "road-dusk",
      title: "Onto the last mile",
      line: "Customs cleared, trucked and handed over across Singapore, Malaysia, Indonesia and beyond." },
    { stage: "DELIVERED", word: "SIGNED",    plate: "truck-dock",
      title: "Delivered, signed, done",
      line: "Proof of delivery back in your inbox the same day it lands." }
  ],

  stats: [
    { value: "10+", label: "Years in freight" },
    { value: "12", label: "Markets served" },
    { value: "3", label: "Storage hubs" },
    { value: "24h", label: "Quote turnaround" }
  ],

  services: [
    { title: "Air Freight", plate: "air-cargo",
      body: "Priority and economy air cargo, charters and consolidated shipments on the corridors we run weekly.",
      tags: ["Door-to-door", "Airport-to-airport", "Perishables"] },
    { title: "Sea Freight", plate: "ship-dock",
      body: "FCL, LCL and consolidation out of Singapore with direct lines to Asia, the Middle East, Europe and Africa.",
      tags: ["FCL", "LCL", "Breakbulk"] },
    { title: "Storage Hubs", plate: "warehouse-2",
      body: "Bonded and general warehousing in Singapore, Dubai and the Netherlands — your stock, our roof, your rules.",
      tags: ["Singapore", "Dubai", "Netherlands"] },
    { title: "Singapore Supply Chain", plate: "warehouse",
      body: "In-country management of orders, consolidation and distribution, run from our Ubi Crescent office.",
      tags: ["Order handling", "Consolidation", "Distribution"] },
    { title: "3PL", plate: "warehouse-3",
      body: "Third-party logistics that plugs into your team — inventory, pick-and-pack, kitting and returns.",
      tags: ["Pick & pack", "Kitting", "Returns"] },
    { title: "Local Handling & Delivery", plate: "road-trails",
      body: "Port and airport collections, customs clearance, trucking and final delivery under one booking.",
      tags: ["Customs", "Trucking", "Last mile"] }
  ],

  network: {
    title: "One booking, twelve markets.",
    body: "Enkei moves freight across Asia-Pacific, Europe, the Middle East and Africa from hubs in Singapore, Dubai and the Netherlands.",
    regions: [
      { group: "South-East Asia", places: ["Singapore", "Malaysia", "Indonesia", "Myanmar", "Philippines"] },
      { group: "North & East Asia", places: ["India", "Japan", "Thailand", "Hong Kong"] },
      { group: "West & Rest", places: ["Europe", "Middle East", "Africa"] }
    ]
  },

  tracking: {
    title: "Where is my shipment?",
    body: "Enter your booking or container reference. We locate it across our hubs and reply with the latest status.",
    refLabel: "Booking / container reference",
    refPlaceholder: "e.g. ENS-204581 or MSKU 4820193",
    contactLabel: "Email or phone",
    contactPlaceholder: "so we know where to reply",
    button: "Request location",
    note: "No live portal yet — a person on our team checks and answers, usually within the working day."
  },

  quote: {
    title: "Get a quote",
    body: "Tell us what is moving and where. We come back with a rate — usually the same working day.",
    fields: [
      { name: "name", label: "Name", type: "text", placeholder: "Your name", required: true },
      { name: "company", label: "Company", type: "text", placeholder: "Company name" },
      { name: "email", label: "Email", type: "email", placeholder: "you@company.com", required: true },
      { name: "phone", label: "Phone", type: "tel", placeholder: "+65 …" },
      { name: "service", label: "Service", type: "select",
        options: ["Air Freight", "Sea Freight", "Storage Hubs", "Singapore Supply Chain", "3PL", "Local Handling & Delivery", "Not sure yet"] },
      { name: "route", label: "Route", type: "text", placeholder: "Singapore → Dubai" },
      { name: "details", label: "Details", type: "textarea", placeholder: "Cargo, weight, dimensions, dates…" }
    ],
    sendWhatsApp: "Send on WhatsApp",
    sendEmail: "Send by email"
  },

  footer: {
    blurb: "Air & sea freight, storage hubs and supply-chain services — Singapore, Dubai and the Netherlands.",
    linksTitle: "Company",
    contactTitle: "Contact",
    rights: "All rights reserved."
  },

  otherBusinesses: {
    title: "Our other businesses",
    subtitle: "Diverse businesses. One shared vision.",
    body: "Enkei Services is part of a wider group. Our sister companies serve FMCG and food distribution across Singapore and the region.",
    items: [
      { name: "HMN Global Brands Pte Ltd", url: "https://hmn-sg.vercel.app/",
        tag: "FMCG distributor · Since 1999",
        body: "Reliable brand partner for perfumes and toiletries — Singapore FMCG distributor since 1999." },
      { name: "AAA Global Foods Pte Ltd", url: "https://aaagf.sg",
        tag: "Food distribution",
        body: "Brand-name foodstuffs distributor — quality food products across Singapore and the region." }
    ]
  }
};
