// ============================================================
// 100+ QUESTIONS — Mathematics & English across all levels
// ============================================================

import { CLASS_BROAD_SECTION, CLASS_NAMES } from "./data"
import { nextId } from "./generators"

const now = () => new Date().toISOString()

// Math questions per level
function generateMathQuestions(classId: string, className: string, createdBy: string) {
  const section = CLASS_BROAD_SECTION[className]
  const questions: any[] = []

  if (section === "Nursery") {
    questions.push(
      { text: "What comes after 5?", options: ["4", "6", "7", "8"], correctAnswer: "6", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "How many fingers do you have on one hand?", options: ["3", "4", "5", "6"], correctAnswer: "5", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "Which shape has three sides?", options: ["Circle", "Square", "Triangle", "Rectangle"], correctAnswer: "Triangle", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "2 + 2 = ?", options: ["3", "4", "5", "6"], correctAnswer: "4", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "What is the biggest number? 3, 8, 1, 6", options: ["3", "8", "1", "6"], correctAnswer: "8", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "A circle is round.", options: ["True", "False"], correctAnswer: "True", type: "true_false", points: 3, difficulty: "easy" as const },
      { text: "Count from 1 to 10 and write the 7th number.", points: 5, type: "theory", difficulty: "medium" as const, theoryAnswer: "7" },
    )
  }

  if (section === "Primary") {
    questions.push(
      { text: "What is 15 + 27?", options: ["42", "32", "52", "40"], correctAnswer: "42", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "Which of these is a prime number?", options: ["12", "15", "17", "21"], correctAnswer: "17", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "What is 1/4 of 100?", options: ["20", "25", "30", "40"], correctAnswer: "25", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "A rectangle has 4 equal sides.", options: ["True", "False"], correctAnswer: "False", type: "true_false", points: 3, difficulty: "easy" as const },
      { text: "What is 9 × 8?", options: ["64", "72", "81", "56"], correctAnswer: "72", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Convert 0.5 to a fraction in simplest form.", options: ["1/5", "1/4", "1/2", "2/5"], correctAnswer: "1/2", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "What is the perimeter of a square with side 6cm?", options: ["12cm", "18cm", "24cm", "36cm"], correctAnswer: "24cm", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "Solve: 245 - 138 = ?", options: ["107", "117", "97", "127"], correctAnswer: "107", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "All odd numbers are prime.", options: ["True", "False"], correctAnswer: "False", type: "true_false", points: 3, difficulty: "medium" as const },
      { text: "What is 25% of 200?", options: ["25", "40", "50", "75"], correctAnswer: "50", type: "mcq", points: 5, difficulty: "hard" as const },
    )
  }

  if (section === "JSS") {
    questions.push(
      { text: "Solve for x: 3x + 7 = 22", options: ["3", "5", "7", "9"], correctAnswer: "5", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "What is the square root of 144?", options: ["10", "11", "12", "14"], correctAnswer: "12", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "If 5 books cost ₦750, what is the cost of 8 books?", options: ["₦1,000", "₦1,200", "₦1,500", "₦1,600"], correctAnswer: "₦1,200", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "A triangle has angles 70° and 50°. What is the third angle?", options: ["50°", "60°", "70°", "80°"], correctAnswer: "60°", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Simplify: 12x² + 3x - 4x² + 2x", options: ["8x² + 5x", "16x² + 5x", "8x² - x", "16x² - x"], correctAnswer: "8x² + 5x", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "What is 2³?", options: ["4", "6", "8", "9"], correctAnswer: "8", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "All prime numbers are odd.", options: ["True", "False"], correctAnswer: "False", type: "true_false", points: 3, difficulty: "medium" as const },
      { text: "Calculate the area of a circle with radius 7cm (π = 22/7)", options: ["154cm²", "144cm²", "164cm²", "174cm²"], correctAnswer: "154cm²", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "Convert 0.375 to a fraction in lowest terms.", options: ["3/8", "5/8", "3/4", "7/8"], correctAnswer: "3/8", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "Solve: 2(x - 3) = 14", options: ["x = 7", "x = 8", "x = 10", "x = 12"], correctAnswer: "x = 10", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "The mean of the numbers 5, 8, 12, 15, 20 is 12.", options: ["True", "False"], correctAnswer: "True", type: "true_false", points: 3, difficulty: "medium" as const },
      { text: "A man earns ₦60,000 per month and saves 15%. How much does he save monthly?", options: ["₦7,000", "₦8,000", "₦9,000", "₦10,000"], correctAnswer: "₦9,000", type: "mcq", points: 5, difficulty: "hard" as const },
    )
  }

  if (section === "SSS") {
    questions.push(
      { text: "Differentiate y = 3x² + 5x - 2", options: ["6x + 5", "3x + 5", "6x² + 5", "3x² + 5"], correctAnswer: "6x + 5", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "What is the value of log₂8?", options: ["2", "3", "4", "8"], correctAnswer: "3", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "If sin θ = 3/5, what is cos θ?", options: ["2/5", "3/5", "4/5", "5/3"], correctAnswer: "4/5", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "Solve: 2x² - 5x - 3 = 0", options: ["x = 1 or x = -1.5", "x = 2 or x = 3", "x = 3 or x = -0.5", "x = -3 or x = 0.5"], correctAnswer: "x = 3 or x = -0.5", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "The sum of interior angles of a pentagon is 540°.", options: ["True", "False"], correctAnswer: "True", type: "true_false", points: 3, difficulty: "medium" as const },
      { text: "What is ∫2x dx?", options: ["x² + c", "2x² + c", "x + c", "2x + c"], correctAnswer: "x² + c", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "Find the determinant of matrix [[2, 3], [1, 4]]", options: ["5", "7", "11", "14"], correctAnswer: "5", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "What is the probability of getting a head when flipping a fair coin?", options: ["1/4", "1/3", "1/2", "2/3"], correctAnswer: "1/2", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "In an arithmetic progression, the first term is 2 and the common difference is 3. Find the 10th term.", options: ["27", "29", "30", "32"], correctAnswer: "29", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "A line with gradient 2 passes through (1, 3). Find its equation.", options: ["y = 2x + 1", "y = 2x - 1", "y = 2x + 3", "y = x + 3"], correctAnswer: "y = 2x + 1", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Differentiate: y = sin(3x)", options: ["cos(3x)", "3cos(3x)", "-3cos(3x)", "3sin(3x)"], correctAnswer: "3cos(3x)", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "The quadratic equation x² - 5x + 6 = 0 has roots 2 and 3.", options: ["True", "False"], correctAnswer: "True", type: "true_false", points: 3, difficulty: "medium" as const },
    )
  }

  return questions.map((q) => ({
    id: nextId("q"),
    type: q.type,
    text: q.text,
    options: q.options || undefined,
    correctAnswer: q.correctAnswer || (q.type === "theory" ? q.theoryAnswer : undefined),
    points: q.points,
    difficulty: q.difficulty || "medium",
    subjectId: "",
    classId,
    topic: getMathTopic(q.text, section),
    approved: true,
    approvedBy: createdBy,
    approvedAt: now(),
    createdBy,
    createdAt: now(),
    updatedAt: now(),
  }))
}

// English questions per level
function generateEnglishQuestions(classId: string, className: string, createdBy: string) {
  const section = CLASS_BROAD_SECTION[className]
  const questions: any[] = []

  if (section === "Nursery") {
    questions.push(
      { text: "Which letter comes after A?", options: ["B", "C", "D", "E"], correctAnswer: "B", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "How many letters are in the word 'CAT'?", options: ["2", "3", "4", "5"], correctAnswer: "3", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "What sound does the letter 'B' make?", options: ["buh", "suh", "muh", "tuh"], correctAnswer: "buh", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "The word 'DOG' starts with the letter D.", options: ["True", "False"], correctAnswer: "True", type: "true_false", points: 3, difficulty: "easy" as const },
      { text: "What is the first letter of 'APPLE'?", options: ["A", "P", "L", "E"], correctAnswer: "A", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "Which word means a baby cat?", options: ["Kitten", "Puppy", "Cub", "Calf"], correctAnswer: "Kitten", type: "mcq", points: 5, difficulty: "medium" as const },
    )
  }

  if (section === "Primary") {
    questions.push(
      { text: "Choose the correct spelling:", options: ["Recieve", "Receive", "Receeve", "Reseive"], correctAnswer: "Receive", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Which of these is a noun?", options: ["Run", "Beautiful", "Table", "Quickly"], correctAnswer: "Table", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "What is the past tense of 'go'?", options: ["Goed", "Went", "Gone", "Going"], correctAnswer: "Went", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "Choose the correct sentence:", options: ["He go to school.", "He goes to school.", "He going to school.", "He gone to school."], correctAnswer: "He goes to school.", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "An adjective describes a verb.", options: ["True", "False"], correctAnswer: "False", type: "true_false", points: 3, difficulty: "medium" as const },
      { text: "What is the opposite of 'hot'?", options: ["Warm", "Cool", "Cold", "Mild"], correctAnswer: "Cold", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "Identify the verb: 'The boy ran quickly.'", options: ["Boy", "Ran", "Quickly", "The"], correctAnswer: "Ran", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Which word means 'very big'?", options: ["Small", "Tiny", "Enormous", "Tiny"], correctAnswer: "Enormous", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "'Their' is used to show possession.", options: ["True", "False"], correctAnswer: "True", type: "true_false", points: 3, difficulty: "easy" as const },
      { text: "Write a short paragraph about your best friend.", points: 10, type: "theory", difficulty: "medium" as const },
    )
  }

  if (section === "JSS") {
    questions.push(
      { text: "Which part of speech is the word 'happily'?", options: ["Noun", "Verb", "Adjective", "Adverb"], correctAnswer: "Adverb", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Choose the correct pronoun: '___ is going to the market.'", options: ["Him", "He", "His", "Himself"], correctAnswer: "He", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "What is the plural of 'child'?", options: ["Childs", "Childes", "Children", "Childrens"], correctAnswer: "Children", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "Identify the figure of speech: 'The wind whispered through the trees.'", options: ["Simile", "Metaphor", "Personification", "Alliteration"], correctAnswer: "Personification", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Change to reported speech: She said, 'I am tired.'", options: ["She said she is tired.", "She said she was tired.", "She said I am tired.", "She says she was tired."], correctAnswer: "She said she was tired.", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "'Their' and 'There' are homophones.", options: ["True", "False"], correctAnswer: "True", type: "true_false", points: 3, difficulty: "easy" as const },
      { text: "What is the antonym of 'generous'?", options: ["Kind", "Stingy", "Helpful", "Loving"], correctAnswer: "Stingy", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Complete the idiom: 'A blessing in ___'", options: ["Mask", "Disguise", "Hiding", "Secret"], correctAnswer: "Disguise", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Which sentence is punctuated correctly?", options: ["Where are you going?", "Where are you going.", "Where are you going!", "Where are you going"], correctAnswer: "Where are you going?", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "Identify the type of sentence: 'Please close the door.'", options: ["Declarative", "Interrogative", "Imperative", "Exclamatory"], correctAnswer: "Imperative", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Write a formal letter to your principal requesting permission to start a debate club.", points: 10, type: "theory", difficulty: "hard" as const },
      { text: "All adverbs end in '-ly'.", options: ["True", "False"], correctAnswer: "False", type: "true_false", points: 3, difficulty: "medium" as const },
    )
  }

  if (section === "SSS") {
    questions.push(
      { text: "Identify the literary device: 'He is as brave as a lion.'", options: ["Metaphor", "Simile", "Personification", "Hyperbole"], correctAnswer: "Simile", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "What is the mood of this passage? 'The dark clouds gathered ominously overhead as the wind howled through the empty streets.'", options: ["Joyful", "Tense/Fearful", "Peaceful", "Humorous"], correctAnswer: "Tense/Fearful", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Change to passive voice: 'The students completed the project.'", options: ["The project was completed by the students.", "The project is completed by the students.", "The project has been completed.", "The students were completed by the project."], correctAnswer: "The project was completed by the students.", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "What is the root word of 'unhappiness'?", options: ["un", "happy", "happiness", "ness"], correctAnswer: "happy", type: "mcq", points: 5, difficulty: "easy" as const },
      { text: "Which of these is a dramatic work?", options: ["Epic", "Novel", "Play", "Sonnet"], correctAnswer: "Play", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "A colon is used to introduce a list.", options: ["True", "False"], correctAnswer: "True", type: "true_false", points: 3, difficulty: "easy" as const },
      { text: "What is the main theme of Chinua Achebe's 'Things Fall Apart'?", options: ["Love", "Colonialism", "Technology", "Adventure"], correctAnswer: "Colonialism", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Identify the conflict type: 'A woman struggles with her fear of public speaking.'", options: ["Person vs Person", "Person vs Society", "Person vs Self", "Person vs Nature"], correctAnswer: "Person vs Self", type: "mcq", points: 5, difficulty: "medium" as const },
      { text: "Which of these sentences contains a dangling modifier?", options: ["Walking home, the rain started.", "Walking home, I felt the rain start.", "As I walked home, the rain started.", "The rain started while I was walking home."], correctAnswer: "Walking home, the rain started.", type: "mcq", points: 5, difficulty: "hard" as const },
      { text: "Analyze the poem 'The Pulley' by George Herbert, focusing on its central metaphor.", points: 10, type: "theory", difficulty: "hard" as const },
      { text: "Write a debate speech arguing for or against the motion: 'Social media does more harm than good.'", points: 10, type: "theory", difficulty: "hard" as const },
      { text: "A soliloquy is a speech delivered by one character alone on stage.", options: ["True", "False"], correctAnswer: "True", type: "true_false", points: 3, difficulty: "medium" as const },
    )
  }

  return questions.map((q) => ({
    id: nextId("q"),
    type: q.type,
    text: q.text,
    options: q.options || undefined,
    correctAnswer: q.correctAnswer || (q.type === "theory" ? q.theoryAnswer : undefined),
    points: q.points,
    difficulty: q.difficulty || "medium",
    subjectId: "",
    classId,
    topic: getEnglishTopic(q.text, section),
    approved: true,
    approvedBy: createdBy,
    approvedAt: now(),
    createdBy,
    createdAt: now(),
    updatedAt: now(),
  }))
}

function getMathTopic(text: string, section: string): string {
  if (text.includes("differentiate") || text.includes("integrate") || text.includes("∫")) return "Calculus"
  if (text.includes("matrix") || text.includes("determinant")) return "Matrices"
  if (text.includes("log") || text.includes("logarithm")) return "Logarithms"
  if (text.includes("sin") || text.includes("cos") || text.includes("trig")) return "Trigonometry"
  if (text.includes("quadratic") || text.includes("solve for x") || text.includes("algebra")) return "Algebra"
  if (text.includes("prime") || text.includes("odd") || text.includes("even")) return "Number Theory"
  if (text.includes("fraction") || text.includes("decimal") || text.includes("percent")) return "Fractions & Decimals"
  if (text.includes("area") || text.includes("perimeter") || text.includes("geometry") || text.includes("angle")) return "Geometry"
  if (text.includes("probability")) return "Probability"
  if (text.includes("mean") || text.includes("average") || text.includes("statistics")) return "Statistics"
  if (text.includes("differentiate") || text.includes("calculus")) return "Calculus"
  if (text.includes("arithmetic") || text.includes("sequence") || text.includes("progression")) return "Sequences"
  return "General Mathematics"
}

function getEnglishTopic(text: string, section: string): string {
  if (text.includes("grammar") || text.includes("verb") || text.includes("noun") || text.includes("pronoun") || text.includes("adjective") || text.includes("adverb") || text.includes("preposition") || text.includes("conjunction") || text.includes("tense") || text.includes("plural") || text.includes("passive") || text.includes("reported")) return "Grammar"
  if (text.includes("spelling") || text.includes("spell")) return "Spelling"
  if (text.includes("vocabulary") || text.includes("word") || text.includes("meaning") || text.includes("synonym") || text.includes("antonym") || text.includes("idiom")) return "Vocabulary"
  if (text.includes("comprehension") || text.includes("passage") || text.includes("read")) return "Comprehension"
  if (text.includes("essay") || text.includes("paragraph") || text.includes("write") || text.includes("letter") || text.includes("composition") || text.includes("debate")) return "Composition"
  if (text.includes("figure of speech") || text.includes("simile") || text.includes("metaphor") || text.includes("personification") || text.includes("literary") || text.includes("poem") || text.includes("poetry") || text.includes("theme") || text.includes("conflict") || text.includes("soliloquy") || text.includes("dramatic") || text.includes("play") || text.includes("novel") || text.includes("prose")) return "Literature"
  if (text.includes("punctuation") || text.includes("colon") || text.includes("comma") || text.includes("apostrophe") || text.includes("sentence")) return "Punctuation & Syntax"
  if (text.includes("phonics") || text.includes("letter") || text.includes("sound") || text.includes("alphabet")) return "Phonics"
  return "General English"
}

// ============================================================
// MAIN GENERATOR
// ============================================================
export function generateAllQuestions(
  classes: { id: string; name: string }[],
  subjects: { id: string; name: string; classId: string }[],
  createdBy: string
) {
  const allQuestions: any[] = []

  for (const cls of classes) {
    const classSubjects = subjects.filter((s) => s.classId === cls.id)
    const mathSub = classSubjects.find((s) => s.name === "Mathematics" || s.name === "Number Work")
    const engSub = classSubjects.find((s) => s.name === "English Language" || s.name === "Letter Work")

    if (mathSub) {
      const mathQuestions = generateMathQuestions(cls.id, cls.name, createdBy)
      mathQuestions.forEach((q) => { q.subjectId = mathSub.id })
      allQuestions.push(...mathQuestions)
    }

    if (engSub) {
      const engQuestions = generateEnglishQuestions(cls.id, cls.name, createdBy)
      engQuestions.forEach((q) => { q.subjectId = engSub.id })
      allQuestions.push(...engQuestions)
    }
  }

  return allQuestions
}

// ============================================================
// EXAMS
// ============================================================
export function generateExams(
  classes: { id: string; name: string }[],
  subjects: { id: string; name: string; classId: string }[],
  questions: { id: string; classId: string; subjectId: string; points: number }[],
  createdBy: string
) {
  const exams: any[] = []
  const sections = ["Nursery", "Primary", "JSS", "SSS"]

  for (const section of sections) {
    const sectionClasses = classes.filter((c) => CLASS_BROAD_SECTION[c.name] === section)
    if (sectionClasses.length === 0) continue

    const representativeClass = sectionClasses[0]
    const classSubjects = subjects.filter((s) => s.classId === representativeClass.id)
    const mathSub = classSubjects.find((s) => s.name === "Mathematics" || s.name === "Number Work")
    const engSub = classSubjects.find((s) => s.name === "English Language" || s.name === "Letter Work")

    if (mathSub) {
      const mathQuestions = questions.filter((q) => q.subjectId === mathSub.id).slice(0, 10)
      const now = new Date().toISOString()
      exams.push({
        id: nextId("exm"),
        title: `End of Term Examination - ${mathSub.name} (${section})`,
        description: `Comprehensive end of first term examination for ${mathSub.name} covering all topics taught.`,
        duration: 60,
        shuffleQuestions: true,
        showResults: true,
        subjectId: mathSub.id,
        classId: representativeClass.id,
        createdBy,
        questions: mathQuestions.map((q) => ({ questionId: q.id, points: q.points })),
        status: "published",
        createdAt: now,
        updatedAt: now,
      })
    }

    if (engSub) {
      const engQuestions = questions.filter((q) => q.subjectId === engSub.id).slice(0, 10)
      const now = new Date().toISOString()
      exams.push({
        id: nextId("exm"),
        title: `End of Term Examination - ${engSub.name} (${section})`,
        description: `Comprehensive end of first term examination for ${engSub.name} covering all topics taught.`,
        duration: 60,
        shuffleQuestions: true,
        showResults: true,
        subjectId: engSub.id,
        classId: representativeClass.id,
        createdBy,
        questions: engQuestions.map((q) => ({ questionId: q.id, points: q.points })),
        status: "published",
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  return exams
}

// ============================================================
// EXAM SESSIONS + SUBMISSIONS (simulate some completed exams)
// ============================================================
export function generateExamSessionsAndSubmissions(
  exams: { id: string; subjectId: string; questions: { questionId: string; points: number }[] }[],
  students: { id: string; firstName: string; lastName: string; classId: string }[],
  subjects: { id: string; classId: string }[]
) {
  const sessions: any[] = []
  const submissions: any[] = []

  for (let ei = 0; ei < Math.min(exams.length, 6); ei++) {
    const exam = exams[ei]
    const eligibleStudents = students.filter((s) => {
      const sub = subjects.find((sb) => sb.id === exam.subjectId)
      return sub && s.classId === sub.classId
    }).slice(0, 5)

    for (const student of eligibleStudents) {
      const now = new Date().toISOString()
      const startTime = new Date(Date.now() - 3600000 - Math.random() * 86400000).toISOString()
      const answers = exam.questions.map((q) => ({
        questionId: q.questionId,
        answer: Math.random() > 0.3 ? "Sample answer text" : "",
        score: Math.random() > 0.3 ? Math.floor(Math.random() * q.points) + 1 : 0,
      }))
      const totalScore = answers.reduce((s: number, a: any) => s + (a.score || 0), 0)
      const maxScore = exam.questions.reduce((s: number, q: any) => s + q.points, 0)

      sessions.push({
        id: nextId("esn"),
        examId: exam.id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentId: student.id,
        startTime,
        endTime: new Date(new Date(startTime).getTime() + 3600000).toISOString(),
        status: "completed",
        answers,
        totalScore,
        maxScore,
        tabSwitches: Math.floor(Math.random() * 3),
        flagged: Math.random() > 0.9,
        createdAt: startTime,
      })
    }
  }

  // Create submissions for these sessions
  sessions.forEach((session, i) => {
    const teacherIds = ["2", "3", "4", "5", "6"]
    submissions.push({
      id: nextId("sub"),
      sessionId: session.id,
      gradedBy: teacherIds[i % teacherIds.length],
      totalScore: session.totalScore,
      maxScore: session.maxScore,
      feedback: i % 3 === 0 ? "Good attempt. Review the areas you missed." : null,
      gradedAt: new Date(new Date(session.endTime).getTime() + 86400000).toISOString(),
      status: "graded",
    })
  })

  return { sessions, submissions }
}
