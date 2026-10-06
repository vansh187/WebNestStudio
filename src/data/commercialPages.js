// Commercial service landing pages. Plain data (no imports) so the sitemap script
// can read it in Node. Every proof point must describe work that actually exists:
// a published case study, or WebNest's own platform (this website, its Python API,
// the lead pipeline, client portal and AI project planner). No invented clients,
// figures, ratings or results.
export const COMMERCIAL_PAGES = [
  {
    path: '/software-development-company-gurugram',
    slug: 'software-development-gurugram',
    navLabel: 'Software Development',
    serviceType: 'Custom software development',
    areaServed: ['Gurugram', 'Delhi NCR', 'India'],
    seo: {
      title: 'Software Development Company in Gurugram, India',
      description: 'WebNest Studio is a software development company in Gurugram building custom web applications, APIs and databases with React, Java, Spring Boot and Python.',
    },
    eyebrow: 'Custom software · Gurugram, Haryana',
    h1: 'Software Development Company in Gurugram',
    lead: 'We design and build custom web applications, backend APIs and databases for businesses that have outgrown spreadsheets, disconnected tools or an off-the-shelf product that no longer fits how they work.',
    support: 'WebNest Studio is based in Gurugram and works with businesses across Delhi NCR, the rest of India and remote clients. One team handles the interface, the API, the database and the deployment, so the parts are designed to work together from the first release.',
    problems: {
      heading: 'What businesses usually come to us with',
      items: [
        { title: 'Work that lives in spreadsheets and chat threads', text: 'Orders, bookings, approvals or client updates are tracked by hand in several places. Data gets typed in twice, status is unclear, and nobody has one reliable view of what is happening.' },
        { title: 'A website that needs to become an application', text: 'A marketing site worked at launch, but customers now need accounts, payments, uploads or a portal. Bolting these onto a template creates fragile code and security gaps.' },
        { title: 'Systems that do not talk to each other', text: 'The payment gateway, email provider, invoicing and internal records each hold part of the truth. Without an integration layer, reconciling them is manual and error-prone.' },
        { title: 'An existing product that is hard to change', text: 'Every new feature breaks something else, deployments are risky, and the original developers are no longer available. The business needs a codebase it can keep building on.' },
      ],
    },
    capabilities: {
      heading: 'What we build',
      items: [
        { title: 'Web applications', text: 'React interfaces for customers, staff and administrators, with role-based screens, forms with validation, and layouts that work on phones as well as desktops.' },
        { title: 'Backend APIs', text: 'REST APIs in Java with Spring Boot or in Python with FastAPI, structured around your business rules rather than around database tables.' },
        { title: 'Databases and data models', text: 'PostgreSQL and MySQL schemas designed for the relationships in your data: customers, orders, payments, documents and audit history.' },
        { title: 'Integrations', text: 'Payment gateways such as Razorpay, transactional email, PDF generation, and third-party APIs connected through a backend that verifies results instead of trusting the browser.' },
        { title: 'Customer and client portals', text: 'Signed-in areas where your customers can see their orders, project status or documents without having to email you for an update.' },
        { title: 'Modernising an existing system', text: 'Reviewing an existing codebase, stabilising what matters, and replacing the riskiest parts in stages instead of an all-at-once rewrite.' },
      ],
    },
    engineering: {
      heading: 'How we engineer it',
      intro: 'Most problems in custom software come from decisions that are invisible on the screen. These are the ones we make deliberately on every project.',
      items: [
        { title: 'Architecture', text: 'We separate the interface, business logic, data and external services so each can change without rewriting the others. A first release stays small, but its structure leaves room for the next phase.' },
        { title: 'API design', text: 'Endpoints are designed around use cases, return consistent errors and are versioned when they change. The frontend never has to guess what a response means.' },
        { title: 'Authentication and authorization', text: 'Who you are and what you are allowed to do are checked on the server for every request that reads or changes data. Hiding a button in the UI is never the security control.' },
        { title: 'Database design', text: 'Constraints and foreign keys protect relationships, indexes follow the real queries, and related records are loaded together instead of one query per row (the N+1 problem).' },
        { title: 'Reliability', text: 'Operations that must not run twice, such as creating an order or recording a payment, are tied to a unique reference so retries and double clicks do not create duplicates.' },
        { title: 'Performance', text: 'Data that is read often and changes rarely is cached and invalidated when it changes. Pages are code-split so visitors only download what the screen they are on needs.' },
        { title: 'Security', text: 'Input is validated on the server, sensitive endpoints are rate-limited, secrets stay out of the frontend, and dependencies are kept current.' },
        { title: 'Cloud deployment', text: 'Applications are deployed to managed platforms such as Vercel and Render or to your own cloud account, with environment-specific configuration and a repeatable build.' },
      ],
    },
    technologies: [
      { area: 'Frontend', items: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'] },
      { area: 'Backend', items: ['Java', 'Spring Boot', 'Python', 'FastAPI'] },
      { area: 'Data', items: ['PostgreSQL', 'MySQL'] },
      { area: 'APIs and integrations', items: ['REST', 'Razorpay', 'Transactional email', 'PDF generation'] },
      { area: 'Deployment', items: ['Vercel', 'Render', 'Your cloud account'] },
    ],
    processNote: 'Discovery is usually a call or a meeting where we map the workflow you want to replace, the people who use it and the systems it has to connect to. From that we agree a first release that is useful on its own.',
    proof: {
      heading: 'Work you can look at',
      paragraphs: [
        'VStitch by Anjali Nanda is a fashion commerce platform we engineered with React, Python and PostgreSQL. Beyond the storefront it handles customised dress orders, backend-verified Razorpay payments, duplicate-request protection, automated PDF invoices and transactional email. The case study walks through the architecture.',
        'This website is our own production system too: a React application prerendered for search engines, served from Vercel, with a Python API on Render behind the contact forms, client portal, lead pipeline and coding courses.',
      ],
      caseStudy: 'vstitch-by-anjali-nanda',
    },
    faqs: [
      ['Do you only work with businesses in Gurugram?', 'No. We are based in Gurugram and many conversations start with businesses in Delhi NCR, but most of the work happens online, so we also work with clients elsewhere in India and abroad.'],
      ['Should we build custom software or use an off-the-shelf product?', 'If an existing product covers your workflow with configuration alone, it is usually cheaper and faster. Custom software makes sense when the workflow is what differentiates you, when you need integrations the product cannot do, or when per-user licensing becomes more expensive than owning the system.'],
      ['Which technology will you use?', 'We choose based on the project: React for the interface, and Java with Spring Boot or Python with FastAPI for the backend, depending on your team, existing systems and hosting. We explain the trade-offs before anything is decided.'],
      ['Who owns the source code?', 'Ownership of the code and deliverables is set out in the project agreement before work starts, so you know exactly what you will receive at handover.'],
      ['How do you estimate cost and timeline?', 'From the workflows, integrations, data migration and quality requirements involved. We prefer to scope a first release that is useful on its own, estimate it properly, and plan later phases from real usage.'],
      ['Can you take over an existing application?', 'Often, yes. We start by reviewing the code, hosting and data to understand the risks, then recommend whether to stabilise, extend or replace parts of it.'],
    ],
    learning: [
      { to: '/learn/spring-boot', label: 'Spring Boot course' },
      { to: '/learn/react', label: 'React course' },
      { to: '/learn/database-design', label: 'Database design course' },
      { to: '/learn/python', label: 'Python course' },
    ],
    related: ['/ai-development-company-india', '/custom-crm-development', '/services/web-development'],
  },
  {
    path: '/ai-development-company-india',
    slug: 'ai-development-india',
    navLabel: 'AI Development',
    serviceType: 'AI software development',
    areaServed: ['India'],
    seo: {
      title: 'AI Development Company in India | LLM & RAG',
      description: 'WebNest Studio builds AI software in India: LLM integration, RAG over your own documents, AI chatbots and workflow automation for your business systems.',
    },
    eyebrow: 'AI software development · India',
    h1: 'AI Development Company in India',
    lead: 'We build AI features that do a specific job inside your business software: answering questions from your own documents, drafting and classifying, extracting data, or automating a step that people currently do by hand.',
    support: 'We are a Gurugram-based team that treats AI as one component of a larger system. The model call is usually the easy part; the work that decides whether an AI feature is useful is the data it can see, how its output is checked, and what happens when it is wrong.',
    problems: {
      heading: 'Where AI tends to help, and where it does not',
      items: [
        { title: 'Repetitive reading and writing', text: 'Staff spend hours summarising enquiries, drafting replies, tagging tickets or pulling fields out of documents. A model can do a first pass that a person reviews.' },
        { title: 'Knowledge that is hard to find', text: 'Policies, product details and past answers are scattered across files. Retrieval over your own content lets an assistant answer with a source instead of guessing.' },
        { title: 'Requirements gathering and intake', text: 'Long forms put people off. A conversational intake can collect the same information step by step and hand a structured summary to your team.' },
        { title: 'Decisions that need to be exact', text: 'Pricing, eligibility, payments and anything regulated should stay in deterministic code. We will tell you when a rule-based approach is the better answer.' },
      ],
    },
    capabilities: {
      heading: 'What we build',
      items: [
        { title: 'LLM integration', text: 'Connecting language models from established providers to your application through a backend that controls prompts, limits and data access. Keys never reach the browser.' },
        { title: 'RAG over your content', text: 'Retrieval-augmented generation: your documents are split, embedded and searched so the model answers from your material, and the answer can show where it came from.' },
        { title: 'AI chatbots and assistants', text: 'Chat interfaces for customers or staff with conversation history, handoff to a person, and clear limits on what the assistant is allowed to do.' },
        { title: 'Structured extraction and classification', text: 'Turning emails, forms and documents into validated fields your system can store, with a review step for low-confidence results.' },
        { title: 'Workflow automation', text: 'AI steps placed inside an existing process: triggered by an event, writing to your database, notifying the right person, and logging what was done.' },
        { title: 'Machine learning and NLP features', text: 'Classical ML and NLP in Python where a smaller, cheaper model is a better fit than a large language model, such as categorisation or similarity search.' },
      ],
    },
    engineering: {
      heading: 'Engineering AI features that hold up in production',
      intro: 'A demo that works on five examples is not a product. These are the parts we design before an AI feature reaches your users.',
      items: [
        { title: 'Evaluation before launch', text: 'We agree a set of real example inputs with expected outcomes, then measure the feature against them whenever prompts, models or data change.' },
        { title: 'Grounding and citations', text: 'For question answering, retrieval limits the model to your approved content and the interface shows sources, so people can check an answer instead of trusting it.' },
        { title: 'Human review', text: 'Where a wrong answer has a cost, output is a draft that a person approves. We design the review screen as part of the feature.' },
        { title: 'Cost and rate control', text: 'Usage limits per user, caching of repeated work and choosing the smallest model that meets the quality bar keep running costs predictable.' },
        { title: 'Privacy and data access', text: 'The model only receives the data a task needs, access rules from your application still apply to retrieved documents, and sensitive fields can be excluded.' },
        { title: 'Failure handling', text: 'Timeouts, provider outages and unusable output all have a defined fallback, so the rest of your application keeps working when the AI step does not.' },
      ],
    },
    technologies: [
      { area: 'Languages', items: ['Python', 'JavaScript'] },
      { area: 'AI', items: ['LLM provider APIs', 'Embeddings', 'Retrieval-augmented generation', 'NLP'] },
      { area: 'Data', items: ['PostgreSQL', 'Vector search'] },
      { area: 'Application', items: ['FastAPI', 'React', 'REST APIs'] },
    ],
    processNote: 'AI projects start with one workflow, not a platform. We look at real examples of the input and the output you expect, build a small prototype, and measure it before deciding whether to take it further.',
    proof: {
      heading: 'AI we run ourselves',
      paragraphs: [
        'The project planner on this website is an AI assistant we built. It asks a visitor about their project in a conversation, keeps track of the details collected so far, and produces a written project plan that can be downloaded as a PDF or emailed. It is rate-limited per user and runs on our Python backend, not in the browser.',
        'In the VStitch commerce platform, PostgreSQL holds the transactional data alongside a vector layer that prepares the catalogue for similarity and context-based features.',
      ],
      caseStudy: 'vstitch-by-anjali-nanda',
    },
    faqs: [
      ['Can you add AI to our existing website or software?', 'Usually, yes. It depends on whether we can reach the data the feature needs and where its output should go. We review the existing system and suggest the least disruptive place to add it.'],
      ['Will the AI always give correct answers?', 'No, and you should be wary of anyone who says otherwise. We reduce errors with retrieval, constrained outputs and evaluation, and we design human review in wherever a wrong answer matters.'],
      ['Is our data used to train the model?', 'We use provider APIs and settings that do not train on your data where the provider offers that, send only the data a task needs, and discuss data residency and retention before anything is built.'],
      ['Which AI model will you use?', 'We pick per task, comparing quality, speed and cost on your own examples. The integration is built so the model can be swapped later without rewriting the feature.'],
      ['What does it cost to run?', 'Running cost depends on how many requests you make and how much text each one processes. We estimate it from expected usage during the prototype and add limits and caching to keep it in budget.'],
      ['Do we need a lot of data to start?', 'Not for most LLM features. A set of real documents and a few dozen example inputs with good answers is enough to build and evaluate a first version.'],
    ],
    learning: [
      { to: '/learn/python', label: 'Python course' },
      { to: '/learn/postgresql', label: 'PostgreSQL course' },
      { to: '/learn/database-design', label: 'Database design course' },
    ],
    related: ['/software-development-company-gurugram', '/custom-crm-development', '/services/web-development'],
  },
  {
    path: '/custom-crm-development',
    slug: 'custom-crm',
    navLabel: 'CRM Development',
    serviceType: 'Custom CRM development',
    areaServed: ['India'],
    seo: {
      title: 'Custom CRM Development Company in India',
      description: 'Custom CRM development by WebNest Studio: lead management, sales pipelines, role-based access, approvals, dashboards, WhatsApp and payment integrations.',
    },
    eyebrow: 'Custom CRM development · India',
    h1: 'Custom CRM Development',
    lead: 'We build CRMs around the way your team actually sells and serves customers: your stages, your approval rules, your roles, and the tools your customers already use to reach you.',
    support: 'Packaged CRMs are a good start for many teams. A custom CRM makes sense when you are paying for features you do not use, working around the ones you need, or copying data between the CRM and the rest of your systems by hand.',
    problems: {
      heading: 'Signs a custom CRM is worth considering',
      items: [
        { title: 'Leads arrive from too many places', text: 'Website forms, WhatsApp, phone calls, Instagram and referrals all land somewhere different, and some are never followed up.' },
        { title: 'Your process does not match the software', text: 'The stages, fields and approvals your team needs do not fit a generic pipeline, so people keep side spreadsheets that the CRM never sees.' },
        { title: 'Everyone sees everything, or nobody can find anything', text: 'Sales, operations, managers and clients need different views and permissions, which off-the-shelf plans either lock behind higher tiers or do not support.' },
        { title: 'The CRM is an island', text: 'Quotes, payments, invoices and project delivery happen in other tools, so the CRM never shows the full state of a customer.' },
      ],
    },
    capabilities: {
      heading: 'What a custom CRM from us can include',
      items: [
        { title: 'Lead capture and management', text: 'Every enquiry from your website, campaigns and messaging channels stored in one place with its source, owner and full history.' },
        { title: 'Sales pipelines', text: 'Stages defined by your process, with filters by status, source and owner, and changes recorded so you can see how a deal moved.' },
        { title: 'Role-based access control', text: 'Separate permissions for admins, managers, sales staff and, where useful, your own clients, enforced on the server for every request.' },
        { title: 'Approval engines', text: 'Discounts, quotes or onboarding steps that need sign-off are routed to the right person, with the decision and its reason kept on record.' },
        { title: 'Workflow automation', text: 'Follow-up reminders, assignment rules, status-based emails and handoffs between teams, triggered by events in the CRM instead of memory.' },
        { title: 'Dashboards and analytics', text: 'Pipeline value by stage, conversion by source and team workload, calculated from the CRM data rather than exported to a spreadsheet.' },
        { title: 'Client portals', text: 'A signed-in area where customers check their project or order status themselves.' },
        { title: 'Integrations', text: 'WhatsApp Business messaging, email, Razorpay payments, invoicing and your existing website or ERP, connected through a backend API.' },
      ],
    },
    engineering: {
      heading: 'How we engineer a CRM',
      intro: 'A CRM holds your customer relationships, so data quality, permissions and history matter more than screens.',
      items: [
        { title: 'A data model built around your business', text: 'Leads, contacts, companies, deals, activities and documents are modelled with the relationships your team really uses, so reports do not depend on free-text fields.' },
        { title: 'Permissions on the server', text: 'Role and ownership checks run in the API, so a user cannot read or change another team\'s records by editing a request.' },
        { title: 'Audit history', text: 'Status changes, assignments and approvals are recorded with who and when, which settles disputes and shows where deals stall.' },
        { title: 'Safe concurrent updates', text: 'When two people update the same record, the change is applied consistently, and the interface recovers cleanly if a save fails.' },
        { title: 'Fast lists and filters', text: 'Paginated, indexed queries keep pipeline views quick as the number of leads grows, instead of loading every record into the browser.' },
        { title: 'Reliable integrations', text: 'Incoming messages and payment events are verified, de-duplicated and retried safely, so one webhook does not create two leads or two payments.' },
      ],
    },
    technologies: [
      { area: 'Frontend', items: ['React'] },
      { area: 'Backend', items: ['Python', 'FastAPI', 'Java', 'Spring Boot'] },
      { area: 'Data', items: ['PostgreSQL', 'MySQL'] },
      { area: 'Integrations', items: ['WhatsApp Business API', 'Email', 'Razorpay', 'PDF generation'] },
    ],
    processNote: 'We start by walking through how a lead becomes a customer today, who touches it at each step, and which reports you check every week. That map becomes the data model and the first set of screens.',
    proof: {
      heading: 'The CRM behind our own studio',
      paragraphs: [
        'Every enquiry on this website goes into a lead pipeline we built and use ourselves: contact messages, project briefs, consultation bookings, resource downloads, newsletter sign-ups and conversations with our AI project planner. Leads are filtered by source and status and moved through stages from new to contacted, qualified, confirmed, completed, won or lost.',
        'The same system runs a role-based client portal. Administrators update each client\'s project phase and percentage complete, and the client signs in to see it, while the API keeps admin, client and learner access separate.',
      ],
      caseStudy: 'vstitch-by-anjali-nanda',
    },
    faqs: [
      ['Should we build a custom CRM or customise an existing one?', 'If an existing CRM fits your process with configuration, start there. Custom is worth it when you are fighting the tool, paying per seat for features you do not use, or need integrations and permissions it cannot provide.'],
      ['Can you move our data from spreadsheets or another CRM?', 'Yes. We map your existing fields to the new data model, clean up duplicates during import, and run a trial migration before switching over.'],
      ['Can the CRM capture WhatsApp enquiries?', 'Yes, through the WhatsApp Business Platform. Incoming messages can create or update a lead, and agreed message templates can be sent from the CRM.'],
      ['Will our team and clients have different access?', 'Yes. Roles and permissions are part of the design from the start and are enforced by the backend, not just hidden in the interface.'],
      ['Can it work on phones?', 'The interface is responsive, so your team can review leads and update stages from a phone browser. A separate mobile app is only needed for requirements such as offline use.'],
      ['How long does a first version take?', 'It depends on the number of roles, integrations and data to migrate. We usually scope a first release around lead capture, the pipeline and permissions, then add automation and reporting in later phases.'],
    ],
    learning: [
      { to: '/learn/database-design', label: 'Database design course' },
      { to: '/learn/database-sql', label: 'SQL course' },
      { to: '/learn/spring-boot', label: 'Spring Boot course' },
      { to: '/learn/react', label: 'React course' },
    ],
    related: ['/software-development-company-gurugram', '/ai-development-company-india', '/services/web-development'],
  },
]

export const DEVELOPMENT_PROCESS = [
  { title: 'Discovery', text: 'Your goals, users, current tools and constraints.' },
  { title: 'Requirements', text: 'Agreed scope for a first useful release, written down.' },
  { title: 'Architecture', text: 'Data model, APIs, integrations and hosting decided up front.' },
  { title: 'UI/UX', text: 'Screens and flows designed and reviewed with you.' },
  { title: 'Development', text: 'Built in increments you can see and test along the way.' },
  { title: 'Testing', text: 'Functional, mobile, permission and failure-case checks.' },
  { title: 'Deployment', text: 'Released to production with environment configuration.' },
  { title: 'Support', text: 'Fixes, monitoring and the next phase, as agreed.' },
]

// Every commercial and service page in one list for the Services hub, footer and
// related-service links. Paths here must exist as routes.
export const SERVICE_DIRECTORY = [
  { to: '/software-development-company-gurugram', title: 'Custom Software Development', summary: 'Web applications, APIs and databases built with React, Java, Spring Boot and Python.' },
  { to: '/ai-development-company-india', title: 'AI Development', summary: 'LLM integration, RAG, AI chatbots and automation connected to your business systems.' },
  { to: '/custom-crm-development', title: 'Custom CRM Development', summary: 'Lead management, sales pipelines, role-based access, approvals and integrations.' },
  { to: '/services/web-development', title: 'Website Development', summary: 'Responsive business websites and web applications with accessible interfaces.' },
]

export function getCommercialPage(path) {
  return COMMERCIAL_PAGES.find((page) => page.path === path) || null
}
