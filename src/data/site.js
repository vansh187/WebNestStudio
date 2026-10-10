export const CONTACT = {
  phone: '+91 72769 71875',
  phoneHref: 'tel:+917276971875',
  email: 'vansh.duggal@webneststudio.co.in',
  emailHref: 'mailto:vansh.duggal@webneststudio.co.in',
  whatsappHref: 'https://wa.me/917276971875?text=Hello%20WebNest%20Studio%2C%20I%27d%20like%20to%20discuss%20a%20premium%20digital%20experience%20for%20my%20brand.%20Please%20share%20the%20next%20steps.',
  instagramHref: 'https://www.instagram.com/webneststudio112026/',
  linkedinHref: 'https://www.linkedin.com/company/webneststudio.co.in',
}

// The one company identity used by the footer, contact page and Organization
// schema. Primary location vs. service area are kept separate on purpose.
export const COMPANY = {
  name: 'WebNest Studio',
  positioning: 'Web & AI Software Development Company',
  locality: 'Gurugram',
  region: 'Haryana',
  country: 'India',
  countryCode: 'IN',
  location: 'Gurugram, Haryana, India',
  serviceArea: 'Serving Gurugram, Delhi NCR, India and remote clients worldwide.',
}

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Our Story', to: '/our-story' },
  { label: 'Services', to: '/services' },
  { label: 'Work', to: '/portfolio' },
  { label: 'Blog', to: '/blog' },
  { label: 'Webnest CodeLab', to: '/codelab' },
  { label: 'Learn', to: '/learn' },
  { label: 'Visiting Card', to: '/card' },
]

// Grouped for the footer so the nav reads as tidy categories, not one long list.
export const FOOTER_SECTIONS = [
  {
    title: 'Company',
    links: [
      { label: 'Home', to: '/' },
      { label: 'About Us', to: '/about' },
      { label: 'Our Story', to: '/our-story' },
      { label: 'Services', to: '/services' },
      { label: 'Work', to: '/portfolio' },
      { label: 'Case Studies', to: '/case-studies' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Software Development', to: '/software-development-company-gurugram' },
      { label: 'AI Development', to: '/ai-development-company-india' },
      { label: 'CRM Development', to: '/custom-crm-development' },
      { label: 'Website Development', to: '/services/web-development' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', to: '/blog' },
      { label: 'FAQs', to: '/faqs' },
      { label: 'Visiting Card', to: '/card' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms-and-conditions' },
      { label: 'Disclaimer', to: '/disclaimer' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Webnest CodeLab', to: '/codelab' },
      { label: 'Learn programming', to: '/learn' },
      { label: 'Coding practice', to: '/codelab/problems' },
    ],
  },
]

// Flat list kept for any consumer that just wants every footer link.
export const FOOTER_LINKS = FOOTER_SECTIONS.flatMap((s) => s.links)

export const TECH_STACK = [
  { name: 'React', category: 'Frontend' },
  { name: 'Java', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'MySQL', category: 'Database' },
  { name: 'Oracle', category: 'Database' },
  { name: 'WebLogic', category: 'Infrastructure' },
  { name: 'Maven', category: 'Build' },
  { name: 'GraphQL', category: 'API' },
]

export const PROCESS = [
  { step: '01', title: 'Discover', description: 'We learn your business, goals, and audience before writing a line of code.' },
  { step: '02', title: 'Design', description: 'Trend-forward UI/UX crafted to convert visitors into customers.' },
  { step: '03', title: 'Develop', description: 'Clean, scalable code across your chosen stack — React, Java, Python, and more.' },
  { step: '04', title: 'Deploy & Grow', description: 'Launch, monitor, and iterate with AI-driven insight and ongoing support.' },
]
