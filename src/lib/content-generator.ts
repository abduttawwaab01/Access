export function getLevel(className: string): "nursery" | "primary" | "jss" | "sss" {
  const c = className.toLowerCase()
  if (c.includes("nursery")) return "nursery"
  if (c.includes("primary")) return "primary"
  if (c.includes("jss") || c.includes("junior")) return "jss"
  return "sss"
}

export function getSubjectCategory(subject: string): string {
  const s = subject.toLowerCase()
  if (["mathematics", "further mathematics", "additional mathematics", "numeracy", "number work", "quantitative reasoning", "quantitative"].some((x) => s.includes(x))) return "mathematics"
  if (["physics", "chemistry", "biology", "science", "integrated science", "basic science", "general science"].some((x) => s.includes(x))) return "science"
  if (["english", "english language", "literacy", "letter work", "verbal reasoning", "comprehension"].some((x) => s.includes(x))) return "english"
  if (["yoruba", "french", "arabic", "igbo", "hausa"].some((x) => s.includes(x))) return "language"
  if (["history", "social studies", "geography", "government", "civic education", "social habits"].some((x) => s.includes(x))) return "social"
  if (["computer", "data processing", "basic technology", "it", "programming", "coding"].some((x) => s.includes(x))) return "technology"
  if (["agricultural science", "agriculture", "home economics", "food", "nutrition"].some((x) => s.includes(x))) return "vocational"
  if (["creative arts", "art", "music", "fine art", "drawing"].some((x) => s.includes(x))) return "creative"
  if (["crs", "christian", "islamic", "religious", "moral", "moral instruction"].some((x) => s.includes(x))) return "religious"
  if (["business", "commerce", "accounting", "economics", "entrepreneurship", "office practice"].some((x) => s.includes(x))) return "business"
  if (["phe", "physical", "health", "sport"].some((x) => s.includes(x))) return "physical"
  return "general"
}

export function getLevelAdjective(level: string): string {
  const map: Record<string, string> = {
    nursery: "basic foundational",
    primary: "elementary",
    jss: "intermediate",
    sss: "advanced",
  }
  return map[level] || "standard"
}

export function getDuration(level: string): string {
  const map: Record<string, string> = {
    nursery: "30",
    primary: "35",
    jss: "40",
    sss: "45",
  }
  return map[level] || "40"
}

export function getStudentTitle(level: string): string {
  const map: Record<string, string> = {
    nursery: "pupils",
    primary: "pupils",
    jss: "students",
    sss: "students",
  }
  return map[level] || "students"
}

const introTopics = [
  "Ask students what they already know about the topic through guided questions.",
  "Begin with a short story or real-life scenario related to the topic.",
  "Display a picture or object related to the topic and ask questions.",
  "Pose a problem for students to think about before the lesson begins.",
  "Review the previous lesson and connect it to today's topic.",
  "Sing a song or recite a rhyme related to the topic.",
  "Show a short video clip to capture students' attention.",
]

const summaryStatements = [
  "Students should now understand the key concepts taught in this lesson.",
  "The main ideas covered today form the foundation for the next topic.",
  "Review these notes at home and practice what you have learned.",
  "Mastery of this topic requires regular practice and revision.",
]

import { fetchWikipediaExtract } from "./content-fetcher"
import { parseExtractToLesson, parseExtractToStudentNote } from "./content-to-lesson"
import { generateQuestionsFromText } from "./question-generator"

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function tryWikipediaLesson(
  subject: string,
  topic: string,
  className: string,
  term: string,
  week: string | number
): Promise<string | null> {
  try {
    const wiki = await fetchWikipediaExtract(topic)
    if (wiki.found && wiki.extract.length > 50) {
      return parseExtractToLesson(wiki.extract, subject, wiki.title, className, term, week)
    }
  } catch {
    // fall through to template
  }
  return null
}

