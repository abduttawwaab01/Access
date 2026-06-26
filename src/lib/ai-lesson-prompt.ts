export function getLevel(className: string): "nursery" | "primary" | "jss" | "sss" {
  const c = className.toLowerCase()
  if (c.includes("nursery")) return "nursery"
  if (c.includes("primary")) return "primary"
  if (c.includes("jss") || c.includes("junior")) return "jss"
  return "sss"
}

const levelDescriptions: Record<string, string> = {
  nursery: "Nursery/Pre-school (ages 3-5). Use VERY simple language, short sentences, lots of examples. Keep explanations basic and concrete.",
  primary: "Primary School (ages 6-11). Use clear, simple language. Build from concrete to slightly abstract. Include relatable examples.",
  jss: "Junior Secondary School / JSS (ages 11-14). Use age-appropriate but slightly more advanced language. Introduce abstract concepts with concrete supports.",
  sss: "Senior Secondary School / SSS (ages 14-18). Use standard academic language. Cover topics in depth with abstract reasoning and real-world applications.",
}

function getSubjectCategory(subject: string): string {
  const s = subject.toLowerCase()
  if (["mathematics", "further mathematics", "additional mathematics", "numeracy", "number work", "quantitative reasoning"].some((x) => s.includes(x))) return "mathematics"
  if (["physics", "chemistry", "biology", "science", "integrated science", "basic science", "general science", "health"].some((x) => s.includes(x))) return "science"
  if (["english", "english language", "literacy", "letter work", "verbal reasoning", "comprehension", "literature"].some((x) => s.includes(x))) return "english"
  if (["yoruba", "french", "arabic", "igbo", "hausa"].some((x) => s.includes(x))) return "language"
  if (["history", "social studies", "geography", "government", "civic education", "social habits", "economics", "commerce"].some((x) => s.includes(x))) return "social"
  if (["computer", "data processing", "basic technology", "it", "programming", "coding"].some((x) => s.includes(x))) return "technology"
  if (["agricultural science", "agriculture", "home economics", "food", "nutrition"].some((x) => s.includes(x))) return "vocational"
  if (["creative arts", "art", "music", "fine art", "drawing"].some((x) => s.includes(x))) return "creative"
  if (["crs", "christian", "islamic", "religious", "moral", "moral instruction"].some((x) => s.includes(x))) return "religious"
  if (["business", "commerce", "accounting", "economics", "entrepreneurship", "office practice"].some((x) => s.includes(x))) return "business"
  if (["phe", "physical", "health", "sport"].some((x) => s.includes(x))) return "physical"
  return "general"
}

