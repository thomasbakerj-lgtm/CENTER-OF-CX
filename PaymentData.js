// Payment Technology Matrix — sourced from Payment_Technology_Matrix.xlsx
// 51 vendors | 8 capability dimensions | H=3, M=2, L=1 | Max score 24
// Plus 5 C-suite fit indicators (CFO, CTO, CIO, COO, CX)

// H=3, M=2, L=1 conversion
const v = (scores) => scores.reduce((a, s) => a + ({ H: 3, M: 2, L: 1 }[s] || 2), 0);

export const paymentVendors = [
  // ═══ UNIFIED COMMERCE / GLOBAL PROCESSORS ═══
  { name: "Adyen", slug: "adyen-pay", score: 24, cat: "Unified Commerce", onl: 3, pos: 3, kio: 3, hh: 3, orch: 3, alt: 3, glob: 3, ent: 3, role: "Unified commerce processor", diff: "Single platform for online, in-store, kiosk, and risk; strong devices; excellent global support", bestFit: "Large retail, global brands, quick service restaurants, marketplaces", caution: "Enterprise pricing; requires disciplined implementation", cfo: "H", cto: "H", cio: "H", coo: "H", cx: "H" },
  { name: "Stripe", slug: "stripe-pay", score: 20, cat: "Digital-First", onl: 3, pos: 2, kio: 2, hh: 2, orch: 3, alt: 3, glob: 3, ent: 3, role: "Developer-first online payments", diff: "Excellent API and documentation; fast rollout; strong global coverage", bestFit: "Digital-first companies, subscription businesses, software platforms", caution: "Point of sale and hardware ecosystem still developing", cfo: "M", cto: "H", cio: "H", coo: "H", cx: "H" },
  { name: "Worldpay (FIS)", slug: "worldpay-pay", score: 21, cat: "Global Acquiring", onl: 3, pos: 3, kio: 3, hh: 3, orch: 2, alt: 2, glob: 3, ent: 3, role: "Global acquiring and point of sale", diff: "Broad global acceptance; strong legacy compatibility; deep regulatory coverage", bestFit: "Global retailers with legacy integrations", caution: "Innovation speed slower; more complex onboarding", cfo: "M", cto: "M", cio: "H", coo: "H", cx: "M" },
  { name: "Global Payments", slug: "globalpay", score: 21, cat: "Global Acquiring", onl: 3, pos: 3, kio: 2, hh: 3, orch: 2, alt: 2, glob: 3, ent: 3, role: "Acquiring + point of sale ecosystem", diff: "Wide geographic reach; strong retail and hospitality presence", bestFit: "Retail and hospitality brands operating internationally", caution: "Frontend tools and reporting lag modern providers", cfo: "M", cto: "M", cio: "H", coo: "M", cx: "M" },
  { name: "Checkout.com", slug: "checkout-pay", score: 18, cat: "Digital-First", onl: 3, pos: 1, kio: 1, hh: 1, orch: 3, alt: 3, glob: 3, ent: 3, role: "Global online processor", diff: "High authorization rates; strong fraud tools; excellent international coverage", bestFit: "Global e-commerce, direct-to-consumer", caution: "Not designed for large physical store fleets", cfo: "H", cto: "H", cio: "H", coo: "H", cx: "H" },
  { name: "FreedomPay", slug: "freedompay", score: 21, cat: "Enterprise In-Store", onl: 3, pos: 3, kio: 3, hh: 3, orch: 2, alt: 2, glob: 3, ent: 3, role: "Enterprise in-store payments", diff: "Excellent security; strong point of sale and kiosk integrations", bestFit: "Retail, hospitality, hotels", caution: "Online capabilities weaker", cfo: "M", cto: "M", cio: "H", coo: "H", cx: "M" },

  // ═══ ONLINE / DIGITAL-FIRST PROCESSORS ═══
  { name: "Braintree", slug: "braintree-pay", score: 16, cat: "Digital-First", onl: 3, pos: 1, kio: 1, hh: 1, orch: 3, alt: 3, glob: 3, ent: 3, role: "Online payments", diff: "Excellent wallet support; easy integration; PayPal ecosystem", bestFit: "Online merchants and apps", caution: "Weak in-store capabilities", cfo: "M", cto: "H", cio: "M", coo: "M", cx: "M" },
  { name: "CyberSource", slug: "cybersource-pay", score: 18, cat: "Gateway / Fraud", onl: 3, pos: 2, kio: 2, hh: 2, orch: 2, alt: 2, glob: 3, ent: 2, role: "Gateway and fraud management", diff: "Strong fraud tools; Visa-owned stability; global acceptance", bestFit: "Enterprises needing compliance depth", caution: "Slower innovation and user interface", cfo: "M", cto: "M", cio: "H", coo: "M", cx: "M" },
  { name: "BlueSnap", slug: "bluesnap-pay", score: 15, cat: "Digital-First", onl: 3, pos: 1, kio: 1, hh: 1, orch: 2, alt: 2, glob: 3, ent: 2, role: "Online gateway", diff: "Strong global alternative payment methods; good recurring billing support", bestFit: "Cross-border online commerce", caution: "Limited point of sale support", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },
  { name: "Nuvei", slug: "nuvei-pay", score: 18, cat: "Global Acquiring", onl: 3, pos: 2, kio: 2, hh: 2, orch: 2, alt: 3, glob: 3, ent: 2, role: "Global payment provider", diff: "Strong alternative methods; good cross-border coverage", bestFit: "High-risk industries and expansions into new markets", caution: "Less optimized for major retail", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },
  { name: "Mollie", slug: "mollie-pay", score: 14, cat: "Regional", onl: 3, pos: 1, kio: 1, hh: 1, orch: 2, alt: 3, glob: 2, ent: 2, role: "European online processor", diff: "Excellent online experience; simple onboarding", bestFit: "European online brands", caution: "Limited global and in-store reach", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },

  // ═══ BANK-LED / LEGACY ACQUIRING ═══
  { name: "Chase / JPM Payments", slug: "chase-pay", score: 14, cat: "Bank-Led", onl: 2, pos: 2, kio: 1, hh: 1, orch: 1, alt: 1, glob: 3, ent: 2, role: "Bank-led acquiring", diff: "Reliable funding; strong treasury integration; trusted brand", bestFit: "U.S.-based large merchants", caution: "Limited global online features", cfo: "H", cto: "M", cio: "H", coo: "M", cx: "M" },
  { name: "Elavon", slug: "elavon-pay", score: 15, cat: "Bank-Led", onl: 2, pos: 2, kio: 2, hh: 2, orch: 1, alt: 1, glob: 3, ent: 2, role: "Acquiring and point of sale", diff: "Deep airline and hospitality experience; stable settlement", bestFit: "Travel and hospitality operators", caution: "Older user experience and reporting", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },

  // ═══ PAYMENT ORCHESTRATION ═══
  { name: "Spreedly", slug: "spreedly-pay", score: 16, cat: "Orchestration", onl: 3, pos: 1, kio: 1, hh: 1, orch: 3, alt: 2, glob: 3, ent: 3, role: "Payment orchestration", diff: "Connects to many processors; reduces lock-in; flexible routing", bestFit: "Multi-processor enterprises", caution: "Adds architectural complexity; still requires processors", cfo: "M", cto: "H", cio: "M", coo: "M", cx: "M" },
  { name: "Gr4vy", slug: "gr4vy-pay", score: 14, cat: "Orchestration", onl: 3, pos: 1, kio: 1, hh: 1, orch: 3, alt: 2, glob: 2, ent: 3, role: "Cloud payment orchestration", diff: "Strong rules engine; modern cloud architecture", bestFit: "Enterprises building flexible payment stacks", caution: "Needs separate processors for settlement", cfo: "M", cto: "H", cio: "M", coo: "M", cx: "M" },
  { name: "Primer", slug: "primer-pay", score: 13, cat: "Orchestration", onl: 3, pos: 1, kio: 1, hh: 1, orch: 3, alt: 2, glob: 2, ent: 2, role: "Payment automation and routing", diff: "Workflow automation; simple integration of many providers", bestFit: "Digital businesses needing flexible routing", caution: "Still requires primary processors", cfo: "M", cto: "H", cio: "M", coo: "M", cx: "M" },

  // ═══ DEVICE / IN-STORE SPECIALISTS ═══
  { name: "Square / Block", slug: "square-pay", score: 16, cat: "SMB / In-Store", onl: 2, pos: 3, kio: 2, hh: 3, orch: 1, alt: 2, glob: 2, ent: 2, role: "Point of sale and small business payments", diff: "Great hardware experience; simple pricing", bestFit: "Small retail and food service", caution: "Not optimized for enterprise scale", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "H" },
  { name: "Shift4", slug: "shift4-pay", score: 17, cat: "Hospitality", onl: 2, pos: 3, kio: 3, hh: 3, orch: 1, alt: 2, glob: 2, ent: 2, role: "Hospitality and restaurant payments", diff: "Strong restaurant and hotel integrations; good hardware fleet", bestFit: "Hospitality brands", caution: "Less flexible for digital-first business", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },
  { name: "Verifone", slug: "verifone-pay", score: 18, cat: "Enterprise In-Store", onl: 2, pos: 3, kio: 3, hh: 3, orch: 2, alt: 2, glob: 3, ent: 2, role: "Device and point of sale platform", diff: "Large device ecosystem; strong compliance; global reach", bestFit: "Retailers needing robust terminal management", caution: "Gateway technology less modern", cfo: "M", cto: "M", cio: "H", coo: "M", cx: "M" },
  { name: "PAX", slug: "pax-pay", score: 18, cat: "Enterprise In-Store", onl: 2, pos: 3, kio: 3, hh: 3, orch: 2, alt: 2, glob: 3, ent: 2, role: "Payment terminals", diff: "Wide range of devices; competitive hardware pricing", bestFit: "Regions with strong PAX distributor networks", caution: "Software maturity varies by region", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },
  { name: "SumUp", slug: "sumup-pay", score: 16, cat: "SMB / In-Store", onl: 2, pos: 3, kio: 2, hh: 3, orch: 1, alt: 2, glob: 2, ent: 1, role: "Small business point of sale", diff: "Simple hardware; easy onboarding", bestFit: "Small retail and mobile sellers", caution: "Not enterprise-grade", cfo: "L", cto: "M", cio: "M", coo: "M", cx: "M" },

  // ═══ REGIONAL / MOBILE WALLETS ═══
  { name: "Paysafe", slug: "paysafe-pay", score: 18, cat: "Alt-Pay / Wallets", onl: 3, pos: 2, kio: 2, hh: 2, orch: 2, alt: 3, glob: 3, ent: 2, role: "Payments + alternative methods", diff: "Strong digital wallets and cross-border flows", bestFit: "Gaming, digital content, high-risk verticals", caution: "Not ideal for complex retail operations", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },
  { name: "Paytm", slug: "paytm-pay", score: 18, cat: "Regional", onl: 3, pos: 3, kio: 3, hh: 3, orch: 2, alt: 3, glob: 1, ent: 2, role: "Indian wallet and payments", diff: "Huge local adoption; strong QR acceptance", bestFit: "India-based brands", caution: "Limited global and advanced enterprise features", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },
  { name: "MercadoPago", slug: "mercadopago-pay", score: 19, cat: "Regional", onl: 3, pos: 3, kio: 2, hh: 3, orch: 2, alt: 3, glob: 2, ent: 2, role: "Latin America payments", diff: "Very strong e-commerce and wallet adoption", bestFit: "Latin American markets", caution: "Limited support outside region", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },
  { name: "M-Pesa", slug: "mpesa-pay", score: 13, cat: "Regional", onl: 1, pos: 2, kio: 2, hh: 2, orch: 1, alt: 3, glob: 1, ent: 2, role: "Mobile money", diff: "Dominant mobile wallet in East Africa", bestFit: "African markets and cash-light consumers", caution: "Not suitable for global retail", cfo: "L", cto: "L", cio: "L", coo: "M", cx: "M" },

  // ═══ SPECIALTY / NICHE ═══
  { name: "GoCardless", slug: "gocardless-pay", score: 14, cat: "Specialty", onl: 2, pos: 1, kio: 1, hh: 1, orch: 2, alt: 3, glob: 3, ent: 2, role: "Bank-to-bank payments", diff: "Excellent recurring direct debit support", bestFit: "Subscriptions; business-to-business billing", caution: "Not suitable for retail or card-heavy flows", cfo: "H", cto: "M", cio: "M", coo: "M", cx: "M" },
  { name: "Mangopay", slug: "mangopay-pay", score: 13, cat: "Specialty", onl: 3, pos: 1, kio: 1, hh: 1, orch: 2, alt: 2, glob: 2, ent: 2, role: "Marketplace payments", diff: "Very strong payout and multi-party payment flows", bestFit: "Marketplaces and platforms", caution: "Limited in-store execution", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },
  { name: "Digital River", slug: "digitalriver-pay", score: 14, cat: "Specialty", onl: 3, pos: 1, kio: 1, hh: 1, orch: 2, alt: 2, glob: 3, ent: 2, role: "E-commerce, tax, and payments", diff: "Handles tax, compliance, and global commerce complexity", bestFit: "Software and digital goods", caution: "Limited device and point of sale presence", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },
  { name: "Koi-Services", slug: "koi-pay", score: 16, cat: "Integration Partner", onl: 2, pos: 2, kio: 2, hh: 2, orch: 1, alt: 1, glob: 2, ent: 2, role: "Integration and deployment partner", diff: "Custom integration for payment devices and systems; strong hands-on support", bestFit: "Mid-market operators needing help connecting online, kiosk, point of sale", caution: "Depends on underlying processor partners", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },

  // ═══ SMB / BASIC ═══
  { name: "Authorize.Net", slug: "authnet-pay", score: 10, cat: "SMB Gateway", onl: 2, pos: 1, kio: 1, hh: 1, orch: 1, alt: 1, glob: 2, ent: 1, role: "U.S. online gateway", diff: "Simple, reliable online acceptance", bestFit: "Small to mid-market online merchants", caution: "Dated technology; enterprise-grade depth absent", cfo: "L", cto: "L", cio: "L", coo: "L", cx: "M" },
  { name: "Tietoevry Payments", slug: "tietoevry-pay", score: 14, cat: "Regional", onl: 2, pos: 2, kio: 1, hh: 1, orch: 2, alt: 1, glob: 3, ent: 2, role: "European enterprise payments", diff: "Strong in Europe; robust compliance tools", bestFit: "Banks and large enterprises", caution: "Limited e-commerce features", cfo: "M", cto: "M", cio: "H", coo: "M", cx: "M" },
  { name: "AffiniPay", slug: "affinipay-pay", score: 11, cat: "Specialty", onl: 2, pos: 1, kio: 1, hh: 1, orch: 1, alt: 1, glob: 2, ent: 2, role: "Payments for professional services", diff: "Specialized workflows for legal and accounting", bestFit: "Law firms, accountants", caution: "Narrow vertical applicability", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },
  { name: "PagSeguro", slug: "pagseguro-pay", score: 19, cat: "Regional", onl: 3, pos: 3, kio: 2, hh: 3, orch: 2, alt: 3, glob: 2, ent: 2, role: "Brazil payments", diff: "Popular in Brazil; strong point of sale devices", bestFit: "Brazilian small merchants", caution: "Limited reach outside Brazil", cfo: "M", cto: "M", cio: "M", coo: "M", cx: "M" },
];

