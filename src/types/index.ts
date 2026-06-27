export type UserRole = "admin" | "teacher" | "parent" | "student"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string
  phone?: string
}

export interface School {
  id: string
  name: string
  shortName: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  address?: string
  phone?: string
  email?: string
}

export interface ChildSummary {
  id: string
  name: string
  class: string
  grade: string
  attendance: number
  performance: number
  image?: string
}

export interface StatCard {
  label: string
  value: string | number
  change?: number
  icon: string
  trend?: "up" | "down" | "neutral"
}

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}

// CBT Engine Types
export type QuestionType = "mcq" | "true_false" | "theory" | "coding"

export interface Question {
  id: string
  type: QuestionType
  text: string
  options?: string[]
  correctAnswer?: string
  points: number
  subjectId: string
  classId: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Exam {
  id: string
  title: string
  description?: string
  duration: number
  shuffleQuestions: boolean
  showResults: boolean
  subjectId: string
  classId: string
  createdBy: string
  questions: { questionId: string; points: number }[]
  status: "draft" | "published" | "archived"
  createdAt: string
  updatedAt: string
}

export interface ExamSession {
  id: string
  examId: string
  studentName: string
  studentId?: string
  startTime: string
  endTime?: string
  status: "pending" | "active" | "completed" | "cancelled"
  answers: { questionId: string; answer: string; score?: number }[]
  totalScore?: number
  maxScore: number
  tabSwitches: number
  flagged: boolean
  createdAt: string
}

export interface Submission {
  id: string
  sessionId: string
  gradedBy?: string
  totalScore: number
  maxScore: number
  feedback?: string
  gradedAt?: string
  status: "pending" | "graded"
}

// Parent-Student Relationship
export interface ParentStudentLink {
  id: string
  parentId: string
  studentId: string
  relationship: string
}

// Extended Exam types
export type ExamCategory = "school_test" | "entrance" | "term_exam" | "quiz"

// Attendance QR
export interface AttendanceQR {
  id: string
  type: "student_id" | "school_entry"
  code: string
  schoolId: string
  createdAt: string
  expiresAt?: string
}

// Attendance Record extended
export interface AttendanceRecord {
  id: string
  userId: string
  userType: "student" | "staff"
  date: string
  time: string
  status: "present" | "absent" | "late"
  method: "qr" | "face" | "manual"
  timestamp: string
}

// Report Card
export interface ReportCardData {
  studentId: string
  studentName: string
  className: string
  term: string
  session: string
  subjects: {
    name: string
    score: number
    total: number
    grade: string
    remark: string
  }[]
  totalScore: number
  totalMax: number
  average: number
  position: string
  attendance: { present: number; absent: number; late: number }
  teacherComment: string
  principalComment: string
  nextTerm: string
  domains: { name: string; score: number; max: number }[]
}

// Certificate Types
export type RecipientType = "student" | "teacher" | "staff"

export interface CertificateConfig {
  templateId: string
  recipientName: string
  recipientType: RecipientType
  awardName: string
  classOrDepartment: string
  date: string
  reason: string
  schoolName: string
  schoolLogo: string
  schoolMotto: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
  signatureName: string
  signatureImage: string
  issuerName: string
  issuerTitle: string
  certificateId: string
  showBadge: boolean
  showWatermark: boolean
  theme: "light" | "dark" | "custom"
}

export interface CertificateTemplate {
  id: string
  name: string
  description: string
  preview: string
  tags: string[]
}

export const DEFAULT_CERTIFICATE_CONFIG: CertificateConfig = {
  templateId: "classic-gold",
  recipientName: "",
  recipientType: "student",
  awardName: "Certificate of Achievement",
  classOrDepartment: "",
  date: new Date().toISOString().split("T")[0],
  reason: "For outstanding academic performance",
  schoolName: "",
  schoolLogo: "",
  schoolMotto: "",
  primaryColor: "#b8860b",
  secondaryColor: "#f5e6c8",
  accentColor: "#8b0000",
  backgroundColor: "#fffef5",
  textColor: "#1a1a2e",
  borderColor: "#b8860b",
  signatureName: "",
  signatureImage: "",
  issuerName: "",
  issuerTitle: "Principal",
  certificateId: `CERT-${Date.now().toString(36).toUpperCase()}`,
  showBadge: true,
  showWatermark: true,
  theme: "light",
}

// Behaviour Chart Types
export interface StudentBehaviourEntry {
  id: string
  name: string
  scores: Record<string, number>
  notes?: string
}

export interface BehaviourCategory {
  id: string
  label: string
  emoji: string
  maxScore: number
}

export interface BehaviourReward {
  threshold: number
  label: string
}

export interface BehaviourConfig {
  templateId: string
  chartTitle: string
  schoolName: string
  schoolLogo: string
  students: StudentBehaviourEntry[]
  categories: BehaviourCategory[]
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderColor: string
  starColor: string
  starSize: "sm" | "md" | "lg"
  theme: "light" | "dark" | "custom"
  showNames: boolean
  showTotals: boolean
  showRewardTrack: boolean
  showEmojis: boolean
  periodType: "daily" | "weekly" | "monthly"
  periodLabel: string
  date: string
  rewards: BehaviourReward[]
}

export interface BehaviourTemplate {
  id: string
  name: string
  description: string
  preview: string
  tags: string[]
}

export const DEFAULT_BEHAVIOUR_CONFIG: BehaviourConfig = {
  templateId: "daily-star",
  chartTitle: "Star Achievement Chart",
  schoolName: "",
  schoolLogo: "",
  students: [],
  categories: [
    { id: "participation", label: "Participation", emoji: "🙋", maxScore: 3 },
    { id: "homework", label: "Homework", emoji: "📚", maxScore: 3 },
    { id: "behaviour", label: "Behaviour", emoji: "😊", maxScore: 3 },
    { id: "cleanliness", label: "Cleanliness", emoji: "🧹", maxScore: 3 },
    { id: "punctuality", label: "Punctuality", emoji: "⏰", maxScore: 3 },
  ],
  primaryColor: "#f59e0b",
  secondaryColor: "#10b981",
  accentColor: "#ef4444",
  backgroundColor: "#fffbeb",
  textColor: "#1a1a2e",
  borderColor: "#f59e0b",
  starColor: "#f59e0b",
  starSize: "md",
  theme: "light",
  showNames: true,
  showTotals: true,
  showRewardTrack: false,
  showEmojis: true,
  periodType: "weekly",
  periodLabel: "Week 1",
  date: new Date().toISOString().split("T")[0],
  rewards: [
    { threshold: 10, label: "Star Badge" },
    { threshold: 25, label: "Class Monitor" },
    { threshold: 50, label: "Prize from School" },
  ],
}

export const CATEGORY_PRESETS: Record<string, BehaviourCategory[]> = {
  default: [
    { id: "participation", label: "Participation", emoji: "🙋", maxScore: 3 },
    { id: "homework", label: "Homework", emoji: "📚", maxScore: 3 },
    { id: "behaviour", label: "Behaviour", emoji: "😊", maxScore: 3 },
    { id: "cleanliness", label: "Cleanliness", emoji: "🧹", maxScore: 3 },
    { id: "punctuality", label: "Punctuality", emoji: "⏰", maxScore: 3 },
  ],
  academic: [
    { id: "reading", label: "Reading", emoji: "📖", maxScore: 3 },
    { id: "writing", label: "Writing", emoji: "✏️", maxScore: 3 },
    { id: "math", label: "Math", emoji: "🔢", maxScore: 3 },
    { id: "science", label: "Science", emoji: "🔬", maxScore: 3 },
    { id: "art", label: "Art & Creative", emoji: "🎨", maxScore: 3 },
  ],
  conduct: [
    { id: "respect", label: "Respect", emoji: "🙏", maxScore: 3 },
    { id: "honesty", label: "Honesty", emoji: "🤝", maxScore: 3 },
    { id: "kindness", label: "Kindness", emoji: "💛", maxScore: 3 },
    { id: "responsibility", label: "Responsibility", emoji: "✅", maxScore: 3 },
    { id: "teamwork", label: "Teamwork", emoji: "👥", maxScore: 3 },
  ],
  nursery: [
    { id: "sharing", label: "Sharing", emoji: "🧸", maxScore: 3 },
    { id: "listening", label: "Listening", emoji: "👂", maxScore: 3 },
    { id: "following", label: "Following Rules", emoji: "📏", maxScore: 3 },
    { id: "tidy", label: "Tidying Up", emoji: "🧹", maxScore: 3 },
    { id: "manners", label: "Good Manners", emoji: "🌷", maxScore: 3 },
  ],
}
