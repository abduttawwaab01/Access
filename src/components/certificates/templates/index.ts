"use client"

import type { CertificateTemplate } from "@/types"
import { ClassicGold } from "./ClassicGold"
import { ModernElegance } from "./ModernElegance"
import { AcademicScroll } from "./AcademicScroll"
import { PremiumDark } from "./PremiumDark"
import { AwardWinner } from "./AwardWinner"
import { ProfessionalBlue } from "./ProfessionalBlue"
import { GreenAchievement } from "./GreenAchievement"
import { RoyalPurple } from "./RoyalPurple"
import { Aurora } from "./Aurora"
import { Minimalist } from "./Minimalist"

export const certificateTemplates: CertificateTemplate[] = [
  {
    id: "classic-gold",
    name: "Classic Gold",
    description: "Traditional certificate with gold accents and serif typography",
    preview: "Classic Gold",
    tags: ["traditional", "formal", "gold"],
  },
  {
    id: "modern-elegance",
    name: "Modern Elegance",
    description: "Clean, minimal design with bold color accents",
    preview: "Modern Elegance",
    tags: ["modern", "clean", "bold"],
  },
  {
    id: "academic-scroll",
    name: "Academic Scroll",
    description: "Antique parchment-inspired design with scroll motifs",
    preview: "Academic Scroll",
    tags: ["vintage", "parchment", "academic"],
  },
  {
    id: "premium-dark",
    name: "Premium Dark",
    description: "Luxurious dark background with metallic accents",
    preview: "Premium Dark",
    tags: ["luxury", "dark", "metallic"],
  },
  {
    id: "award-winner",
    name: "Award Winner",
    description: "Celebratory design with star motifs and ribbons",
    preview: "Award Winner",
    tags: ["celebratory", "stars", "colorful"],
  },
  {
    id: "professional-blue",
    name: "Professional Blue",
    description: "Corporate blue theme with clean lines",
    preview: "Professional Blue",
    tags: ["corporate", "blue", "professional"],
  },
  {
    id: "green-achievement",
    name: "Green Achievement",
    description: "Nature-inspired tones with elegant leaf motifs",
    preview: "Green Achievement",
    tags: ["nature", "green", "earthy"],
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    description: "Regal purple with gold accents and crest elements",
    preview: "Royal Purple",
    tags: ["royal", "purple", "gold", "crest"],
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Modern gradient design with glassmorphism effects",
    preview: "Aurora",
    tags: ["gradient", "modern", "glassmorphism"],
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Ultra-clean design with thin borders and whitespace",
    preview: "Minimalist",
    tags: ["minimal", "clean", "thin"],
  },
]

export const templateComponents: Record<string, React.FC<{ config: any }>> = {
  "classic-gold": ClassicGold,
  "modern-elegance": ModernElegance,
  "academic-scroll": AcademicScroll,
  "premium-dark": PremiumDark,
  "award-winner": AwardWinner,
  "professional-blue": ProfessionalBlue,
  "green-achievement": GreenAchievement,
  "royal-purple": RoyalPurple,
  "aurora": Aurora,
  "minimalist": Minimalist,
}
