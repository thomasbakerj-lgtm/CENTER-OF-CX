// Retail & eCommerce Sub-Vertical CX Stack Frameworks
// 6 sub-verticals × 7 layers × vendor stacks with "why" and integration pitfalls

export const retailSubVerticals = {
  "ecommerce-dtc": {
    name: "eCommerce / DTC", parent: "Retail & eCommerce",
    tagline: "Order status, returns, shipping issues, payment disputes, and cart abandonment recovery.",
    intro: "DTC eCommerce contact centers live and die by speed. The customer who can't find their order, can't process a return, or has a payment question expects resolution in minutes — not hours. The CX challenge is handling massive transactional volume at low AHT while identifying and escalating the 10-15% of interactions that carry revenue or retention significance.",
    kpis: [
      { metric: "AHT", avg: "4:20", note: "Fast — most interactions are transactional (order status, returns)" },
      { metric: "FCR", avg: "78%", note: "High — simple product set and integrated OMS reduce handoffs" },
      { metric: "CSAT", avg: "76%", note: "Moderate — returns friction and shipping delays suppress scores" },
      { metric: "Containment", avg: "35%", note: "High — WISMO and returns are highly automatable" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["CSAT and NPS tracking by order type, channel, and issue category","Returns root cause analytics identifying product, fulfillment, and description issues","Agent revenue attribution — upsells, saves, and cart recovery tracked per agent","Seasonal performance benchmarking against peak period targets","Review and social sentiment correlation with support interactions"],
        vendors: "NICE Nexidia, Qualtrics, Medallia, Gorgias Analytics", risk: "Returns rate climbing without root cause visibility",
        stack: [
          { name: "Gorgias", role: "eCommerce Analytics", why: "Revenue attribution built into the support platform. Shows exactly how much revenue each agent generates through order modifications, upsells, and save offers. The only analytics platform where support is measured as a revenue center.", href: "/vendors" },
          { name: "NICE Nexidia", role: "Interaction Analytics", why: "Speech and text analytics at scale. Identifies systemic issues — if 500 customers mention 'sizing' this week, that's a product page problem, not a support problem. Root cause detection across channels.", href: "/vendors/analytics" },
        ],
        pitfall: "eCommerce brands track CSAT at the ticket level but not at the customer journey level. A customer who contacts support 3 times about the same return — and gets a satisfactory response each time — will rate each interaction positively but leave a 1-star review because the overall experience was terrible. Track resolution journey metrics, not just interaction metrics."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["Intent-based routing separating WISMO, returns, pre-purchase, and complaints","VIP and loyalty tier routing for high-LTV customers","Revenue opportunity routing — cart abandonment and pre-purchase to sales-skilled agents","Peak season overflow routing with quality-maintained surge capacity","Channel-aware routing — chat for simple, phone for complex, social for brand"],
        vendors: "Gladly, Gorgias, Genesys, NICE CXone", risk: "Revenue-generating pre-purchase inquiries buried in returns queue",
        stack: [
          { name: "Gladly", role: "Customer Service Platform", why: "Customer-timeline-first architecture — every interaction with a customer appears in one lifelong conversation thread. No ticket numbers. Agents see the full relationship, not isolated incidents. Purpose-built for retail.", href: "/vendors" },
          { name: "Gorgias", role: "eCommerce Helpdesk", why: "Shopify-native with order data visible in every conversation. Macros with order variables (tracking link, refund status) resolve 30-40% of tickets in one click. Built for speed at scale.", href: "/vendors" },
          { name: "Genesys Cloud", role: "Enterprise CCaaS", why: "For DTC brands scaling past 200 agents or adding voice/complex routing. Predictive routing matches customer intent to agent skill. Overkill for small Shopify stores; essential for enterprise DTC.", href: "/vendors/genesys" },
        ],
        pitfall: "Most DTC brands route by channel (chat queue, email queue, phone queue) instead of by intent. A pre-purchase question on chat ('does this come in blue?') and a complaint on chat ('this arrived damaged') go to the same agent. The pre-purchase question is a revenue opportunity; the complaint is a retention risk. They need different agent skills. Route by intent, not by channel."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Live chat with real-time order data and one-click actions","Social media response management across Instagram, Facebook, TikTok","Proactive shipping notifications reducing WISMO volume","SMS for order updates, delivery windows, and return labels","Self-service returns portal with automated label generation"],
        vendors: "Gorgias, Gladly, Intercom, Ada, Zendesk", risk: "Social media complaints going viral without real-time response capability",
        stack: [
          { name: "Gorgias", role: "Omnichannel Inbox", why: "Unified inbox for email, chat, social (Instagram DMs, Facebook, TikTok), SMS, and phone. Order data from Shopify visible in every conversation. One-click refund, reshipment, and discount code.", href: "/vendors" },
          { name: "Klaviyo", role: "Proactive Communications", why: "Post-purchase email and SMS flows — shipping confirmation, delivery updates, review requests. Reduces WISMO volume by 25-40% when flows are well-designed. The best support ticket is the one that never gets created.", href: "/vendors" },
          { name: "Loop Returns", role: "Self-Service Returns", why: "Self-service returns portal that handles 60-70% of returns without agent involvement. Exchange-first logic retains revenue by offering exchanges before refunds.", href: "/vendors" },
        ],
        pitfall: "DTC brands deploy proactive shipping notifications but send them with the carrier's generic tracking page — which shows 'in transit' for 5 days with no updates. The customer sees the notification, clicks the link, sees no progress, and contacts support anyway. Use a branded tracking page (Narvar, AfterShip, Malomo) with estimated delivery, delay explanations, and self-service options. The tracking page IS the support experience for 40% of customers."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Order status bots with real-time tracking and delivery estimates","Returns eligibility bots with policy enforcement and label generation","Product recommendation bots for pre-purchase guidance","Subscription management bots (skip, pause, modify, cancel)","FAQ bots covering shipping times, sizing, materials, and care instructions"],
        vendors: "Ada, Gorgias Automate, Forethought, Tidio", risk: "Bot blocking the customer from reaching a human when needed",
        stack: [
          { name: "Ada", role: "AI Customer Service", why: "No-code bot builder with deep Shopify integration. Handles WISMO, returns initiation, and product FAQ. Resolution-focused — takes actions (issues refund, generates label) rather than just answering questions.", href: "/vendors/iva" },
          { name: "Gorgias Automate", role: "eCommerce Automation", why: "Automation built into the helpdesk. Auto-responds to WISMO with real-time tracking. Auto-tags and routes by intent. Macros with order data variables. The fastest path from zero to automated for Shopify brands.", href: "/vendors" },
        ],
        pitfall: "WISMO bots are the easiest win in eCommerce — but only if they return real-time data. A bot that says 'your order is on its way!' when the package has been sitting at a carrier facility for 3 days makes things worse. Connect your bot to the carrier API (not your OMS) for last-mile tracking accuracy. Your OMS knows the order shipped; the carrier API knows where it actually is."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["PCI compliance for payment data in chat and voice channels","Fraud prevention in returns and exchanges (serial returner detection)","CCPA/GDPR compliance for customer data handling and deletion requests","Chargeback prevention through proactive dispute resolution","Age verification for restricted products (alcohol, CBD, supplements)"],
        vendors: "Forter, Sift, Stripe Radar, Signifyd", risk: "Return fraud eroding margins without detection",
        stack: [
          { name: "Forter", role: "Fraud Prevention", why: "Real-time fraud decisioning for orders, returns, and account actions. Identifies serial returners, promo abusers, and account takeover. Protects margins while keeping legitimate customers frictionless.", href: "/vendors" },
          { name: "Signifyd", role: "Guaranteed Fraud Protection", why: "Shifts chargeback liability from the merchant. If Signifyd approves an order and it turns out to be fraud, Signifyd pays the chargeback. Revenue protection with a financial guarantee.", href: "/vendors" },
        ],
        pitfall: "Return fraud costs eCommerce brands 8-10% of return volume. The most common pattern: customer claims item was 'not received' or 'arrived damaged' when it wasn't. Without fraud detection integrated into your returns workflow, your agents approve every claim because denying a legitimate customer is worse than absorbing fraud. Forter and similar tools give agents data-backed confidence to flag suspicious claims without alienating honest customers."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["Returns processing with exchange-first logic to retain revenue","Order modification workflow (address change, item swap, cancel before ship)","Subscription lifecycle workflow (pause, skip, modify, win-back)","Warranty claim and replacement workflow with proof collection","Loyalty program enrollment and reward redemption workflow"],
        vendors: "Loop Returns, Narvar, Recharge, Shopify Flow", risk: "Returns processed as refunds when exchanges would retain revenue",
        stack: [
          { name: "Loop Returns", role: "Returns & Exchanges", why: "Exchange-first returns platform. When a customer initiates a return, Loop offers exchanges, store credit, and variant swaps before showing the refund option. Retains 30-40% of return revenue.", href: "/vendors" },
          { name: "Recharge", role: "Subscription Management", why: "Subscription commerce platform for Shopify. Manages recurring orders, skip/pause/cancel, and swap flows. Integration means agents can modify subscriptions without leaving the helpdesk.", href: "/vendors" },
          { name: "Shopify Flow", role: "Workflow Automation", why: "Native Shopify automation. Triggers actions based on order events — auto-tag VIP orders, flag high-risk returns, route specific products to specialized agents. No code required.", href: "/vendors" },
        ],
        pitfall: "The default returns workflow for most brands is: customer requests return → agent approves → refund issued. This is a revenue leak. Exchange-first returns (Loop, Narvar) present the customer with exchange options, store credit with a bonus, and variant swaps before showing the refund button. Brands switching to exchange-first returns retain 30-40% of revenue that would have been refunded. This is the single highest-ROI workflow change in eCommerce CX."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["Shopify / commerce platform integration (orders, customers, products)","Carrier and fulfillment integration (real-time tracking, delivery status)","Payment processor connectivity (Stripe, PayPal, Shop Pay)","Inventory and warehouse management system access","Customer data platform integration for purchase history and LTV"],
        vendors: "Shopify, Salesforce Commerce, BigCommerce, Magento", risk: "Agent seeing order data but not carrier data — can't answer WISMO",
        stack: [
          { name: "Shopify", role: "Commerce Platform", why: "Powers the majority of DTC brands. Order data, customer data, product catalog, and inventory in one platform. Your CX stack starts with Shopify integration — if your helpdesk can't pull Shopify data natively, you're building workarounds.", href: "/vendors" },
          { name: "ShipBob / ShipStation", role: "Fulfillment & Shipping", why: "3PL and shipping management. Real-time fulfillment status, tracking numbers, and carrier data. The answer to 'where is my order' lives here, not in Shopify.", href: "/vendors" },
          { name: "Stripe", role: "Payments", why: "Payment processing with dispute management, refund APIs, and fraud detection. Agents need Stripe data to process refunds, verify charges, and respond to disputes.", href: "/vendors/payments" },
        ],
        pitfall: "Shopify shows order data; the 3PL (ShipBob, ShipStation) shows fulfillment data; the carrier (UPS, FedEx, USPS) shows delivery data. These are three different systems with three different update cadences. An agent answering 'where is my order?' needs all three: Shopify says 'shipped,' ShipBob says 'picked and packed at 2pm,' and UPS says 'out for delivery.' If your helpdesk only integrates Shopify, your agents know the order shipped but can't tell the customer when it arrives."
      },
    ],
  },

  "omnichannel-retail": {
    name: "Omnichannel Retail", parent: "Retail & eCommerce",
    tagline: "BOPIS, cross-channel returns, inventory inquiries, and loyalty programs.",
    intro: "Omnichannel retail contact centers manage the intersection of digital and physical commerce. The CX challenge is seamless — a customer who buys online and picks up in store, returns in a different store, and contacts support via chat expects every touchpoint to have full context. The reality is usually fragmented systems, siloed inventory, and agents who can see the online order but not the in-store return.",
    kpis: [
      { metric: "AHT", avg: "5:50", note: "Moderate — cross-channel resolution requires system lookups across POS and eComm" },
      { metric: "FCR", avg: "68%", note: "Below average — cross-channel issues require store-level coordination" },
      { metric: "CSAT", avg: "74%", note: "Lower — the gap between omnichannel promise and siloed reality frustrates customers" },
      { metric: "Containment", avg: "22%", note: "Lower than pure eComm — store-specific questions require human knowledge" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["Cross-channel journey analytics — online purchase to in-store pickup to support contact","CSAT by channel combination (web-to-store, store-to-web, pure digital)","Inventory accuracy analytics correlated to customer complaints","Store-level support performance for BOPIS and in-store pickup issues","Loyalty program engagement analytics tied to support interactions"],
        vendors: "NICE, Qualtrics, Medallia, Salesforce", risk: "No visibility into how channel transitions affect satisfaction",
        stack: [
          { name: "Medallia", role: "Experience Analytics", why: "Cross-channel journey analytics connecting online, in-store, and contact center touchpoints. Shows where omnichannel breaks — typically at the channel transition point.", href: "/vendors/analytics" },
          { name: "NICE CXone", role: "Contact Center Analytics", why: "Interaction analytics with cross-channel context. Agent QA scoring that accounts for omnichannel complexity — resolving a cross-channel return is harder than a pure online return.", href: "/vendors/nice-cxone" },
        ],
        pitfall: "Omnichannel retailers measure channel-specific metrics (online CSAT, store CSAT, call center CSAT) but not journey-level metrics. A customer who has a great online experience, a frustrating BOPIS pickup, and a satisfactory support call will rate the support call positively — but their overall brand sentiment is negative. Measure the journey, not the touchpoint."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["Store-aware routing connecting customers to agents with local store knowledge","Cross-channel order routing — agents see both online and POS transactions","BOPIS issue routing with store operations escalation path","Loyalty tier routing for rewards members and VIP customers","Seasonal routing for holiday, back-to-school, and promotional events"],
        vendors: "Genesys, NICE CXone, Gladly, Salesforce Service", risk: "Agent without store-level visibility handling an in-store pickup issue",
        stack: [
          { name: "Gladly", role: "Customer Platform", why: "Unified customer timeline across all channels and all order types. Agents see the full relationship — online orders, in-store purchases, loyalty points, and every past interaction — in one view.", href: "/vendors" },
          { name: "Genesys Cloud", role: "Enterprise CCaaS", why: "Skills-based routing with store knowledge attributes. Routes BOPIS issues to agents familiar with that store's operations. Handles the routing complexity of 500+ store locations.", href: "/vendors/genesys" },
        ],
        pitfall: "Omnichannel routing requires store-level context that most CCaaS platforms don't natively support. When a customer calls about a BOPIS pickup at Store #247, the agent needs to know that store's hours, pickup location, and current wait time. This data lives in the retail operations system, not the CCaaS. Build a store information layer that surfaces location-specific data in the agent desktop."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Unified messaging across web chat, SMS, social, and in-store associate communication","BOPIS status notifications with pickup instructions and store directions","Cross-channel return status updates regardless of return origin","Appointment scheduling for in-store services (styling, fitting, consultation)","Store associate escalation from contact center with warm transfer"],
        vendors: "Gladly, Zendesk, Salesforce Service, Intercom", risk: "Notifications for online orders not reflecting in-store actions",
        stack: [
          { name: "Clienteling apps (Tulip, Endear)", role: "Store Associate CRM", why: "Connect in-store associates with customer data for personalized service. When the contact center resolves an issue, the store associate sees it. When the store associate makes a sale, the contact center sees it.", href: "/vendors" },
          { name: "Gladly", role: "Unified Customer Comms", why: "Single conversation thread regardless of channel. Customer starts on chat, continues via email, calls a week later — same thread, same context, no repetition.", href: "/vendors" },
        ],
        pitfall: "Omnichannel communication promises 'continue your conversation anywhere' — but most implementations only unify digital channels. The in-store interaction is invisible to the contact center, and the contact center interaction is invisible to the store associate. True omnichannel requires a shared customer record (Salesforce, Gladly) that both the store and the contact center update. Without this, 'omnichannel' is just 'multi-channel with a marketing label.'"
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Order status bots spanning online and in-store purchases","Store inventory lookup bots with real-time availability","BOPIS readiness bots with pickup window and store hours","Cross-channel return eligibility bots with policy enforcement","Loyalty point balance and redemption bots"],
        vendors: "Ada, Salesforce Einstein, Gladly AI", risk: "Bot showing online inventory when customer needs store-level availability",
        stack: [
          { name: "Ada", role: "AI Customer Service", why: "Handles order status, store hours, and inventory lookups across channels. Integrates with both eComm and retail OMS for unified order visibility.", href: "/vendors/iva" },
          { name: "Salesforce Einstein", role: "AI Layer", why: "Next-best-action recommendations across the retail customer journey. Personalizes bot responses based on purchase history, loyalty tier, and channel preference.", href: "/vendors" },
        ],
        pitfall: "Inventory bots in omnichannel retail must distinguish between warehouse inventory (available for shipping), store inventory (available for pickup), and display inventory (in-store but allocated). A bot that says 'in stock' when the item is in the warehouse but not in the customer's preferred store creates a failed BOPIS attempt. Query store-level inventory, not aggregate inventory."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["Cross-channel return policy enforcement (buy online, return in store and vice versa)","PCI compliance across online, phone, and in-store payment channels","Loyalty program terms enforcement for points earning and redemption","Price matching policy automation across online and in-store","Fraud detection for cross-channel return abuse"],
        vendors: "Forter, Appriss Retail, Sift", risk: "Cross-channel return fraud exploiting gaps between systems",
        stack: [
          { name: "Appriss Retail", role: "Return Fraud Prevention", why: "The Verify platform analyzes return patterns across channels. Identifies customers exploiting cross-channel return policies — buying online with promotions and returning in store for full price.", href: "/vendors" },
          { name: "Forter", role: "Fraud Decisioning", why: "Real-time fraud prevention across online orders, in-store transactions, and cross-channel returns. Unified identity resolution shows the same customer's behavior across all touchpoints.", href: "/vendors" },
        ],
        pitfall: "Cross-channel return fraud exploits the gap between systems. A customer buys an item online with a 30% coupon, returns it in store for full-price store credit, then uses the credit to buy something at full price. The online system sees a return; the POS sees a new purchase. Neither flags the arbitrage. Unified transaction visibility across online and POS is the only way to catch this pattern."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["BOPIS workflow with inventory reservation, pick notification, and customer readiness","Cross-channel return workflow with refund routing (original payment vs store credit)","Ship-from-store workflow with store fulfillment coordination","Endless aisle ordering (in-store order of online-only inventory)","Loyalty enrollment, tier upgrade, and reward redemption workflow"],
        vendors: "Salesforce Commerce, Manhattan Associates, Narvar, Shopify POS", risk: "BOPIS fulfillment delays with no proactive customer notification",
        stack: [
          { name: "Manhattan Associates", role: "Order Management", why: "Enterprise OMS unifying online, store, and warehouse inventory. Intelligent order routing decides ship-from-store vs ship-from-warehouse. The operational backbone for true omnichannel fulfillment.", href: "/vendors" },
          { name: "Narvar", role: "Post-Purchase Experience", why: "Branded tracking, returns portal, and delivery experience management. Reduces WISMO by providing proactive, branded communication across all fulfillment methods.", href: "/vendors" },
        ],
        pitfall: "BOPIS success depends on the store fulfillment team, not the contact center — but the contact center absorbs the complaints when it fails. 'I got a pickup notification but the store says it's not ready' is the #1 BOPIS complaint. The fix is operational (improve store pick times and notification accuracy), but the contact center needs real-time visibility into store fulfillment status to give honest answers instead of 'let me check with the store.'"
      },
      { layer: 1, name: "Data Access",
        capabilities: ["Unified commerce platform spanning online and POS transactions","Store-level inventory with real-time availability by location","Customer data platform with cross-channel purchase history","Loyalty program database with points, tier, and redemption history","Store operations data (hours, pickup locations, staffing)"],
        vendors: "Salesforce Commerce, Shopify POS, Oracle Retail, SAP", risk: "Online and in-store customer records not linked — no unified view",
        stack: [
          { name: "Salesforce Commerce + POS", role: "Unified Commerce", why: "Commerce Cloud for online and POS for in-store on one platform. Unified customer record, unified order history, unified inventory view. The foundation for true omnichannel CX.", href: "/vendors" },
          { name: "Oracle Retail", role: "Enterprise Retail Platform", why: "Full retail suite — merchandising, supply chain, POS, and customer engagement. Dominant in large-format retail. Deep inventory management across thousands of locations.", href: "/vendors" },
        ],
        pitfall: "The #1 omnichannel data problem: the online customer and the in-store customer are different records. A customer who buys online with email@gmail.com and swipes a loyalty card in store with a phone number exists as two people in most retail systems. Without identity resolution linking these records, the agent sees half the customer's history. Invest in customer identity resolution (Amperity, Treasure Data) before claiming 'unified customer view.'"
      },
    ],
  },

  "subscription-membership": {
    name: "Subscription & Membership", parent: "Retail & eCommerce",
    tagline: "Billing cycles, cancellation/retention, membership benefits, and recurring order management.",
    intro: "Subscription contact centers exist primarily to prevent cancellation. Every inbound contact is a retention opportunity or a churn signal. The CX challenge is making it easy enough to manage subscriptions that customers don't want to cancel, while having the right offers and authority when they do.",
    kpis: [
      { metric: "AHT", avg: "6:10", note: "Moderate — retention conversations require exploration and negotiation" },
      { metric: "FCR", avg: "80%", note: "High — most subscription actions are self-contained" },
      { metric: "CSAT", avg: "72%", note: "Lower — customers calling to cancel are already dissatisfied" },
      { metric: "Containment", avg: "30%", note: "Moderate — skip/pause/modify are automatable; cancellation needs humans" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["Churn prediction analytics identifying at-risk subscribers before they cancel","Cancellation reason tracking with root cause categorization","Retention offer effectiveness analytics — which offers save which segments","LTV impact analysis of support interactions on subscription longevity","Win-back campaign analytics for lapsed subscribers"],
        vendors: "NICE, Qualtrics, ChurnZero, Brightback", risk: "Churn rate climbing without visibility into leading indicators",
        stack: [
          { name: "ChurnZero", role: "Customer Success", why: "Real-time churn prediction based on engagement signals. Identifies at-risk subscribers before they contact support. Triggers proactive outreach to save at-risk accounts.", href: "/vendors" },
          { name: "Brightback (Chargebee Retention)", role: "Cancellation Analytics", why: "Cancellation flow analytics showing exactly where and why subscribers cancel. Tests different retention offers and measures save rates by segment.", href: "/vendors" },
        ],
        pitfall: "Subscription brands measure churn rate but not churn driver distribution. 'Our churn rate is 8%' is less useful than '40% churn for price, 25% for product fatigue, 20% for poor service, 15% for life change.' Each driver requires a different retention strategy. Price churners need offers; product fatigue churners need variety; service churners need experience fixes. Track the driver, not just the rate."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["Cancellation intent routing to retention-skilled agents","Billing dispute routing with subscription context and history","Loyalty tier routing for long-tenured subscribers","Win-back routing for recently lapsed subscribers who re-engage","Self-service routing for skip, pause, and modification requests"],
        vendors: "Gladly, Gorgias, NICE CXone", risk: "Cancellation calls reaching agents without retention authority or offers",
        stack: [
          { name: "Gladly", role: "Customer Platform", why: "Full subscription history visible in the customer timeline. Agents see tenure, total spend, past retention offers, and engagement patterns — everything needed for an informed save conversation.", href: "/vendors" },
        ],
        pitfall: "Retention routing is only effective if retention agents have authority. Most subscription brands route cancellation calls to a 'retention team' that can only offer a 10% discount or one free month. If the customer has already decided to leave, these offers insult rather than save. Give retention agents a tiered offer menu based on customer LTV and churn risk score — the save offer for a $2,000 LTV customer should be different from a $200 LTV customer."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Proactive engagement at churn risk signals (missed deliveries, declined payments)","Self-service subscription portal for skip, pause, swap, and frequency changes","Cancellation save flow with embedded offers and alternatives","Reactivation campaigns for lapsed subscribers via email, SMS, and ads","Billing notification and payment retry communications"],
        vendors: "Recharge, Klaviyo, Brightback, Ada", risk: "Making cancellation too difficult and triggering chargebacks instead",
        stack: [
          { name: "Recharge", role: "Subscription Management", why: "The standard for Shopify subscription management. Skip, pause, swap, and frequency changes through self-service portal. Reduces cancellation by making modification easy.", href: "/vendors" },
          { name: "Klaviyo", role: "Lifecycle Communications", why: "Automated email/SMS flows for subscription lifecycle — welcome, upcoming charge, delivery, review request, at-risk, and win-back. The communication layer that sits on top of the subscription engine.", href: "/vendors" },
          { name: "Brightback (Chargebee)", role: "Cancellation Experience", why: "Intelligent cancellation flow that presents tailored alternatives based on the cancellation reason. 'Too expensive?' → offer discount. 'Too much product?' → offer reduced frequency. Saves 10-20% of cancellation attempts.", href: "/vendors" },
        ],
        pitfall: "The FTC's 'click to cancel' rule requires that cancelling a subscription must be as easy as signing up. Dark pattern cancellation flows (hidden cancel buttons, mandatory phone calls, multi-step confirmations) create regulatory risk and brand damage. The winning strategy isn't making cancellation hard — it's making modification so easy that customers pause or downgrade instead of cancelling."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Subscription management bots (skip, pause, modify frequency, swap products)","Billing FAQ bots explaining charges, renewals, and payment methods","Order tracking bots for upcoming and recent subscription deliveries","Product swap recommendation bots based on preferences and history","Cancellation deflection bots with self-service alternatives"],
        vendors: "Ada, Recharge AI, Gorgias Automate", risk: "Bot completing cancellation without attempting retention",
        stack: [
          { name: "Ada", role: "AI Agent", why: "Handles subscription modifications (skip, pause, swap) without human involvement. Routes cancellation requests to retention agents with full context. Actions-first, not information-first.", href: "/vendors/iva" },
        ],
        pitfall: "Subscription bots should handle modification easily but NOT handle cancellation automatically. A customer saying 'cancel my subscription' should be routed to a retention agent who can explore the reason and offer alternatives. A bot that processes the cancellation instantly saves AHT but loses revenue. The correct bot behavior: 'I can help with that — let me connect you with someone who can make sure we handle this right and explore any options that might work for you.'"
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["FTC click-to-cancel compliance for cancellation process","PCI compliance for stored payment methods and recurring charges","CCPA/GDPR data deletion requests for former subscribers","Dunning management rules for failed payment retries","Promotional offer compliance ensuring terms are clearly communicated"],
        vendors: "Stripe, Chargebee, Recurly", risk: "FTC enforcement action for dark pattern cancellation",
        stack: [
          { name: "Stripe Billing", role: "Subscription Billing", why: "Recurring billing with intelligent retry logic, dunning management, and revenue recovery. Handles the payment infrastructure that subscription CX depends on.", href: "/vendors/payments" },
          { name: "Chargebee", role: "Subscription Management", why: "Subscription lifecycle management with retention tools (Brightback), revenue recovery, and compliance-ready cancellation flows.", href: "/vendors" },
        ],
        pitfall: "Failed payments are the #1 involuntary churn driver for subscriptions. Most brands retry the same card 3 times and then cancel the subscription. Smart dunning (Stripe, Chargebee) retries at optimal times, tries alternative payment methods, and sends the customer payment update reminders before cancelling. The difference between basic and smart dunning is typically 3-5% of recovered revenue."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["Subscription creation and onboarding workflow with welcome series","Modification workflow (frequency, products, payment, address) with confirmation","Cancellation workflow with reason capture and retention offer logic","Failed payment recovery workflow with retry and notification sequence","Win-back workflow with reactivation offers and re-enrollment"],
        vendors: "Recharge, Bold Subscriptions, Chargebee, Ordergroove", risk: "No retention workflow — cancellation goes straight to processing",
        stack: [
          { name: "Recharge", role: "Subscription Engine", why: "Handles the full subscription lifecycle on Shopify. Modification, cancellation, and reactivation workflows. API access means your helpdesk can execute subscription actions natively.", href: "/vendors" },
          { name: "Ordergroove", role: "Relationship Commerce", why: "Subscription and auto-replenishment platform for enterprise retail. Predictive shipment timing, dynamic offers, and cross-sell within the subscription.", href: "/vendors" },
        ],
        pitfall: "Most subscription brands have a cancellation workflow but not a win-back workflow. A customer who cancels in March might be winnable in June with the right offer — but only if you have a timed, segmented re-engagement sequence. Build a 30/60/90-day win-back flow triggered by cancellation, with offers escalating over time. Subscribers who cancel are 5x more likely to resubscribe than cold prospects."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["Subscription platform integration (active subscriptions, billing history, modifications)","Commerce platform for product catalog and order history","Payment processor for billing, refunds, and failed payment status","Customer data platform with engagement signals and LTV calculation","Marketing automation for lifecycle communication triggers"],
        vendors: "Recharge, Shopify, Stripe, Klaviyo, Segment", risk: "Subscription data not visible in the helpdesk during support interactions",
        stack: [
          { name: "Recharge", role: "Subscription Data", why: "The source of truth for subscription status, billing history, and modification history. If your helpdesk can't read and write Recharge data, agents are blind during subscription conversations.", href: "/vendors" },
          { name: "Segment", role: "Customer Data Platform", why: "Unifies customer data across subscription, eCommerce, support, and marketing. Enables LTV-based routing and churn prediction by connecting behavioral data to the support experience.", href: "/vendors" },
        ],
        pitfall: "Subscription data lives in Recharge; order data lives in Shopify; payment data lives in Stripe; engagement data lives in Klaviyo. Your agent needs all four to handle a subscription conversation effectively. Most helpdesks integrate Shopify but not Recharge — so the agent can see past orders but can't see the active subscription, billing schedule, or modification history. Integrate the subscription platform first; it's the most critical data source for subscription CX."
      },
    ],
  },

  "marketplace": {
    name: "Marketplace Sellers", parent: "Retail & eCommerce",
    tagline: "Seller support, buyer disputes, listing issues, payment holds, and policy enforcement.",
    intro: "Marketplace contact centers serve two audiences with opposing interests — buyers and sellers — on the same platform. The CX challenge is maintaining trust with both sides while enforcing policies that neither fully agrees with. Every dispute resolution favoring one side creates friction with the other.",
    kpis: [
      { metric: "AHT", avg: "7:00", note: "Long — disputes require investigation and multi-party coordination" },
      { metric: "FCR", avg: "60%", note: "Low — disputes and policy issues often require investigation and follow-up" },
      { metric: "CSAT", avg: "70%", note: "Low — someone loses every dispute" },
      { metric: "Containment", avg: "28%", note: "Order status automatable; disputes and policy questions require humans" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["Buyer vs seller CSAT tracking with separate scorecards","Dispute resolution analytics — outcomes, timelines, and escalation rates","Seller health scoring based on support volume and complaint patterns","Policy enforcement consistency monitoring across agents","Trust and safety metrics — fraud detection, counterfeit reports, policy violations"],
        vendors: "NICE, Zendesk Analytics, custom dashboards", risk: "Inconsistent policy enforcement eroding marketplace trust",
        stack: [{ name: "NICE CXone", role: "QA & Analytics", why: "Separate QA scorecards for buyer-facing and seller-facing interactions. Compliance monitoring ensures policy enforcement consistency across agents.", href: "/vendors/nice-cxone" }],
        pitfall: "Marketplaces measure buyer CSAT and seller CSAT separately, but the real metric is dispute resolution fairness. If buyers always win disputes, sellers leave the platform. If sellers always win, buyers lose trust. Track dispute outcome distribution by category and ensure it aligns with your published policies — not with which side complains louder."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["Buyer vs seller routing with different service models and SLAs","Seller tier routing based on GMV, tenure, and account health","Dispute and case routing with investigation workflow","Trust and safety routing for fraud, counterfeit, and policy violations","Seller onboarding routing with dedicated support during ramp"],
        vendors: "Zendesk, Salesforce Service, Genesys", risk: "High-GMV sellers waiting in general queue during critical account issues",
        stack: [{ name: "Zendesk", role: "Support Platform", why: "Structured ticketing with custom fields for buyer/seller/dispute type. SLA management by seller tier. Strong for marketplaces scaling from hundreds to thousands of sellers.", href: "/vendors" }, { name: "Salesforce Service Cloud", role: "Enterprise CRM", why: "Full seller relationship management with case management. Better for marketplaces with complex seller onboarding and ongoing account management.", href: "/vendors/ccaas" }],
        pitfall: "Marketplace seller support is B2B support — but most marketplaces staff it like B2C. A seller whose payments are on hold has a cash flow crisis; treating their case with the same SLA as a buyer asking about a tracking number destroys seller trust. Build a separate seller support path with B2B-grade SLAs, especially for payment and account health issues."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Buyer-seller messaging with platform moderation and safety controls","Seller portal with performance dashboards and policy documentation","Dispute resolution interface with evidence submission from both parties","Proactive seller notifications for policy changes and performance alerts","Buyer review and feedback management with seller response tools"],
        vendors: "Zendesk, custom platforms, Intercom", risk: "Unmoderated buyer-seller messaging enabling off-platform transactions",
        stack: [{ name: "Custom / Zendesk", role: "Marketplace Support", why: "Most marketplaces build custom buyer-seller messaging to control the experience and prevent off-platform transactions. Zendesk sits behind it for case management and agent tooling.", href: "/vendors" }],
        pitfall: "Buyer-seller messaging must be moderated for two reasons: preventing fraud (phishing, off-platform payment schemes) and preventing harassment. But moderation at scale requires AI-assisted scanning, not human review of every message. Implement keyword detection and behavioral analysis (sudden shift to personal contact info) to flag risky conversations without reading every message."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Order status bots for buyers with tracking and delivery estimates","Seller FAQ bots covering policies, fees, shipping requirements, and payouts","Dispute pre-screening bots collecting evidence from both parties","Listing issue bots helping sellers fix policy violations","Payout status bots for sellers with payment timeline information"],
        vendors: "Ada, Forethought, Zendesk AI", risk: "Bot resolving disputes without proper investigation",
        stack: [{ name: "Ada", role: "AI Agent", why: "Handles buyer WISMO and seller FAQ at scale. Routes disputes to human agents with pre-collected evidence from both parties. Reduces agent time per dispute by 30-40%.", href: "/vendors/iva" }],
        pitfall: "Dispute bots should collect evidence and context — but never resolve disputes. A bot that auto-refunds buyers without seller input will be gamed by fraudulent buyers. A bot that auto-rejects buyer claims without investigation will lose buyer trust. The bot's job is intake and evidence collection; the human's job is judgment."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["Marketplace policy enforcement automation with seller notifications","Payment hold and release rules based on seller risk scoring","Counterfeit and IP violation detection and takedown workflows","Buyer protection policy enforcement with dispute resolution rules","Regulatory compliance for marketplace facilitator tax obligations"],
        vendors: "Sift, Forter, custom trust & safety tools", risk: "Policy inconsistency creating legal liability and seller lawsuits",
        stack: [{ name: "Sift", role: "Trust & Safety", why: "Machine learning fraud detection for marketplace transactions. Buyer fraud, seller fraud, and account takeover detection. The trust layer that protects both sides.", href: "/vendors" }],
        pitfall: "Marketplaces face a unique legal risk: if policy enforcement is inconsistent, sellers can claim discrimination or unfair trade practices. If seller A is suspended for a policy violation but seller B with the same violation isn't, you have liability. Automate policy detection and enforcement to ensure consistency — human discretion should be the exception, not the rule."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["Seller onboarding workflow with identity verification and store setup","Dispute resolution workflow with evidence collection, review, and decision","Seller payout workflow with hold, release, and reserve management","Listing moderation workflow with policy violation detection","Buyer return and refund workflow with marketplace guarantee enforcement"],
        vendors: "Salesforce, custom platforms, Stripe Connect", risk: "Dispute resolution taking 7-14 days and losing both buyer and seller",
        stack: [{ name: "Stripe Connect", role: "Marketplace Payments", why: "Split payments, seller payouts, dispute management, and tax reporting for marketplace transactions. The payment infrastructure that marketplace CX depends on.", href: "/vendors/payments" }],
        pitfall: "Dispute resolution workflows must have hard deadlines or they languish. Set a 48-hour evidence submission window, a 24-hour review SLA, and a 72-hour total resolution target. Disputes that take 2 weeks lose both the buyer and the seller regardless of the outcome."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["Marketplace platform data (listings, orders, seller accounts, buyer accounts)","Payment platform integration (transactions, payouts, holds, disputes)","Seller performance data (ratings, fulfillment metrics, policy violations)","Buyer purchase and dispute history","Product catalog and listing compliance data"],
        vendors: "Custom platform, Stripe Connect, Mirakl, Sharetribe", risk: "Buyer and seller data in separate systems with no unified view",
        stack: [{ name: "Mirakl", role: "Marketplace Platform", why: "Enterprise marketplace platform powering multi-seller operations. Seller management, catalog integration, and order routing. The operational backbone for enterprise marketplace CX.", href: "/vendors" }],
        pitfall: "Marketplace agents need to see both sides of every transaction — the buyer's history AND the seller's history — to make fair dispute decisions. Most marketplace support tools show one side at a time, forcing agents to switch between buyer view and seller view. Build a dispute resolution interface that shows both parties' evidence, history, and account health side by side."
      },
    ],
  },

  "luxury-specialty": {
    name: "Luxury & Specialty", parent: "Retail & eCommerce",
    tagline: "Concierge-style service, product expertise, after-purchase care, and VIP client management.",
    intro: "Luxury retail contact centers are anti-volume. The goal is not efficiency — it's relationship depth. A $5,000 handbag buyer expects a fundamentally different experience than a $50 t-shirt buyer. The CX challenge is delivering concierge-grade service at scale without losing the intimacy that defines luxury.",
    kpis: [
      { metric: "AHT", avg: "9:30", note: "Long by design — luxury service is not optimized for speed" },
      { metric: "FCR", avg: "85%", note: "High — dedicated client advisors with deep product knowledge and authority" },
      { metric: "CSAT", avg: "88%", note: "Highest in retail — the service IS the brand experience" },
      { metric: "Containment", avg: "8%", note: "Very low — luxury clients expect human interaction, not bots" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance", capabilities: ["Client satisfaction tied to purchase frequency and average order value","Client advisor performance — revenue attribution and relationship depth","Product expertise scoring — agents tested on brand knowledge","VIP client risk monitoring — engagement decline signals attrition","Brand voice consistency scoring across all interactions"], vendors: "NICE, Qualtrics, Salesforce", risk: "Service quality declining as brand scales without detection",
        stack: [{ name: "NICE CXone", role: "Quality Management", why: "QA scoring calibrated for luxury — evaluates product knowledge, brand voice, personalization, and relationship building. Speed metrics are intentionally de-weighted.", href: "/vendors/nice-cxone" }],
        pitfall: "Luxury brands apply standard contact center metrics (AHT targets, calls per hour) to concierge interactions and wonder why service quality drops. In luxury, a 15-minute call that results in a $3,000 purchase is better than five 3-minute calls that result in nothing. Measure revenue per interaction and client retention rate, not handle time."
      },
      { layer: 6, name: "Routing & Orchestration", capabilities: ["Named client advisor routing with relationship continuity","Purchase history-aware routing matching clients to product category experts","VIP and top-client priority routing with zero-wait SLA","After-purchase care routing to repair, alteration, and care specialists","Event and appointment routing for in-store experiences and trunk shows"], vendors: "Genesys, NICE CXone, Salesforce", risk: "A top client reaching a general agent who doesn't know their purchase history",
        stack: [{ name: "Genesys Cloud", role: "CCaaS", why: "Named-advisor routing with full client context. When a $50K/year client calls, they reach their dedicated advisor who knows their purchase history, style preferences, and upcoming events.", href: "/vendors/genesys" }],
        pitfall: "Named-advisor routing only works if advisors have manageable client books. If each advisor is assigned 500 clients, the personalization is superficial. True luxury service requires client books of 50-150 per advisor. This is a staffing model decision, not a technology decision — but the technology must support the model."
      },
      { layer: 5, name: "Conversation Management", capabilities: ["Clienteling via personal messaging (WhatsApp, SMS with compliance archival)","Video styling sessions and virtual product presentations","Personalized product recommendations based on purchase history and preferences","After-purchase care communications (care instructions, repair services)","Exclusive event invitations and early access notifications"], vendors: "Tulip, Endear, Salesforce, Unblu", risk: "Personal advisor communications happening on unmonitored channels",
        stack: [{ name: "Tulip", role: "Clienteling", why: "Luxury-focused clienteling platform connecting digital and in-store experiences. Client profiles with purchase history, preferences, and wish lists. Advisors manage client relationships across channels.", href: "/vendors" }, { name: "Endear", role: "Client Outreach", why: "CRM built for retail client outreach. Personalized messaging, lookbooks, and follow-up sequences. Tracks which outreach drives purchases.", href: "/vendors" }],
        pitfall: "Luxury advisors build personal relationships with clients — and those relationships often move to personal channels (personal phone, WhatsApp, Instagram DM). This creates three risks: the brand loses the relationship when the advisor leaves, communications aren't archived for compliance, and the brand has no visibility into client interactions. Deploy compliant personal messaging (Tulip, Endear) that preserves the intimate feel while keeping communications on brand-owned channels."
      },
      { layer: 4, name: "Reasoning & Planning", capabilities: ["Product availability and reservation bots for limited editions","Order and delivery status for high-value purchases","Repair and alteration status tracking","Personal shopping appointment scheduling","Basic brand and product information"], vendors: "Limited use — luxury clients prefer humans", risk: "Bot interaction degrading the luxury experience",
        stack: [{ name: "Minimal AI recommended", role: "—", why: "Luxury clients chose the brand for human craftsmanship and personal service. A chatbot saying 'How can I help you today?' to a client who spends $50,000/year undermines the brand promise. Use AI behind the scenes (agent assist, recommendation engines) — not customer-facing." }],
        pitfall: "The luxury containment target should be near 0%. Every customer interaction is a revenue and relationship opportunity. A bot that deflects a client's call about a repair saves $6 in agent cost and risks $50,000 in lifetime value. AI in luxury belongs in the agent's ear (real-time product knowledge, client preferences, inventory lookup) — not in the client's face."
      },
      { layer: 3, name: "Policy & Guardrails", capabilities: ["Brand voice and communication standards enforcement","Client data privacy and confidentiality controls","PCI compliance for high-value transactions","Anti-counterfeiting and grey market monitoring","International trade compliance for cross-border luxury purchases"], vendors: "Custom brand standards, legal compliance", risk: "Brand voice inconsistency across client advisors",
        stack: [{ name: "Brand-specific training", role: "Standards", why: "Luxury compliance is brand-specific. Chanel's communication standards differ from Hermès which differ from Rolex. The 'guardrails' in luxury are brand guidelines, not generic compliance tools. Invest in advisor training and certification over technology." }],
        pitfall: "Luxury brands obsess over product quality but often neglect service quality consistency. If a client calls the Paris boutique and gets concierge-level service, then calls the U.S. support center and gets a standard retail experience, the brand promise breaks. Global service standards with regional training programs — not just a style guide — are the luxury equivalent of compliance."
      },
      { layer: 2, name: "Workflow Execution", capabilities: ["Made-to-order and customization workflow with client specification capture","Repair and restoration workflow with item tracking and progress updates","Personal shopping workflow with style profile and wish list management","VIP event management workflow with RSVP, preparation, and follow-up","Gift registry and corporate gifting workflow with personalization"], vendors: "Salesforce, custom CRM, Cegid", risk: "High-touch workflows automated into generic processes",
        stack: [{ name: "Salesforce / Custom CRM", role: "Client Management", why: "Luxury CRM must track preferences, sizing, past purchases, gifting history, and personal milestones (birthdays, anniversaries). Most luxury brands build custom CRM on Salesforce with heavily customized data models.", href: "/vendors/ccaas" }],
        pitfall: "Luxury workflows cannot be standardized the way mass retail workflows can. A repair request for a $25,000 watch and a repair request for a $200 pair of shoes need fundamentally different handling — different SLAs, different communication cadence, different escalation paths. Build service-tier workflows, not one-size-fits-all workflows."
      },
      { layer: 1, name: "Data Access", capabilities: ["Client profile with complete purchase history across boutiques and online","Product catalog with specifications, availability, and waitlist status","Inventory across boutiques, warehouses, and partner locations","Client preferences, sizing, style notes, and wish lists","Event and appointment calendar integration"], vendors: "Salesforce, Cegid, custom systems", risk: "Client history in the advisor's head instead of in the system",
        stack: [{ name: "Cegid", role: "Luxury Retail Platform", why: "Retail management platform purpose-built for luxury. Unified commerce, clienteling, and inventory across boutiques. Strong in European luxury houses.", href: "/vendors" }],
        pitfall: "The biggest data risk in luxury retail: client knowledge lives in the advisor's personal notebook, not in the CRM. When an advisor leaves, the brand loses 10 years of client relationship knowledge — sizing preferences, gift history, personal milestones, and style notes. Mandate CRM documentation as a performance requirement, not an optional task. The advisor's notebook belongs to the brand."
      },
    ],
  },

  "grocery-delivery": {
    name: "Grocery & Delivery", parent: "Retail & eCommerce",
    tagline: "Substitutions, delivery windows, order modifications, refunds, and real-time logistics.",
    intro: "Grocery and delivery contact centers operate in real-time. A customer who discovers a substitution they don't want, a late delivery, or a missing item needs resolution now — not in 24 hours. The CX challenge is speed and accuracy under pressure, with thin margins that make every unnecessary support interaction a direct hit to profitability.",
    kpis: [
      { metric: "AHT", avg: "3:40", note: "Very fast — issues are concrete (wrong item, missing item, late delivery)" },
      { metric: "FCR", avg: "82%", note: "High — most issues resolved with refund or credit" },
      { metric: "CSAT", avg: "73%", note: "Lower — delivery delays and substitutions suppress satisfaction regardless of support quality" },
      { metric: "Containment", avg: "42%", note: "Highest in retail — refunds, credits, and status checks are highly automatable" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance", capabilities: ["Substitution acceptance rate analytics by product category","Delivery accuracy and on-time performance tracking","Refund and credit cost analytics with root cause (picker error, driver, inventory)","Customer cohort analysis — single-order vs repeat vs subscriber","Shopper and driver performance correlation with customer satisfaction"], vendors: "Custom analytics, NICE, Looker", risk: "Refund costs escalating without visibility into root cause",
        stack: [{ name: "Looker / custom BI", role: "Operational Analytics", why: "Grocery CX analytics are operational analytics. Substitution rates, delivery accuracy, and refund costs must be analyzed at the SKU, store, and shopper level. Standard CX analytics tools don't have the grocery data model.", href: "/vendors" }],
        pitfall: "Grocery refund costs can consume 3-5% of revenue if unchecked. The root cause is usually upstream — bad inventory data causing substitutions, picker errors selecting wrong items, or driver issues causing damage. The contact center processes the refund but rarely feeds the data back to operations. Build a closed loop: every refund reason code should generate an operational alert to the team that caused the issue."
      },
      { layer: 6, name: "Routing & Orchestration", capabilities: ["Real-time order modification routing during active shopping/delivery","Post-delivery issue routing (missing items, substitutions, quality)","Subscription/recurring order management routing","Driver and shopper issue routing for gig worker support","Priority routing for time-sensitive delivery window issues"], vendors: "Zendesk, Intercom, custom platforms", risk: "Real-time order issues reaching support after the delivery is complete",
        stack: [{ name: "Zendesk / Intercom", role: "Support Platform", why: "Fast-response platforms with in-app messaging. Grocery support must be accessible during the delivery experience — not after. In-app support during active orders is the minimum.", href: "/vendors" }],
        pitfall: "Grocery support has a time dimension that most retail support doesn't. A customer who messages 'please don't substitute organic eggs' needs that message to reach the shopper BEFORE they finish picking the order. Routing support messages to an agent who then relays to the shopper is too slow. Build direct customer-to-shopper communication for in-progress orders and reserve agent support for post-delivery issues."
      },
      { layer: 5, name: "Conversation Management", capabilities: ["In-app messaging during active order with real-time shopper communication","Delivery status notifications with live driver tracking","Post-delivery feedback and issue reporting with photo evidence","Substitution approval/rejection flow during shopping","Proactive delay notifications with updated delivery windows"], vendors: "Custom in-app, Twilio, Zendesk", risk: "Customer discovering substitutions only at delivery with no recourse",
        stack: [{ name: "Twilio", role: "Communications Platform", why: "Powers the real-time messaging between customers, shoppers, and drivers. SMS notifications, in-app chat, and delivery updates. The communication infrastructure layer.", href: "/vendors" }],
        pitfall: "Proactive substitution approval is the single highest-impact CX feature in grocery delivery. When the shopper can't find organic eggs and selects conventional eggs as a substitute, the customer should be notified in real-time and given the option to approve, reject, or suggest an alternative. Platforms that deliver surprise substitutions generate 3x more refund requests and 2x more support contacts."
      },
      { layer: 4, name: "Reasoning & Planning", capabilities: ["Missing/wrong item report bots with instant refund or credit","Delivery status bots with real-time tracking","Order modification bots for adding items or changing delivery windows","Substitution preference bots learning customer replacement preferences","Recurring order management bots for subscription grocery"], vendors: "Ada, custom bots, Intercom", risk: "Bot issuing refunds without fraud controls",
        stack: [{ name: "Ada / custom", role: "AI Agent", why: "Instant resolution for missing items and quality issues. Customer reports missing avocados → bot verifies order contained avocados → instant credit issued. No agent involvement for clear-cut cases.", href: "/vendors/iva" }],
        pitfall: "Grocery refund bots must have fraud limits. A customer who reports 'missing items' on every order is likely committing fraud. Set per-customer refund thresholds — after $X in refunds within Y days, flag the account for human review. Without limits, a small percentage of customers will systematically abuse automated refunds and cost you more than the bot saves."
      },
      { layer: 3, name: "Policy & Guardrails", capabilities: ["Refund and credit policy automation with per-customer limits","Food safety communication protocols for recalls and contamination","Age verification for alcohol delivery","Tipping and rating fairness policies for gig workers","Data privacy for delivery address and household information"], vendors: "Custom policies, age verification APIs", risk: "Unlimited automated refunds enabling systematic fraud",
        stack: [{ name: "Custom fraud controls", role: "Refund Guardrails", why: "Grocery platforms must build custom refund abuse detection because off-the-shelf fraud tools aren't designed for $8 avocado claims. Per-customer refund velocity, photo evidence requirements above certain thresholds, and account review triggers.", href: "/vendors" }],
        pitfall: "Alcohol delivery creates a unique compliance requirement: age verification at delivery. If the driver doesn't verify and the customer is underage, the platform has liability. But age verification creates delivery friction — the customer must be home and present ID. Communicate the requirement clearly before checkout and during delivery tracking. The compliance requirement shouldn't be a surprise at the door."
      },
      { layer: 2, name: "Workflow Execution", capabilities: ["Real-time order modification workflow during active shopping","Refund and credit issuance workflow with root cause tagging","Substitution management workflow with preference learning","Delivery rescheduling workflow with window availability check","Recurring order workflow with pause, skip, and modification"], vendors: "Custom platforms, Shopify, Instacart Platform", risk: "Order modification requests not reaching shoppers in time",
        stack: [{ name: "Custom / Instacart Platform", role: "Grocery Operations", why: "Grocery delivery workflows are unique enough that most platforms build custom. Instacart's white-label platform serves retailers who want the technology without building it.", href: "/vendors" }],
        pitfall: "The most common grocery workflow failure: a customer messages 'please remove the milk' but the message reaches the support agent, not the shopper. The shopper has already picked and paid for the milk. Now the customer has milk they don't want and a support ticket to process. Real-time order modification must flow directly to the active shopper session."
      },
      { layer: 1, name: "Data Access", capabilities: ["Order management system with real-time order status and shopper assignment","Inventory management with store-level product availability","Delivery logistics with driver location and ETA","Customer order history with substitution preferences and refund history","Product catalog with pricing, descriptions, and allergen information"], vendors: "Custom OMS, Shopify, Instacart, DoorDash Drive", risk: "Inventory data not reflecting actual store shelf availability",
        stack: [{ name: "Custom OMS / Platform", role: "Order Data", why: "Grocery delivery OMS must track orders through: placed → assigned to shopper → being picked → substitutions made → checked out → assigned to driver → in transit → delivered. Each state has different support implications.", href: "/vendors" }],
        pitfall: "Grocery inventory data is the most inaccurate in all of retail. A store's system says 'in stock' but the shelf is empty. The shopper can't find the item and makes a substitution the customer doesn't want. The entire substitution problem is an inventory accuracy problem. Platforms that invest in real-time shelf-level inventory (camera-based, RFID) see 40-60% fewer substitutions and proportionally fewer support contacts."
      },
    ],
  },
};

export const getRetailSubVertical = (slug) => retailSubVerticals[slug];
export const getAllRetailSubVerticalSlugs = () => Object.keys(retailSubVerticals);
