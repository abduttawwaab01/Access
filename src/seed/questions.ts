// ============================================================
// 50 MATH + 50 ENGLISH QUESTIONS PER CLASS LEVEL
// Programmatic generation using templates + class-index seeding
// ============================================================

import { CLASS_BROAD_SECTION, getSubjectsForClass, CLASS_NAMES } from "./data"
import { nextId } from "./generators"

const now = () => new Date().toISOString()

// Helper: deterministic pseudorandom based on seed
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5)
  return shuffled.slice(0, n)
}

// ============================================================
// MATH QUESTION GENERATION
// ============================================================
function generateMathQuestionsForSection(
  section: string,
  classIndex: number,
  classId: string,
  subjectId: string,
  createdBy: string
) {
  const rand = seededRandom(classIndex * 7919 + 104729)
  const questions: any[] = []
  let qIdx = 0

  function add(type: string, text: string, options: string[], correctAnswer: string, difficulty: string, points = 5) {
    questions.push({
      id: nextId("q"),
      type,
      text,
      options,
      correctAnswer,
      points,
      difficulty,
      subjectId,
      classId,
      topic: guessMathTopic(text),
      approved: true,
      approvedBy: createdBy,
      approvedAt: now(),
      createdBy,
      createdAt: now(),
      updatedAt: now(),
    })
  }

  function addTrueFalse(text: string, correctAnswer: string, difficulty: string) {
    add("true_false", text, ["True", "False"], correctAnswer, difficulty, 3)
  }

  function addTheory(text: string, difficulty: string, points = 10) {
    questions.push({
      id: nextId("q"),
      type: "theory",
      text,
      options: undefined,
      correctAnswer: undefined,
      points,
      difficulty,
      subjectId,
      classId,
      topic: guessMathTopic(text),
      approved: true,
      approvedBy: createdBy,
      approvedAt: now(),
      createdBy,
      createdAt: now(),
      updatedAt: now(),
    })
  }

  // Number ranges for each section
  const ranges: Record<string, { max: number; maxMult: number; decimals: boolean }> = {
    Nursery: { max: 10, maxMult: 5, decimals: false },
    Primary: { max: 50, maxMult: 12, decimals: true },
    JSS: { max: 100, maxMult: 15, decimals: true },
    SSS: { max: 200, maxMult: 20, decimals: true },
  }
  const R = ranges[section] || ranges.Primary

  const addLevel = section === "Nursery" ? "concrete" : section === "Primary" ? "intermediate" : "abstract"

  // --- Templates ---
  const templates: (() => void)[] = []

  // 1. Basic addition (+2 templates for variety)
  templates.push(() => {
    const a = Math.floor(rand() * R.max) + 1
    const b = Math.floor(rand() * R.max) + 1
    const correct = a + b
    const wrongs = new Set<number>()
    while (wrongs.size < 3) {
      const w = correct + Math.floor(rand() * 20) - 10
      if (w !== correct && w > 0) wrongs.add(w)
    }
    const opts = [String(correct), ...Array.from(wrongs).map(String)].sort(() => rand() - 0.5)
    add("mcq", `What is ${a} + ${b}?`, opts, String(correct), correct <= 20 ? "easy" : "medium")
  })

  templates.push(() => {
    const a = Math.floor(rand() * R.max) + 10
    const b = Math.floor(rand() * R.max) + 1
    if (a < b) return
    const correct = a - b
    const wrongs = new Set<number>()
    while (wrongs.size < 3) {
      const w = correct + Math.floor(rand() * 20) - 10
      if (w !== correct && w >= 0) wrongs.add(w)
    }
    const opts = [String(correct), ...Array.from(wrongs).map(String)].sort(() => rand() - 0.5)
    add("mcq", `What is ${a} - ${b}?`, opts, String(correct), correct <= 20 ? "easy" : "medium")
  })

  // 2. Multiplication (Primary+)
  if (section !== "Nursery") {
    templates.push(() => {
      const a = Math.floor(rand() * R.maxMult) + 2
      const b = Math.floor(rand() * Math.min(R.maxMult, 12)) + 2
      const correct = a * b
      const wrongs = new Set<number>()
      while (wrongs.size < 3) {
        const w = correct + Math.floor(rand() * 30) - 15
        if (w !== correct && w > 0) wrongs.add(w)
      }
      const opts = [String(correct), ...Array.from(wrongs).map(String)].sort(() => rand() - 0.5)
      add("mcq", `What is ${a} × ${b}?`, opts, String(correct), correct > 50 ? "medium" : "easy")
    })
  }

  // 3. Division (Primary+)
  if (section !== "Nursery") {
    templates.push(() => {
      const b = Math.floor(rand() * Math.min(R.maxMult, 10)) + 2
      const q = Math.floor(rand() * Math.min(R.maxMult, 10)) + 1
      const a = b * q
      const correct = q
      const wrongs = new Set<number>()
      while (wrongs.size < 3) {
        const w = correct + Math.floor(rand() * 10) - 5
        if (w !== correct && w > 0) wrongs.add(w)
      }
      const opts = [String(correct), ...Array.from(wrongs).map(String)].sort(() => rand() - 0.5)
      add("mcq", `What is ${a} ÷ ${b}?`, opts, String(correct), "medium")
    })
  }

  // 4. Place value / expanded form (Primary)
  if (section === "Primary") {
    templates.push(() => {
      const n = Math.floor(rand() * 9000) + 1000
      const digits = String(n).split("")
      const place = Math.floor(rand() * 4) // thousands, hundreds, tens, units
      const placeNames = ["thousands", "hundreds", "tens", "units"]
      const digit = digits[place]
      const wrongs = new Set<string>()
      while (wrongs.size < 3) {
        wrongs.add(String(Math.floor(rand() * 9) + 1))
      }
      wrongs.delete(digit)
      const opts = [digit, ...Array.from(wrongs)].sort(() => rand() - 0.5)
      add("mcq", `What digit is in the ${placeNames[place]} place in ${n}?`, opts, digit, "easy")
    })
  }

  // 5. Fractions (Primary+)
  if (section !== "Nursery") {
    templates.push(() => {
      const num = Math.floor(rand() * 4) + 1
      const den = Math.floor(rand() * 4) + 2
      const pct = Math.round((num / den) * 100)
      add("mcq",
        `What is ${num}/${den} as a percentage?`,
        [String(pct) + "%", String(pct + 5) + "%", String(pct - 5) + "%", String(pct + 10) + "%"],
        String(pct) + "%", "medium")
    })
  }

  // 6. Fraction identification (Nursery/Primary basic)
  templates.push(() => {
    if (section === "Nursery") {
      const shape = pick(["circle", "square", "triangle"], rand)
      add("mcq",
        `What shape has 3 sides?`,
        ["Circle", "Square", "Triangle", "Rectangle"],
        "Triangle", "easy")
    } else {
      const num = Math.floor(rand() * 3) + 1
      const den = Math.floor(rand() * 4) + 2
      add("mcq",
        `What fraction is shaded if ${num} out of ${den} parts are shaded?`,
        [`${num}/${den}`, `${den}/${num}`, `${num + 1}/${den}`, `${num}/${den + 1}`],
        `${num}/${den}`, "easy")
    }
  })

  // 7. Word problems (all levels)
  templates.push(() => {
    const items = ["apples", "oranges", "books", "pens", "chairs", "tables", "mangoes", "crayons"]
    const item = pick(items, rand)
    const a = Math.floor(rand() * R.max) + 1
    const b = Math.floor(rand() * R.max) + 1
    if (section === "Nursery") {
      add("mcq",
        `If you have ${a} ${item} and get ${b} more, how many ${item} do you have in total?`,
        [String(a + b), String(a), String(b), String(a + b + 1)],
        String(a + b), "easy")
    } else {
      const action = pick(["bought", "had", "picked", "collected"], rand)
      const action2 = pick(["got", "found", "received", "was given"], rand)
      add("mcq",
        `Tunde ${action} ${a} ${item}. He then ${action2} ${b} more. How many ${item} does he have in total?`,
        [String(a + b), String(a - b), String(a * b), String(Math.abs(a - b))],
        String(a + b), "medium")
    }
  })

  // 8. Number sequences
  templates.push(() => {
    const step = Math.floor(rand() * 5) + 1
    const start = Math.floor(rand() * 10) + 1
    const seq = [start, start + step, start + 2 * step, start + 3 * step]
    const correct = seq[3] + step
    if (section === "SSS") {
      const wrongs = [correct + 2 * step, correct - step, correct + step + 1].map(String)
      add("mcq",
        `What is the next number in the sequence: ${seq.join(", ")}, ___?`,
        [String(correct), ...wrongs], String(correct), "medium")
    } else if (section === "JSS") {
      const wrongs = [correct - 1, correct + 2 * step, correct + 1].map(String)
      add("mcq",
        `Find the next number: ${seq.join(", ")}, ___?`,
        [String(correct), ...wrongs], String(correct), "medium")
    } else {
      add("mcq",
        `What comes next? ${seq.join(", ")}, ___?`,
        [String(correct), String(correct + 1), String(correct - 1), String(correct + step)],
        String(correct), "easy")
    }
  })

  // 9. Greater than / Less than
  templates.push(() => {
    const a = Math.floor(rand() * R.max) + 1
    const b = Math.floor(rand() * R.max) + 1
    if (a === b) return
    const correct = a > b ? ">" : "<"
    add("mcq",
      `Which symbol makes this true? ${a} ___ ${b}`,
      [">", "<", "=", "+"],
      correct, "easy")
  })

  // 10. Perimeter (Primary+)
  if (section !== "Nursery") {
    templates.push(() => {
      const side = Math.floor(rand() * 10) + 3
      add("mcq",
        `What is the perimeter of a square with side ${side}cm?`,
        [`${side * 4}cm`, `${side * 2}cm`, `${side}cm`, `${side + 4}cm`],
        `${side * 4}cm`, "medium")
    })
  }

  // 11. Area (Primary+)
  if (section !== "Nursery") {
    templates.push(() => {
      const l = Math.floor(rand() * 8) + 3
      const w = Math.floor(rand() * 6) + 2
      add("mcq",
        `What is the area of a rectangle ${l}cm by ${w}cm?`,
        [`${l * w}cm²`, `${l + w}cm²`, `${2 * (l + w)}cm²`, `${l * w * 2}cm²`],
        `${l * w}cm²`, "medium")
    })
  }

  // 12. Time / Calendar (Primary)
  if (section === "Primary" || section === "Nursery") {
    templates.push(() => {
      const hr = Math.floor(rand() * 12) + 1
      const min = Math.floor(rand() * 4) * 15
      add("mcq",
        `What time is shown if the hour hand is at ${hr} and minute hand is at 12?`,
        [`${hr}:00`, `${hr}:30`, `${hr}:15`, `${hr}:45`],
        `${hr}:00`, "easy")
    })
  }

  // 13. Money (Nigeria Naira)
  if (section !== "Nursery") {
    templates.push(() => {
      const amount = Math.floor(rand() * 50 + 1) * 100
      const discount = Math.floor(rand() * 30 + 5)
      const saved = Math.round(amount * discount / 100)
      add("mcq",
        `A school bag costs ₦${amount}. If there is a ${discount}% discount, how much money is saved?`,
        [`₦${saved}`, `₦${saved + 50}`, `₦${Math.round(amount * 0.1)}`, `₦${saved * 2}`],
        `₦${saved}`, "hard")
    })
  }

  // 14. Even/Odd (Primary+)
  if (section !== "Nursery") {
    templates.push(() => {
      const n = Math.floor(rand() * 50) + 1
      const correct = n % 2 === 0 ? "Even" : "Odd"
      add("mcq",
        `Is ${n} an even or odd number?`,
        ["Even", "Odd", "Prime", "Both"],
        correct, "easy")
    })
  }

  // 15. Algebra: Solve for x (JSS+)
  if (section === "JSS" || section === "SSS") {
    templates.push(() => {
      const coeff = Math.floor(rand() * 5) + 2
      const constTerm = Math.floor(rand() * 10) + 1
      const result = coeff * 5 + constTerm
      add("mcq",
        `Solve for x: ${coeff}x + ${constTerm} = ${result}`,
        [String(5), String(4), String(6), String(5 + Math.floor(rand() * 3) - 1)],
        String(5), "medium")
    })
    templates.push(() => {
      const coeff = Math.floor(rand() * 4) + 2
      const rhs = coeff * 7
      add("mcq",
        `If ${coeff}x = ${rhs}, what is x?`,
        [String(7), String(rhs), String(rhs / 2), String(coeff)],
        String(7), "easy")
    })
  }

  // 16. Prime numbers (JSS+)
  if (section !== "Nursery" && section !== "Primary") {
    templates.push(() => {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
      const nonPrimes = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25]
      const correct = pick(primes, rand)
      const wrongs = pickN(nonPrimes, 3, rand).map(String)
      const opts = [String(correct), ...wrongs].sort(() => rand() - 0.5)
      add("mcq",
        `Which of these is a prime number?`,
        opts, String(correct), "medium")
    })
  }

  // 17. Decimals and percentages (Primary+)
  if (R.decimals) {
    templates.push(() => {
      const pct = (Math.floor(rand() * 8) + 2) * 10
      add("mcq",
        `What is ${pct}% of 50?`,
        [String(pct * 50 / 100), String(pct), String(50 / pct * 100), String(pct * 50)],
        String(pct * 50 / 100), "hard")
    })
  }

  // 18. Ratio (JSS+)
  if (section === "JSS" || section === "SSS") {
    templates.push(() => {
      const aRatio = Math.floor(rand() * 3) + 1
      const bRatio = Math.floor(rand() * 3) + 1
      const total = (aRatio + bRatio) * 10
      const correct = aRatio * 10
      const wrong = bRatio * 10
      add("mcq",
        `If ₦${total} is shared between A and B in the ratio ${aRatio}:${bRatio}, how much does A get?`,
        [`₦${correct}`, `₦${wrong}`, `₦${correct * 2}`, `₦${total / 2}`],
        `₦${correct}`, "hard")
    })
  }

  // 19. Probability (JSS+)
  if (section === "JSS" || section === "SSS") {
    templates.push(() => {
      const total = Math.floor(rand() * 4) + 4
      const favorable = Math.floor(rand() * (total - 1)) + 1
      add("mcq",
        `A bag contains ${total} balls, ${favorable} are red. What is the probability of picking a red ball?`,
        [`${favorable}/${total}`, `${total - favorable}/${total}`, `1/${total}`, `${favorable}/1`],
        `${favorable}/${total}`, "medium")
    })
  }

  // 20. Calculus (SSS only)
  if (section === "SSS") {
    templates.push(() => {
      const a = Math.floor(rand() * 3) + 2
      const b = Math.floor(rand() * 5) + 1
      add("mcq",
        `Differentiate y = ${a}x² + ${b}x - 3`,
        [`${2 * a}x + ${b}`, `${a}x + ${b}`, `${2 * a}x² + ${b}`, `${a}x² + ${b}x`],
        `${2 * a}x + ${b}`, "hard")
    })
    templates.push(() => {
      const base = Math.floor(rand() * 3) + 2
      add("mcq",
        `What is log₂${Math.pow(2, base)}?`,
        [String(base), String(base + 1), String(base - 1), String(2 * base)],
        String(base), "medium")
    })
    templates.push(() => {
      const angle = pick([30, 45, 60], rand)
      const sinVal = angle === 30 ? "1/2" : angle === 45 ? "√2/2" : "√3/2"
      add("mcq",
        `What is sin ${angle}°?`,
        [sinVal, "1/3", "1", "0"],
        sinVal, "medium")
    })
    templates.push(() => {
      const a = Math.floor(rand() * 4) + 1
      const b = Math.floor(rand() * 4) + 1
      add("mcq",
        `Find the gradient of the line y = ${a}x + ${b}`,
        [String(a), String(b), String(a + b), String(a - b)],
        String(a), "easy")
    })
  }

  // 21. Geometry: angles (JSS+)
  if (section !== "Nursery" && section !== "Primary") {
    templates.push(() => {
      const a = Math.floor(rand() * 40) + 30
      const b = Math.floor(rand() * 40) + 30
      if (a + b >= 180) return
      add("mcq",
        `A triangle has two angles: ${a}° and ${b}°. What is the third angle?`,
        [String(180 - a - b) + "°", String(a + b) + "°", String(90) + "°", String(180 - a) + "°"],
        String(180 - a - b) + "°", "medium")
    })
  }

  // 22. Simple interest (JSS+)
  if (section === "JSS" || section === "SSS") {
    templates.push(() => {
      const P = (Math.floor(rand() * 10) + 1) * 10000
      const R = Math.floor(rand() * 10) + 5
      const T = 1
      const SI = P * R / 100
      add("mcq",
        `What is the simple interest on ₦${P} at ${R}% per annum for ${T} year?`,
        [`₦${SI}`, `₦${SI * 2}`, `₦${P * R / 200}`, `₦${P * (R + 1) / 100}`],
        `₦${SI}`, "hard")
    })
  }

  // 23. Least Common Multiple / Highest Common Factor (JSS+)
  if (section !== "Nursery" && section !== "Primary") {
    templates.push(() => {
      const a = Math.floor(rand() * 6) + 4
      const b = Math.floor(rand() * 6) + 4
      const gcd = (x: number, y: number): number => y === 0 ? x : gcd(y, x % y)
      const correct = gcd(a, b)
      add("mcq",
        `What is the Highest Common Factor of ${a} and ${b}?`,
        [String(correct), String(a * b), String(Math.min(a, b)), String(Math.max(a, b))],
        String(correct), "medium")
    })
  }

  // 24. True/False: Math facts (all levels)
  templates.push(() => {
    if (section === "Nursery") {
      addTrueFalse("A square has 4 sides.", "True", "easy")
    } else {
      const n1 = Math.floor(rand() * 20) + 1
      const n2 = Math.floor(rand() * 20) + 1
      const correct = n1 + n2
      const given = correct + (rand() > 0.5 ? Math.floor(rand() * 5) + 1 : Math.floor(rand() * -5) - 1)
      const isTrue = given === correct
      addTrueFalse(`${n1} + ${n2} = ${given}`, isTrue ? "True" : "False", "easy")
    }
  })
  templates.push(() => {
    const n = Math.floor(rand() * 30) + 2
    const isPrime = (x: number) => {
      if (x < 2) return false
      for (let i = 2; i * i <= x; i++) if (x % i === 0) return false
      return true
    }
    if (section === "Nursery" || section === "Primary") {
      addTrueFalse(`${n} is an ${n % 2 === 0 ? "even" : "odd"} number.`, "True", "easy")
    } else {
      const statement = isPrime(n) ? `${n} is a prime number.` : `${n} is not a prime number.`
      addTrueFalse(statement, "True", "medium")
    }
  })

  // 25. Theory questions (one per level)
  templates.push(() => {
    if (section === "Nursery") {
      addTheory("Count from 1 to 20 and write all the numbers in order.", "easy", 5)
    } else if (section === "Primary") {
      const a = Math.floor(rand() * 100) + 50
      const b = Math.floor(rand() * 50) + 20
      addTheory(`Solve step by step: ${a} + ${b} - ${Math.floor(rand() * 30) + 10} = ?`, "medium", 5)
    } else if (section === "JSS") {
      const x = Math.floor(rand() * 5) + 2
      addTheory(`Solve the equation 3x + ${x * 4} = ${x * 7}. Show your working.`, "medium", 5)
    } else {
      const a = Math.floor(rand() * 5) + 2
      const b = Math.floor(rand() * 3) + 1
      addTheory(`Differentiate y = ${a}x³ + ${b}x² - ${Math.floor(rand() * 4) + 1}x + ${Math.floor(rand() * 10) + 1} with respect to x.`, "hard", 5)
    }
  })

  // Execute enough templates to get 50 questions
  let attempts = 0
  while (questions.length < 50 && attempts < 200) {
    attempts++
    const template = templates[Math.floor(rand() * templates.length)]
    const before = questions.length
    template()
    // If template didn't add (returned early), try again
    if (questions.length === before) continue
  }

  return questions.slice(0, 50)
}

