import { content01Basics } from './content-01-basics.js'
import { content02ControlFlow } from './content-02-controlflow.js'
import { content03Strings } from './content-03-strings.js'
import { content04aOopPart1 } from './content-04a-oop-part1.js'
import { content04bOopPart2 } from './content-04b-oop-part2.js'
import { content05Exceptions } from './content-05-exceptions.js'
import { content06Multithreading } from './content-06-multithreading.js'
import { content07Collections } from './content-07-collections.js'
import { content08Java8Io } from './content-08-java8-io.js'
import { content09Jdbc } from './content-09-jdbc.js'
import { content10Servlets } from './content-10-servlets.js'
import { content11Jsp } from './content-11-jsp.js'
import { content12Runtime } from './content-12-runtime.js'
import { content13Engineering } from './content-13-engineering.js'
import { content14GapsA } from './content-14-gaps-a.js'
import { content15GapsB } from './content-15-gaps-b.js'
import { content16GapsC } from './content-16-gaps-c.js'
import { content17GapsD } from './content-17-gaps-d.js'
import { content18GapsE } from './content-18-gaps-e.js'
import { content19GapsF } from './content-19-gaps-f.js'
import { content20GapsG } from './content-20-gaps-g.js'
import { content21Hibernate } from './content-21-hibernate.js'
import { content22SpringCoreBoot } from './content-22-spring-core-boot.js'
import { content23SecurityCloud } from './content-23-security-cloud.js'
import { content24Mockito } from './content-24-mockito.js'
import { practice01Basics } from './practice-01-basics.js'
import { practice02ControlFlow } from './practice-02-controlflow.js'
import { practice03Strings } from './practice-03-strings.js'
import { practice04aOop } from './practice-04a-oop.js'
import { practice04bOop } from './practice-04b-oop.js'
import { practice04cOop } from './practice-04c-oop.js'
import { practice05Exceptions } from './practice-05-exceptions.js'
import { JAVA_CORE_MODULES, ADVANCED_JAVA_MODULES, buildTopicIndex } from './topics.js'

// Practice blocks live in their own per-module files, keyed by the same slugs.
export const JAVA_PRACTICE = {
  ...practice01Basics,
  ...practice02ControlFlow,
  ...practice03Strings,
  ...practice04aOop,
  ...practice04bOop,
  ...practice04cOop,
  ...practice05Exceptions,
}

const LESSON_PROSE = {
  ...content01Basics,
  ...content02ControlFlow,
  ...content03Strings,
  ...content04aOopPart1,
  ...content04bOopPart2,
  ...content05Exceptions,
  ...content06Multithreading,
  ...content07Collections,
  ...content08Java8Io,
  ...content09Jdbc,
  ...content10Servlets,
  ...content11Jsp,
  ...content12Runtime,
  ...content13Engineering,
  ...content14GapsA,
  ...content15GapsB,
  ...content16GapsC,
  ...content17GapsD,
  ...content18GapsE,
  ...content19GapsF,
  ...content20GapsG,
  ...content21Hibernate,
  ...content22SpringCoreBoot,
  ...content23SecurityCloud,
  ...content24Mockito,
}

export const JAVA_LESSON_CONTENT = Object.fromEntries(
  Object.entries(LESSON_PROSE).map(([slug, entry]) => [slug, JAVA_PRACTICE[slug] ? { ...entry, ...JAVA_PRACTICE[slug] } : entry]),
)

export { JAVA_CORE_MODULES, ADVANCED_JAVA_MODULES, buildTopicIndex }
