import { NextResponse } from "next/server"
import { buildContext } from "@/lib/ai-context"

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

const MODELS = [
  "mistralai/mistral-7b-instruct:free",
  "huggingfaceh4/zephyr-7b-beta:free",
  "microsoft/phi-3-mini-4k-instruct:free",
  "gryphe/mythomax-l2-13b",
]

export async function POST(request: Request) {
  try {
    const { prompt, role, teacherId, messages: history } = await request.json()

    if (!prompt || !role) {
      return NextResponse.json({ error: "Prompt and role are required" }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured. Please set OPENROUTER_API_KEY in your environment." },
        { status: 500 }
      )
    }

    const { systemPrompt } = await buildContext(role, teacherId)

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...(history || []).slice(-20),
      { role: "user", content: prompt },
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
            "X-Title": "Access School AI Assistant",
          },
          body: JSON.stringify({
            model,
            messages: chatMessages,
            stream: true,
            max_tokens: 2048,
            temperature: 0.7,
          }),
        })

        if (!response.ok) {
          const errText = await response.text().catch(() => "Unknown error")
          lastError = `Model ${model} failed: ${response.status} ${errText.slice(0, 200)}`
          console.warn(lastError)
          continue
        }

        const stream = response.body
        if (!stream) {
          lastError = `Model ${model}: no response body`
          continue
        }

        const encoder = new TextEncoder()
        const decoder = new TextDecoder()

        const readable = new ReadableStream({
          async start(controller) {
            const reader = stream.getReader()
            let buffer = ""

            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split("\n")
                buffer = lines.pop() || ""

                for (const line of lines) {
                  const trimmed = line.trim()
                  if (!trimmed || !trimmed.startsWith("data:")) continue
                  const data = trimmed.slice(5).trim()
                  if (data === "[DONE]") continue
                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content || ""
                    if (content) {
                      controller.enqueue(encoder.encode(content))
                    }
                  } catch {
                    // skip malformed JSON chunks
                  }
                }
              }

              if (buffer.trim()) {
                const trimmed = buffer.trim()
                if (trimmed.startsWith("data:")) {
                  const data = trimmed.slice(5).trim()
                  if (data !== "[DONE]") {
                    try {
                      const parsed = JSON.parse(data)
                      const content = parsed.choices?.[0]?.delta?.content || ""
                      if (content) controller.enqueue(encoder.encode(content))
                    } catch { /* skip */ }
                  }
                }
              }
            } catch (err) {
              console.warn("Stream read error:", err)
            } finally {
              controller.close()
            }
          },
        })

        return new Response(readable, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        })
      } catch (err) {
        lastError = `Model ${model}: ${(err as Error).message}`
        console.warn(lastError)
      }
    }

    return NextResponse.json(
      { error: `All AI models failed. Last error: ${lastError || "Unknown"}` },
      { status: 503 }
    )
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${(err as Error).message}` },
      { status: 500 }
    )
  }
}