// ============================================================
// ENGLISH QUESTION GENERATION
// ============================================================
function generateEnglishQuestionsForSection(
  section: string,
  classIndex: number,
  classId: string,
  subjectId: string,
  createdBy: string
) {
  const rand = seededRandom(classIndex * 1013 + 693)
  const questions: any[] = []

  function add(type: string, text: string, options: string[], correctAnswer: string, difficulty: string, points = 5) {
    questions.push({
      id: nextId("q"),
      type,
      text,
      options,
      correctAnswer,
      points,
      difficulty,
      subjectId,
      classId,
      topic: guessEnglishTopic(text),
      approved: true,
      approvedBy: createdBy,
      approvedAt: now(),
      createdBy,
      createdAt: now(),
      updatedAt: now(),
    })
  }

  function addTrueFalse(text: string, correctAnswer: string, difficulty: string) {
    add("true_false", text, ["True", "False"], correctAnswer, difficulty, 3)
  }

  function addTheory(text: string, difficulty: string, points = 10) {
    questions.push({
      id: nextId("q"),
      type: "theory",
      text,
      options: undefined,
      correctAnswer: undefined,
      points,
      difficulty,
      subjectId,
      classId,
      topic: guessEnglishTopic(text),
      approved: true,
      approvedBy: createdBy,
      approvedAt: now(),
      createdBy,
      createdAt: now(),
      updatedAt: now(),
    })
  }

  const templates: (() => void)[] = []

  // 1. Parts of speech (all levels)
  templates.push(() => {
    const nouns = ["cat", "table", "book", "city", "teacher", "river", "child", "house", "tree", "school"]
    const verbs = ["run", "eat", "sleep", "read", "write", "sing", "dance", "jump", "talk", "walk"]
    const adjs = ["beautiful", "big", "small", "tall", "bright", "dark", "happy", "young", "old", "fast"]
    const advs = ["quickly", "happily", "loudly", "silently", "carefully", "bravely", "slowly", "gently", "eagerly", "softly"]
    if (section === "Nursery") {
      const word = pick(nouns, rand)
      add("mcq", `Which word is a thing? ${word}, run, quickly`, [word, "run", "quickly", "beautiful"], word, "easy")
    } else {
      const word = pick(nouns, rand).charAt(0).toUpperCase() + pick(nouns, rand).slice(1)
      add("mcq",
        `Identify the noun in this sentence: "${word} ${pick(verbs, rand)}s ${pick(advs, rand)}."`,
        [word, `${pick(verbs, rand)}s`, pick(advs, rand), "the"],
        word, "easy")
    }
  })

  templates.push(() => {
    const adjs = ["beautiful", "big", "small", "tall", "bright", "dark", "happy", "young", "old", "fast"]
    if (section === "Nursery") {
      add("mcq", `The opposite of "hot" is ___`, ["warm", "cold", "cool", "mild"], "cold", "easy")
    } else {
      const word = pick(adjs, rand)
      const antonym = word === "big" ? "small" : word === "beautiful" ? "ugly" : word === "tall" ? "short" : word === "dark" ? "bright" : word === "happy" ? "sad" : word === "young" ? "old" : word === "fast" ? "slow" : "big"
      add("mcq",
        `What is the antonym of "${word}"?`,
        [antonym, word, word + "ly", "un" + word],
        antonym, "easy")
    }
  })

  // 2. Verb tenses
  templates.push(() => {
    const verbs = [
      { base: "go", past: "went", pp: "gone" },
      { base: "eat", past: "ate", pp: "eaten" },
      { base: "write", past: "wrote", pp: "written" },
      { base: "sing", past: "sang", pp: "sung" },
      { base: "swim", past: "swam", pp: "swum" },
      { base: "take", past: "took", pp: "taken" },
      { base: "speak", past: "spoke", pp: "spoken" },
      { base: "break", past: "broke", pp: "broken" },
      { base: "drive", past: "drove", pp: "driven" },
      { base: "begin", past: "began", pp: "begun" },
    ]
    const v = pick(verbs, rand)
    const correct = v.past
    const wrongs = [v.base + "ed", v.base, v.pp].filter(w => w !== correct)
    add("mcq",
      `What is the past tense of "${v.base}"?`,
      [correct, wrongs[0], wrongs[1] || v.base + "ing", "was " + correct],
      correct, section === "Nursery" || section === "Primary" ? "easy" : "medium")
  })

  // 3. Spelling
  templates.push(() => {
    const pairs = [
      { correct: "receive", wrong: "recieve" },
      { correct: "believe", wrong: "beleive" },
      { correct: "necessary", wrong: "neccessary" },
      { correct: "occurred", wrong: "occured" },
      { correct: "accommodate", wrong: "accomodate" },
      { correct: "separate", wrong: "seperate" },
      { correct: "definitely", wrong: "definately" },
      { correct: "embarrass", wrong: "embarass" },
      { correct: "independent", wrong: "independant" },
      { correct: "privilege", wrong: "privelege" },
      { correct: "tomorrow", wrong: "tommorrow" },
      { correct: "library", wrong: "libary" },
    ]
    const p = pick(pairs, rand)
    const correct = p.correct
    const wrongs = [p.wrong, p.correct.replace(/e/g, "a"), p.correct.slice(0, -1) + "le"].filter(w => w !== correct)
    add("mcq",
      `Choose the correct spelling:`,
      [correct, wrongs[0], wrongs[1] || p.wrong.toUpperCase(), "wrong"],
      correct, "medium")
  })

  // 4. Vocabulary: synonyms
  templates.push(() => {
    const pairs = [
      { word: "happy", synonym: "joyful", antonym: "sad" },
      { word: "big", synonym: "large", antonym: "small" },
      { word: "smart", synonym: "intelligent", antonym: "dull" },
      { word: "brave", synonym: "courageous", antonym: "cowardly" },
      { word: "kind", synonym: "generous", antonym: "cruel" },
      { word: "rich", synonym: "wealthy", antonym: "poor" },
      { word: "quick", synonym: "fast", antonym: "slow" },
      { word: "old", synonym: "ancient", antonym: "new" },
      { word: "strong", synonym: "powerful", antonym: "weak" },
      { word: "beautiful", synonym: "gorgeous", antonym: "ugly" },
    ]
    const p = pick(pairs, rand)
    add("mcq",
      `What is the synonym of "${p.word}"?`,
      [p.synonym, p.antonym, p.word.toUpperCase(), p.synonym.toUpperCase()],
      p.synonym, "easy")
  })

  // 5. Vocabulary: definitions
  templates.push(() => {
    const defs = [
      { word: "library", def: "A place where books are kept" },
      { word: "hospital", def: "A place where sick people are treated" },
      { word: "school", def: "A place where children learn" },
      { word: "market", def: "A place where goods are bought and sold" },
      { word: "church", def: "A place of Christian worship" },
      { word: "kitchen", def: "A room where food is cooked" },
    ]
    const p = pick(defs, rand)
    add("mcq",
      `What is a "${p.word}"?`,
      [p.def, "A place to play", "A place to sleep", "A place to work"],
      p.def, "easy")
  })

  // 6. Punctuation
  templates.push(() => {
    const qs = [
      { q: "Which punctuation ends a question?", a: "?" },
      { q: "Which punctuation shows possession (e.g., John's book)?", a: "Apostrophe (')" },
      { q: "Which punctuation is used to introduce a list?", a: "Colon (:)" },
      { q: "Which punctuation separates items in a list?", a: "Comma (,)" },
      { q: "Which punctuation marks a strong emotion?", a: "Exclamation mark (!)" },
    ]
    const p = pick(qs, rand)
    add("mcq", p.q, [p.a, "Period (.)", "Semicolon (;)", "Dash (-)"], p.a, "easy")
  })

  // 7. Sentence structure
  templates.push(() => {
    const subjects = ["The boy", "She", "My mother", "The teacher", "John", "The dog", "The children", "We", "They", "A man"]
    const verbs = ["runs", "eats", "reads", "writes", "sings", "dances", "jumps", "talks", "walks", "plays"]
    const objs = ["football", "a book", "loudly", "in the park", "every day", "at school", "to music", "dinner"]
    const subj = pick(subjects, rand)
    const verb = pick(verbs, rand)
    if (section !== "Nursery" && section !== "SSS") {
      const incorrect = `${subj} ${verb.replace(/s$/, "")} ${pick(objs, rand)}`
      const correct = `${subj} ${verb} ${pick(objs, rand)}`
      add("mcq",
        `Which sentence is grammatically correct?`,
        [correct, incorrect, `${correct.replace(" ", "  ")}`, `${subj.toLowerCase()} ${verb}`],
        correct, "medium")
    }
  })

  // 8. Homophones
  templates.push(() => {
    const homophones = [
      { word1: "there", word2: "their", sentence: "___ going to the park.", correct: "they're" },
      { word1: "to", word2: "too", sentence: "She is going ___ the store.", correct: "to" },
      { word1: "your", word2: "you're", sentence: "___ very kind.", correct: "You're" },
      { word1: "its", word2: "it's", sentence: "___ a beautiful day.", correct: "It's" },
      { word1: "affect", word2: "effect", sentence: "The medicine had a positive ___.", correct: "effect" },
    ]
    const p = pick(homophones, rand)
    add("mcq",
      `Fill in the blank: ${p.sentence.replace("___", "______")}`,
      [p.word1, p.word2, p.correct, p.word1.toUpperCase()],
      p.correct, "medium")
  })

  // 9. Idioms (JSS+)
  if (section === "JSS" || section === "SSS") {
    templates.push(() => {
      const idioms = [
        { phrase: "A blessing in disguise", meaning: "Something good that seemed bad at first" },
        { phrase: "Once in a blue moon", meaning: "Very rarely" },
        { phrase: "Break the ice", meaning: "To start a conversation in a social setting" },
        { phrase: "Hit the nail on the head", meaning: "To be exactly right" },
        { phrase: "Bite the bullet", meaning: "To endure a painful situation" },
        { phrase: "The ball is in your court", meaning: "It's your turn to act" },
        { phrase: "Piece of cake", meaning: "Very easy" },
        { phrase: "Let the cat out of the bag", meaning: "Reveal a secret" },
      ]
      const p = pick(idioms, rand)
      add("mcq",
        `What does the idiom "${p.phrase}" mean?`,
        [p.meaning, "A type of food", "A weather condition", "A type of sport"],
        p.meaning, "hard")
    })
  }

  // 10. Figures of speech (JSS+)
  if (section === "JSS" || section === "SSS") {
    templates.push(() => {
      const figures = [
        { example: "He is as brave as a lion.", figure: "Simile" },
        { example: "The wind whispered through the trees.", figure: "Personification" },
        { example: "Life is a rollercoaster.", figure: "Metaphor" },
        { example: "I've told you a million times!", figure: "Hyperbole" },
        { example: "Peter Piper picked a peck of pickled peppers.", figure: "Alliteration" },
      ]
      const p = pick(figures, rand)
      add("mcq",
        `Identify the figure of speech: "${p.example}"`,
        [p.figure, "Simile", "Metaphor", "Alliteration"].sort(() => rand() - 0.5),
        p.figure, "medium")
    })
  }

  // 11. Comprehension passage (simulated)
  templates.push(() => {
    const passages = [
      { text: "The sun rises in the east every morning. It gives us light and warmth. Plants need sunlight to grow.", q: "Where does the sun rise?", a: "In the east" },
      { text: "Water is very important for life. We use water for drinking, cooking, and bathing. Without water, we cannot live.", q: "Why is water important?", a: "We use it for drinking, cooking, and bathing" },
      { text: "Nigeria is a country in West Africa. It has 36 states and a Federal Capital Territory. The largest city is Lagos.", q: "How many states does Nigeria have?", a: "36" },
      { text: "Trees give us oxygen, fruits, and shade. They also provide habitat for birds and animals. We should plant more trees.", q: "What do trees give us?", a: "Oxygen, fruits, and shade" },
    ]
    const p = pick(passages, rand)
    add("mcq",
      `Read: "${p.text}" → ${p.q}`,
      [p.a, "I don't know", "Maybe", p.a.toUpperCase()],
      p.a, "medium")
  })

  // 12. Prepositions (all levels)
  templates.push(() => {
    const preps = [
      { correct: "in", wrongs: ["on", "at", "by"] },
      { correct: "on", wrongs: ["in", "at", "under"] },
      { correct: "under", wrongs: ["over", "on", "in"] },
      { correct: "beside", wrongs: ["behind", "under", "over"] },
      { correct: "behind", wrongs: ["beside", "in front of", "under"] },
    ]
    const p = pick(preps, rand)
    const opts = [p.correct, ...p.wrongs].sort(() => rand() - 0.5)
    if (section === "Nursery") {
      add("mcq", `The cat is ___ the table.`, opts, p.correct, "easy")
    } else {
      add("mcq", `She placed the book ___ the shelf.`, opts, p.correct, "easy")
    }
  })

  // 13. Conjunctions
  templates.push(() => {
    const pairs = [
      { sentence: "I wanted to go __ I was tired.", correct: "but" },
      { sentence: "She studied hard __ she passed.", correct: "so" },
      { sentence: "We can go to the park __ the museum.", correct: "or" },
      { sentence: "He is tall __ his brother is short.", correct: "while" },
      { sentence: "You can have ice cream __ you finish your dinner.", correct: "if" },
    ]
    const p = pick(pairs, rand)
    add("mcq",
      `Choose the correct conjunction: "${p.sentence}"`,
      [p.correct, "because", "although", "unless"].sort(() => rand() - 0.5),
      p.correct, "medium")
  })

  // 14. Determiners / Articles
  templates.push(() => {
    const nouns = pickN(["apple", "orange", "book", "pen", "car", "house", "elephant", "hour", "umbrella", "dog"], 3, rand)
    const correct = pick(nouns, rand)
    const article = ["a", "e", "i", "o", "u"].includes(correct[0]) ? "an" : "a"
    add("mcq",
      `Which article goes before "${correct}"?`,
      [article, article === "a" ? "an" : "a", "the", "some"],
      article, "easy")
  })

  // 15. Direct/Indirect speech (JSS+)
  if (section === "JSS" || section === "SSS") {
    templates.push(() => {
      const quotes = [
        { direct: 'She said, "I am happy."', correct: 'She said that she was happy.' },
        { direct: 'He said, "I will come tomorrow."', correct: 'He said that he would come the next day.' },
        { direct: 'They said, "We are studying."', correct: 'They said that they were studying.' },
        { direct: 'He said, "I have finished."', correct: 'He said that he had finished.' },
      ]
      const p = pick(quotes, rand)
      add("mcq",
        `Convert to reported speech: ${p.direct}`,
        [p.correct, p.direct.replace("said", "says"), p.direct.replace("I", "he"), p.correct.replace("that", "this")],
        p.correct, "hard")
    })
  }

  // 16. Literature questions (SSS)
  if (section === "SSS") {
    templates.push(() => {
      const litQs = [
        { q: "Who wrote 'Things Fall Apart'?", a: "Chinua Achebe" },
        { q: "What is the genre of 'The Pulley' by George Herbert?", a: "Poetry" },
        { q: "A speech by one character alone on stage is called a ___.", a: "Soliloquy" },
        { q: "What is the main conflict in 'The Lion and the Jewel'?", a: "Tradition vs Modernity" },
        { q: "The character Okonkwo appears in which novel?", a: "Things Fall Apart" },
      ]
      const p = pick(litQs, rand)
      const wrongs = pickN(["Wole Soyinka", "Chimamanda Adichie", "William Shakespeare", "Chinua Achebe", "George Herbert", "Ngugi wa Thiong'o", "Prose", "Drama", "Monologue", "Dialogue", "Tradition", "Modernity", "Fate vs Free Will"], 3, rand)
      const allOpts = [p.a, ...wrongs.filter(w => w !== p.a)].slice(0, 4).sort(() => rand() - 0.5)
      add("mcq", p.q, allOpts, p.a, "medium")
    })
  }

  // 17. True/False English facts
  templates.push(() => {
    const engFacts = [
      ["A noun names a person, place, thing, or idea.", "True"],
      ["An adjective describes a verb.", "False"],
      ["'Their', 'There', and 'They're' are homophones.", "True"],
      ["A sentence must always end with a period.", "False"],
      ["'Beautiful' is an example of an adverb.", "False"],
      ["Proper nouns are always capitalized.", "True"],
      ["A paragraph must have at least 5 sentences.", "False"],
      ["Similes use 'like' or 'as' for comparison.", "True"],
    ]
    const f = pick(engFacts, rand)
    addTrueFalse(f[0] as string, f[1] as string, "easy")
  })

  // 18. Composition prompts (theory)
  templates.push(() => {
    const prompts: Record<string, string[]> = {
      Nursery: ["Write three sentences about your family.", "Describe your favourite animal in 2 sentences."],
      Primary: ["Write a paragraph about your best friend.", "Describe your favourite food and why you like it.", "Write about what you did during the last holiday."],
      JSS: ["Write a letter to your friend inviting them to your birthday party.", "Describe an incident that taught you a valuable lesson.", "Write a paragraph about the importance of education."],
      SSS: ["Write a debate speech for or against: 'Social media does more harm than good.'", "Write an essay on the role of youth in nation building.", "Analyze the theme of colonialism in 'Things Fall Apart'."],
    }
    const p = pick(prompts[section] || prompts.Primary, rand)
    addTheory(p, section === "SSS" ? "hard" : "medium", 10)
  })

  // 19. Collective nouns
  templates.push(() => {
    const collectives: [string, string][] = [
      ["A group of lions", "A pride"],
      ["A group of fish", "A school"],
      ["A group of bees", "A swarm"],
      ["A group of birds", "A flock"],
      ["A group of cows", "A herd"],
      ["A group of students", "A class"],
      ["A group of soldiers", "An army"],
      ["A group of sheep", "A flock"],
    ]
    const c = pick(collectives, rand)
    add("mcq",
      `What is the collective noun? ${c[0]}:`,
      [c[1], "A group", "A pack", "A team"].sort(() => rand() - 0.5),
      c[1], "medium")
  })

  // 20. Active/Passive voice (JSS+)
  if (section === "JSS" || section === "SSS") {
    templates.push(() => {
      const pairs: [string, string][] = [
        ["The cat chased the mouse.", "The mouse was chased by the cat."],
        ["The students completed the project.", "The project was completed by the students."],
        ["The chef cooked the meal.", "The meal was cooked by the chef."],
        ["The teacher praised the student.", "The student was praised by the teacher."],
      ]
      const p = pick(pairs, rand)
      add("mcq",
        `Change to passive voice: "${p[0]}"`,
        [p[1], p[0], p[0].replace("chased", "was chasing"), p[1].replace("by", "and")],
        p[1], "hard")
    })
  }

  // Execute templates to get ~50 questions
  let attempts = 0
  while (questions.length < 50 && attempts < 200) {
    attempts++
    const template = templates[Math.floor(rand() * templates.length)]
    const before = questions.length
    template()
    if (questions.length === before) continue
  }

  return questions.slice(0, 50)
}

