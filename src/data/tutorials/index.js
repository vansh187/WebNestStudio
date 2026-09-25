import { springFrameworkContent } from './spring-framework.js'
import { springBootContent } from './spring-boot.js'
import { springFrameworkSetup } from './spring-framework-setup.js'
import { pythonContentA } from './python-a.js'
import { pythonContentB } from './python-b.js'
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

// Keyed by course slug (matching STATIC_COURSE_DEFINITIONS in codelabDefaults.js),
// each value keyed by the topic's slug (via the same slugify() used for lesson ids).
export const TUTORIALS_BY_COURSE = {
  'spring-framework': { ...springFrameworkContent, ...springFrameworkExtra, ...springFrameworkSetup },
  'spring-boot': { ...springBootContent, ...springBootExtra },
  python: { ...pythonContentA, ...pythonContentB, ...pythonExtra },
  html: { ...htmlContent, ...htmlExtra },
  css: { ...cssContent, ...cssExtra },
  javascript: { ...javascriptContentA, ...javascriptContentB, ...javascriptExtra },
  react: { ...reactContentA, ...reactContentB, ...reactExtra },
  'database-sql': { ...databaseSqlContentA, ...databaseSqlContentB, ...databaseSqlExtra },
  postgresql: postgresqlContent,
  'database-design': { ...databaseDesignContent, ...databaseDesignExtra },
}
