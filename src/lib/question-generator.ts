function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [text]
}

function getKeyTerms(text: string): string[] {
  const terms = new Set<string>()
  const sentences = splitSentences(text)
  for (const s of sentences) {
    const words = s.split(/\s+/)
    for (let i = 0; i < words.length; i++) {
      const w = words[i].replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "")
      if (w.length >= 6 && /^[A-Z]/.test(w)) {
        terms.add(w)
      }
    }
  }
  return [...terms]
}

function findDefinitionSentences(text: string): string[] {
  const patterns = [
    /is a\s/i, /is an\s/i, /is the\s/i, /are called\s/i,
    /refers to\s/i, /is defined as\s/i, /means\s/i,
    /is one of\s/i, /can be defined as\s/i, /is known as\s/i,
  ]
  return splitSentences(text).filter((s) =>
    patterns.some((p) => p.test(s))
  )
}

function extractMcqFromDefinition(sentence: string, allSentences: string[]): { question: string; options: string[]; answer: number } | null {
  const clean = sentence.trim()
  const match = clean.match(/^([A-Z][^,]+?)\s+is\s+(a|an|the)\s+(.+)/i)
  if (!match) return null

  const term = match[1].trim()
  const definition = match[3].replace(/[.!?]$/, "").trim()

  if (definition.length > 120 || definition.length < 5) return null

  const distractors: string[] = []
  for (const s of allSentences) {
    if (s === clean) continue
    const dMatch = s.match(/\s+is\s+(a|an|the)\s+(.+)/i)
    if (dMatch) {
      const d = dMatch[2].replace(/[.!?]$/, "").trim()
      if (d.length < 120 && d !== definition) {
        distractors.push(d)
      }
    }
  }

  while (distractors.length < 3) {
    const fallbacks = [
      `a concept unrelated to ${term}`,
      `a different topic in this subject`,
      `a method used for other purposes`,
    ]
    for (const f of fallbacks) {
      if (distractors.length < 3) distractors.push(f)
    }
  }

  const options = shuffle([definition, ...distractors.slice(0, 3)])
  const answer = options.indexOf(definition)

  return {
    question: `What is ${term}?`,
    options,
    answer,
  }
}

function extractMcqFromFact(sentence: string): { question: string; options: string[]; answer: number } | null {
  const clean = sentence.trim()
  const words = clean.split(/\s+/)
  if (words.length < 6 || words.length > 40) return null

  const match = clean.match(/^(.{10,80}?)\s+(is|are|was|were|has|have|can|will|may)\s+(.{5,80})/i)
  if (!match) return null

  const subject = match[1].trim()
  const verb = match[2]
  const remainder = match[3].replace(/[.!?]$/, "").trim()

  if (subject.length > 60 || remainder.length > 80) return null

  const wrongVerb = verb === "is" ? "are not" : verb === "are" ? "is not" : verb === "has" ? "does not have" : verb === "can" ? "cannot" : "was not"

  const options = shuffle([
    `${verb} ${remainder}`,
    `${wrongVerb} ${remainder}`,
    `${verb} a different concept`,
    `${verb} the opposite of ${remainder}`,
  ])

  return {
    question: `Which statement about ${subject} is correct?`,
    options,
    answer: options.indexOf(`${verb} ${remainder}`),
  }
}

function findFillInBlank(sentence: string, keyTerms: string[]): { question: string; options: string[]; answer: number } | null {
  for (const term of keyTerms) {
    const regex = new RegExp(`\\b${term}\\b`)
    if (regex.test(sentence)) {
      const question = sentence.replace(regex, "________")
      if (question.length > 200) continue

      const distractors = keyTerms.filter((t) => t !== term).slice(0, 3)
      while (distractors.length < 3) {
        const fallbacks = ["Concept", "Process", "Theory"]
        for (const f of fallbacks) {
          if (distractors.length < 3 && !distractors.includes(f)) distractors.push(f)
        }
      }

      const options = shuffle([term, ...distractors.slice(0, 3)])
      const answer = options.indexOf(term)
      return { question, options, answer }
    }
  }
  return null
}