// ============================================================
// TOPIC CLASSIFIERS
// ============================================================
function guessMathTopic(text: string): string {
  const t = text.toLowerCase()
  if (t.includes("differentiate") || t.includes("∫") || t.includes("integrate") || t.includes("calculus")) return "Calculus"
  if (t.includes("log") || t.includes("logarithm")) return "Logarithms"
  if (t.includes("sin") || t.includes("cos") || t.includes("trig") || t.includes("angle")) return "Trigonometry"
  if (t.includes("solve") || t.includes("algebra") || t.includes("equation") || t.includes("variable") || t.includes("gradient") || t.includes("linear") || t.includes("what is x") || /[a-z]\s*=\s*\d/.test(t)) return "Algebra"
  if (t.includes("prime") || t.includes("odd") || t.includes("even") || t.includes("factor") || t.includes("multiple") || t.includes("hcf") || t.includes("lcm") || t.includes("highest common") || t.includes("least common")) return "Number Theory"
  if (t.includes("fraction") || t.includes("decimal") || t.includes("%") || t.includes("percent") || t.includes("ratio")) return "Fractions, Decimals & Percentages"
  if (t.includes("area") || t.includes("perimeter") || t.includes("shape") || t.includes("square") || t.includes("rectangle") || t.includes("triangle") || t.includes("circle") || t.includes("geometry")) return "Geometry"
  if (t.includes("probab") || t.includes("chance") || t.includes("likely")) return "Probability"
  if (t.includes("mean") || t.includes("average") || t.includes("median") || t.includes("mode") || t.includes("statistics")) return "Statistics"
  if (t.includes("sequence") || t.includes("progression") || t.includes("next number") || t.includes("comes next") || t.includes("next in the")) return "Sequences & Series"
  if (t.includes("interest") || t.includes("money") || t.includes("₦") || t.includes("naira") || t.includes("cost") || t.includes("saved") || t.includes("discount")) return "Financial Mathematics"
  if (t.includes("matrix") || t.includes("determinant")) return "Matrices"
  if (t.includes("time") || t.includes("clock") || t.includes("calendar") || t.includes("hour hand") || t.includes("minute hand")) return "Time & Measurement"
  if (t.includes("what digit") || t.includes("place value") || t.includes("expanded") || t.includes("which digit") || t.includes("units place") || t.includes("tens place") || t.includes("hundreds place") || t.includes("thousands place")) return "Place Value"
  if (t.includes("+") || t.includes("addition") || t.includes("add") || t.includes("in total") || t.includes("how many") || t.includes("more") || t.includes("plus")) return "Addition"
  if (t.includes("-") || t.includes("subtract") || t.includes("minus")) return "Subtraction"
  if (t.includes("×") || t.includes("multiply") || t.includes("multiplication") || t.includes("times")) return "Multiplication"
  if (t.includes("÷") || t.includes("division") || t.includes("divide")) return "Division"
  if (t.includes("count") || t.includes("number") || t.includes("greater") || t.includes("less") || t.includes("which symbol") || t.includes("compare")) return "Basic Numeracy"
  if (t.includes("share") || t.includes("proportion")) return "Ratio & Proportion"
  return "General Mathematics"
}

