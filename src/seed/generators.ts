import {
  CLASS_NAMES,
  CLASS_SECTIONS,
  CLASS_BROAD_SECTION,
  getSubjectsForClass,
  NIGERIAN_FIRST_NAMES_MALE,
  NIGERIAN_FIRST_NAMES_FEMALE,
  NIGERIAN_LAST_NAMES,
  NIGERIAN_CITIES,
  TEACHER_DATA,
  ADMIN_DATA,
  PARENT_DATA,
  CURRENT_SESSION,
  CURRENT_TERM,
  TERM_NAMES,
  WEEKDAYS,
  TIME_SLOTS,
  SUBJECTS_NURSERY,
  SUBJECTS_PRIMARY,
  SUBJECTS_JSS,
  SUBJECTS_SSS_SCIENCE,
  SUBJECTS_SSS_ARTS,
  SUBJECTS_SSS_COMMERCE,
  REPORT_DOMAINS,
  GRADE_BOUNDARIES,
  getGradeAndRemark,
} from "./data"

// --- HELPERS ---
let _idCounter = 1000
export function nextId(prefix = "s") {
  return `${prefix}_${++_idCounter}`
}
export function resetIdCounter() {
  _idCounter = 1000
}

const now = () => new Date().toISOString()
const today = () => now().split("T")[0]

const maleFirstNames = [...NIGERIAN_FIRST_NAMES_MALE]
const femaleFirstNames = [...NIGERIAN_FIRST_NAMES_FEMALE]
const lastNames = [...NIGERIAN_LAST_NAMES]
let nameIndex = 0

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickDeterministic<T>(arr: T[]): T {
  const item = arr[nameIndex % arr.length]
  nameIndex++
  return item
}

