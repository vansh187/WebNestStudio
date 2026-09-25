// These offerings are already described in site.js and the Services catalogue.
export const SERVICE_PAGES = [
  {
    slug: 'web-development', title: 'Custom Website Development',
    description: 'Custom website development from WebNest Studio in New Delhi: responsive business websites and web applications with accessible interfaces and maintainable code.',
    intro: 'Your website should help people understand your business and take the next step. We build custom websites around your content, customer journeys and the systems your team already uses.',
    problems: 'This service fits businesses launching a new site, replacing a site that is difficult to update, or turning a manual customer journey into a web application. Start with the task your visitor needs to complete: finding a service, requesting a quote, buying a product or accessing an account.',
    capabilities: ['Responsive layouts for phones, tablets and desktops', 'React interfaces, forms and API-connected applications', 'Content structure, accessible navigation and technical SEO foundations', 'Integration with your existing backend and business tools'],
    approach: 'We first map the essential pages and conversion paths, then agree the content and interface design. Development connects those screens to your data and workflows. Before launch, we check mobile layouts, forms, loading behavior and deployment requirements. Ongoing changes can be scoped after launch.',
    technologies: 'React, HTML, CSS, JavaScript, REST APIs and the backend stack appropriate to your project.',
    questions: [
      ['Can you improve an existing website?', 'Yes. Share the site and the problems you want to solve. We can assess whether focused changes or a rebuild better fit its code, content and requirements.'],
      ['What should I prepare for a quote?', 'Share your business goals, required pages, existing brand assets, content, integrations and desired launch window. Scope and dependencies determine the estimate.'],
    ],
    course: 'react', courseLabel: 'React tutorials',
  },
  {
    slug: 'ai-development', title: 'AI Implementation and Integration',
    description: 'Integrate AI chatbots, automation and LLM-powered features into your business software with WebNest Studio, an IT consultancy in New Delhi.',
    intro: 'AI is useful when it solves a specific workflow problem. We help integrate chatbots, intelligent automation and LLM-powered features into websites and applications, with clear boundaries around what the system can do.',
    problems: 'A starting point might be helping customers navigate approved information, assisting staff with repetitive work, or adding an AI feature to an existing product. We begin with the inputs, expected outputs and how a person will review or act on the result.',
    capabilities: ['Chatbot interfaces connected to your application', 'LLM-powered features integrated with existing workflows', 'Automation that works with your APIs and business systems', 'Evaluation of expected responses and failure cases'],
    approach: 'We identify one useful workflow, review the available data and build a focused prototype. Together we assess answer quality, response time, operating cost and failure behavior. An agreed implementation can then add access controls, user feedback and human handoff where needed.',
    technologies: 'Python, React, model-provider APIs and REST integrations selected for the workflow.',
    questions: [
      ['Can AI be added to an existing website?', 'Often, yes. The integration depends on the site architecture, available APIs, the information it should use and the actions it needs to perform.'],
      ['Will the AI always give a correct answer?', 'No. AI output needs evaluation and appropriate review. We discuss scope, fallback behavior and which decisions should remain with a person.'],
    ],
    course: 'python', courseLabel: 'Python tutorials',
  },
  {
    slug: 'software-development', title: 'Full-Stack Software Development',
    description: 'Full-stack software development with React, Java, Python and Spring Boot. WebNest Studio builds application interfaces, APIs and database integrations.',
    intro: 'Build software around the way your business works. We develop application interfaces, backend services and data integrations as connected parts of a maintainable system.',
    problems: 'Custom software can help when disconnected tools require repeated data entry, when an existing product needs a new workflow, or when teams need a shared view of business information. Defining user roles, data ownership and the first useful release keeps the project focused.',
    capabilities: ['React application interfaces connected to backend services', 'Java, Spring Boot and Python application development', 'REST and GraphQL API integrations', 'MySQL and Oracle data models, queries and application connectivity'],
    approach: 'We begin with the workflow, current systems and deployment constraints. Next we agree a small release scope and the contracts between interfaces, APIs and data. Implementation includes validation and error handling, followed by testing and deployment planning. Further features can be prioritised from real usage.',
    technologies: 'React, Java, Spring Boot, Python, MySQL, Oracle, REST and GraphQL.',
    questions: [
      ['Can you connect our existing systems?', 'We assess the APIs, data formats, access requirements and limitations of each system before proposing the integration.'],
      ['How are timeline and cost determined?', 'They depend on the workflows, integrations, data migration, quality requirements and release scope. A discovery discussion helps turn these into an estimate.'],
    ],
    course: 'spring-boot', courseLabel: 'Spring Boot tutorials',
  },
]
