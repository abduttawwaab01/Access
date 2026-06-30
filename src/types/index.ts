export type UserRole = "admin" | "teacher" | "parent" | "student" | "superadmin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string
  phone?: string
}

export interface Parent {
  id: string
  name: string
  email: string
  phone?: string
  image?: string
  linkedStudents?: ChildSummary[]
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
  className?: string
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
  schoolId: string
  relationship?: string
  createdAt?: string
}

// Extended Exam types
export type ExamCategory = "school_test" | "entrance" | "term_exam" | "quiz"

// Attendance types (maps to Prisma schema exactly)
export interface AttendanceRecord {
  id: string
  studentId: string
  date: string
  status: "present" | "absent" | "late"
  schoolId: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceLog {
  id: string
  userId: string
  userType?: string
  date: string
  time?: string
  status?: "present" | "late"
  method?: "qr" | "manual"
  timestamp: string
  schoolId: string
  createdAt: string
}

export interface AttendanceQRCode {
  id: string
  type: string
  data: string
  schoolId: string
  createdAt: string
}

// Weekly Report types
export interface WeeklyReport {
  id: string
  studentId: string
  classId: string
  week: number
  term?: string
  session?: string
  content?: Record<string, unknown>
  status: "draft" | "published"
  createdBy?: string
  publishedAt?: string
  schoolId: string
  createdAt: string
  updatedAt: string
}

// Timetable types
export interface TimetableSet {
  id: string
  name: string
  type?: string
  classId?: string
  schoolId: string
  createdAt: string
  updatedAt: string
  entries?: TimetableEntry[]
}

export interface TimetableEntry {
  id: string
  setId?: string
  day: string
  period?: string
  startTime?: string
  endTime?: string
  subjectId?: string
  subjectName?: string
  classId: string
  teacherId?: string
  teacherName?: string
  room?: string
  isBreak: boolean
  date?: string
  schoolId: string
  createdAt: string
  updatedAt: string
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

// Handwriting Sheet Types
export type HandwritingLineStyle = "solid" | "dashed" | "dotted"
export type HandwritingSheetSize = "a4" | "letter"
export type HandwritingOrientation = "portrait" | "landscape"
export type HandwritingLineSpacing = "narrow" | "medium" | "wide"
export type HandwritingContentType = "blank" | "tracing-text" | "tracing-letters" | "custom-text"

export interface HandwritingConfig {
  templateId: string
  sheetTitle: string
  studentName: string
  date: string
  lineStyle: HandwritingLineStyle
  lineSpacing: HandwritingLineSpacing
  lineColor: string
  orientation: HandwritingOrientation
  paperSize: HandwritingSheetSize
  margins: number
  primaryColor: string
  backgroundColor: string
  textColor: string
  contentType: HandwritingContentType
  tracingText: string
  fontSize: number
  showNameField: boolean
  showDateField: boolean
  showTitleField: boolean
  lineCount: number
  showMarginLine: boolean
  marginLineColor: string
  pictureBox: boolean
  pictureBoxHeight: number
  theme: "light" | "dark" | "custom"
}

export interface HandwritingTemplate {
  id: string
  name: string
  description: string
  preview: string
  tags: string[]
}

// Financial types
export interface FeeStructure {
  id: string
  classId: string
  type: string
  amount: number
  dueDate?: string
  description?: string
  term?: string
  session?: string
  schoolId: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  studentId: string
  feeStructureId?: string
  amount: number
  reference?: string
  method?: string
  paidAt?: string
  term?: string
  session?: string
  status: "pending" | "confirmed" | "rejected"
  confirmedAt?: string
  confirmedBy?: string
  schoolId: string
  createdAt: string
  updatedAt: string
}

export interface BankDetails {
  id: string
  schoolId: string
  bankName?: string
  accountName?: string
  accountNumber?: string
  swiftCode?: string
  branch?: string
}

export interface SalaryStructure {
  id: string
  staffId: string
  amount: number
  schoolId: string
  updatedAt: string
}

export interface SalaryRecord {
  id: string
  staffId: string
  month: string
  year: string
  amount: number
  status: "pending" | "paid"
  paidAt?: string
  confirmedAt?: string
  confirmedBy?: string
  schoolId: string
  createdAt: string
  updatedAt: string
}

export interface ReceiptData {
  studentName: string
  studentId: string
  studentClass: string
  amount: number
  paid: number
  balance: number
  term: string
  session: string
  method: string
  createdAt: string
  reference: string
  schoolName: string
  schoolAddress?: string
  schoolLogo?: string
  bankName?: string
  accountName?: string
  accountNumber?: string
}

export interface PayslipData {
  staffName: string
  staffId: string
  staffRole: string
  month: string
  year: string
  amount: number
  paidAt?: string
  schoolName: string
  schoolAddress?: string
  schoolLogo?: string
}

export const DEFAULT_HANDWRITING_CONFIG: HandwritingConfig = {
  templateId: "classic-ruled",
  sheetTitle: "Handwriting Practice",
  studentName: "",
  date: new Date().toISOString().split("T")[0],
  lineStyle: "solid",
  lineSpacing: "medium",
  lineColor: "#d1d5db",
  orientation: "portrait",
  paperSize: "a4",
  margins: 20,
  primaryColor: "#6366f1",
  backgroundColor: "#ffffff",
  textColor: "#1a1a2e",
  contentType: "blank",
  tracingText: "The quick brown fox jumps over the lazy dog.",
  fontSize: 18,
  showNameField: true,
  showDateField: true,
  showTitleField: true,
  lineCount: 14,
  showMarginLine: true,
  marginLineColor: "#ef4444",
  pictureBox: false,
  pictureBoxHeight: 120,
  theme: "light",
}

export const LINE_SPACING_MAP: Record<HandwritingLineSpacing, number> = {
  narrow: 24,
  medium: 36,
  wide: 48,
}

export interface Subject {
  id: string
  name: string
  code?: string | null
  classId: string
  schoolId: string
  createdAt: string
  updatedAt: string
}

export interface AcademicSession {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  schoolId: string
  termCount?: number
}

export interface Term {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  sessionId: string
}

export interface SoWWeekEntry {
  weekNumber?: number
  week?: number
  topic: string
  objectives?: string
  content?: string
  resources?: string
}

export interface SchemeOfWork {
  id: string
  classId: string
  subjectId: string
  title: string
  content?: { weeks?: SoWWeekEntry[]; term?: string; session?: string } | null
  status: "draft" | "pending" | "published"
  createdBy?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  schoolId: string
  createdAt: string
  updatedAt: string
  weeks?: SoWWeekEntry[]
  term?: string
  session?: string
  subjectName?: string
  className?: string
  creatorName?: string
  approverName?: string | null
}

export interface Class {
  id: string
  name: string
  arm?: string | null
  section?: string | null
  isActive: boolean
  schoolId: string
  levelId?: string | null
  createdAt: string
  updatedAt: string
  studentCount?: number
  level?: { id: string; name: string } | null
}

export interface Level {
  id: string
  name: string
  slug: string
  sortOrder: number
}

export const HANDWRITING_LETTERS = [
  "Aa", "Bb", "Cc", "Dd", "Ee", "Ff", "Gg", "Hh", "Ii",
  "Jj", "Kk", "Ll", "Mm", "Nn", "Oo", "Pp", "Qq", "Rr",
  "Ss", "Tt", "Uu", "Vv", "Ww", "Xx", "Yy", "Zz",
]
