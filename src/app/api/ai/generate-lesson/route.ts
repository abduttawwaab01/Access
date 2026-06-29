import { NextResponse } from "next/server"
import { buildLessonSystemPrompt } from "@/lib/ai-lesson-prompt"
import { requireAuth } from "@/lib/api-auth"

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

const MODELS = [
  "mistralai/mistral-7b-instruct:free",
  "huggingfaceh4/zephyr-7b-beta:free",
  "microsoft/phi-3-mini-4k-instruct:free",
  "gryphe/mythomax-l2-13b",
]

function extractJson(text: string): any {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth instanceof Response) return auth
  try {
    const { subject, topic, className, term, week } = await request.json()

    if (!subject || !topic || !className) {
      return NextResponse.json({ error: "subject, topic, and className are required" }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      )
    }

    const systemPrompt = buildLessonSystemPrompt(subject, topic, className, term || "First Term", week || "1")
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate a complete lesson note for ${topic} in ${subject} for ${className}. Include the student note, teacher lesson plan, and 5 quiz questions.` },
    ]

    let lastError: string | null = null

    for (const model of MODELS) {
      try {
        const response = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://access-skoolar.vercel.app",
            "X-Title": "Access School Lesson Generator",
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 4096,
            temperature: 0.7,
          }),
        })

        if (!response.ok) {
          const errText = await response.text().catch(() => "Unknown error")
          lastError = `Model ${model} failed: ${response.status} ${errText.slice(0, 200)}`
          continue
        }

        const data = await response.json()
        const content = data?.choices?.[0]?.message?.content || ""

        if (!content) {
          lastError = `Model ${model}: empty response`
          continue
        }

        const parsed = extractJson(content)
        if (parsed && parsed.studentNote && parsed.lessonPlan) {
          return NextResponse.json({
            studentNote: parsed.studentNote,
            lessonPlan: parsed.lessonPlan,
            questions: parsed.questions || [],
            source: "ai",
            model,
          })
        }

        if (parsed && parsed.studentNote) {
          return NextResponse.json({
            studentNote: parsed.studentNote,
            lessonPlan: parsed.lessonPlan || generateBasicLessonPlan(parsed.studentNote, subject, topic, className, term, week),
            questions: parsed.questions || [],
            source: "ai",
            model,
          })
        }

        lastError = `Model ${model}: response didn't contain valid lesson data`
      } catch (err) {
        lastError = `Model ${model}: ${(err as Error).message}`
      }
    }

    return NextResponse.json(
      { error: `AI generation failed. ${lastError || "Unknown error"}` },
      { status: 503 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${(err as Error).message}` },
      { status: 500 }
    )
  }
}

function generateBasicLessonPlan(studentNote: string, subject: string, topic: string, className: string, term: string, week: string | number): string {
  return `## Topic: ${topic}

**Class:** ${className} | **Subject:** ${subject}
**Term:** ${term} | **Week:** ${week} | **Duration:** 40 Minutes

### Learning Objectives
By the end of this lesson, students will be able to:
- Define and explain ${topic} in their own words
- Identify key concepts related to ${topic}
- Apply knowledge of ${topic} to solve problems
- Demonstrate understanding through exercises

### Instructional Materials
- Textbook
- Whiteboard and markers
- Charts and diagrams
- Notebooks and pens

### Previous Knowledge
Students have learned basic concepts in ${subject} in previous lessons.

### Introduction / Set Induction
Ask students what they already know about the topic through guided questions.

### Lesson Presentation

**Step 1:** Introduction to ${topic}
- Teacher explains the concept with clear definitions and examples
- Students listen, ask questions, and take notes

**Step 2:** Content Development
- Teacher presents key points with detailed explanations
- Students participate in discussions

**Step 3:** Practical Application
- Students work on exercises individually and in groups
- Teacher guides and provides feedback

**Step 4:** Evaluation
- Teacher asks oral questions to assess understanding
- Students respond and ask clarifying questions

### Summary
Review the main points covered in today's lesson. Emphasize the key takeaways.

### Assignment
1. Write a summary of today's lesson on ${topic}
2. Answer the review questions at the end of the chapter
3. Research more about ${topic}
`
}