function generateTemplateLesson(
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

  const objectives = generateObjectives(category, topic)
  const materials = generateMaterials(category, level)
  const prevKnowledge = `Students have learned basic concepts in ${subject} in previous lessons. They are familiar with foundational topics that prepare them for this lesson.`
  const intro = pick(introTopics)
  const steps = generateLessonSteps(category, topic, level)
  const evalQs = generateEvaluation(category, topic)
  const summary = pick(summaryStatements)
  const assignment = generateAssignment(category, topic, level)

  return `## Topic: ${topic}

**Class:** ${className} | **Subject:** ${subject}
**Term:** ${term} | **Week:** ${week} | **Duration:** ${dur} Minutes

### Learning Objectives
By the end of this lesson, ${students} will be able to:
${objectives}

### Instructional Materials
${materials}

### Previous Knowledge
${prevKnowledge}

### Introduction / Set Induction
${intro}

### Lesson Presentation

${steps}

### Evaluation
${evalQs}

### Summary
${summary}

### Assignment
${assignment}`
}

function generateTemplateStudentNote(
  subject: string,
  topic: string,
  className: string,
  term: string,
  week: string | number
): string {
  const level = getLevel(className)
  const category = getSubjectCategory(subject)
  const students = getStudentTitle(level)

  return `## ${topic}

### Introduction
${topic} is an important topic in ${subject}. In this note, you will learn everything you need to know about ${topic} in a simple and clear way. Understanding this topic will help you build a strong foundation for more advanced concepts in ${subject}.

### What You Will Learn
By the end of this note, you will be able to:
- Define and explain ${topic} in your own words
- Identify the key concepts and ideas related to ${topic}
- Apply what you have learned to solve problems and answer questions
- Connect ${topic} to real-life situations

### What is ${topic}?
${topic} is a key concept in ${subject}. It involves understanding important ideas that help us make sense of the world around us. When we study ${topic}, we learn about the principles and practices that are essential for this subject.

The study of ${topic} covers several important areas. First, we look at the basic definition and what makes ${topic} unique. Then we explore how ${topic} relates to other concepts we already know.

### Key Concepts
The main ideas covered in ${topic} include:
1. **Definition and Meaning** — Understanding what ${topic} is all about
2. **Key Principles** — The fundamental rules and ideas that guide this topic
3. **Applications** — How ${topic} is used in everyday life
4. **Importance** — Why learning ${topic} matters

### Important Definitions
- **${topic}**: The main subject or concept we are studying
- **Key Terms**: Important vocabulary related to this topic will be explained as you study

### Examples
**Example 1:**
Consider how ${topic} applies in real life. For instance, when we look at everyday situations, we can see ${topic} at work in many ways that affect our daily lives.

**Example 2:**
Another example of ${topic} can be seen in how professionals use these concepts to solve problems and make decisions in their work.

### Key Points to Remember
- ${topic} is an important concept in ${subject}
- The main ideas help us understand more complex topics later
- Practice and review are essential for mastering this topic
- Real-life applications make ${topic} relevant and useful

### Practice Questions
1. What is ${topic}? Write a short explanation in your own words.
2. List three important facts about ${topic}.
3. How does ${topic} apply to real-life situations?
4. Why is it important to study ${topic}?
5. What questions do you still have about ${topic}?

### Answer Key
1. (Answer will vary based on the specific topic studied)
2. (Answers should reflect the key points covered in the note)
3. (Students should identify real-world applications)
4. (Students should explain the importance of the topic)
5. (Open-ended — students should identify areas for further clarification)
`
}

export async function generateLessonNote(
  subject: string,
  topic: string,
  className: string,
  term: string,
  week: string | number
): Promise<string> {
  const wikiContent = await tryWikipediaLesson(subject, topic, className, term, week)
  if (wikiContent) return wikiContent
  return generateTemplateLesson(subject, topic, className, term, week)
}