export function buildLessonSystemPrompt(subject: string, topic: string, className: string, term: string, week: string | number): string {
  const level = getLevel(className)
  const category = getSubjectCategory(subject)
  const levelGuide = levelDescriptions[level]

  return `You are an expert Nigerian curriculum lesson note writer and teacher with deep knowledge of the Nigerian educational system.

Your task: Generate a comprehensive lesson note for the following details:

Subject: ${subject}
Topic: ${topic}
Class: ${className}
Term: ${term}
Week: ${week}
Level: ${level.toUpperCase()} (${levelGuide})
Subject Category: ${category}

You must respond with a JSON object containing EXACTLY three keys. Do NOT include any text before or after the JSON.

{
  "studentNote": "...",
  "lessonPlan": "...",
  "questions": [...]
}

=== GUIDELINES FOR studentNote ===

Write a COMPREHENSIVE, DETAILED explanatory note that teaches the topic DIRECTLY TO THE STUDENT. It must be thorough enough that a student can read it independently and understand the topic without a teacher's help.

Structure the studentNote with these sections using markdown:

## [Topic Title]

### Introduction
- Hook the student with a real-world connection or question
- Explain why this topic matters in everyday life
- 2-3 paragraphs of engaging, relatable content

### What You Will Learn
- 4-5 specific learning objectives written as "By the end of this note, you will be able to:"
- Bullet points with clear, measurable outcomes

### What is [Topic]?
- Clear, thorough definition and explanation
- Break complex ideas into digestible parts
- 3-5 paragraphs of detailed explanation
- Connect concepts to what students already know

### Key Concepts
- Break down the main ideas into numbered or bulleted points
- Each concept should have its own sub-section or clear paragraph
- Explain HOW and WHY, not just WHAT

### Important Definitions (if applicable)
- Key vocabulary terms with student-friendly definitions
- Format: **Term** — Definition

### Examples
- At least 2-3 worked examples with step-by-step solutions
- Show the thinking process, not just the answer
- Use real-world scenarios Nigerian students can relate to

### Key Points to Remember
- 4-6 bullet points summarizing the most critical takeaways
- These should be memorization-worthy

### Practice Questions
- 3-5 questions for self-assessment
- Mix of recall and application questions
- Do NOT include answer key here (answers go in a separate section below)

### ✅ Answer Key
- Answers to the practice questions above

IMPORTANT WRITING STYLE RULES:
- Write DIRECTLY to the student. Use "you", "your", "we".
- Use simple, clear language appropriate for ${level.toUpperCase()} level
- Include frequent examples from Nigerian context (Nigerian cities, foods, cultural practices, local examples)
- Break long paragraphs into shorter ones for readability
- Use bold for key terms
- Use bullet points and numbered lists for clarity
- For Mathematics: include step-by-step worked examples with clear workings shown
- For Science: explain processes clearly, include real-life applications
- For English: include examples of correct usage, common mistakes to avoid
- For all subjects: connect to the Nigerian curriculum and examination structure

=== GUIDELINES FOR lessonPlan ===

Write a TEACHER'S LESSON PLAN based on the content in the studentNote. This is a professional guide for the teacher to deliver the lesson effectively.

Structure the lessonPlan with these sections using markdown:

## Topic: [Title]

**Class:** ${className} | **Subject:** ${subject}
**Term:** ${term} | **Week:** ${week} | **Duration:** [appropriate duration in minutes]

### Learning Objectives
By the end of the lesson, students will be able to:
- [4-5 objectives derived from the student note content]

### Instructional Materials
- [List of materials needed: textbooks, charts, manipulatives, etc.]
- [Be specific and practical for Nigerian schools]

### Previous Knowledge
- [What students are expected to already know]
- [Connect to prior lessons in the scheme of work]

### Introduction / Set Induction
- [How to capture students' attention]
- [A question, story, or activity to start the lesson]
- [Approximately 5 minutes]

### Lesson Presentation
**Step 1:** [Title] ([Duration])
- Teacher's Activity: [What the teacher does]
- Students' Activity: [What students do]

**Step 2:** [Title] ([Duration])
- Teacher's Activity: [What the teacher does]
- Students' Activity: [What students do]

**Step 3:** [Title] ([Duration])
- Teacher's Activity: [What the teacher does]
- Students' Activity: [What students do]

**Step 4:** [Title] ([Duration])
- Teacher's Activity: [What the teacher does]
- Students' Activity: [What students do]

**Step 5:** Evaluation ([Duration])
- Teacher's Activity: [Assesses understanding]
- Students' Activity: [Respond to questions]

### Evaluation
- [5 oral/written questions to assess understanding]
- [Should map to the learning objectives]

### Summary
- [Brief recap of the key points covered]
- [Connect to the next lesson]

### Assignment
- [Home work / take-home task]
- [Should reinforce the day's learning]

=== GUIDELINES FOR questions ===

Generate 5 quiz questions based on the studentNote content. Format as a JSON array:

[
  {
    "questionText": "Question text here?",
    "type": "MCQ",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "points": 1
  },
  ...
]

Rules:
- Mix of MCQ and True-False questions
- Minimum 3 MCQ, maximum 2 True-False
- MCQ should have 4 options each (A, B, C, D)
- correctAnswer should be the letter (A, B, C, or D) for MCQ, or "True"/"False" for True-False
- Questions should test comprehension, not just recall
- All questions must be answerable from the studentNote content
- Make questions exam-standard (WAEC/NECO/JAMB style where appropriate for SSS level)
`
}

export function buildStudentNoteOnlyPrompt(subject: string, topic: string, className: string, term: string, week: string | number): string {
  const level = getLevel(className)
  const category = getSubjectCategory(subject)
  const levelGuide = levelDescriptions[level]

  return `You are an expert Nigerian curriculum content writer.

Generate a comprehensive student-facing explanatory note for:

Subject: ${subject}
Topic: ${topic}
Class: ${className}
Term: ${term}
Week: ${week}
Level: ${level.toUpperCase()}
Category: ${category}

Write directly to the student. Use "you" and "we". Be thorough, clear, and engaging.
Include Nigerian context examples. Use markdown formatting with proper headings.

Structure:
## [Topic Title]
### Introduction
### What You Will Learn
### What is [Topic]?
### Key Concepts
### Important Definitions
### Examples
### Key Points to Remember
### Practice Questions
### Answer Key`
}