function guessEnglishTopic(text: string): string {
  const t = text.toLowerCase()
  if (t.includes("noun") || t.includes("verb") || t.includes("adjective") || t.includes("adverb") || t.includes("preposition") || t.includes("conjunction") || t.includes("pronoun") || t.includes("article") || t.includes("tense") || t.includes("past tense") || t.includes("grammar") || t.includes("grammatic") || t.includes("fill in the blank") || t.includes("choose the correct conjunction") || t.includes("___ the") || t.includes("the ___")) return "Grammar"
  if (t.includes("spell") || t.includes("spelling") || t.includes("correct spelling") || t.includes("choose the correct spelling")) return "Spelling"
  if (t.includes("synonym") || t.includes("antonym") || t.includes("vocabulary") || t.includes("meaning") || t.includes("word") || t.includes("idiom") || t.includes("collective") || t.includes("homophone") || t.includes("what is a ") || t.includes("what does the idiom")) return "Vocabulary & Word Usage"
  if (t.includes("read:") || t.includes("passage") || t.includes("comprehension") || t.includes("story")) return "Reading Comprehension"
  if (t.includes("paragraph") || t.includes("essay") || t.includes("write") || t.includes("letter") || t.includes("composition") || t.includes("debate") || t.includes("describe") || t.includes("sentences about") || t.includes("write about") || t.includes("write three sentences") || t.includes("write a")) return "Composition & Writing"
  if (t.includes("simile") || t.includes("metaphor") || t.includes("personification") || t.includes("hyperbole") || t.includes("alliteration") || t.includes("figure of speech") || t.includes("literary") || t.includes("poem") || t.includes("poetry") || t.includes("play") || t.includes("novel") || t.includes("author") || t.includes("wrote") || t.includes("prose") || t.includes("drama") || t.includes("soliloquy") || t.includes("theme") || t.includes("conflict") || t.includes("identify the figure of speech") || t.includes("things fall apart")) return "Literature"
  if (t.includes("punctuation") || t.includes("colon") || t.includes("comma") || t.includes("apostrophe") || t.includes("question mark") || t.includes("exclamation") || t.includes("period") || t.includes("semicolon") || t.includes("punctuat")) return "Punctuation"
  if (t.includes("sentence") || t.includes("reported") || t.includes("indirect") || t.includes("direct") || t.includes("passive") || t.includes("active voice") || t.includes("grammatically correct") || t.includes("change to passive") || t.includes("reported speech") || t.includes("convert to")) return "Sentence Structure & Transformation"
  if (t.includes("phonics") || t.includes("letter") || t.includes("sound") || t.includes("alphabet") || t.includes("rhyme")) return "Phonics & Phonetics"
  if (t.includes("opposite")) return "Antonyms"
  if (t.includes("identify the noun") || t.includes("which word is a")) return "Grammar"
  return "General English"
}

