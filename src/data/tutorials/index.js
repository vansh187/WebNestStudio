import { springFrameworkContent } from './spring-framework.js'
import { springBootContent } from './spring-boot.js'
import { springFrameworkSetup } from './spring-framework-setup.js'
import { springBootSecurity } from './spring-boot-security.js'
import { springBootAi } from './spring-boot-ai.js'
import { springBootData } from './spring-boot-data.js'
import { springBootTesting } from './spring-boot-testing.js'
import { springBootWeb } from './spring-boot-web.js'
import { springBootCore } from './spring-boot-core.js'
import { springBootMessaging } from './spring-boot-messaging.js'
import { springBootAop } from './spring-boot-aop.js'
import { springBootFundamentals } from './spring-boot-fundamentals.js'
import { springBootRestExtras } from './spring-boot-rest-extras.js'
import { springBootReactive } from './spring-boot-reactive.js'
import { springBootOps } from './spring-boot-ops.js'
import { springBootCloud } from './spring-boot-cloud.js'
import { springBootAdvanced } from './spring-boot-advanced.js'
import { springBootCareer } from './spring-boot-career.js'
import { pythonContentA } from './python-a.js'
import { pythonContentB } from './python-b.js'
import { pythonBasics } from './python-basics.js'
import { pythonStructures } from './python-structures.js'
import { pythonOopA } from './python-oop-a.js'
import { pythonOopB } from './python-oop-b.js'
import { pythonMl } from './python-ml.js'
import { pythonDataB } from './python-data-b.js'
import { pythonDataA } from './python-data-a.js'
import { pythonFastapiB } from './python-fastapi-b.js'
import { pythonFastapiA } from './python-fastapi-a.js'
import { pythonDatabases } from './python-databases.js'
import { pythonAdvanced } from './python-advanced.js'
import { pythonStdlib } from './python-stdlib.js'
import { htmlContent } from './html.js'
import { cssContent } from './css.js'
import { javascriptContentA } from './javascript-a.js'
import { javascriptContentB } from './javascript-b.js'
import { reactContentA } from './react-a.js'
import { reactContentB } from './react-b.js'
import { databaseSqlContentA } from './database-sql-a.js'
import { databaseSqlContentB } from './database-sql-b.js'
import { postgresqlContent } from './postgresql.js'
import { databaseDesignContent } from './database-design.js'
import {
  springFrameworkExtra,
  springBootExtra,
  pythonExtra,
} from './extra-a.js'
import {
  htmlExtra,
  cssExtra,
  javascriptExtra,
  reactExtra,
  databaseSqlExtra,
  databaseDesignExtra,
} from './extra-b.js'

import { practicePythonFoundations } from './practice-python-01-foundations.js'
import { practicePythonStructuresFunctions } from './practice-python-02-structures-functions.js'
import { practicePythonOop } from './practice-python-03-oop.js'
import { practicePythonModulesErrorsFiles } from './practice-python-04-modules-errors-files.js'
import { practicePythonDatabasesAdvanced } from './practice-python-05-databases-advanced.js'
import { practicePythonAlgorithmsPractical } from './practice-python-06-algorithms-practical.js'
import { practicePythonFastapi } from './practice-python-07-fastapi.js'
import { practicePythonDataMl } from './practice-python-08-data-ml.js'
import { practiceHtml } from './practice-html.js'
import { practiceCss } from './practice-css.js'

// Practice blocks live in their own files, keyed by course slug and then by the same
// topic slugs as the lesson prose.
export const TUTORIAL_PRACTICE = {
  python: {
    ...practicePythonFoundations,
    ...practicePythonStructuresFunctions,
    ...practicePythonOop,
    ...practicePythonModulesErrorsFiles,
    ...practicePythonDatabasesAdvanced,
    ...practicePythonAlgorithmsPractical,
    ...practicePythonFastapi,
    ...practicePythonDataMl,
  },
  html: practiceHtml,
  css: practiceCss,
}

// Keyed by course slug (matching STATIC_COURSE_DEFINITIONS in codelabDefaults.js),
// each value keyed by the topic's slug (via the same slugify() used for lesson ids).
const TUTORIAL_PROSE = {
  'spring-framework': { ...springFrameworkContent, ...springFrameworkExtra, ...springFrameworkSetup },
  'spring-boot': {
    ...springBootContent,
    ...springBootExtra,
    ...springBootSecurity,
    ...springBootAi,
    ...springBootData,
    ...springBootTesting,
    ...springBootWeb,
    ...springBootCore,
    ...springBootMessaging,
    ...springBootAop,
    ...springBootFundamentals,
    ...springBootRestExtras,
    ...springBootReactive,
    ...springBootOps,
    ...springBootCloud,
    ...springBootAdvanced,
    ...springBootCareer,
  },
  python: {
    ...pythonContentA,
    ...pythonContentB,
    ...pythonExtra,
    ...pythonBasics,
    ...pythonStructures,
    ...pythonOopA,
    ...pythonOopB,
    ...pythonMl,
    ...pythonDataB,
    ...pythonDataA,
    ...pythonFastapiB,
    ...pythonFastapiA,
    ...pythonDatabases,
    ...pythonAdvanced,
    ...pythonStdlib,
  },
  html: { ...htmlContent, ...htmlExtra },
  css: { ...cssContent, ...cssExtra },
  javascript: { ...javascriptContentA, ...javascriptContentB, ...javascriptExtra },
  react: { ...reactContentA, ...reactContentB, ...reactExtra },
  'database-sql': { ...databaseSqlContentA, ...databaseSqlContentB, ...databaseSqlExtra },
  postgresql: postgresqlContent,
  'database-design': { ...databaseDesignContent, ...databaseDesignExtra },
}

export const TUTORIALS_BY_COURSE = Object.fromEntries(
  Object.entries(TUTORIAL_PROSE).map(([course, lessons]) => {
    const practice = TUTORIAL_PRACTICE[course]
    if (!practice) return [course, lessons]
    return [course, Object.fromEntries(
      Object.entries(lessons).map(([slug, entry]) => [slug, practice[slug] ? { ...entry, ...practice[slug] } : entry]),
    )]
  }),
)