export async function generateComprehensiveLessonNote(
  subject: string,
  topic: string,
  className: string,
  term: string,
  week: string | number
): Promise<{
  studentNote: string
  lessonPlan: string
  questions: { questionText: string; type: string; options: string[]; correctAnswer: string; points: number }[]
  source: "ai" | "wikipedia" | "template"
}> {
  try {
    const res = await fetch("/api/ai/generate-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, topic, className, term, week: String(week) }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.studentNote && data.lessonPlan) {
        return {
          studentNote: data.studentNote,
          lessonPlan: data.lessonPlan,
          questions: data.questions || [],
          source: "ai",
        }
      }
    }
  } catch {
    // fall through to Wikipedia
  }

  try {
    const wiki = await fetchWikipediaExtract(topic)
    if (wiki.found && wiki.extract.length > 50) {
      const studentNote = parseExtractToStudentNote(wiki.extract, subject, wiki.title, className, term, week)
      const lessonPlan = parseExtractToLesson(wiki.extract, subject, wiki.title, className, term, week)
      const questions = generateQuestionsFromText(wiki.extract, 5)
      return { studentNote, lessonPlan, questions, source: "wikipedia" }
    }
  } catch {
    // fall through to template
  }

  return {
    studentNote: generateTemplateStudentNote(subject, topic, className, term, week),
    lessonPlan: generateTemplateLesson(subject, topic, className, term, week),
    questions: [],
    source: "template",
  }
}

export async function generateLessonNoteWithQuestions(
  subject: string,
  topic: string,
  className: string,
  term: string,
  week: string | number
): Promise<{ content: string; questions: { questionText: string; type: string; options: string[]; correctAnswer: string; points: number }[]; source: "wikipedia" | "template" | "ai" }> {
  let content: string
  let source: "wikipedia" | "template" | "ai" = "template"

  try {
    const wiki = await fetchWikipediaExtract(topic)
    if (wiki.found && wiki.extract.length > 50) {
      content = parseExtractToLesson(wiki.extract, subject, wiki.title, className, term, week)
      source = "wikipedia"
      const questions = generateQuestionsFromText(wiki.extract, 5)
      return { content, questions, source }
    }
  } catch {
    // fall through
  }

  content = generateTemplateLesson(subject, topic, className, term, week)
  return { content, questions: [], source }
}

export function getContentVersion(content: any): "v1" | "v2" {
  if (typeof content === "string") return "v1"
  if (content && typeof content === "object" && content.format === "v2") return "v2"
  return "v1"
}

export function extractStudentContent(content: any): string {
  const version = getContentVersion(content)
  if (version === "v2") return content.studentNote || content.lessonPlan || ""
  if (typeof content === "string") return content
  return ""
}

export function extractLessonPlan(content: any): string {
  const version = getContentVersion(content)
  if (version === "v2") return content.lessonPlan || content.studentNote || ""
  if (typeof content === "string") return content
  return ""
}

function generateObjectives(category: string, topic: string): string {
  const common = [
    `Define and explain the key concepts of ${topic}`,
    `Identify and describe the main features of ${topic}`,
    `Apply the principles of ${topic} to solve related problems`,
    `Demonstrate understanding of ${topic} through practical exercises`,
    `Analyze and evaluate different aspects of ${topic}`,
  ]
  if (category === "mathematics") {
    return [
      `Define ${topic} and explain its importance in everyday life`,
      `Identify the key components and rules of ${topic}`,
      `Solve problems involving ${topic} accurately`,
      `Apply ${topic} to real-life situations`,
      `Demonstrate confidence in working with ${topic}`,
    ].map((o) => `- ${o}.`).join("\n")
  }
  if (category === "science") {
    return [
      `Define ${topic} and state its key concepts`,
      `Describe the processes and principles involved in ${topic}`,
      `Carry out simple experiments related to ${topic}`,
      `Record and interpret observations from ${topic} activities`,
      `Explain the importance of ${topic} in everyday life`,
    ].map((o) => `- ${o}.`).join("\n")
  }
  if (category === "english") {
    return [
      `Read and comprehend passages related to ${topic}`,
      `Identify and use key vocabulary associated with ${topic}`,
      `Construct sentences and paragraphs using ${topic} concepts`,
      `Analyze texts and express personal opinions about ${topic}`,
      `Demonstrate good communication skills when discussing ${topic}`,
    ].map((o) => `- ${o}.`).join("\n")
  }
  return common.map((o) => `- ${o}.`).join("\n")
}