export const getAllPayments = () => paymentVendors;
export const getPaymentsByCategory = (cat) => paymentVendors.filter(v => v.cat === cat);

export const paymentDimensions = [
  { abbr: "ONL", name: "Online / E-commerce" },
  { abbr: "POS", name: "POS / In-Store" },
  { abbr: "KIO", name: "Kiosk / Self-Serve" },
  { abbr: "HH", name: "Handheld / mPOS" },
  { abbr: "ORC", name: "Payment Orchestration" },
  { abbr: "ALT", name: "Alt-Pay / Wallets" },
  { abbr: "GLB", name: "Global Reach" },
  { abbr: "ENT", name: "Enterprise Fit" },
];

export const paymentCats = [
  { name: "Unified Commerce", color: "#10B981", desc: "Full-spectrum processors supporting online, in-store, kiosk, and mobile from a single platform." },
  { name: "Digital-First", color: "#0088DD", desc: "Online-first processors with strong APIs, orchestration, and global coverage. Weaker in physical point of sale." },
  { name: "Global Acquiring", color: "#3B82F6", desc: "Legacy and enterprise acquirers with broad geographic reach and strong compliance depth." },
  { name: "Enterprise In-Store", color: "#7C3AED", desc: "Specialized in physical retail payment infrastructure — terminals, kiosks, and in-store security." },
  { name: "Orchestration", color: "#EC4899", desc: "Payment routing and orchestration layers that sit above processors. Enable multi-provider flexibility." },
  { name: "Regional", color: "#F59E0B", desc: "Dominant in specific geographic markets. Strong local adoption but limited global applicability." },
  { name: "Specialty", color: "#14B8A6", desc: "Purpose-built for specific payment motions — marketplaces, subscriptions, professional services, or bank-to-bank." },
  { name: "SMB / In-Store", color: "#6B7280", desc: "Simple hardware and onboarding for small businesses and mobile sellers." },
];

export const csuiteLenses = [
  { abbr: "CFO", name: "Finance", desc: "Cost efficiency, settlement speed, risk/fraud, FX, reconciliation, vendor stability." },
  { abbr: "CTO", name: "Engineering", desc: "API quality, reliability, scalability, security architecture, developer experience." },
  { abbr: "CIO", name: "Security & Governance", desc: "Security architecture, data governance, enterprise integration, resilience, token portability." },
  { abbr: "COO", name: "Operations", desc: "Uptime, issue reduction, device ops, multichannel consistency, support quality." },
  { abbr: "CX", name: "Experience", desc: "Friction reduction, self-service, agent workflow, device CX, journey continuity." },
];

export const getPaymentVendor = (slug) => paymentVendors.find(v => v.slug === slug) || null;
