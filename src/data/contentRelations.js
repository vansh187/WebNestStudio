// Learn → service → case study relationships, keyed by course slug. Lessons and
// course pages read this instead of hard-coding links, so one edit here updates
// every lesson in the course. Anchor wording varies on purpose.
const SOFTWARE = '/software-development-company-gurugram'
const AI = '/ai-development-company-india'
const CRM = '/custom-crm-development'
const WEB = '/services/web-development'

export const COURSE_RELATIONS = {
  'java-core': { service: SOFTWARE, anchor: 'custom software development', text: 'We use Java on client projects for backend services and APIs.' },
  'advanced-java': { service: SOFTWARE, anchor: 'backend and API development', text: 'JDBC, servlets and the patterns in this course sit underneath the Java services we build for clients.' },
  'spring-framework': { service: SOFTWARE, anchor: 'Spring-based application development', text: 'Dependency injection, transactions and data access from this course are how we structure Java backends.' },
  'spring-boot': { service: SOFTWARE, anchor: 'software development services', text: 'Spring Boot is one of the stacks we build production REST APIs with.' },
  python: { service: AI, anchor: 'AI and LLM development', text: 'Python runs our own backend and the AI features we build for clients.', caseStudy: 'vstitch-by-anjali-nanda' },
  html: { service: WEB, anchor: 'website development', text: 'Semantic, accessible HTML is the base of every website we build.' },
  css: { service: WEB, anchor: 'custom website design and development', text: 'Responsive layouts like the ones in this course are part of every site we deliver.' },
  javascript: { service: WEB, anchor: 'web development work', text: 'JavaScript powers the interactive parts of the websites and apps we build.' },
  react: { service: SOFTWARE, anchor: 'React application development', text: 'React is the frontend we use for client web applications, including this website.', caseStudy: 'vstitch-by-anjali-nanda' },
  'database-sql': { service: CRM, anchor: 'custom CRM development', text: 'CRMs and dashboards are SQL underneath: pipelines, filters and reports are queries like the ones in this course.' },
  postgresql: { service: SOFTWARE, anchor: 'database-backed applications', text: 'PostgreSQL holds the orders, payments and invoices in the commerce platform we engineered.', caseStudy: 'vstitch-by-anjali-nanda' },
  'database-design': { service: CRM, anchor: 'CRM and data-heavy applications', text: 'A CRM is only as good as its data model, which is what this course teaches.' },
}

export function getCourseRelation(courseSlug) {
  return COURSE_RELATIONS[courseSlug] || null
}