export function generateMaterials(category: string, level: string): string {
  const common = [
    "- Whiteboard and markers",
    "- Textbook",
    "- Charts and diagrams",
    "- Notebooks and pens",
  ]
  if (category === "mathematics") common.push("- Geometric instruments / calculators")
  if (category === "science") common.push("- Laboratory equipment / specimens", "- Handouts with diagrams")
  if (category === "technology") common.push("- Computers / tablets", "- Projector")
  if (category === "creative") common.push("- Drawing materials", "- Art supplies")
  if (category === "english") common.push("- Reading passages", "- Dictionaries")
  if (level === "nursery") common.push("- Flashcards", "- Toys and learning aids", "- Colored objects")
  if (level === "primary") common.push("- Flashcards", "- Visual aids")
  return common.join("\n")
}

function generateLessonSteps(category: string, topic: string, level: string): string {
  const students = getStudentTitle(level)
  const steps: string[] = []

  if (category === "mathematics") {
    steps.push(
      `**Step 1: Introduction to ${topic}**\n- Teacher explains the concept of ${topic} with clear definitions.\n- Teacher writes key terms and formulas on the board.\n- ${students} listen, ask questions, and take notes.`,
    )
    steps.push(
      `**Step 2: Worked Examples**\n- Teacher solves example problems step-by-step on the board.\n- Teacher explains each step and why it is done.\n- ${students} copy the examples and ask clarifying questions.`,
    )
    steps.push(
      `**Step 3: Guided Practice**\n- Teacher gives ${students} similar problems to solve in pairs.\n- Teacher moves around the class to provide support.\n- Selected ${students} present their solutions on the board.`,
    )
    steps.push(
      `**Step 4: Independent Practice**\n- ${students} solve problems individually.\n- Teacher marks some work and provides feedback.`,
    )
  } else if (category === "science") {
    steps.push(
      `**Step 1: Introduction to ${topic}**\n- Teacher explains the concept and importance of ${topic}.\n- Teacher presents diagrams, charts, or real objects.\n- ${students} observe and share what they know.`,
    )
    steps.push(
      `**Step 2: Demonstration / Experiment**\n- Teacher demonstrates an experiment or activity related to ${topic}.\n- ${students} observe carefully and record their observations.\n- Teacher explains the scientific principles behind the observations.`,
    )
    steps.push(
      `**Step 3: Discussion and Note-Taking**\n- Teacher leads a class discussion on the findings.\n- Key points are summarized on the board.\n- ${students} copy notes and ask questions.`,
    )
    steps.push(
      `**Step 4: Application**\n- ${students} identify real-life applications of ${topic}.\n- Teacher gives examples from the local environment.`,
    )
  } else if (category === "english") {
    steps.push(
      `**Step 1: Introduction to ${topic}**\n- Teacher introduces the topic with a short passage or example.\n- ${students} listen and respond to pre-reading questions.`,
    )
    steps.push(
      `**Step 2: Reading and Comprehension**\n- ${students} read the passage or study the material.\n- Teacher explains difficult vocabulary and concepts.\n- ${students} answer comprehension questions.`,
    )
    steps.push(
      `**Step 3: Guided Practice**\n- ${students} work in groups to complete exercises.\n- Teacher guides and corrects where necessary.\n- Groups present their work to the class.`,
    )
    steps.push(
      `**Step 4: Evaluation**\n- ${students} complete individual written exercises.\n- Teacher reviews answers with the class.`,
    )
  } else {
    steps.push(
      `**Step 1: Introduction to ${topic}**\n- Teacher introduces the topic using a story, question, or visual aid.\n- ${students} share their prior knowledge and experiences.`,
    )
    steps.push(
      `**Step 2: Content Development**\n- Teacher explains the key concepts of ${topic} in detail.\n- Charts, diagrams, and examples are used for illustration.\n- ${students} take notes and ask questions.`,
    )
    steps.push(
      `**Step 3: Class Activity**\n- ${students} participate in group discussions or practical activities.\n- Teacher monitors and provides guidance.\n- Groups present their findings.`,
    )
    steps.push(
      `**Step 4: Summary**\n- Teacher summarizes the main points of the lesson.\n- ${students} ask final questions for clarification.`,
    )
  }

  return steps.map((s, i) => `**Step ${i + 1}:** ${s.split("**Step")[1] || s}`).join("\n\n")
}

