"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"
import { BookOpen, Lightbulb, Star, Target, FileQuestion, CheckCircle2, PenTool, ListChecks } from "lucide-react"

interface StudentNoteContentProps {
  content: string
  className?: string
}

function getSectionIcon(heading: string) {
  const h = heading.toLowerCase()
  if (h.includes("introduction")) return <BookOpen className="h-4 w-4" />
  if (h.includes("what you will learn") || h.includes("learning objective")) return <Target className="h-4 w-4" />
  if (h.includes("key point") || h.includes("remember")) return <Star className="h-4 w-4" />
  if (h.includes("definition")) return <BookOpen className="h-4 w-4" />
  if (h.includes("example")) return <Lightbulb className="h-4 w-4" />
  if (h.includes("practice question") || h.includes("review question")) return <FileQuestion className="h-4 w-4" />
  if (h.includes("answer key") || h.includes("answer")) return <CheckCircle2 className="h-4 w-4" />
  if (h.includes("key concept")) return <ListChecks className="h-4 w-4" />
  if (h.includes("assignment")) return <PenTool className="h-4 w-4" />
  return null
}

function isKeyPointsSection(heading: string) {
  return /key points?/.test(heading.toLowerCase()) || /remember/.test(heading.toLowerCase())
}

function isDefinitionSection(heading: string) {
  return /definitions?/.test(heading.toLowerCase())
}

function isExampleSection(heading: string) {
  return /examples?/.test(heading.toLowerCase())
}

function isPracticeSection(heading: string) {
  return /practice question/.test(heading.toLowerCase()) || /review question/.test(heading.toLowerCase())
}

function isAnswerSection(heading: string) {
  return /answer/.test(heading.toLowerCase())
}

function isLearningObjectives(heading: string) {
  return /what you will learn/.test(heading.toLowerCase()) || /learning objective/.test(heading.toLowerCase())
}

export function StudentNoteContent({ content, className }: StudentNoteContentProps) {
  if (!content || !content.trim()) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No content available for this lesson note yet.
      </div>
    )
  }

  return (
    <div className={cn("student-note-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => {
            const text = extractText(children)
            return (
              <h1 className="text-xl font-bold text-foreground mt-6 mb-3 pb-2 border-b border-border" {...props}>
                {text}
              </h1>
            )
          },
          h2: ({ children, ...props }) => {
            const text = extractText(children)
            const icon = getSectionIcon(text)
            return (
              <h2 className="text-lg font-bold text-foreground mt-6 mb-3 flex items-center gap-2" {...props}>
                {icon && <span className="text-primary shrink-0">{icon}</span>}
                {text}
              </h2>
            )
          },
          h3: ({ children, ...props }) => {
            const text = extractText(children)
            const icon = getSectionIcon(text)

            if (isKeyPointsSection(text)) {
              return (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50/80 p-4 my-4">
                  <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2" {...props}>
                    <Star className="h-4 w-4 text-amber-500" />
                    {text}
                  </h3>
                  <div className="text-sm text-amber-900 space-y-1">
                    {children}
                  </div>
                </div>
              )
            }

            if (isDefinitionSection(text)) {
              return (
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50/80 p-4 my-4">
                  <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2" {...props}>
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    {text}
                  </h3>
                  <div className="text-sm text-blue-900 space-y-1">
                    {children}
                  </div>
                </div>
              )
            }

            if (isExampleSection(text)) {
              return (
                <div className="my-4">
                  <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2 mb-2" {...props}>
                    <Lightbulb className="h-4 w-4 text-emerald-500" />
                    {text}
                  </h3>
                  <div className="border-l-4 border-emerald-400 pl-4 py-1 text-sm text-muted-foreground">
                    {children}
                  </div>
                </div>
              )
            }

            if (isPracticeSection(text)) {
              return (
                <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/60 p-4 my-4">
                  <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2 mb-2" {...props}>
                    <FileQuestion className="h-4 w-4 text-purple-500" />
                    {text}
                  </h3>
                  <div className="text-sm text-purple-900 space-y-1">
                    {children}
                  </div>
                </div>
              )
            }

            if (isAnswerSection(text)) {
              return (
                <details className="my-4 group">
                  <summary className="text-sm font-bold text-emerald-700 flex items-center gap-2 cursor-pointer hover:text-emerald-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {text}
                  </summary>
                  <div className="mt-2 pl-4 border-l-2 border-emerald-300 text-sm text-muted-foreground">
                    {children}
                  </div>
                </details>
              )
            }

            if (isLearningObjectives(text)) {
              return (
                <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/80 p-4 my-4">
                  <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-2 mb-2" {...props}>
                    <Target className="h-4 w-4 text-indigo-500" />
                    {text}
                  </h3>
                  <div className="text-sm text-indigo-900 space-y-1">
                    {children}
                  </div>
                </div>
              )
            }

            return (
              <h3 className="text-base font-semibold text-foreground mt-4 mb-2 flex items-center gap-2" {...props}>
                {icon && <span className="text-primary/70 shrink-0">{icon}</span>}
                {text}
              </h3>
            )
          },
          h4: ({ children, ...props }) => (
            <h4 className="text-sm font-semibold text-foreground mt-3 mb-1" {...props}>
              {children}
            </h4>
          ),
          p: ({ children, ...props }) => (
            <p className="text-sm leading-relaxed text-muted-foreground mb-3" {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul className="text-sm text-muted-foreground space-y-1 mb-3 list-disc pl-5" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="text-sm text-muted-foreground space-y-1 mb-3 list-decimal pl-5" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-sm leading-relaxed" {...props}>
              {children}
            </li>
          ),
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-foreground" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-muted-foreground/80" {...props}>
              {children}
            </em>
          ),
          hr: () => <hr className="my-6 border-border" />,
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-3 text-sm italic text-muted-foreground/80" {...props}>
              {children}
            </blockquote>
          ),
          code: ({ children, ...props }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground" {...props}>
              {children}
            </code>
          ),
          pre: ({ children, ...props }) => (
            <pre className="bg-muted/80 rounded-xl p-4 overflow-x-auto text-sm mb-3" {...props}>
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (Array.isArray(children)) {
    return children.map(extractText).join("")
  }
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as any).props.children)
  }
  return ""
}
