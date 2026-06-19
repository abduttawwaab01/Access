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