// ============================================================
// MAIN GENERATOR – 50 Math + 50 English per class level
// ============================================================
export function generateAllQuestions(
  classes: { id: string; name: string }[],
  subjects: { id: string; name: string; classId: string }[],
  createdBy: string
) {
  const allQuestions: any[] = []

  for (let ci = 0; ci < classes.length; ci++) {
    const cls = classes[ci]
    const classSubjects = subjects.filter((s) => s.classId === cls.id)
    const mathSub = classSubjects.find((s) => s.name === "Mathematics" || s.name === "Number Work")
    const engSub = classSubjects.find((s) => s.name === "English Language" || s.name === "Letter Work")
    const section = CLASS_BROAD_SECTION[cls.name] || "Primary"

    if (mathSub) {
      const mathQuestions = generateMathQuestionsForSection(section, ci, cls.id, mathSub.id, createdBy)
      allQuestions.push(...mathQuestions)
    }

    if (engSub) {
      const engQuestions = generateEnglishQuestionsForSection(section, ci, cls.id, engSub.id, createdBy)
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
      const mathQuestions = questions.filter((q) => q.subjectId === mathSub.id).slice(0, 30)
      if (mathQuestions.length > 0) {
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
    }

    if (engSub) {
      const engQuestions = questions.filter((q) => q.subjectId === engSub.id).slice(0, 30)
      if (engQuestions.length > 0) {
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
  }

  return exams
}

// ============================================================
// EXAM SESSIONS + SUBMISSIONS (simulate completed exams)
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

  sessions.forEach((session, i) => {
    const teacherIds = ["2", "3", "4", "5", "6"]
    submissions.push({
      id: nextId("sub"),
      sessionId: session.id,
      studentId: session.studentId,
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
