// Case-study content. Plain data only (no asset imports) so the sitemap script
// can read it in Node; images are mapped by slug in components/caseStudies/images.js.
// Only describe what was delivered: no revenue, traffic or performance figures.
export const CASE_STUDIES = [
  {
    slug: 'vstitch-by-anjali-nanda',
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
    seo: {
      title: 'VStitch E-Commerce Case Study | React, Python & PostgreSQL | WebNest Studio',
      description: 'See how WebNest Studio engineered VStitch using React, Python, PostgreSQL, Razorpay, vector capabilities, Resend, automated PDF invoices and custom dress workflows.',
    },
  },
]

export function getCaseStudy(slug) {
  return CASE_STUDIES.find((item) => item.slug === slug) || null
}