function getRandomScore(min = 30, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomBool(probability = 0.5) {
  return Math.random() < probability
}

function generateStudentName(index: number, gender: "Male" | "Female") {
  const firstNames = gender === "Male" ? maleFirstNames : femaleFirstNames
  const firstName = firstNames[(index * 7 + 3) % firstNames.length]
  const lastName = lastNames[(index * 13 + 5) % lastNames.length]
  return { firstName, lastName }
}

// ============================================================
// ACADEMIC SESSION & TERMS
// ============================================================
export function generateSession() {
  return {
    id: nextId("ses"),
    name: CURRENT_SESSION,
    startDate: "2024-09-09T00:00:00.000Z",
    endDate: "2025-07-18T00:00:00.000Z",
    isCurrent: true,
    schoolId: "school_1",
    createdAt: now(),
    updatedAt: now(),
  }
}

export function generateTerms(sessionId: string) {
  return TERM_NAMES.map((name, i) => ({
    id: nextId("trm"),
    name,
    startDate: ["2024-09-09", "2025-01-06", "2025-04-14"][i] + "T00:00:00.000Z",
    endDate: ["2024-12-13", "2025-03-28", "2025-07-18"][i] + "T00:00:00.000Z",
    isCurrent: i === 0,
    sessionId,
    createdAt: now(),
    updatedAt: now(),
  }))
}

// ============================================================
// CLASSES
// ============================================================
export function generateClasses() {
  return CLASS_NAMES.map((name) => ({
    id: nextId("cls"),
    name,
    arm: null,
    section: CLASS_SECTIONS[name],
    schoolId: "school_1",
    createdAt: now(),
    updatedAt: now(),
  }))
}

// ============================================================
// SUBJECTS per class
// ============================================================
export function generateSubjects(classes: { id: string; name: string }[]) {
  const result: any[] = []
  for (const cls of classes) {
    const subs = getSubjectsForClass(cls.name)
    for (const sub of subs) {
      result.push({
        id: nextId("sub"),
        name: sub.name,
        code: sub.code,
        classId: cls.id,
        schoolId: "school_1",
        createdAt: now(),
        updatedAt: now(),
      })
    }
  }
  return result
}

// ============================================================
// STAFF (including admin + 5 teachers)
// ============================================================
export function generateStaff() {
  const result: any[] = []
  // Admin (id=1 for existing admin compatibility)
  result.push({
    id: "1",
    firstName: ADMIN_DATA.firstName,
    lastName: ADMIN_DATA.lastName,
    email: ADMIN_DATA.email,
    password: "successor",
    role: "admin",
    department: ADMIN_DATA.department,
    qualification: ADMIN_DATA.qualification,
    gender: ADMIN_DATA.gender,
    staffId: "ADM001",
    phone: ADMIN_DATA.phone,
    address: "1 School Road, Ikeja, Lagos",
    status: "active",
    employmentDate: "2020-01-01",
    salary: 500000,
    createdAt: now(),
    updatedAt: now(),
  })

  for (const t of TEACHER_DATA) {
    result.push({
      id: nextId("stf"),
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      password: "password123",
      role: "teacher",
      department: t.department,
      qualification: t.qualification,
      gender: t.gender,
      staffId: `STF${Math.floor(1000 + Math.random() * 9000)}`,
      phone: t.phone,
      address: `${Math.floor(Math.random() * 100) + 1} ${pickRandom(["Teacher", "Staff", "Estate"])} Avenue, ${pickRandom(["Ikeja", "Lagos", "Ibadan"])}`,
      status: "active",
      employmentDate: "2022-09-01",
      salary: 250000,
      createdAt: now(),
      updatedAt: now(),
    })
  }
  return result
}

// ============================================================
// STUDENTS — 5 per class, total ~100
// ============================================================
export function generateStudents(classes: { id: string; name: string; section: string }[]) {
  const result: any[] = []
  let studentCounter = 1

  for (const cls of classes) {
    for (let i = 0; i < 2; i++) {
      const studentNum = studentCounter++
      const gender = i % 2 === 0 ? "Male" : "Female"
      const names = generateStudentName(studentNum, gender)
      const dobYear = {
        Nursery: 2020,
        Primary: 2016,
        JSS: 2012,
        SSS: 2008,
      }[CLASS_BROAD_SECTION[cls.name]] || 2015

      result.push({
        id: nextId("stu"),
        firstName: names.firstName,
        lastName: names.lastName,
        password: "student123",
        studentId: `RKA/${now().split("-")[0]}/${String(studentNum).padStart(3, "0")}`,
        email: `${names.firstName.toLowerCase()}.${names.lastName.toLowerCase()}${studentNum}@student.rka.edu.ng`,
        dateOfBirth: `${dobYear + i}-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + (i % 28)).padStart(2, "0")}T00:00:00.000Z`,
        gender,
        address: `${Math.floor(Math.random() * 100) + 1} ${pickRandom(["Peace", "Unity", "Liberty", "Progress", "Harmony"])} Street, ${pickRandom(NIGERIAN_CITIES)}`,
        phone: `+234 80${Math.floor(100 + Math.random() * 900)} ${String(Math.floor(100 + Math.random() * 900)).padStart(3, "0")} ${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, "0")}`,
        bloodGroup: pickRandom(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
        medicalNotes: getRandomBool(0.2) ? pickRandom(["Asthma", "Allergy to peanuts", "None", "Sickle cell trait", "Mild asthma"]) : "",
        enrollmentDate: new Date(2024, 8, 1 + i).toISOString().split("T")[0],
        status: "active",
        passportPhoto: "",
        qrCode: "",
        barcode: "",
        classId: cls.id,
        parentId: null,
        schoolId: "school_1",
        createdAt: now(),
        updatedAt: now(),
      })
    }
  }
  return result
}

// ============================================================
// PARENTS
// ============================================================
export function generateParents() {
  return PARENT_DATA.map((p, i) => ({
    id: nextId("par"),
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    phone: p.phone,
    password: "parent123",
    occupation: pickRandom(["Business", "Civil Servant", "Engineer", "Doctor", "Lawyer", "Teacher", "Accountant", "Banker", "Trader", "Farmer"]),
    address: `${Math.floor(Math.random() * 50) + 1} ${pickRandom(["Garden", "Park", "Hill", "Valley", "Crescent"])} Avenue, ${pickRandom(NIGERIAN_CITIES)}`,
    createdAt: now(),
    updatedAt: now(),
  }))
}

// ============================================================
// PARENT LINKS
// ============================================================
export function generateParentLinks(students: { id: string }[], parents: { id: string }[]) {
  const result: any[] = []
  students.forEach((student, i) => {
    const parent = parents[i % parents.length]
    result.push({
      id: nextId("plk"),
      parentId: parent.id,
      studentId: student.id,
      relationship: i % 2 === 0 ? "Father" : "Mother",
    })
  })
  return result
}

// ============================================================
// TEACHER ASSIGNMENTS
// ============================================================
export function generateTeacherAssignments(
  staffList: { id: string; department: string }[],
  classes: { id: string; name: string }[],
  subjects: { id: string; name: string; classId: string }[]
) {
  const result: any[] = []
  const teachers = staffList.filter((s) => s.department !== "Administration")

  teachers.forEach((teacher, ti) => {
    // Assign 2-3 classes
    const numClasses = 3 + ti
    const assignedClasses: string[] = []
    const assignedSubjects: string[] = []

    for (let c = 0; c < Math.min(numClasses, classes.length); c++) {
      const clsIndex = (ti * 5 + c * 3) % classes.length
      const cls = classes[clsIndex]
      if (!assignedClasses.includes(cls.id)) {
        assignedClasses.push(cls.id)
      }
      // Find subjects for this class that match this teacher's department
      const classSubjects = subjects.filter((s) => s.classId === cls.id)
      const matchingSubjects = classSubjects.filter((s) => {
        const dept = teacher.department
        if (dept === "Mathematics") return s.name === "Mathematics" || s.name === "Number Work"
        if (dept === "Languages") return ["English Language", "Letter Work", "Literature-in-English"].includes(s.name)
        if (dept === "Science") return ["Basic Science", "Integrated Science", "Biology", "Chemistry", "Physics", "General Science"].includes(s.name)
        if (dept === "Arts & Social Sciences") return ["Social Studies", "Government", "Social Habits", "Economics", "Commerce", "Christian Religious Studies"].includes(s.name)
        if (dept === "Agriculture & Vocational") return ["Agricultural Science", "Accounting", "Health & Physical Education"].includes(s.name)
        return false
      })
      matchingSubjects.forEach((s) => {
        if (!assignedSubjects.includes(s.id)) assignedSubjects.push(s.id)
      })
    }

    result.push({
      id: nextId("ta"),
      teacherId: teacher.id,
      classIds: assignedClasses,
      subjectIds: assignedSubjects,
      isClassTeacher: ti === 0,
    })
  })
  return result
}

// ============================================================
// TIMETABLE
// ============================================================
export function generateTimetable(classes: { id: string; name: string }[], subjects: { id: string; name: string; classId: string }[]) {
  const result: any[] = []

  for (const cls of classes) {
    const classSubjects = subjects.filter((s) => s.classId === cls.id)
    if (classSubjects.length === 0) continue

    for (const day of WEEKDAYS) {
      for (let slotIdx = 0; slotIdx < Math.min(TIME_SLOTS.length, 8); slotIdx++) {
        const slot = TIME_SLOTS[slotIdx]
        if (slot.break) continue

        const sub = classSubjects[slotIdx % classSubjects.length]
        result.push({
          id: nextId("tt"),
          day,
          startTime: slot.start,
          endTime: slot.end,
          time: slot.start,
          subject: sub.name,
          teacherName: pickRandom(["Mr. Okonkwo", "Ms. Abubakar", "Mrs. Adebayo", "Mr. Ogunlade", "Ms. Eze"]),
          classId: cls.id,
          room: `Room ${Math.floor(100 + Math.random() * 200)}`,
        })
      }
    }
  }
  return result
}

// ============================================================
// ANNOUNCEMENTS
// ============================================================
export function generateAnnouncements() {
  return []
}

// ============================================================
// TOPICS
// ============================================================
export function generateTopics(subjects: { id: string; name: string; classId: string }[], classes: { id: string; name: string }[]) {
  const result: any[] = []
  const topicMap: Record<string, string[]> = {
    "Mathematics": ["Algebra", "Geometry", "Trigonometry", "Statistics", "Arithmetic", "Number Bases", "Set Theory", "Calculus"],
    "Number Work": ["Counting", "Addition", "Subtraction", "Shapes", "Number Recognition"],
    "English Language": ["Grammar", "Comprehension", "Composition", "Vocabulary", "Oral English"],
    "Letter Work": ["Alphabet", "Phonics", "Writing", "Reading", "Spelling"],
    "Basic Science": ["Living Things", "Matter", "Energy", "Environment", "Force"],
    "Integrated Science": ["Scientific Method", "Ecosystem", "Human Body", "Chemistry Basics", "Physics Basics"],
    "General Science": ["Animals", "Plants", "Weather", "Water", "Our Body"],
    "Social Studies": ["Family", "Culture", "Government", "Economy", "Geography"],
    "Social Habits": ["My Family", "My School", "My Community", "Sharing", "Manners"],
    "Agricultural Science": ["Farm Tools", "Crop Production", "Animal Husbandry", "Soil Science", "Food Preservation"],
    "Health & Physical Education": ["Personal Hygiene", "Exercise", "Nutrition", "Safety", "Sports"],
    "Biology": ["Cell Biology", "Genetics", "Ecology", "Evolution", "Human Anatomy"],
    "Chemistry": ["Atomic Structure", "Chemical Bonding", "Organic Chemistry", "Acids & Bases", "Thermochemistry"],
    "Physics": ["Mechanics", "Waves", "Electricity", "Magnetism", "Thermodynamics"],
    "Literature-in-English": ["Poetry", "Prose", "Drama", "Figures of Speech", "Literary Appreciation"],
    "Government": ["Political Systems", "Constitution", "Citizenship", "Electoral Process", "International Relations"],
    "Christian Religious Studies": ["Faith", "Love", "Salvation", "The Ten Commandments", "The Life of Jesus"],
    "Economics": ["Demand & Supply", "Market Structure", "National Income", "Money & Banking", "International Trade"],
    "Commerce": ["Trade", "Transportation", "Insurance", "Advertising", "Business Organization"],
    "Accounting": ["Double Entry", "Ledger", "Trial Balance", "Financial Statements", "Partnership Accounts"],
  }

  for (const sub of subjects) {
    const topics = topicMap[sub.name] || ["General"]
    for (const topic of topics) {
      result.push({
        id: nextId("top"),
        name: topic,
        subjectId: sub.id,
        classId: sub.classId,
        createdAt: now(),
        updatedAt: now(),
      })
    }
  }
  return result
}

// ============================================================
// SCHEME OF WORK
// ============================================================
const WEEKLY_TOPICS: Record<string, string[][]> = {
  Mathematics: [
    ["Whole Numbers (Place Value)", "Addition & Subtraction", "Multiplication Tables", "Division Basics", "Fractions Introduction", "Decimals", "Percentage", "Money & Transactions", "Length & Distance", "Weight & Capacity", "Time & Calendar", "Shapes & Geometry", "Data Collection & Pictograms"],
    ["Whole Numbers Revision", "Addition (3-digit)", "Subtraction (3-digit)", "Multiplication (2-digit)", "Division with Remainder", "Fractions (Addition)", "Decimals (Addition)", "Percentage of Quantities", "Perimeter", "Area", "Volume", "Angles", "Line Graphs"],
    ["Revision", "Number Sequences", "Fractions (Multiplication)", "Decimals (Multiplication)", "Ratio", "Proportion", "Speed & Distance", "Simple Interest", "Profit & Loss", "Algebraic Expressions", "Simple Equations", "Coordinate Geometry", "Probability"],
  ],
  English: [
    ["Parts of Speech", "Nouns & Pronouns", "Verbs & Tenses", "Adjectives & Adverbs", "Punctuation", "Sentence Structure", "Comprehension (Narrative)", "Composition (My Family)", "Vocabulary Building", "Spelling Rules", "Oral English (Phonics)", "Reading Fluency", "Dictation"],
    ["Synonyms & Antonyms", "Prepositions", "Conjunctions", "Comprehension (Descriptive)", "Composition (A Visit To...)", "Letter Writing (Informal)", "Vocabulary (Synonyms)", "Idioms & Proverbs", "Oral English (Stress)", "Reported Speech", "Active & Passive Voice", "Reading Comprehension", "Revision"],
    ["Revision of Tenses", "Conditional Clauses", "Comprehension (Argumentative)", "Composition (Debate)", "Letter Writing (Formal)", "Summary Writing", "Vocabulary (Antonyms)", "Figures of Speech", "Oral English (Intonation)", "Question Tags", "Phrasal Verbs", "Reading & Analysis", "Examination Preparation"],
  ],
  Science: [
    ["Living & Non-Living Things", "Plants Around Us", "Animals Around Us", "The Human Body", "The Senses", "Food & Nutrition", "Water & Its Uses", "Air & Wind", "Day & Night", "Weather & Seasons", "Soil & Rocks", "Energy & Light", "Sound & Hearing"],
    ["Classification of Living Things", "The Cell", "Digestive System", "Respiratory System", "Circulatory System", "Excretory System", "Nervous System", "Reproduction in Plants", "Reproduction in Animals", "Growth & Development", "Nutrition & Diet", "Food Tests", "Ecosystem & Habitat"],
    ["Matter & Its States", "Atoms & Molecules", "Elements & Compounds", "Chemical Equations", "Acids & Alkalis", "Metals & Non-Metals", "Electricity & Circuits", "Magnetism", "Heat Transfer", "Light & Optics", "Sound Waves", "Force & Motion", "Work, Energy & Power"],
  ],
  Social: [
    ["The Family", "Family Members & Roles", "Culture & Traditions", "Our Community", "Rules & Regulations", "Leadership", "Government at the Local Level", "Taxes & Services", "Transportation", "Communication", "Money & Banking", "Natural Resources", "Patriotism"],
    ["Citizenship", "Rights & Duties", "Constitution", "Government at State Level", "The Three Arms of Government", "Elections", "Political Parties", "Conflict Resolution", "International Organizations", "Globalization", "Culture & National Identity", "Population", "Urbanization"],
    ["Meaning of Government", "Democracy", "Rule of Law", "Separation of Powers", "Fundamental Human Rights", "Press Freedom", "Civil Service", "Public Corporations", "Economic Integration", "International Law", "United Nations", "African Union", "Revision & Review"],
  ],
  Agric: [
    ["Meaning of Agriculture", "Types of Farming", "Farm Tools & Equipment", "Soil Preparation", "Planting Methods", "Crops Around Us", "Crop Care", "Harvesting", "Farm Animals", "Animal Products", "Uses of Water on Farm", "Farm Buildings", "Importance of Agriculture"],
    ["Soil Composition", "Soil Fertility", "Organic Manure", "Inorganic Fertilizer", "Crop Rotation", "Mixed Farming", "Pest & Disease Control", "Weed Control", "Livestock Management", "Animal Nutrition", "Animal Health", "Fish Farming", "Poultry Management"],
    ["Agricultural Ecology", "Rock Weathering", "Farm Structures", "Farm Machinery", "Plant Nutrition", "Photosynthesis", "Growth Hormones", "Plant Breeding", "Animal Breeding", "Reproductive System", "Lactation", "Agricultural Marketing", "Agricultural Finance"],
  ],
}

const WEEKLY_OBJECTIVES: Record<string, string[]> = {
  Mathematics: ["Understand place value", "Perform addition correctly", "Master multiplication facts", "Understand division concepts", "Identify fractions", "Work with decimals", "Calculate percentages", "Handle money transactions", "Measure lengths", "Measure weight/capacity", "Read time/calendar", "Identify shapes", "Interpret data"],
  English: ["Identify word classes", "Use nouns/pronouns correctly", "Use correct tenses", "Describe with adjectives", "Punctuate sentences", "Construct sentences", "Comprehend narrative text", "Write descriptively", "Expand vocabulary", "Spell correctly", "Pronounce correctly", "Read fluently", "Write from dictation"],
  Science: ["Differentiate living/non-living", "Identify plant parts", "Categorize animals", "Name body parts", "Describe senses", "Understand nutrition", "Know water sources", "Understand air properties", "Explain day/night", "Describe weather", "Identify soil types", "Identify energy sources", "Describe sound"],
  Social: ["Define family", "Identify family roles", "Describe culture", "Know community helpers", "Understand rules", "Identify leaders", "Know local government", "Understand taxes", "Know transport modes", "Use communication tools", "Understand money", "Identify resources", "Demonstrate patriotism"],
  Agric: ["Define agriculture", "Identify farm types", "Name farm tools", "Prepare soil", "Describe planting", "Identify crops", "Care for crops", "Harvest correctly", "Identify farm animals", "List animal products", "Use farm water", "Name farm buildings", "Explain importance"],
}

function getTermIndex(termName: string): number {
  return TERM_NAMES.indexOf(termName)
}

export function generateSchemeOfWork(
  classes: { id: string; name: string }[],
  subjects: { id: string; name: string; classId: string }[]
) {
  const result: any[] = []

  for (const termName of TERM_NAMES) {
    for (const cls of classes) {
      const classSubjects = subjects.filter((s) => s.classId === cls.id)
      for (const sub of classSubjects) {
        const tIdx = getTermIndex(termName)
        const key = sub.name === "Number Work" || sub.name === "Mathematics" ? "Mathematics"
          : sub.name === "Letter Work" || sub.name === "English Language" ? "English"
          : sub.name === "General Science" || sub.name === "Basic Science" || sub.name === "Integrated Science" || sub.name === "Biology" || sub.name === "Chemistry" || sub.name === "Physics" || sub.name === "Health & Physical Education" ? "Science"
          : sub.name === "Social Studies" || sub.name === "Social Habits" || sub.name === "Government" || sub.name === "Economics" || sub.name === "Commerce" ? "Social"
          : sub.name === "Agricultural Science" || sub.name === "Accounting" ? "Agric"
          : sub.name === "Literature-in-English" || sub.name === "Christian Religious Studies" ? "English"
          : null

        if (!key || !WEEKLY_TOPICS[key]) continue

        const topics = WEEKLY_TOPICS[key][tIdx] || WEEKLY_TOPICS[key][0]
        const objectives = WEEKLY_OBJECTIVES[key] || []
        const weeks = topics.map((topic, wi) => ({
          id: nextId("swk"),
          week: wi + 1,
          topic,
          objectives: objectives[wi] || objectives[0] || "Understand the topic",
          content: `Comprehensive coverage of ${topic} suitable for ${cls.name} level. Includes definitions, examples, practice exercises, and real-world applications.`,
          resources: `${pickRandom(["Textbook", "Worksheet", "Chart", "Video", "Interactive Activity"])}, ${pickRandom(["Group Discussion", "Individual Practice", "Demonstration", "Field Trip"])}`,
          assessment: `${pickRandom(["Classwork", "Homework", "Quiz", "Group Work", "Oral Assessment"])}`,
        }))

        result.push({
          id: nextId("sow"),
          title: `${cls.name} ${sub.name} Scheme of Work (${termName})`,
          subjectId: sub.id,
          subject: sub.name,
          classId: cls.id,
          term: termName,
          session: CURRENT_SESSION,
          weeks,
          status: "published",
          createdBy: "1",
          approvedBy: "1",
          approvedAt: now(),
          createdAt: now(),
          updatedAt: now(),
        })
      }
    }
  }
  return result
}

// ============================================================
// LESSON NOTES (4 per class — Math, English, Science, Social/Agric)
// ============================================================
export function generateLessonNotes(
  classes: { id: string; name: string }[],
  subjects: { id: string; name: string; classId: string }[],
  staff: { id: string; firstName: string; lastName: string }[]
) {
  const result: any[] = []
  const teacher = staff.find((s) => s.id !== "1")

  const noteTemplates: Record<string, { objectives: string[]; intro: string; activities: string[]; conclusion: string }> = {
    "Mathematics": {
      objectives: ["Understand the key mathematical concepts presented", "Apply mathematical operations correctly", "Solve problems with confidence and accuracy", "Explain the reasoning behind solutions"],
      intro: "Begin with a warm-up activity reviewing previous knowledge. Introduce the new concept using concrete examples and manipulatives. Relate the topic to real-life situations students can identify with.",
      activities: ["Mental mathematics drill and review (5 mins)", "Direct instruction with worked examples on the board (15 mins)", "Guided practice with teacher supervision (10 mins)", "Group work on problem-solving tasks (10 mins)", "Individual practice exercises (10 mins)"],
      conclusion: "Review key points with the class. Address common errors observed during practice. Assign homework that reinforces the day's learning. Preview the next topic.",
    },
    "English Language": {
      objectives: ["Identify and understand the language concept being taught", "Apply the concept correctly in speech and writing", "Demonstrate comprehension through exercises", "Build vocabulary related to the topic"],
      intro: "Begin with a short warm-up activity such as a quick review game or vocabulary quiz. Introduce the topic using a story, picture, or real-life scenario. Elicit prior knowledge from students.",
      activities: ["Warm-up discussion or vocabulary game (5 mins)", "Presentation of new concept with examples (15 mins)", "Reading/writing activity with guided support (15 mins)", "Peer practice and speaking exercise (10 mins)", "Written exercise to reinforce learning (10 mins)"],
      conclusion: "Recap the main points of the lesson. Check understanding through oral questions. Assign practice work. Provide feedback on common errors.",
    },
    "Science": {
      objectives: ["Understand the scientific concept being introduced", "Make observations and draw conclusions", "Relate the concept to everyday life", "Demonstrate understanding through practical activities"],
      intro: "Begin with a demonstration or experiment to capture students' interest. Ask probing questions to assess prior knowledge. Explain the learning objectives for the lesson.",
      activities: ["Engagement activity/demonstration (5 mins)", "Explanation of scientific concepts with diagrams (15 mins)", "Hands-on experiment or observation (15 mins)", "Group discussion and recording of findings (10 mins)", "Review questions and worksheet (10 mins)"],
      conclusion: "Review what was learned. Connect the lesson to real-world applications. Assign research or observation homework. Prepare students for the next topic.",
    },
    "Social Studies": {
      objectives: ["Understand the social/civic concept being taught", "Appreciate its relevance to everyday life", "Develop critical thinking about the topic", "Apply the knowledge to real-life situations"],
      intro: "Begin with a discussion question related to the topic. Use pictures, maps, or stories to introduce the concept. Connect the topic to students' own experiences and community.",
      activities: ["Discussion starter and brainstorming (5 mins)", "Direct instruction with visual aids (15 mins)", "Group discussion or debate (15 mins)", "Map/Chart activity or research task (10 mins)", "Reflection writing or worksheet (10 mins)"],
      conclusion: "Summarize key facts and concepts. Encourage students to share what they learned with family. Assign a simple research task. Preview the next lesson.",
    },
    "Agric": {
      objectives: ["Understand basic agricultural concepts", "Identify tools, crops, and farming practices", "Appreciate the importance of agriculture", "Develop practical agricultural skills"],
      intro: "Begin with pictures or samples of farm products. Discuss the importance of agriculture in Nigeria. Connect to students' home experiences with farming or food.",
      activities: ["Warm-up: What do you know about farming? (5 mins)", "Presentation of new concepts with pictures/realia (15 mins)", "Practical identification of tools/crops (10 mins)", "Group activity: sorting or matching (10 mins)", "Worksheet and review (10 mins)"],
      conclusion: "Review the key learning points. Discuss how agriculture provides food and jobs. Assign a practical task (e.g., plant a seed at home). Preview the next topic.",
    },
  }

  const subjectCategories: Record<string, string> = {
    "Number Work": "Mathematics",
    "Mathematics": "Mathematics",
    "Further Mathematics": "Mathematics",
    "Letter Work": "English Language",
    "English Language": "English Language",
    "Literature-in-English": "English Language",
    "General Science": "Science",
    "Basic Science": "Science",
    "Integrated Science": "Science",
    "Biology": "Science",
    "Chemistry": "Science",
    "Physics": "Science",
    "Social Habits": "Social Studies",
    "Social Studies": "Social Studies",
    "Government": "Social Studies",
    "Economics": "Social Studies",
    "History": "Social Studies",
    "Geography": "Social Studies",
    "Civic Education": "Social Studies",
    "Agricultural Science": "Agric",
    "Home Economics": "Agric",
    "Business Studies": "Social Studies",
    "Commerce": "Social Studies",
    "Accounting": "Mathematics",
    "Christian Religious Studies": "Social Studies",
    "Health Habits": "Science",
    "Health & Physical Education": "Science",
    "Physical & Health Education": "Science",
  }

  for (const cls of classes) {
    const classSubjects = subjects.filter((s) => s.classId === cls.id)

    // Pick up to 4 subjects: Math, English, Science, Social/Agric
    const mathSub = classSubjects.find((s) => s.name === "Mathematics" || s.name === "Number Work" || s.name === "Further Mathematics")
    const engSub = classSubjects.find((s) => s.name === "English Language" || s.name === "Letter Work" || s.name === "Literature-in-English")
    const scienceSub = classSubjects.find((s) => ["General Science", "Basic Science", "Integrated Science", "Biology", "Chemistry", "Physics", "Health Habits", "Physical & Health Education", "Health & Physical Education"].includes(s.name))
    const humanitiesSub = classSubjects.find((s) => ["Social Studies", "Social Habits", "Agricultural Science", "Home Economics", "Civic Education", "Christian Religious Studies", "Government", "Economics", "Commerce", "Geography", "History"].includes(s.name))

    const selected = [mathSub, engSub, scienceSub, humanitiesSub].filter(Boolean) as any[]
    const seenNames = new Set<string>()
    const unique = selected.filter((s) => {
      if (seenNames.has(s.name)) return false
      seenNames.add(s.name)
      return true
    })

    for (let si = 0; si < unique.length; si++) {
      const sub = unique[si]
      const weekNum = 2 + si * 3
      const cat = subjectCategories[sub.name] || "General"
      const tmpl = noteTemplates[cat] || noteTemplates["Mathematics"]
      const topicWords = pickRandom(["Basic Concepts", "Core Topics", "Fundamentals", "Key Principles", "Essential Skills", "Important Themes"])

      result.push({
        id: nextId("ln"),
        title: `${sub.name}: ${topicWords} - Week ${weekNum} (${cls.name})`,
        subject: sub.name,
        subjectId: sub.id,
        classId: cls.id,
        week: weekNum,
        term: "First Term",
        session: CURRENT_SESSION,
        content: `<h2>${sub.name} Lesson - ${cls.name}</h2><h3>Learning Objectives:</h3><ul>${tmpl.objectives.map(o => `<li>${o}</li>`).join("")}</ul><h3>Introduction:</h3><p>${tmpl.intro}</p><h3>Lesson Procedure / Activities:</h3><ol>${tmpl.activities.map(a => `<li>${a}</li>`).join("")}</ol><h3>Conclusion:</h3><p>${tmpl.conclusion}</p><h3>Evaluation:</h3><p>Students will be assessed through class participation, completed exercises, and a short quiz at the end of the lesson. Marks will be recorded for continuous assessment.</p>`,
        resources: `<ul><li>${sub.name} Textbook (Chapter ${weekNum})</li><li>Lesson worksheet</li><li>Whiteboard and markers</li><li>Learning aids relevant to the topic</li><li>Reference materials</li></ul>`,
        quiz: [
          {
            id: nextId("qz"),
            questionText: `What is the most important thing you learned in today's ${sub.name} lesson?`,
            question: `What is the most important thing you learned in today's ${sub.name} lesson?`,
            type: "Theory",
            options: [],
            correctAnswer: "Students should mention a key concept from the lesson",
            points: 5,
          },
          {
            id: nextId("qz"),
            questionText: `${sub.name} is an important subject that helps develop critical thinking. (True/False)`,
            question: `${sub.name} is an important subject that helps develop critical thinking. (True/False)`,
            type: "True-False",
            options: ["True", "False"],
            correctAnswer: "True",
            points: 3,
          },
        ],
        status: "published",
        createdBy: teacher?.id || "1",
        approvedBy: "1",
        approvedAt: now(),
        createdAt: now(),
        updatedAt: now(),
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "Admin User",
        className: cls.name,
      })
    }
  }
  return result
}

// ============================================================
// ATTENDANCE RECORDS
// ============================================================
export function generateAttendanceRecords(students: { id: string }[]) {
  const result: any[] = []
  const daysInTerm = 60
  const statuses: ("present" | "absent" | "late")[] = ["present", "present", "present", "present", "present", "present", "present", "present", "absent", "late"]

  for (const student of students) {
    for (let d = 0; d < daysInTerm; d++) {
      const date = new Date(2024, 8 + Math.floor(d / 30), (d % 30) + 1)
      if (date.getDay() === 0 || date.getDay() === 6) continue
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      result.push({
        id: nextId("att"),
        studentId: student.id,
        date: date.toISOString().split("T")[0],
        status,
        timeIn: status === "absent" ? null : `${7 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
        timeOut: "14:00",
        markedBy: "1",
      })
    }
  }
  return result
}

// ============================================================
// RESULTS (full scores for report cards)
// ============================================================
export function generateResults(
  students: { id: string; classId: string }[],
  subjects: { id: string; name: string; classId: string }[],
  classes: { id: string; name: string }[]
) {
  const result: any[] = []

  for (const student of students) {
    const classSubjects = subjects.filter((s) => s.classId === student.classId)
    for (const sub of classSubjects) {
      const caScore = getRandomScore(15, 38)
      const examScore = getRandomScore(20, 58)
      const total = caScore + examScore
      const { grade, remark } = getGradeAndRemark(total, 100)
      result.push({
        id: nextId("res"),
        studentId: student.id,
        subject: sub.name,
        subjectId: sub.id,
        caScore,
        examScore,
        caTotal: 40,
        examTotal: 60,
        total,
        score: total,
        totalMax: 100,
        grade,
        remark,
        term: CURRENT_TERM,
        session: CURRENT_SESSION,
        createdAt: now(),
        updatedAt: now(),
      })
    }
  }
  return result
}

// ============================================================
// REPORT CARDS (based on results data)
// ============================================================
export function generateReportCards(
  students: { id: string; firstName: string; lastName: string; classId: string }[],
  classes: { id: string; name: string }[],
  results: { studentId: string; subject: string; score: number; total: number; grade: string; remark: string }[],
  attendanceRecords: { studentId: string; status: string }[]
) {
  const result: any[] = []
  const teachersComment = [
    "A diligent student who shows great promise. Keep up the good work!",
    "Has shown remarkable improvement this term. Well done!",
    "A focused and hardworking student. Encouraged to participate more in class.",
    "Shows good understanding of most subjects. Needs to work on consistency.",
    "An excellent student with great leadership qualities.",
    "Has potential but needs to be more regular with assignments.",
    "A pleasure to teach. Shows genuine interest in learning.",
    "Good performance overall. Should focus on areas of weakness.",
  ]

  const principalComment = [
    "Keep striving for excellence. Your hard work will pay off.",
    "We are proud of your achievements this term. Continue to aim higher.",
    "You have the ability to excel. Apply yourself consistently.",
    "A satisfactory performance. We look forward to even better results.",
    "Exemplary conduct and academic performance. Well done.",
  ]

  for (const student of students) {
    const studentResults = results.filter((r) => r.studentId === student.id)
    const attendance = attendanceRecords.filter((a) => a.studentId === student.id)
    const cls = classes.find((c) => c.id === student.classId)
    const totalScore = studentResults.reduce((s: number, r) => s + r.score, 0)
    const totalMax = studentResults.reduce((s: number, r) => s + r.total, 0)
    const subjectsData = studentResults.map((r) => ({
      name: r.subject,
      score: r.score,
      total: r.total,
      grade: r.grade,
      remark: r.remark,
    }))

    result.push({
      id: nextId("rc"),
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      className: cls?.name || "Unknown",
      term: CURRENT_TERM,
      session: CURRENT_SESSION,
      subjects: subjectsData,
      totalScore,
      totalMax,
      average: studentResults.length > 0 ? Math.round(totalScore / studentResults.length) : 0,
      position: pickRandom(["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"]),
      attendance: {
        present: attendance.filter((a) => a.status === "present").length,
        absent: attendance.filter((a) => a.status === "absent").length,
        late: attendance.filter((a) => a.status === "late").length,
      },
      teacherComment: pickRandom(teachersComment),
      principalComment: pickRandom(principalComment),
      nextTerm: "6th January 2025",
      domains: REPORT_DOMAINS.map((d) => ({
        name: d.name,
        score: Math.floor(Math.random() * 6) + 5,
        max: d.max,
      })),
    })
  }
  return result
}

// ============================================================
// FEE STRUCTURES
// ============================================================
export function generateFeeStructures(classes: { id: string; name: string }[]) {
  const baseFees: Record<string, number> = {
    Nursery: 150000,
    Primary: 200000,
    JSS: 300000,
    SSS: 400000,
  }

  return classes.map((cls) => ({
    id: nextId("fee"),
    classId: cls.id,
    className: cls.name,
    tuition: baseFees[CLASS_BROAD_SECTION[cls.name]] || 200000,
    development: 50000,
    sports: 25000,
    library: 20000,
    ict: 30000,
    total: (baseFees[CLASS_BROAD_SECTION[cls.name]] || 200000) + 125000,
    term: CURRENT_TERM,
    session: CURRENT_SESSION,
    createdAt: now(),
    updatedAt: now(),
  }))
}

// ============================================================
// PAYMENTS
// ============================================================
export function generatePayments(
  students: { id: string; classId: string }[],
  feeStructures: { classId: string; total: number }[]
) {
  const result: any[] = []
  for (const student of students) {
    const fee = feeStructures.find((f) => f.classId === student.classId)
    if (!fee) continue
    result.push({
      id: nextId("pay"),
      studentId: student.id,
      amount: fee.total,
      paid: getRandomBool(0.7) ? fee.total : Math.floor(fee.total * (getRandomBool(0.5) ? 0.5 : 0.75)),
      description: `School Fees - ${CURRENT_TERM} ${CURRENT_SESSION}`,
      term: CURRENT_TERM,
      session: CURRENT_SESSION,
      status: getRandomBool(0.7) ? "confirmed" : "pending",
      method: pickRandom(["cash", "transfer", "pos"]),
      confirmedBy: getRandomBool(0.7) ? "1" : null,
      confirmedAt: getRandomBool(0.7) ? now() : null,
      createdAt: now(),
    })
  }
  return result
}

// ============================================================
// BANK DETAILS
// ============================================================
export function generateBankDetails() {
  return {
    id: "b1",
    bankName: "First Bank of Nigeria",
    accountName: "Royal Kiddies Academy",
    accountNumber: "2034567890",
    branch: "Ikeja Branch, Lagos",
    swiftCode: "FBNINGLA",
    schoolId: "school_1",
    updatedAt: now(),
  }
}

// ============================================================
// SCHOOL SETTINGS
// ============================================================
export function generateSchoolSettings() {
  return {
    loginEnabled: true,
    expirationDate: null,
    superAdminPassword: "successor",
    schoolName: "Royal Kiddies Academy",
    schoolMotto: "Excellence in Character and Learning",
    schoolAddress: "42 Education Avenue, Ikeja, Lagos State",
    schoolPhone: "+234 801 234 5678",
    schoolEmail: "info@royalkiddiesacademy.edu.ng",
    schoolLogo: "",
    aboutText: "Royal Kiddies Academy is a premier educational institution dedicated to nurturing the next generation of leaders. We provide a holistic education that combines academic excellence with character development.",
  }
}

// ============================================================
// ADMISSION APPLICATIONS
// ============================================================
export function generateAdmissionApplications(classes: { id: string; name: string }[]) {
  const statuses = ["pending", "approved", "rejected"]
  return [
    {
      id: nextId("adm"),
      firstName: "Chibuzo",
      lastName: "Okeke",
      email: "chibuzo.okeke@email.com",
      phone: "+234 803 456 7890",
      classId: classes[2]?.id || "class_3",
      className: classes[2]?.name || "Primary 1",
      status: "pending",
      appliedAt: "2024-08-15T10:30:00.000Z",
      dob: "2018-03-12",
      gender: "Male",
      address: "15 Peace Street, Enugu",
      previousSchool: "Bright Stars Montessori",
      notes: "Transfer from Bright Stars. Good academic record.",
    },
    {
      id: nextId("adm"),
      firstName: "Khadija",
      lastName: "Suleiman",
      email: "khadija.suleiman@email.com",
      phone: "+234 803 567 8901",
      classId: classes[8]?.id || "class_9",
      className: classes[8]?.name || "JSS 1",
      status: "approved",
      appliedAt: "2024-07-20T14:00:00.000Z",
      dob: "2012-09-25",
      gender: "Female",
      address: "8 Unity Road, Kano",
      previousSchool: "Kano Capital School",
      notes: "Accepted. Starting JSS 1.",
    },
    {
      id: nextId("adm"),
      firstName: "Daniel",
      lastName: "Adebayo",
      email: "daniel.adebayo@email.com",
      phone: "+234 803 678 9012",
      classId: classes[12]?.id || "class_13",
      className: classes[12]?.name || "SSS 1 - Arts",
      status: "rejected",
      appliedAt: "2024-06-10T09:00:00.000Z",
      dob: "2008-11-03",
      gender: "Male",
      address: "22 Liberty Avenue, Ibadan",
      previousSchool: "Ibadan Grammar School",
      notes: "Application incomplete. Missing required documents.",
    },
  ]
}

// ============================================================
// FEEDBACK TICKETS
// ============================================================
export function generateFeedbackTickets() {
  return [
    {
      id: nextId("fb"),
      name: "Emeka Okafor",
      email: "emeka.okafor@email.com",
      subject: "Library Books Request",
      message: "The library needs more reference books for the science department. Students are struggling to find resources for their projects.",
      status: "pending",
      createdAt: "2024-10-05T11:30:00.000Z",
      resolvedAt: null,
      resolution: null,
    },
    {
      id: nextId("fb"),
      name: "Yetunde Adebayo",
      email: "yetunde.adebayo@email.com",
      subject: "School Bus Route",
      message: "Can the school consider adding a bus route to the Maryland area? Many parents in this area would appreciate it.",
      status: "resolved",
      createdAt: "2024-09-20T08:15:00.000Z",
      resolvedAt: "2024-09-25T16:00:00.000Z",
      resolution: "Thank you for your suggestion. We will review the bus routes for the next term.",
    },
    {
      id: nextId("fb"),
      name: "Musa Bello",
      email: "musa.bello@email.com",
      subject: "Sports Equipment",
      message: "The football field needs new goalposts and nets. The current ones are damaged.",
      status: "pending",
      createdAt: "2024-11-02T15:45:00.000Z",
      resolvedAt: null,
      resolution: null,
    },
  ]
}

// ============================================================
// WEEKLY REPORTS
// ============================================================
export function generateWeeklyReports(
  students: { id: string; firstName: string; lastName: string; classId: string }[],
  classes: { id: string; name: string }[],
  subjects: { id: string; name: string; classId: string }[],
  results: any[],
  attendanceRecords: any[],
  staff: any[]
) {
  const reports: any[] = []
  const terms = ["First Term", "Second Term", "Third Term"]
  const session = "2024/2025"
  const teacherIds = staff.filter((s) => s.role === "teacher").map((s) => s.id)

  const comments = [
    "A good week overall. The student is progressing well and showing consistent effort in all subjects.",
    "Showed improvement in class participation this week. Encouraged to keep up the good work.",
    "Needs to focus more on completing assignments on time. Otherwise, performance is satisfactory.",
    "Excellent week! Demonstrated great leadership skills during group activities.",
    "Good attendance and punctuality. Homework completion needs slight improvement.",
    "A very productive week. The student has shown remarkable improvement in attitude and academic performance.",
    "Average performance this week. With more dedication, can achieve better results.",
    "Impressive work ethic. The student is a role model for peers in terms of discipline and punctuality.",
  ]

  const firstName = [...NIGERIAN_FIRST_NAMES_MALE, ...NIGERIAN_FIRST_NAMES_FEMALE]

  for (const student of students) {
    const cls = classes.find((c) => c.id === student.classId)
    if (!cls) continue
    const classSubjects = subjects.filter((s) => s.classId === student.classId)
    if (classSubjects.length === 0) continue

    const teacherId = teacherIds[Math.floor(Math.random() * teacherIds.length)]
    const studentResults = results.filter((r) => r.studentId === student.id)
    const studentAttendance = attendanceRecords.filter((a) => a.studentId === student.id)

    // Generate 3 weeks of reports
    for (let week = 1; week <= 3; week++) {
      const subjectPerformances = classSubjects.map((sub) => {
        const subResult = studentResults.find((r) => r.subjectId === sub.id)
        const baseScore = subResult ? (subResult.score / subResult.total) * 100 : 50 + Math.floor(Math.random() * 40)

        return {
          subject: sub.name,
          subjectId: sub.id,
          score: Math.round(Math.min(100, Math.max(10, baseScore + (Math.random() > 0.5 ? 5 : -5)))),
          assignmentsCompleted: Math.floor(Math.random() * 4) + 1,
          assignmentsTotal: 4,
          participation: Math.floor(Math.random() * 3) + 3,
          notes: "",
        }
      })

      const weekAttendance = studentAttendance.slice((week - 1) * 5, week * 5)
      const present = weekAttendance.filter((a) => a.status === "present").length
      const absent = weekAttendance.filter((a) => a.status === "absent").length
      const late = weekAttendance.filter((a) => a.status === "late").length
      const total = weekAttendance.length || 5

      const behavior = {
        punctuality: Math.floor(Math.random() * 3) + 3,
        attentiveness: Math.floor(Math.random() * 3) + 2,
        conduct: Math.floor(Math.random() * 3) + 3,
        homeworkCompletion: Math.floor(Math.random() * 3) + 2,
        teamwork: Math.floor(Math.random() * 3) + 3,
        behaviorNotes: Math.random() > 0.6 ? "Student participated well in extracurricular activities this week." : "",
      }

      const overallRating = Math.round(
        (subjectPerformances.reduce((s, p) => s + (p.score >= 70 ? 4 : p.score >= 50 ? 3 : 2), 0) /
          subjectPerformances.length +
          behavior.punctuality +
          behavior.attentiveness +
          behavior.conduct +
          behavior.homeworkCompletion +
          behavior.teamwork) /
          6
      )

      reports.push({
        id: nextId("wr"),
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        classId: student.classId,
        className: cls.name,
        week,
        term: "First Term",
        session,
        createdBy: teacherId,
        teacherName: staff.find((s) => s.id === teacherId)
          ? `${staff.find((s) => s.id === teacherId).firstName} ${staff.find((s) => s.id === teacherId).lastName}`
          : "Grace Hopper",
        subjectPerformances,
        punctuality: behavior.punctuality,
        attentiveness: behavior.attentiveness,
        conduct: behavior.conduct,
        homeworkCompletion: behavior.homeworkCompletion,
        teamwork: behavior.teamwork,
        behaviorNotes: behavior.behaviorNotes,
        attendancePresent: present,
        attendanceAbsent: absent,
        attendanceLate: late,
        attendanceTotal: total,
        teacherComment: comments[Math.floor(Math.random() * comments.length)],
        overallRating: Math.max(1, Math.min(5, overallRating)),
        status: "published",
        createdAt: new Date(2024, 8 + week, 15).toISOString(),
        updatedAt: new Date(2024, 8 + week, 15).toISOString(),
        publishedAt: new Date(2024, 8 + week, 15).toISOString(),
      })
    }
  }

  return reports
}

// ============================================================
// SUPER ANNOUNCEMENTS
// ============================================================
export function generateSuperAnnouncements() {
  return []
}