function findTrueFalse(sentence: string): { question: string; answer: boolean } | null {
  const clean = sentence.trim()
  if (clean.length < 20 || clean.length > 200) return null

  const negators = ["not", "never", "cannot", "no", "without"]
  const hasNegation = negators.some((n) => new RegExp(`\\b${n}\\b`, "i").test(clean))

  if (Math.random() > 0.5) {
    if (hasNegation) {
      const modified = clean.replace(/\bnot\b/i, "").replace(/\bnever\b/i, "always").replace(/\bcannot\b/i, "can")
      if (modified !== clean) return { question: modified.trim(), answer: true }
    }
    return { question: clean, answer: true }
  }

  const modified = clean
    .replace(/\bis\s+(a|an|the)\s+/i, "is not ")
    .replace(/\bare\s+/i, "are not ")
    .replace(/\bwas\s+/i, "was not ")
    .replace(/\bhas\s+/i, "does not have ")

  if (modified !== clean) return { question: modified.trim(), answer: false }
  return { question: clean, answer: true }
}

export function generateQuestionsFromText(
  text: string,
  count: number = 5
): { questionText: string; type: "MCQ" | "True-False" | "Fill-in-Blank"; options: string[]; correctAnswer: string; points: number }[] {
  const result: { questionText: string; type: "MCQ" | "True-False" | "Fill-in-Blank"; options: string[]; correctAnswer: string; points: number }[] = []

  if (!text || text.trim().length < 20) return result

  const sentences = splitSentences(text)
  const definitionSentences = findDefinitionSentences(text)
  const keyTerms = getKeyTerms(text)

  const mcqs: { question: string; options: string[]; answer: number }[] = []

  for (const def of definitionSentences) {
    const mcq = extractMcqFromDefinition(def, sentences)
    if (mcq && !mcqs.some((m) => m.question === mcq.question)) {
      mcqs.push(mcq)
    }
  }

  for (const s of sentences) {
    if (mcqs.length >= 3) break
    if (definitionSentences.includes(s)) continue
    const mcq = extractMcqFromFact(s)
    if (mcq && !mcqs.some((m) => m.question === mcq.question)) {
      mcqs.push(mcq)
    }
  }

  for (const mcq of mcqs) {
    if (result.length >= count) break
    result.push({
      questionText: mcq.question,
      type: "MCQ",
      options: mcq.options,
      correctAnswer: String.fromCharCode(65 + mcq.answer),
      points: 1,
    })
  }

  const fillBlanks: { question: string; options: string[]; answer: number }[] = []
  for (const s of sentences) {
    if (fillBlanks.length >= 2) break
    if (keyTerms.length < 2) break
    const fb = findFillInBlank(s, keyTerms)
    if (fb && !fillBlanks.some((f) => f.question === fb.question)) {
      fillBlanks.push(fb)
    }
  }

  for (const fb of fillBlanks) {
    if (result.length >= count) break
    result.push({
      questionText: fb.question,
      type: "Fill-in-Blank",
      options: fb.options,
      correctAnswer: String.fromCharCode(65 + fb.answer),
      points: 1,
    })
  }

  const tfs: { question: string; answer: boolean }[] = []
  for (const s of sentences) {
    if (tfs.length >= 2) break
    const tf = findTrueFalse(s)
    if (tf && !tfs.some((t) => t.question === tf.question)) {
      tfs.push(tf)
    }
  }

  for (const tf of tfs) {
    if (result.length >= count) break
    result.push({
      questionText: tf.question,
      type: "True-False",
      options: ["True", "False"],
      correctAnswer: tf.answer ? "A" : "B",
      points: 1,
    })
  }

  return shuffle(result).slice(0, count)
}
