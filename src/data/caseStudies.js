// Case-study content. Plain data only (no asset imports) so the sitemap script
// can read it in Node; images are mapped by slug in components/caseStudies/images.js.
// Only describe what was delivered: no revenue, traffic or performance figures.
export const CASE_STUDIES = [
  {
    slug: 'vstitch-by-anjali-nanda',
    status: 'Delivered',
    title: 'VStitch by Anjali Nanda',
    client: 'VStitch by Anjali Nanda',
    category: 'Fashion E-Commerce / Custom Commerce Platform',
    badge: 'Fashion E-Commerce',
    liveUrl: 'https://www.vstitchbyanjalinanda.com',
    imageAlt: 'VStitch by Anjali Nanda storefront home page showing the new collection hero, navigation and shopping bag',
    description: 'A full-stack fashion commerce platform engineered with React, Python and PostgreSQL, integrating secure payments, customized dress workflows, transactional emails, automated PDF invoices and a scalable backend architecture.',
    technologies: ['React', 'Python', 'PostgreSQL', 'Vector Search', 'Razorpay', 'Resend'],
    hero: {
      h1: 'VStitch by Anjali Nanda — Custom Fashion E-Commerce Engineering Case Study',
      headline: 'Engineering a Custom Fashion Commerce Platform Beyond the Storefront',
      description: 'WebNest Studio engineered VStitch as a full-stack fashion commerce platform using React, Python and PostgreSQL — combining customized dress workflows, secure payment processing, transactional communication, automated invoice generation and a scalable architecture designed for future expansion.',
      technologies: ['React', 'Python', 'PostgreSQL', 'Vector Search', 'Razorpay', 'Resend', 'PDF Generation'],
    },
    challenge: {
      heading: 'The Challenge',
      paragraphs: [
        'VStitch required more than a conventional e-commerce storefront.',
        'The platform needed to manage the complete customer journey — from product discovery and customized dress requirements to checkout, payment verification, order processing, customer communication and invoice generation.',
        'The architecture also needed to remain maintainable and extensible so additional capabilities could be introduced in Phase 2 without rebuilding the core platform.',
      ],
      summary: [
        { label: 'Challenge', text: 'Build a flexible fashion commerce experience.' },
        { label: 'Approach', text: 'Separate experience, business logic, data and external services.' },
        { label: 'Outcome', text: 'A modular full-stack commerce architecture ready for continued expansion.' },
      ],
    },
    architecture: {
      heading: 'Under the Hood',
      subheading: 'The architecture powering VStitch beyond the customer-facing storefront.',
      layers: [
        { name: 'React Frontend', items: ['Product discovery', 'Product detail', 'Customization', 'Cart', 'Checkout', 'Responsive experience'] },
        { name: 'API Security Layer', items: ['Authentication', 'Authorization', 'Input validation', 'Rate limiting', 'Protected endpoints'] },
        { name: 'Python Backend', items: ['REST APIs', 'Business rules', 'Order orchestration', 'Payment workflows', 'Service integrations'] },
        { name: 'Performance & Reliability', items: ['Caching', 'Idempotency', 'Duplicate request protection', 'Error handling', 'Logging'] },
        { name: 'PostgreSQL + Vector Layer', items: ['Customer data', 'Products', 'Orders', 'Payments', 'Customization', 'Invoice metadata', 'Vector capabilities'] },
        { name: 'External Services', items: ['Razorpay', 'Resend', 'PDF generation'] },
      ],
    },
    // Each feature renders as a headed section with prose and, optionally, a step flow.
    features: [
      {
        id: 'journey',
        heading: 'From Product Discovery to Fulfilment',
        paragraphs: [
          'VStitch was engineered as one interconnected commerce workflow rather than a set of disconnected website features. Each step hands its result to the next, so an order carries its customization, payment and invoice with it all the way to fulfilment.',
        ],
        steps: ['Product Discovery', 'Product Detail', 'Dress Customization', 'Cart', 'Checkout', 'Order Creation', 'Payment', 'Payment Verification', 'Database Update', 'Invoice Generation', 'Transactional Email', 'Fulfilment'],
      },
      {
        id: 'customization',
        heading: 'Commerce That Supports Customization',
        paragraphs: [
          'A key VStitch requirement was supporting customers who buy customized dresses, rather than treating every purchase as a standard SKU transaction.',
          'Customization information is part of the order workflow, not an isolated field on a product page. The requirements a customer provides are associated with the order itself, travel with it through payment, and are still attached when the order reaches the people who make the garment.',
        ],
        steps: ['Select Product', 'Choose Customization', 'Provide Requirements', 'Associate Requirements with Order', 'Payment', 'Preserve Customization for Fulfilment'],
      },
      {
        id: 'payments',
        heading: 'Payments Designed Around Transaction Integrity',
        paragraphs: [
          'Payments run through Razorpay. The order is created on the backend before payment starts, and the result of the payment is verified by the backend before anything that depends on it — the order status change, the invoice, the customer email — is allowed to run.',
        ],
        highlight: 'Frontend payment success is not treated as the authoritative transaction state.',
        steps: ['Customer Checkout', 'Order Created', 'Payment Initiated', 'Razorpay', 'Backend Verification', 'Order Status Updated', 'Invoice Generated', 'Customer Notified'],
      },
      {
        id: 'idempotency',
        heading: 'Preventing Duplicate Transactions',
        paragraphs: [
          'Real checkouts are messy: customers double-click the pay button, networks retry requests, and external systems can resend the same event. Without safeguards, any of these could produce a duplicate order, a duplicate transaction, a second invoice or a repeated email.',
          'Critical operations are therefore tied to a unique transaction reference. If a request with that reference has already been processed, the existing result is returned; only a genuinely new request is processed and persisted. This matters most around payment and order workflows, where repeating an operation has a direct cost to the customer.',
        ],
        steps: ['Request', 'Idempotency Key / Unique Transaction Reference', 'Already Processed?', 'Yes: Return Existing Result', 'No: Process, Persist, Respond'],
      },
      {
        id: 'security',
        heading: 'Security Beyond the Frontend',
        paragraphs: [
          'Frontend restrictions are never treated as sufficient protection for sensitive backend operations. Every request that changes data is checked again on the server.',
          'Public APIs receive traffic from genuine customers, bots, accidental request loops and malicious clients alike. Incoming requests are identified and checked against a rate limit before they reach application logic, and sensitive endpoints use stricter policies than ordinary read operations.',
        ],
        cards: [
          { title: 'Authentication', text: 'Who is making the request?' },
          { title: 'Authorization', text: 'Is the user permitted to perform the operation?' },
          { title: 'Server-Side Validation', text: 'Can this input be trusted?' },
          { title: 'Payment Verification', text: 'Has the transaction actually been verified?' },
        ],
        steps: ['Incoming Request', 'Client / Request Identification', 'Rate Limit Check', 'Allowed: API Processing', 'Not Allowed: Throttle / Reject'],
      },
      {
        id: 'performance',
        heading: 'Performance Without Unnecessary Database Work',
        paragraphs: [
          'Information that is requested often and changes rarely is served from a cache instead of repeating the same database work on every request. A cache hit returns immediately; a miss reads from the database, stores the result and then responds.',
          'Cached data is invalidated when the underlying record changes, so customers do not see stale product or order information.',
        ],
        steps: ['Request', 'Cache Lookup', 'Hit: Respond', 'Miss: Read Database', 'Update Cache', 'Respond'],
      },
      {
        id: 'data',
        heading: 'Structured Commerce Data',
        paragraphs: [
          'Commerce data is relational by nature: a customer places an order, the order contains items, each item refers to a product and may carry customization, and the order is linked to a payment and an invoice. PostgreSQL was selected because it enforces those relationships and keeps transactional data consistent.',
          'Alongside the relational data, vector capabilities provide a foundation for semantic retrieval and future intelligent experiences. PostgreSQL handles the deterministic transactional information; the vector layer prepares the platform for similarity and context-based features as they are introduced.',
        ],
        steps: ['Customer', 'Order', 'Order Items', 'Product + Customization', 'Payment', 'Invoice'],
      },
      {
        id: 'automation',
        heading: 'From Transaction to Invoice and Email — Automatically',
        paragraphs: [
          'Transactional communication is connected to application events. When a business event occurs, the Python backend gathers the customer and order context, generates the message and sends it through Resend.',
          'Invoices are produced the same way. After a successful order, the backend reads the customer, order and payment records, generates the invoice as a PDF, associates it with the order and delivers it to the customer. Invoice details come from the authoritative transaction data rather than being typed in again by hand.',
        ],
        steps: ['Successful Order', 'Retrieve Customer, Order and Payment Data', 'Generate Invoice', 'Create PDF', 'Associate with Order', 'Send via Resend', 'Customer'],
      },
    ],
    engineeringChallenges: [
      { title: 'Payment Integrity', text: 'Synchronizing application order state with external payment processing.' },
      { title: 'Customization', text: 'Preserving customer-specific dress requirements throughout the order lifecycle.' },
      { title: 'Duplicate Operations', text: 'Designing critical workflows around idempotency and duplicate-event protection.' },
      { title: 'API Protection', text: 'Using authentication, authorization, validation and rate-limiting principles.' },
      { title: 'Performance', text: 'Reducing unnecessary processing through appropriate caching and optimized data access.' },
      { title: 'Automation', text: 'Connecting orders with transactional emails and PDF invoice generation.' },
      { title: 'Data Integrity', text: 'Maintaining relationships between customers, products, customization, orders, payments and invoices.' },
      { title: 'Extensibility', text: 'Keeping the architecture modular enough to support Phase 2.' },
    ],
    stack: [
      { area: 'Frontend', items: ['React'] },
      { area: 'Backend', items: ['Python'] },
      { area: 'Database', items: ['PostgreSQL'] },
      { area: 'Intelligence Layer', items: ['Vector capabilities'] },
      { area: 'Payments', items: ['Razorpay'] },
      { area: 'Transactional Email', items: ['Resend'] },
      { area: 'Documents', items: ['PDF generation engine'] },
      { area: 'Architecture', items: ['REST / API-driven modular architecture'] },
      { area: 'Security', items: ['Authentication', 'Authorization', 'Validation', 'Rate limiting'] },
      { area: 'Reliability', items: ['Caching', 'Idempotency', 'Duplicate-event protection'] },
    ],
    learned: {
      heading: 'What This Project Reinforced',
      paragraphs: [
        'Building VStitch reinforced an important engineering principle for our team: a modern e-commerce platform is much more than the storefront customers see.',
        'Behind every successful checkout are interconnected systems responsible for data integrity, payments, order state, customization, security, communication, documents and fulfilment.',
        'Engineering these systems as part of one architecture creates a much stronger foundation than treating them as isolated integrations.',
      ],
    },
    futurePhase: {
      badge: 'Phase 2 — Coming Next',
      heading: "What's Next",
      paragraphs: [
        'VStitch was designed with continued expansion in mind.',
        'The modular React, Python and PostgreSQL architecture allows additional commerce, automation, intelligence and customer-experience capabilities to be introduced progressively without rebuilding the core platform.',
      ],
      cta: 'Follow WebNest Studio for the next engineering update.',
    },
    learnLinks: [
      { to: '/learn/react', label: 'React tutorial' },
      { to: '/learn/python', label: 'Python tutorial' },
      { to: '/learn/postgresql', label: 'PostgreSQL tutorial' },
      { to: '/learn/database-design', label: 'Database design tutorial' },
    ],
    relatedServices: ['/software-development-company-gurugram', '/services/web-development', '/ai-development-company-india'],
    seo: {
      title: 'VStitch E-Commerce Case Study | React, Python & PostgreSQL | WebNest Studio',
      description: 'See how WebNest Studio engineered VStitch using React, Python, PostgreSQL, Razorpay, vector capabilities, Resend, automated PDF invoices and custom dress workflows.',
    },
  },
  {
    slug: 'divine-vision-infratech',
    status: 'Delivered',
    title: 'Divine Vision Infratech',
    client: 'Divine Vision Infratech Pvt. Ltd.',
    category: 'Real Estate Technology / Transactional Platform',
    badge: 'Real Estate Platform',
    liveUrl: 'https://www.divinevisioninfra.com/',
    imageAlt: 'Divine Vision Infratech website showing its plotted township experience and site visit call to action',
    description: 'A delivered real estate platform combining a React website, online plot reservations, payment verification, an AI concierge, and operational portals for management and field staff.',
    technologies: ['React', 'Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'Razorpay', 'Google Gemini', 'Whisper', 'WhatsApp Business API'],
    hero: {
      h1: 'Divine Vision Infratech - Engineering a Transactional Real Estate Platform',
      headline: 'From a project brochure to a digital journey from discovery to reservation',
      description: 'WebNest Studio delivered a platform for Divine Vision Infratech that connects public project information, plot inventory, online booking, verified payments, buyer conversations, and staff operations. The project moved beyond a marketing website to support real workflows for buyers and the teams serving them.',
      technologies: ['React', 'FastAPI', 'PostgreSQL + pgvector', 'Razorpay', 'Gemini', 'Whisper', 'WhatsApp Business API'],
    },
    challenge: {
      heading: 'The Challenge',
      paragraphs: [
        'Divine Vision Infratech has developed residential and commercial projects along the NH-1 corridor in Haryana since 2005. Its previous WordPress and Elementor site presented project information, but the buying and sales processes still depended on offline conversations and manual coordination.',
        'Important details such as RERA registration, plot sizes, plot counts, and location were difficult for buyers to find. Enquiries depended on static forms or a generic chat widget, while reservations required a site visit and paperwork. Inventory, leads, visits, and staff activity had no shared operational record.',
        'The brief called for a clear public website and a connected platform where buyers could explore active townships, ask questions, arrange a visit, and reserve a plot online, while management and field teams could work from current records.',
      ],
      summary: [
        { label: 'Challenge', text: 'Connect project discovery, plot booking, and sales operations.' },
        { label: 'Approach', text: 'Deliver one platform for buyers, payments, AI, and staff workflows.' },
        { label: 'Status', text: 'Delivered and live, with post-launch support in place.' },
      ],
    },
    architecture: {
      heading: 'How the Platform Fits Together',
      subheading: 'The public website, transactional services, data, AI retrieval, and provider integrations support one buyer and operations journey.',
      layers: [
        { name: 'React Website', items: ['Project information', 'RERA and plot details', 'Site visit scheduling', 'Plot selection', 'Responsive experience'] },
        { name: 'FastAPI Application', items: ['Booking workflows', 'Inventory holds', 'Payment verification', 'Lead and visit records', 'Admin and employee operations'] },
        { name: 'PostgreSQL Data Layer', items: ['Projects', 'Plot inventory', 'Bookings', 'Payments', 'KYC records', 'Leads and visits'] },
        { name: 'AI Retrieval and Conversation', items: ['Project information retrieval', 'pgvector', 'Gemini tool calling', 'Whisper voice input', 'WhatsApp conversations'] },
        { name: 'External Services', items: ['Razorpay', 'WhatsApp Business API', 'Licensed identity and signing providers'] },
      ],
    },
    features: [
      {
        id: 'discovery-and-planning',
        heading: 'Requirements Before Screens',
        paragraphs: [
          'The engagement began with buyer-journey mapping, an operational review, and requirements sessions with the Divine Vision team. The work was organized into three phases: a transactional foundation, an intelligence layer, and later automation and CRM improvements.',
          'A formal requirements freeze in August 2026 established SRS v2.0 as the build baseline. It included operational needs that are easy to miss in a public website brief: recording offline and cash payments, configuring notification rules, and keeping an audit trail. New ideas after the freeze could be handled as documented changes instead of silently expanding the build scope.',
          'The design process explored multiple distinct landing-page concepts before the client selected a direction. The final experience pairs a premium visual presentation with practical buyer information such as approvals, plot details, and location.',
        ],
        steps: ['Map buyer and staff journeys', 'Document functional requirements', 'Agree phase boundaries', 'Freeze SRS v2.0', 'Design and build against the baseline'],
      },
      {
        id: 'project-discovery',
        heading: 'Project Information Buyers Can Find',
        paragraphs: [
          'The website introduces the company and the communities it has developed, then directs attention to the townships currently selling. Project pages surface registration details, plot sizes, plot counts, and location information so buyers can compare the facts that matter before contacting the sales team.',
          'Location content and nearby landmarks help visitors understand where a project sits along the corridor. A project timeline presents the company\'s earlier communities, while project tours give visitors a preview of the entrance, clubhouse, roads, parks, and township layout.',
          'Visitors can arrange a site visit or continue through call, WhatsApp, and directions links. The React frontend replaces the previous page-builder experience and provides a responsive base for the interactive booking journey.',
        ],
        steps: ['Explore current townships', 'Review registration and plot details', 'Understand location and amenities', 'Choose a site visit or continue to booking'],
      },
      {
        id: 'plot-booking',
        heading: 'Online Plot Booking and Inventory Control',
        paragraphs: [
          'The booking flow connects plot selection to a reservation rather than treating an enquiry as a completed conversion. The inventory grid shows each plot as available, on hold, or sold, with pricing. A buyer can select more than one plot in a booking.',
          'A hold protects a plot while a buyer completes the payment step, reducing the chance that two buyers reserve the same unit at the same time. The booking process also supports digital Aadhaar and PAN document uploads. The source requirements specify scannable UIDAI Secure QR validation for Aadhaar documents.',
          'After a booking is completed, the platform generates the associated application and allotment paperwork as a PDF. Regulated e-KYC, electronic signing, and e-stamping steps are intended to use licensed providers rather than being recreated inside the application.',
        ],
        steps: ['Select one or more plots', 'Place an inventory hold', 'Submit buyer details and KYC documents', 'Start the token payment', 'Verify payment server-side', 'Confirm the booking and generate its documents'],
      },
      {
        id: 'payment-integrity',
        heading: 'Payment State Is Verified by the Backend',
        paragraphs: [
          'Razorpay handles token payments. The browser can report that a payment interaction completed, but that client-side signal is not treated as proof that the transaction succeeded. The backend verifies the gateway result through its webhook flow before the booking is confirmed.',
          'This ordering matters because inventory, booking status, and generated documents depend on the payment state. Keeping confirmation on the server helps prevent a modified browser request or an interrupted redirect from being treated as a successful payment.',
          'The case study source describes end-to-end testing in Razorpay test mode for multi-plot bookings, document uploads, payment capture, and inventory locking. Each step was checked against the backend API, and issues found during QA were fixed and re-verified before launch.',
        ],
        highlight: 'A successful browser redirect is not the authoritative payment record; the verified gateway event is.',
        steps: ['Create the booking and hold inventory', 'Initiate payment through Razorpay', 'Receive and verify the gateway event', 'Update the booking state', 'Generate the booking documents'],
      },
      {
        id: 'divine-assist',
        heading: 'Divine Assist, a Grounded AI Concierge',
        paragraphs: [
          'Instead of a static lead form, the public experience uses Divine Assist for buyer enquiries. The assistant is designed to answer questions about projects, pricing, registration status, and location using Divine Vision information retrieved from PostgreSQL with pgvector. Grounding answers in source content gives the team a way to check responses against the underlying project information.',
          'The assistant can qualify a conversation by budget, unit type, and purchase timeline, then use tools to arrange a site visit. It can also share a project location through WhatsApp and record where an enquiry originated, giving sales staff context about the lead.',
          'Google Gemini provides the language-model reasoning and tool-calling capability. Self-hosted, open-source Whisper handles voice input. The design supports escalation to a human for high-intent enquiries rather than expecting automation to handle every conversation.',
        ],
        steps: ['Receive a website or WhatsApp enquiry', 'Retrieve relevant project information', 'Answer or ask a qualifying question', 'Use a tool to arrange a site visit when requested', 'Record lead context or escalate to staff'],
      },
      {
        id: 'management-operations',
        heading: 'An Admin Portal for the Operating Record',
        paragraphs: [
          'The admin portal brings project and plot inventory, bookings, payment records, customer KYC documents, AI-generated leads, and offline or cash payments into one operational workspace. This lets management see in-person transactions alongside online bookings instead of maintaining separate records.',
          'A notification rules engine supports automated updates, while an audit trail records sensitive administrative changes. Together, these functions make the platform useful after the public website has introduced a buyer: the team can follow the booking and its associated records through the operational process.',
        ],
        steps: ['Maintain project and plot inventory', 'Review bookings and payment records', 'Record offline transactions', 'Manage enquiries and documents', 'Trace sensitive changes in the audit log'],
      },
      {
        id: 'employee-portal',
        heading: 'Field Sales and Visit Ownership',
        paragraphs: [
          'The employee portal models how site visits are handled by the field team. Staff can record a visit with visitor details and the property shown. The associated lead is assigned to that employee for a three-day window and hidden from colleagues during that period; if no follow-up occurs, it returns to the shared pool automatically.',
          'This explicit ownership window is intended to reduce disputes about lead responsibility while preventing an inactive lead from remaining locked indefinitely. Attendance and leave management are also included, giving staff a single portal for these day-to-day tasks.',
        ],
        steps: ['Record a visitor and the property shown', 'Assign the lead to the employee for three days', 'Follow up during the ownership window', 'Release the lead automatically if it remains inactive'],
      },
      {
        id: 'quality-and-security',
        heading: 'Testing Sensitive and Transactional Flows',
        paragraphs: [
          'The platform handles payments and identity documents, so the delivery included a security and quality review against the frozen requirements. The two-person QA team tested the specified flows, including document uploads, payment capture, multi-plot booking, and inventory locking.',
          'The documented controls include server-side payment verification, access-controlled customer documents, separate access for customer, staff, and admin roles, and an audit trail for administrative changes. Steps such as regulated e-KYC and electronic signing are designed to be performed through licensed providers.',
          'Testing used Razorpay test mode before launch. The team checked state through backend APIs rather than relying only on what the browser displayed, then logged, fixed, and re-verified issues before go-live.',
        ],
        cards: [
          { title: 'Payment verification', text: 'Confirm gateway events on the backend before changing booking state.' },
          { title: 'Role-based access', text: 'Separate customer, employee, and administrator permissions.' },
          { title: 'Document access', text: 'Restrict access to customer identity documents.' },
          { title: 'Auditability', text: 'Record sensitive administrative changes.' },
        ],
      },
    ],
    engineeringChallenges: [
      { title: 'Inventory Concurrency', text: 'Hold a plot during checkout so competing booking attempts do not reserve the same unit.' },
      { title: 'Payment Authority', text: 'Use a verified server-side gateway event to determine whether a booking is paid.' },
      { title: 'Buyer Data Handling', text: 'Support document uploads while keeping access to identity records controlled.' },
      { title: 'Human and AI Handoffs', text: 'Use project-grounded responses, site-visit tools, lead context, and escalation to staff.' },
      { title: 'Offline Operations', text: 'Record cash and in-person payments in the same operational system as online activity.' },
      { title: 'Lead Ownership', text: 'Make employee assignment visible and time-bound so inactive leads return to the team pool.' },
      { title: 'Requirements Control', text: 'Use a frozen SRS and documented change requests to manage scope across parallel build tracks.' },
      { title: 'Auditability', text: 'Keep an audit trail for sensitive changes in an application that manages bookings and payments.' },
    ],
    stack: [
      { area: 'Website and portals', items: ['React'] },
      { area: 'Backend APIs', items: ['Python', 'FastAPI'] },
      { area: 'Transactional and retrieval data', items: ['PostgreSQL', 'pgvector'] },
      { area: 'Payments', items: ['Razorpay', 'Verified webhooks'] },
      { area: 'AI reasoning', items: ['Google Gemini', 'Tool calling', 'Retrieval-augmented responses'] },
      { area: 'Voice input', items: ['Self-hosted Whisper'] },
      { area: 'Messaging', items: ['WhatsApp Business API'] },
      { area: 'Access and traceability', items: ['JWT authentication', 'Role-based access', 'Audit trail'] },
    ],
    learned: {
      heading: 'What This Project Demonstrates',
      paragraphs: [
        'A real estate platform is not only a collection of project pages. Once a visitor can reserve inventory and pay online, the design must account for concurrent booking attempts, payment authority, document access, and the records that sales and management use afterward.',
        'The project also shows how an AI assistant can be connected to a specific business workflow. Retrieval gives the assistant project information to work from; tools let it arrange a visit or share a location; and staff escalation keeps a human in the loop for conversations that need one.',
        'Finally, an agreed requirements baseline and clearly separated operational roles help the public website, booking services, and internal portals move forward as parts of one delivery.',
      ],
    },
    futurePhase: {
      badge: 'Delivered Platform',
      heading: 'Planned Improvements',
      paragraphs: [
        'The delivered platform is live, with ongoing maintenance and support. The roadmap in the project brief identifies a Zoho CRM integration for Divine Assist and the lead pipeline, PAN verification in the KYC flow, and deeper analytics on enquiry sources and project demand.',
        'These are follow-on improvements, not claims that they are already in production.',
      ],
      cta: 'Explore the live platform or contact WebNest Studio to discuss a similar project.',
    },
    learnLinks: [
      { to: '/learn/react', label: 'React tutorial' },
      { to: '/learn/python', label: 'Python tutorial' },
      { to: '/learn/postgresql', label: 'PostgreSQL tutorial' },
      { to: '/learn/database-design', label: 'Database design tutorial' },
    ],
    relatedServices: ['/software-development-company-gurugram', '/services/web-development', '/ai-development-company-india'],
    seo: {
      title: 'Divine Vision Infratech Case Study | Real Estate Platform | WebNest Studio',
      description: 'A technical case study of the Divine Vision Infratech platform: online plot booking, Razorpay payment verification, AI-assisted enquiries, PostgreSQL, FastAPI, and staff operations.',
    },
  },
]

export function getCaseStudy(slug) {
  return CASE_STUDIES.find((item) => item.slug === slug) || null
}