function generateEvaluation(category: string, topic: string): string {
  const qs = [
    `1. What is ${topic}? Explain in your own words.`,
    `2. List three key features of ${topic}.`,
    `3. How does ${topic} apply to real-life situations? Give two examples.`,
    `4. Describe the main concepts covered in today's lesson.`,
    `5. What questions do you still have about ${topic}?`,
  ]
  if (category === "mathematics") {
    return [
      "1. Define " + topic + " and give two examples.",
      "2. Solve the following problems related to " + topic + ": (provide practice questions).",
      "3. Explain the steps involved in solving " + topic + " problems.",
      "4. Create your own word problem involving " + topic + ".",
      "5. How can " + topic + " be used in daily life?",
    ].join("\n")
  }
  return qs.join("\n")
}

export function generateAssignment(category: string, topic: string, level: string): string {
  if (level === "nursery") {
    return `1. Draw and color a picture related to ${topic}.\n2. Practice the new words you learned today with your parents.\n3. Bring an object related to ${topic} to the next class.`
  }
  if (category === "mathematics") {
    return `1. Solve five practice problems on ${topic} from your textbook.\n2. Write down the key formulas or rules for ${topic} in your notebook.\n3. Create two word problems involving ${topic} and solve them.\n4. Research one real-life application of ${topic} and write a short paragraph.`
  }
  if (category === "science") {
    return `1. Write a short report on what you learned about ${topic} today.\n2. Draw and label a diagram related to ${topic}.\n3. Find one example of ${topic} in your home environment.\n4. Read the next section in your textbook and prepare questions.`
  }
  if (category === "english") {
    return `1. Write five sentences using the new vocabulary words.\n2. Read the passage again and answer the questions in your notebook.\n3. Write a short paragraph about ${topic}.\n4. Practice reading aloud for fluency.`
  }
  return `1. Write a summary of today's lesson on ${topic}.\n2. Answer the review questions at the end of the chapter.\n3. Research more about ${topic} online or in your textbook.\n4. Be prepared for a class discussion on ${topic} in the next lesson.`
}

export function generateSchemeOfWeeks(
  subject: string,
  className: string,
  term: string,
  count: number = 12
): { weekNumber: number; topic: string; objectives: string; content: string; resources: string }[] {
  const weeks: { weekNumber: number; topic: string; objectives: string; content: string; resources: string }[] = []
  for (let i = 1; i <= count; i++) {
    weeks.push({
      weekNumber: i,
      topic: `${subject} - Week ${i}`,
      objectives: `By the end of Week ${i}, students will understand key concepts in this topic.`,
      content: `This week covers essential content in ${subject}. Activities include explanations, discussions, and practical exercises.`,
      resources: `Textbook, worksheets, and supplementary materials for ${subject}`,
    })
  }
  return weeks
}

export function generateAssignmentDescription(
  subject: string,
  className: string,
  topic: string,
  type: string
): string {
  const level = getLevel(className)
  const students = getStudentTitle(level)

  return `## ${topic} - ${type.charAt(0).toUpperCase() + type.slice(1)} Assignment

**Subject:** ${subject} | **Class:** ${className}

### Instructions
- Answer all questions in your notebook.
- Show all working where applicable.
- Submit on or before the due date.

### Questions
1. Define ${topic} in your own words.
2. List and explain five key points about ${topic}.
3. Give three real-life examples of ${topic}.
4. What is the relationship between ${topic} and what we learned previously?
5. Write a short note on the importance of ${topic}.

### Submission Guidelines
- Write clearly and legibly.
- Number your answers correctly.
- Submit to the class teacher.

### Note
${students} are encouraged to research beyond the textbook.`
}

