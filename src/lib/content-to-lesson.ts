import { generateAssignment, generateMaterials, getLevel, getSubjectCategory, getDuration, getStudentTitle } from "./content-generator"

function extractDefinitions(text: string): string[] {
  const defPatterns = [
    /is a ([^,.]+)/gi,
    /refers to ([^,.]+)/gi,
    /are called ([^,.]+)/gi,
    /means ([^,.]+)/gi,
    /is defined as ([^,.]+)/gi,
    /is the ([^,.]+)/gi,
    /is one of the ([^,.]+)/gi,
  ]
  const found: string[] = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  for (const s of sentences) {
    for (const pattern of defPatterns) {
      if (pattern.test(s)) {
        found.push(s.trim())
        break
      }
    }
  }
  return found
}

function extractKeyTerms(text: string): string[] {
  const terms = new Set<string>()
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  for (const s of sentences) {
    const words = s.split(/\s+/)
    for (let i = 0; i < words.length; i++) {
      const w = words[i].replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "")
      if (w.length >= 6 && /^[A-Z]/.test(w)) {
        terms.add(w)
      }
    }
  }
  return [...terms].slice(0, 8)
}

function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
}

export function parseExtractToLesson(
  extract: string,
  subject: string,
  topic: string,
  className: string,
  term: string,
  week: string | number
): string {
  const level = getLevel(className)
  const category = getSubjectCategory(subject)
  const dur = getDuration(level)
  const students = getStudentTitle(level)

  const paragraphs = splitIntoParagraphs(extract)
  const definitions = extractDefinitions(extract)
  const keyTerms = extractKeyTerms(extract)

  const firstPara = paragraphs[0] || extract
  const introSentence = firstPara.split(". ").slice(0, 2).join(". ") + "."

  const learningObjectives = [
    `Define and explain ${topic} in your own words`,
    `Identify the key concepts and principles of ${topic}`,
    `Describe the main features and characteristics of ${topic}`,
    `Apply the knowledge of ${topic} to solve related problems`,
    `Demonstrate understanding of ${topic} through practical exercises`,
  ]

  const materials = generateMaterials(category, level)

  const contentSteps = buildContentSteps(paragraphs, topic, category, students, definitions, keyTerms)

  const evalQuestions = buildEvaluation(definitions, extract, topic)

  const summary = buildSummary(extract, topic)

  const assignment = generateAssignment(category, topic, level)

  return `## Topic: ${topic}

**Class:** ${className} | **Subject:** ${subject}
**Term:** ${term} | **Week:** ${week} | **Duration:** ${dur} Minutes

### Learning Objectives
By the end of this lesson, ${students} will be able to:
${learningObjectives.map((o) => `- ${o}.`).join("\n")}

### Instructional Materials
${materials}

### Previous Knowledge
${students} have learned basic concepts in ${subject} in previous lessons and are familiar with foundational topics that prepare them for this lesson.

### Introduction / Set Induction
${introSentence}

### Lesson Presentation

${contentSteps}

### Evaluation
${evalQuestions}

### Summary
${summary}

### Assignment
${assignment}`
}

function buildContentSteps(
  paragraphs: string[],
  topic: string,
  category: string,
  students: string,
  definitions: string[],
  keyTerms: string[]
): string {
  const steps: string[] = []

  if (definitions.length > 0) {
    const defLines = definitions.slice(0, 3).map((d) => `- ${d}`).join("\n")
    steps.push(`**Step 1: Definition and Key Concepts**\n- Teacher explains the meaning of ${topic} using clear language.\n- Key definitions include:\n${defLines}\n- ${students} listen, take notes, and ask questions.`)
  } else {
    steps.push(`**Step 1: Introduction to ${topic}**\n- Teacher introduces ${topic} with a brief explanation.\n- ${students} share what they already know about the topic.\n- Key points are written on the board.`)
  }

  if (keyTerms.length > 0) {
    const termLines = keyTerms.map((t) => `- **${t}**`).join("\n")
    steps.push(`**Step 2: Key Vocabulary**\n- Teacher explains the important terms related to ${topic}:\n${termLines}\n- ${students} write the terms and their meanings in their notebooks.`)
  }

  const contentPara = paragraphs.slice(1, 4).map((p) => p.trim()).filter(Boolean)
  const bodyText = contentPara.length > 0
    ? contentPara.join("\n\n")
    : `${topic} is an important topic in this subject. The main ideas covered in this lesson help ${students} understand fundamental concepts that apply to real-life situations.`

  steps.push(`**Step 3: Content Development**\n- Teacher explains the following points in detail:\n\n${bodyText}\n\n- Teacher uses examples, diagrams, and practical demonstrations to illustrate key ideas.\n- ${students} participate in discussions and ask questions.`)

  steps.push(`**Step 4: Practical Application**\n- ${students} work on exercises related to ${topic} individually and in groups.\n- Teacher moves around the class to guide and support learning.\n- Selected ${students} present their work for class discussion.`)

  if (category === "mathematics") {
    steps.push(`**Step 5: Worked Examples and Problem Solving**\n- Teacher solves example problems step-by-step on the board.\n- ${students} practice solving similar problems.\n- Teacher provides feedback and corrections.`)
  }

  return steps.map((s, i) => `**Step ${i + 1}:** ${s.split("**Step")[1] || s}`).join("\n\n")
}

function buildEvaluation(
  definitions: string[],
  extract: string,
  topic: string
): string {
  const questions: string[] = []

  if (definitions.length > 0) {
    questions.push(`1. What is ${topic}? Explain in your own words based on what you learned.`)
    questions.push(`2. List three important facts about ${topic} from today's lesson.`)
  } else {
    questions.push(`1. Define ${topic} and give two examples.`)
    questions.push(`2. Describe the main concepts covered in today's lesson on ${topic}.`)
  }

  const keySentences = extract.match(/[^.!?]+[.!?]+/g) || []
  const factualQs = keySentences
    .filter((s) => s.length > 30 && s.length < 150)
    .slice(0, 2)
    .map((s, i) => `${i + 3}. ${s.trim().replace(/^[A-Z]/, (c) => c.toLowerCase()).replace(/\.$/, "")}?`)

  questions.push(...factualQs)

  while (questions.length < 4) {
    questions.push(`${questions.length + 1}. How does ${topic} apply to real-life situations? Give examples.`)
  }

  questions.push(`5. What questions do you still have about ${topic}?`)

  return questions.join("\n")
}

function buildSummary(extract: string, topic: string): string {
  const sentences = extract.match(/[^.!?]+[.!?]+/g) || []
  const lastSentences = sentences.slice(-2).join(" ").trim()
  if (lastSentences.length > 40) {
    return `${topic} is an important topic that helps us understand the world around us. ${lastSentences} Students should review these notes at home and practice what they have learned.`
  }
  return `Today we learned about ${topic}. The key ideas covered form the foundation for understanding more advanced concepts in this subject. Students should review their notes and practice regularly.`
}
