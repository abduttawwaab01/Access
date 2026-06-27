"use client"

import type { HandwritingTemplate } from "@/types"
import { ClassicRuled } from "./ClassicRuled"
import { DottedThirds } from "./DottedThirds"
import { PrimaryLines } from "./PrimaryLines"
import { HandwritingGrid } from "./HandwritingGrid"
import { TraceWrite } from "./TraceWrite"
import { StorySheet } from "./StorySheet"

export const handwritingTemplates: HandwritingTemplate[] = [
  {
    id: "classic-ruled",
    name: "Classic Ruled",
    description: "Standard wide-ruled paper with red margin line — traditional practice sheet",
    preview: "Classic Ruled",
    tags: ["ruled", "traditional", "margin"],
  },
  {
    id: "dotted-thirds",
    name: "Dotted Thirds",
    description: "Three-line system — solid bottom, dotted middle, solid top for letter height guides",
    preview: "Dotted Thirds",
    tags: ["thirds", "letter-height", "australian"],
  },
  {
    id: "primary-lines",
    name: "Primary Lines",
    description: "Double lines with dashed middle — perfect for early years letter formation",
    preview: "Primary Lines",
    tags: ["primary", "kindergarten", "dashed-middle"],
  },
  {
    id: "handwriting-grid",
    name: "Handwriting Grid",
    description: "Grid paper with cells for consistent letter-by-letter sizing and spacing",
    preview: "Grid",
    tags: ["grid", "cells", "spacing"],
  },
  {
    id: "trace-write",
    name: "Trace & Write",
    description: "Pre-printed words in light italic to trace, then write independently on following lines",
    preview: "Trace & Write",
    tags: ["tracing", "copywork", "practice"],
  },
  {
    id: "story-sheet",
    name: "Story Sheet",
    description: "Picture box at top with lined writing area below — draw then write your story",
    preview: "Story Sheet",
    tags: ["picture-box", "story", "creative-writing"],
  },
]

export const handwritingTemplateComponents: Record<string, React.FC<{ config: any }>> = {
  "classic-ruled": ClassicRuled,
  "dotted-thirds": DottedThirds,
  "primary-lines": PrimaryLines,
  "handwriting-grid": HandwritingGrid,
  "trace-write": TraceWrite,
  "story-sheet": StorySheet,
}