export function generateQuestion(
  subject: string,
  className: string,
  topic: string,
  type: string
): { questionText: string; options: string[]; correctAnswer: string } | null {
  const cat = getSubjectCategory(subject)

  if (type === "True-False") {
    const qs = [
      { q: `${topic} is an important concept in ${subject}.`, a: "True" },
      { q: `${topic} only applies to advanced ${subject} topics.`, a: "False" },
    ]
    const picked = pick(qs)
    return { questionText: picked.q, options: ["True", "False"], correctAnswer: picked.a }
  }

  const configs: Record<string, { q: string; opts: string[]; ans: number }[]> = {
    mathematics: [
      { q: `Which of the following best defines ${topic}?`, opts: ["An arithmetic operation", `A key concept in ${subject}`, "A geometric shape", "A type of graph"], ans: 1 },
    ],
    science: [
      { q: `${topic} is best described as:`, opts: [`A fundamental concept in ${subject}`, "A laboratory tool", "A chemical element", "A mathematical formula"], ans: 0 },
    ],
    english: [
      { q: `Which sentence best demonstrates ${topic}?`, opts: ["The first example", "The second option", "The third choice", "The fourth selection"], ans: 0 },
    ],
  }

  const catConfigs = configs[cat] || [
    { q: `What is the primary focus of ${topic} in ${subject}?`, opts: ["Understanding core principles", "Memorizing facts", "Skipping difficult parts", "Only theory work"], ans: 0 },
  ]

  const picked = pick(catConfigs)
  return { questionText: picked.q, options: picked.opts, correctAnswer: String.fromCharCode(65 + picked.ans) }
}

export function generateQuestionSet(
  subject: string,
  className: string,
  topic: string,
  count: number = 5
): { questionText: string; type: string; options: string[]; correctAnswer: string; points: number }[] {
  const qs: { questionText: string; type: string; options: string[]; correctAnswer: string; points: number }[] = []
  for (let i = 0; i < count; i++) {
    const mcq = generateQuestion(subject, className, topic, "MCQ")
    if (mcq) {
      qs.push({ ...mcq, type: "MCQ", points: 1 })
    }
    if (qs.length >= count) break
  }
  const tf = generateQuestion(subject, className, topic, "True-False")
  if (tf && qs.length < count) {
    qs.push({ ...tf, type: "True-False", points: 1 })
  }
  return qs
}

export function detectTimetableConflicts(
  entries: { day: string; startTime?: string; endTime?: string; teacherId?: string; room?: string; classId?: string; id?: string }[]
): string[] {
  const warnings: string[] = []
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i], b = entries[j]
      if (a.day !== b.day) continue
      const aStart = a.startTime || "", aEnd = a.endTime || ""
      const bStart = b.startTime || "", bEnd = b.endTime || ""
      const overlap = aStart < bEnd && bStart < aEnd
      if (!overlap) continue
      if (a.teacherId && b.teacherId && a.teacherId === b.teacherId) {
        warnings.push(`⚠️ Teacher conflict: Same teacher assigned to ${a.day} ${aStart}-${aEnd} and ${bStart}-${bEnd}`)
      }
      if (a.room && b.room && a.room.toLowerCase() === b.room.toLowerCase()) {
        warnings.push(`⚠️ Room conflict: "${a.room}" double-booked on ${a.day} ${aStart}-${aEnd} and ${bStart}-${bEnd}`)
      }
      if (a.classId && b.classId && a.classId === b.classId) {
        warnings.push(`⚠️ Class conflict: Same class scheduled on ${a.day} ${aStart}-${aEnd} and ${bStart}-${bEnd}`)
      }
    }
  }
  return [...new Set(warnings)]
}
