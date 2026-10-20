// Builds lesson-specific practice from each lesson's authored key points,
// examples, and common mistakes. Used only for the Java/Spring lessons that
// currently have no dedicated practice block.
function buildDerivedPractice(entry, slug) {
  const points = entry.keyPoints || []
  const mistakes = entry.commonMistakes || []
  const examples = entry.examples || []
  if (!points.length || !mistakes.length) return entry

  const point = points[0]
  const mistake = mistakes[0]
  const example = examples[0]
  const section = (entry.sections || []).find((item) => item.heading)
  const rotation = [...slug].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 3
  const mistakeOptions = [mistake, mistakes[1] || `Ignoring the lesson's guidance on ${entry.title}.`]
  const quizAsksForMistake = rotation !== 1
  const answerOptions = quizAsksForMistake ? [point, ...mistakeOptions] : [point, ...mistakeOptions]
  const options = answerOptions.map((_, index) => answerOptions[(index + rotation) % answerOptions.length])
  const answerText = quizAsksForMistake ? mistake : point
  const correctIndex = options.indexOf(answerText)
  const exampleLabel = example?.caption || entry.title
  const sectionHeading = section?.heading || entry.title

  const exercisePrompt = rotation === 1
    ? `A teammate is about to make this mistake: <strong>${mistake}</strong> Use <strong>${sectionHeading}</strong> to review the decision. Write a corrected implementation or design sketch that follows <strong>${point}</strong>, then name one edge case you would check.`
    : `Using the lesson's <strong>${exampleLabel}</strong> example, create a small implementation or design sketch that demonstrates <strong>${point}</strong>. Add a test case or scenario that would catch <strong>${mistake}</strong>, and describe the expected result.`

  const interviewQuestion = [
    `How would you apply the guidance in <strong>${sectionHeading}</strong> to a real task, and what failure would you guard against?`,
    `Why does this principle matter in <strong>${entry.title}</strong>: ${point}`,
    `A teammate is about to make this mistake: ${mistake} How would you diagnose and correct it using the lesson's guidance?`,
  ][rotation]

  return {
    ...entry,
    exercise: {
      prompt: exercisePrompt,
      hints: [
        `Start with <strong>${sectionHeading}</strong>${example ? ` and compare your approach with <strong>${example.caption}</strong>` : ''}. Identify the decision or behavior the lesson recommends.`,
        `Walk through your scenario step by step. Confirm that it follows <strong>${point}</strong> and that it would catch the failure described by <strong>${mistake}</strong>.`,
      ],
    },
    quiz: [{
      question: quizAsksForMistake
        ? `Which choice is a mistake to avoid in <strong>${entry.title}</strong>?`
        : `Which choice best describes the recommended approach in <strong>${entry.title}</strong>?`,
      options,
      answer: correctIndex,
      explanation: quizAsksForMistake
        ? `Avoid this approach: ${mistake} The lesson recommends: ${point}`
        : `This is the recommended approach: ${point} Avoid: ${mistake}`,
    }],
    interviewQuestions: [{
      question: interviewQuestion,
      answer: `${point} Apply this in <strong>${sectionHeading}</strong>${example ? `; the example <strong>${example.caption}</strong> shows one way to do it` : ''}. Avoid ${mistake} and explain how your implementation or design prevents that failure.`,
    }],
  }
}

export function addDerivedPractice(lessons, eligibleSlugs) {
  const eligible = new Set(eligibleSlugs)
  return Object.fromEntries(Object.entries(lessons).map(([slug, entry]) => [
    slug,
    eligible.has(slug) && !entry.exercise && !entry.quiz?.length && !entry.interviewQuestions?.length
      ? buildDerivedPractice(entry, slug)
      : entry,
  ]))
}
