"use client"

import type { BehaviourTemplate } from "@/types"
import { DailyStarChart } from "./DailyStarChart"
import { WeeklyClassChart } from "./WeeklyClassChart"
import { MonthlyGoalTracker } from "./MonthlyGoalTracker"
import { ColourBehaviourChart } from "./ColourBehaviourChart"
import { RewardLadder } from "./RewardLadder"
import { StickerCollection } from "./StickerCollection"

export const behaviourTemplates: BehaviourTemplate[] = [
  {
    id: "daily-star",
    name: "Daily Star Chart",
    description: "Multi-category grid with star buttons per student per category",
    preview: "Daily Star Chart",
    tags: ["stars", "daily", "categories", "grid"],
  },
  {
    id: "weekly-class",
    name: "Weekly Class Chart",
    description: "Simple one-row-per-student, one-star-per-day layout",
    preview: "Weekly Class Chart",
    tags: ["weekly", "simple", "whole class"],
  },
  {
    id: "monthly-goal",
    name: "Monthly Goal Tracker",
    description: "Individual student goals with milestone stars and progress",
    preview: "Monthly Goal Tracker",
    tags: ["goals", "monthly", "milestones"],
  },
  {
    id: "colour-behaviour",
    name: "Colour Behaviour Chart",
    description: "Classic traffic light system — green/yellow/red per student",
    preview: "Colour Behaviour Chart",
    tags: ["traffic light", "colours", "conduct"],
  },
  {
    id: "reward-ladder",
    name: "Reward Ladder",
    description: "Ascending ladder visual with reward milestones",
    preview: "Reward Ladder",
    tags: ["ladder", "rewards", "gamification"],
  },
  {
    id: "sticker-collection",
    name: "Sticker Collection",
    description: "Themed page with circles for physical sticker placement",
    preview: "Sticker Collection",
    tags: ["stickers", "printable", "fun", "nursery"],
  },
]

export const behaviourTemplateComponents: Record<string, React.FC<{
  config: any
  onToggle?: (studentId: string, categoryId: string) => void
  onCycleColour?: (studentId: string) => void
}>> = {
  "daily-star": DailyStarChart,
  "weekly-class": WeeklyClassChart,
  "monthly-goal": MonthlyGoalTracker,
  "colour-behaviour": ColourBehaviourChart,
  "reward-ladder": RewardLadder,
  "sticker-collection": StickerCollection,
}
