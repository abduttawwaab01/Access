// In-memory data store for development
// Swap with Prisma queries when database is connected

let sessions: any[] = [
  { id: "1", name: "2024/2025 Academic Session", startDate: "2024-09-01", endDate: "2025-08-31", isCurrent: true, termCount: 3 },
  { id: "2", name: "2025/2026 Academic Session", startDate: "2025-09-01", endDate: "2026-08-31", isCurrent: false, termCount: 3 },
]

let terms: any[] = [
  { id: "1", name: "First Term", startDate: "2024-09-01", endDate: "2024-12-20", isCurrent: true, sessionId: "1" },
  { id: "2", name: "Second Term", startDate: "2025-01-06", endDate: "2025-04-11", isCurrent: false, sessionId: "1" },
  { id: "3", name: "Third Term", startDate: "2025-04-28", endDate: "2025-08-31", isCurrent: false, sessionId: "1" },
]

let classes: any[] = [
  { id: "1", name: "Grade 10", arm: "A", section: "Science", studentCount: 42 },
  { id: "2", name: "Grade 10", arm: "B", section: "Arts", studentCount: 38 },
  { id: "3", name: "Grade 11", arm: "A", section: "Science", studentCount: 45 },
  { id: "4", name: "Grade 11", arm: "B", section: "Arts", studentCount: 36 },
  { id: "5", name: "Grade 12", arm: "A", section: "Science", studentCount: 40 },
  { id: "6", name: "Grade 12", arm: "B", section: "Arts", studentCount: 34 },
]

let subjects: any[] = [
  { id: "1", name: "Mathematics", code: "MTH101", classId: "1", teacherCount: 3 },
  { id: "2", name: "English Language", code: "ENG101", classId: "1", teacherCount: 2 },
  { id: "3", name: "Physics", code: "PHY101", classId: "1", teacherCount: 2 },
  { id: "4", name: "Chemistry", code: "CHM101", classId: "1", teacherCount: 2 },
  { id: "5", name: "Biology", code: "BIO101", classId: "1", teacherCount: 2 },
  { id: "6", name: "History", code: "HIS101", classId: "2", teacherCount: 1 },
]

let students: any[] = [
  { id: "1", firstName: "Alice", lastName: "Johnson", studentId: "STU2024001", email: "alice@school.com", gender: "Female", classId: "1", status: "active" },
  { id: "2", firstName: "Bob", lastName: "Smith", studentId: "STU2024002", email: "bob@school.com", gender: "Male", classId: "1", status: "active" },
  { id: "3", firstName: "Charlie", lastName: "Brown", studentId: "STU2024003", email: "charlie@school.com", gender: "Male", classId: "2", status: "active" },
  { id: "4", firstName: "Diana", lastName: "Prince", studentId: "STU2024004", email: "diana@school.com", gender: "Female", classId: "3", status: "active" },
  { id: "5", firstName: "Eve", lastName: "Davis", studentId: "STU2024005", email: "eve@school.com", gender: "Female", classId: "3", status: "inactive" },
]

let staff: any[] = [
  { id: "1", firstName: "Grace", lastName: "Hopper", staffId: "STF2023001", email: "grace@school.com", role: "teacher", department: "Science", status: "active" },
  { id: "2", firstName: "Alan", lastName: "Turing", staffId: "STF2023002", email: "alan@school.com", role: "teacher", department: "Mathematics", status: "active" },
  { id: "3", firstName: "Marie", lastName: "Curie", staffId: "STF2023003", email: "marie@school.com", role: "teacher", department: "Science", status: "active" },
  { id: "4", firstName: "Admin", lastName: "User", staffId: "STF2022001", email: "admin@school.com", role: "admin", department: "Administration", status: "active" },
]

let lessonNotes: any[] = [
  { id: "1", title: "Introduction to Algebra", subject: "Mathematics", classId: "1", week: 1, term: "First Term", content: "Algebra is a branch of mathematics that uses symbols to represent numbers...", status: "published", createdAt: "2024-09-05" },
  { id: "2", title: "Quadratic Equations", subject: "Mathematics", classId: "1", week: 3, term: "First Term", content: "A quadratic equation is an equation of the second degree...", status: "published", createdAt: "2024-09-19" },
  { id: "3", title: "Newton's Laws of Motion", subject: "Physics", classId: "3", week: 2, term: "First Term", content: "Newton's laws of motion are three physical laws...", status: "draft", createdAt: "2024-09-12" },
]

let assignments: any[] = [
  { id: "1", title: "Algebra Homework Set 1", subject: "Mathematics", classId: "1", dueDate: "2024-09-20", type: "homework", submissions: 38, total: 42, status: "active" },
  { id: "2", title: "Physics Lab Report", subject: "Physics", classId: "3", dueDate: "2024-09-25", type: "project", submissions: 0, total: 45, status: "active" },
  { id: "3", title: "English Essay: Shakespeare", subject: "English Language", classId: "1", dueDate: "2024-09-15", type: "homework", submissions: 40, total: 42, status: "closed" },
]

let timetable: any[] = [
  { id: "1", day: "Monday", time: "08:00", subject: "Mathematics", classId: "1", room: "201" },
  { id: "2", day: "Monday", time: "09:00", subject: "Physics", classId: "3", room: "Lab 3" },
  { id: "3", day: "Monday", time: "10:00", subject: "Mathematics", classId: "2", room: "205" },
  { id: "4", day: "Tuesday", time: "08:00", subject: "Mathematics", classId: "1", room: "201" },
  { id: "5", day: "Tuesday", time: "09:00", subject: "Chemistry", classId: "3", room: "Lab 1" },
  { id: "6", day: "Wednesday", time: "08:00", subject: "Physics", classId: "3", room: "Lab 3" },
  { id: "7", day: "Wednesday", time: "10:00", subject: "Mathematics", classId: "2", room: "205" },
  { id: "8", day: "Thursday", time: "09:00", subject: "Mathematics", classId: "1", room: "201" },
  { id: "9", day: "Friday", time: "08:00", subject: "Chemistry", classId: "3", room: "Lab 1" },
  { id: "10", day: "Friday", time: "10:00", subject: "Mathematics", classId: "2", room: "205" },
]

let announcements: any[] = [
  { id: "1", title: "Staff Meeting Friday", content: "There will be a staff meeting this Friday at 3pm in the staff room.", audience: "teachers", author: "Principal", createdAt: "2024-09-10T10:00:00", priority: "normal" },
  { id: "2", title: "PTA Meeting", content: "Parent-Teacher Association meeting scheduled for next Tuesday.", audience: "parents", author: "Admin", createdAt: "2024-09-11T14:30:00", priority: "high" },
  { id: "3", title: "Holiday Announcement", content: "School will be closed on October 1st for National Day.", audience: "all", author: "Principal", createdAt: "2024-09-12T08:00:00", priority: "normal" },
]

let results: any[] = [
  { id: "1", studentId: "1", subject: "Mathematics", score: 92, total: 100, grade: "A", term: "First Term", session: "2024/2025" },
  { id: "2", studentId: "1", subject: "English Language", score: 85, total: 100, grade: "A", term: "First Term", session: "2024/2025" },
  { id: "3", studentId: "1", subject: "Physics", score: 78, total: 100, grade: "B", term: "First Term", session: "2024/2025" },
  { id: "4", studentId: "1", subject: "Chemistry", score: 88, total: 100, grade: "A", term: "First Term", session: "2024/2025" },
  { id: "5", studentId: "1", subject: "Biology", score: 72, total: 100, grade: "B", term: "First Term", session: "2024/2025" },
  { id: "6", studentId: "1", subject: "Mathematics", score: 88, total: 100, grade: "A", term: "Second Term", session: "2024/2025" },
  { id: "7", studentId: "1", subject: "English Language", score: 90, total: 100, grade: "A", term: "Second Term", session: "2024/2025" },
  { id: "8", studentId: "1", subject: "Physics", score: 82, total: 100, grade: "A", term: "Second Term", session: "2024/2025" },
  { id: "9", studentId: "2", subject: "Mathematics", score: 65, total: 100, grade: "C", term: "First Term", session: "2024/2025" },
  { id: "10", studentId: "2", subject: "English Language", score: 70, total: 100, grade: "B", term: "First Term", session: "2024/2025" },
  { id: "11", studentId: "2", subject: "Physics", score: 55, total: 100, grade: "D", term: "First Term", session: "2024/2025" },
  { id: "12", studentId: "2", subject: "Chemistry", score: 60, total: 100, grade: "C", term: "First Term", session: "2024/2025" },
  { id: "13", studentId: "2", subject: "Biology", score: 75, total: 100, grade: "B", term: "First Term", session: "2024/2025" },
  { id: "14", studentId: "2", subject: "Mathematics", score: 72, total: 100, grade: "B", term: "Second Term", session: "2024/2025" },
]

let attendanceRecords: any[] = [
  { id: "1", studentId: "1", date: "2024-09-01", status: "present" },
  { id: "2", studentId: "1", date: "2024-09-02", status: "present" },
  { id: "3", studentId: "1", date: "2024-09-03", status: "present" },
  { id: "4", studentId: "1", date: "2024-09-04", status: "late" },
  { id: "5", studentId: "1", date: "2024-09-05", status: "present" },
  { id: "6", studentId: "1", date: "2024-09-06", status: "absent" },
  { id: "7", studentId: "1", date: "2024-09-07", status: "present" },
  { id: "8", studentId: "1", date: "2024-09-08", status: "present" },
  { id: "9", studentId: "1", date: "2024-09-09", status: "present" },
  { id: "10", studentId: "1", date: "2024-09-10", status: "late" },
  { id: "11", studentId: "2", date: "2024-09-01", status: "present" },
  { id: "12", studentId: "2", date: "2024-09-02", status: "absent" },
  { id: "13", studentId: "2", date: "2024-09-03", status: "present" },
  { id: "14", studentId: "2", date: "2024-09-04", status: "present" },
  { id: "15", studentId: "2", date: "2024-09-05", status: "late" },
]

let fees: any[] = [
  { id: "1", studentId: "1", type: "Tuition", amount: 2500, paid: 2500, status: "paid", dueDate: "2024-09-15", term: "First Term" },
  { id: "2", studentId: "1", type: "Transport", amount: 500, paid: 500, status: "paid", dueDate: "2024-09-15", term: "First Term" },
  { id: "3", studentId: "1", type: "Tuition", amount: 2500, paid: 1500, status: "partial", dueDate: "2025-01-15", term: "Second Term" },
  { id: "4", studentId: "2", type: "Tuition", amount: 2500, paid: 2500, status: "paid", dueDate: "2024-09-15", term: "First Term" },
  { id: "5", studentId: "2", type: "Hostel", amount: 1000, paid: 0, status: "unpaid", dueDate: "2024-09-15", term: "First Term" },
]

// Parent-Student links
let parentLinks: any[] = [
  { id: "pl1", parentId: "p1", studentId: "1", relationship: "Mother" },
  { id: "pl2", parentId: "p1", studentId: "2", relationship: "Mother" },
]

// Extended attendance records with method tracking
let attendanceLogs: any[] = [
  { id: "al1", userId: "1", userType: "student", date: "2024-09-01", time: "07:55", status: "present", method: "qr", timestamp: "2024-09-01T07:55:00" },
  { id: "al2", userId: "1", userType: "student", date: "2024-09-02", time: "08:05", status: "late", method: "qr", timestamp: "2024-09-02T08:05:00" },
  { id: "al3", userId: "1", userType: "student", date: "2024-09-03", time: "07:50", status: "present", method: "face", timestamp: "2024-09-03T07:50:00" },
  { id: "al4", userId: "2", userType: "student", date: "2024-09-01", time: "07:45", status: "present", method: "qr", timestamp: "2024-09-01T07:45:00" },
  { id: "al5", userId: "2", userType: "student", date: "2024-09-02", time: "08:30", status: "late", method: "manual", timestamp: "2024-09-02T08:30:00" },
  { id: "al6", userId: "stf1", userType: "staff", date: "2024-09-01", time: "07:30", status: "present", method: "qr", timestamp: "2024-09-01T07:30:00" },
  { id: "al7", userId: "stf2", userType: "staff", date: "2024-09-01", time: "08:15", status: "late", method: "face", timestamp: "2024-09-01T08:15:00" },
]

// Attendance QR codes
let attendanceQRCodes: any[] = [
  { id: "qr1", type: "school_entry", code: "SCH-ACCESS-2024-MAIN", schoolId: "1", createdAt: "2024-09-01T00:00:00" },
  { id: "qr2", type: "student_id", code: "STU-ALICE-001", schoolId: "1", createdAt: "2024-09-01T00:00:00" },
]

// Report Cards
let reportCards: any[] = []

// CBT Engine seed data
let questions: any[] = [
  { id: "q1", type: "mcq", text: "What is the value of π (pi) rounded to 2 decimal places?", options: ["3.14", "3.16", "3.12", "3.18"], correctAnswer: "3.14", points: 5, subjectId: "1", classId: "1", createdBy: "2", createdAt: "2024-09-01T00:00:00", updatedAt: "2024-09-01T00:00:00" },
  { id: "q2", type: "mcq", text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: "Mars", points: 5, subjectId: "3", classId: "1", createdBy: "2", createdAt: "2024-09-01T00:00:00", updatedAt: "2024-09-01T00:00:00" },
  { id: "q3", type: "true_false", text: "The chemical symbol for water is H2O.", options: ["True", "False"], correctAnswer: "True", points: 3, subjectId: "4", classId: "1", createdBy: "2", createdAt: "2024-09-01T00:00:00", updatedAt: "2024-09-01T00:00:00" },
  { id: "q4", type: "theory", text: "Explain the process of photosynthesis in plants.", points: 10, subjectId: "5", classId: "1", createdBy: "3", createdAt: "2024-09-01T00:00:00", updatedAt: "2024-09-01T00:00:00" },
  { id: "q5", type: "coding", text: "Write a function that returns the factorial of a number.", points: 15, subjectId: "1", classId: "1", createdBy: "2", createdAt: "2024-09-01T00:00:00", updatedAt: "2024-09-01T00:00:00" },
  { id: "q6", type: "mcq", text: "What is the capital of Nigeria?", options: ["Lagos", "Abuja", "Kano", "Ibadan"], correctAnswer: "Abuja", points: 5, subjectId: "6", classId: "2", createdBy: "2", createdAt: "2024-09-01T00:00:00", updatedAt: "2024-09-01T00:00:00" },
  { id: "q7", type: "mcq", text: "What is 2 + 2?", options: ["3", "4", "5", "6"], correctAnswer: "4", points: 2, subjectId: "1", classId: "1", createdBy: "2", createdAt: "2024-09-01T00:00:00", updatedAt: "2024-09-01T00:00:00" },
]
let exams: any[] = [
  { id: "e1", title: "Mathematics Mid-Term Test", description: "Covers algebra and geometry topics from first term.", duration: 60, shuffleQuestions: true, showResults: true, subjectId: "1", classId: "1", createdBy: "2", questions: [{ questionId: "q1", points: 5 }, { questionId: "q7", points: 2 }, { questionId: "q5", points: 15 }], status: "published", createdAt: "2024-09-15T00:00:00", updatedAt: "2024-09-15T00:00:00" },
  { id: "e2", title: "Science Quiz", description: "Basic science questions.", duration: 30, shuffleQuestions: false, showResults: true, subjectId: "3", classId: "1", createdBy: "2", questions: [{ questionId: "q2", points: 5 }, { questionId: "q3", points: 3 }, { questionId: "q4", points: 10 }], status: "published", createdAt: "2024-09-20T00:00:00", updatedAt: "2024-09-20T00:00:00" },
  { id: "e3", title: "History Pop Quiz", description: "Draft quiz for history class.", duration: 15, shuffleQuestions: false, showResults: false, subjectId: "6", classId: "2", createdBy: "2", questions: [{ questionId: "q6", points: 5 }], status: "draft", createdAt: "2024-09-25T00:00:00", updatedAt: "2024-09-25T00:00:00" },
]
let examSessions: any[] = [
  { id: "s1", examId: "e1", studentName: "Alice Johnson", studentId: "1", startTime: "2024-10-01T09:00:00", endTime: "2024-10-01T09:45:00", status: "completed", answers: [{ questionId: "q1", answer: "3.14", score: 5 }, { questionId: "q7", answer: "4", score: 2 }, { questionId: "q5", answer: "function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }", score: 12 }], totalScore: 19, maxScore: 22, tabSwitches: 1, flagged: false, createdAt: "2024-10-01T08:55:00" },
  { id: "s2", examId: "e1", studentName: "Bob Smith", studentId: "2", startTime: "2024-10-01T09:00:00", endTime: "2024-10-01T09:50:00", status: "completed", answers: [{ questionId: "q1", answer: "3.14", score: 5 }, { questionId: "q7", answer: "4", score: 2 }, { questionId: "q5", answer: null, score: 0 }], totalScore: 7, maxScore: 22, tabSwitches: 3, flagged: true, createdAt: "2024-10-01T08:55:00" },
  { id: "s3", examId: "e2", studentName: "Alice Johnson", studentId: "1", startTime: "2024-10-02T10:00:00", status: "active", answers: [{ questionId: "q2", answer: "Mars", score: 5 }], maxScore: 18, tabSwitches: 0, flagged: false, createdAt: "2024-10-02T09:55:00" },
]
let submissions: any[] = [
  { id: "sub1", sessionId: "s1", gradedBy: "2", totalScore: 19, maxScore: 22, feedback: "Good work! Review recursion for full marks on the coding question.", gradedAt: "2024-10-01T10:00:00", status: "graded" },
  { id: "sub2", sessionId: "s2", gradedBy: "2", totalScore: 7, maxScore: 22, feedback: "Please attempt all questions.", gradedAt: "2024-10-01T10:05:00", status: "graded" },
]

// ===================== Phase 9: Payments & Salary & Documents =====================
let bankDetails: any = { id: "b1", bankName: "First Bank of Nigeria", accountName: "Access School Academy", accountNumber: "2034567890", branch: "Ikeja Main", swiftCode: "FBNINGLA", schoolId: "1", updatedAt: "2024-09-01T00:00:00" }

let feeStructures: any[] = [
  { id: "fs1", classId: "1", type: "Tuition", amount: 2500, term: "First Term", dueDate: "2024-09-15", session: "2024/2025" },
  { id: "fs2", classId: "1", type: "Tuition", amount: 2500, term: "Second Term", dueDate: "2025-01-15", session: "2024/2025" },
  { id: "fs3", classId: "1", type: "Transport", amount: 500, term: "First Term", dueDate: "2024-09-15", session: "2024/2025" },
  { id: "fs4", classId: "1", type: "Hostel", amount: 1000, term: "First Term", dueDate: "2024-09-15", session: "2024/2025" },
  { id: "fs5", classId: "1", type: "Lab Fee", amount: 300, term: "First Term", dueDate: "2024-09-15", session: "2024/2025" },
  { id: "fs6", classId: "2", type: "Tuition", amount: 2000, term: "First Term", dueDate: "2024-09-15", session: "2024/2025" },
  { id: "fs7", classId: "3", type: "Tuition", amount: 3000, term: "First Term", dueDate: "2024-09-15", session: "2024/2025" },
]

let payments: any[] = [
  { id: "p1", studentId: "1", feeStructureId: "fs1", amount: 2500, method: "bank_transfer", reference: "TRF-2024-001", status: "confirmed", paidAt: "2024-09-10T10:30:00", confirmedAt: "2024-09-10T14:00:00", confirmedBy: "4", notes: "Full payment" },
  { id: "p2", studentId: "1", feeStructureId: "fs3", amount: 500, method: "bank_transfer", reference: "TRF-2024-002", status: "confirmed", paidAt: "2024-09-10T10:30:00", confirmedAt: "2024-09-10T14:00:00", confirmedBy: "4" },
  { id: "p3", studentId: "1", feeStructureId: "fs2", amount: 1500, method: "cash", reference: "CASH-2024-003", status: "confirmed", paidAt: "2025-01-05T09:00:00", confirmedAt: "2025-01-05T11:00:00", confirmedBy: "4" },
  { id: "p4", studentId: "2", feeStructureId: "fs1", amount: 2500, method: "bank_transfer", reference: "TRF-2024-004", status: "confirmed", paidAt: "2024-09-12T08:00:00", confirmedAt: "2024-09-12T10:00:00", confirmedBy: "4" },
  { id: "p5", studentId: "2", feeStructureId: "fs4", amount: 1000, method: "bank_transfer", reference: "TRF-2024-005", status: "pending", paidAt: "2024-09-20T15:30:00", confirmedAt: null, confirmedBy: null },
  { id: "p6", studentId: "3", feeStructureId: "fs6", amount: 2000, method: "bank_transfer", reference: "TRF-2024-006", status: "pending", paidAt: "2024-09-18T12:00:00", confirmedAt: null, confirmedBy: null },
]

let salaryRecords: any[] = [
  { id: "sr1", staffId: "1", amount: 1500, month: "September", year: "2024", status: "paid", paidAt: "2024-09-25T10:00:00", confirmedAt: "2024-09-25T16:00:00", confirmedBy: "4", method: "bank_transfer" },
  { id: "sr2", staffId: "2", amount: 1500, month: "September", year: "2024", status: "paid", paidAt: "2024-09-25T10:00:00", confirmedAt: "2024-09-25T16:00:00", confirmedBy: "4", method: "bank_transfer" },
  { id: "sr3", staffId: "3", amount: 1600, month: "September", year: "2024", status: "paid", paidAt: "2024-09-25T10:00:00", confirmedAt: "2024-09-25T16:00:00", confirmedBy: "4", method: "bank_transfer" },
  { id: "sr4", staffId: "4", amount: 2500, month: "September", year: "2024", status: "paid", paidAt: "2024-09-25T10:00:00", confirmedAt: "2024-09-25T16:00:00", confirmedBy: "4", method: "bank_transfer" },
  { id: "sr5", staffId: "1", amount: 1500, month: "October", year: "2024", status: "pending", paidAt: null, confirmedAt: null, confirmedBy: null, method: "bank_transfer" },
  { id: "sr6", staffId: "2", amount: 1500, month: "October", year: "2024", status: "pending", paidAt: null, confirmedAt: null, confirmedBy: null, method: "bank_transfer" },
  { id: "sr7", staffId: "3", amount: 1600, month: "October", year: "2024", status: "pending", paidAt: null, confirmedAt: null, confirmedBy: null, method: "bank_transfer" },
  { id: "sr8", staffId: "4", amount: 2500, month: "October", year: "2024", status: "pending", paidAt: null, confirmedAt: null, confirmedBy: null, method: "bank_transfer" },
]

// Staff salary structure (base pay per staff)
let salaryStructures: any[] = [
  { id: "ss1", staffId: "1", role: "teacher", baseSalary: 1500, department: "Science", bankName: "GTBank", accountNumber: "0123456789", accountName: "Grace Hopper" },
  { id: "ss2", staffId: "2", role: "teacher", baseSalary: 1500, department: "Mathematics", bankName: "Access Bank", accountNumber: "0234567890", accountName: "Alan Turing" },
  { id: "ss3", staffId: "3", role: "teacher", baseSalary: 1600, department: "Science", bankName: "First Bank", accountNumber: "0345678901", accountName: "Marie Curie" },
  { id: "ss4", staffId: "4", role: "admin", baseSalary: 2500, department: "Administration", bankName: "UBA", accountNumber: "0456789012", accountName: "Admin User" },
]

let documents: any[] = [
  { id: "d1", studentId: "1", type: "fee_receipt", title: "Tuition Fee Receipt - First Term", reference: "RCP-2024-001", generatedAt: "2024-09-10T14:30:00", status: "final" },
  { id: "d2", studentId: "2", type: "fee_receipt", title: "Tuition Fee Receipt - First Term", reference: "RCP-2024-002", generatedAt: "2024-09-12T10:30:00", status: "final" },
  { id: "d3", studentId: "1", type: "acceptance_letter", title: "Acceptance Letter - 2024/2025", reference: "ACC-2024-001", generatedAt: "2024-08-15T09:00:00", status: "final" },
]

let schoolSettingsData: any = { loginEnabled: true, expirationDate: null, superAdminPassword: "super@admin123", schoolName: "Access School Academy", schoolMotto: "Excellence in Education", schoolAddress: "123 Education Street, Lagos, Nigeria", schoolPhone: "+234 800 000 0000", schoolEmail: "info@accessschool.edu", aboutText: "Access School Academy is a premier educational institution dedicated to nurturing the next generation of leaders through innovative teaching methods and comprehensive student development programs." }

let admissionApplications: any[] = [
  { id: "aa1", firstName: "James", lastName: "Wilson", email: "james.wilson@email.com", phone: "+234 801 234 5678", dateOfBirth: "2008-05-12", gender: "Male", classApplyingFor: "1", previousSchool: "Greenfield Academy", address: "15 Peace Avenue, Lagos", parentName: "Mr. Wilson", parentPhone: "+234 802 345 6789", status: "pending", entranceExamScore: null, entranceExamPassed: null, appliedAt: "2025-06-01T10:00:00Z" },
  { id: "aa2", firstName: "Olivia", lastName: "Martins", email: "olivia.m@email.com", phone: "+234 803 456 7890", dateOfBirth: "2009-02-28", gender: "Female", classApplyingFor: "2", previousSchool: "Royal Children School", address: "7 Garden Road, Lagos", parentName: "Mrs. Martins", parentPhone: "+234 804 567 8901", status: "pending", entranceExamScore: null, entranceExamPassed: null, appliedAt: "2025-06-05T14:30:00Z" },
  { id: "aa3", firstName: "Ethan", lastName: "Okonkwo", email: "ethan.o@email.com", phone: "+234 805 678 9012", dateOfBirth: "2007-11-03", gender: "Male", classApplyingFor: "3", previousSchool: "Rising Star Academy", address: "22 Peace Avenue, Lagos", parentName: "Chief Okonkwo", parentPhone: "+234 806 789 0123", status: "accepted", entranceExamScore: 85, entranceExamPassed: true, appliedAt: "2025-05-15T09:00:00Z" },
  { id: "aa4", firstName: "Sophia", lastName: "Adeyemi", email: "sophia.a@email.com", phone: "+234 807 890 1234", dateOfBirth: "2008-09-17", gender: "Female", classApplyingFor: "1", previousSchool: "Bright Future School", address: "10 Freedom Road, Lagos", parentName: "Dr. Adeyemi", parentPhone: "+234 808 901 2345", status: "rejected", entranceExamScore: 45, entranceExamPassed: false, appliedAt: "2025-04-20T11:00:00Z" },
]

export const store = {
  sessions: {
    getAll: () => sessions,
    getById: (id: string) => sessions.find((s) => s.id === id),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data }
      sessions.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = sessions.findIndex((s) => s.id === id)
      if (idx === -1) return null
      sessions[idx] = { ...sessions[idx], ...data }
      return sessions[idx]
    },
    delete: (id: string) => {
      const idx = sessions.findIndex((s) => s.id === id)
      if (idx === -1) return false
      sessions.splice(idx, 1)
      return true
    },
  },
  terms: {
    getAll: (sessionId?: string) =>
      sessionId ? terms.filter((t) => t.sessionId === sessionId) : terms,
    getById: (id: string) => terms.find((t) => t.id === id),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data }
      terms.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = terms.findIndex((t) => t.id === id)
      if (idx === -1) return null
      terms[idx] = { ...terms[idx], ...data }
      return terms[idx]
    },
    delete: (id: string) => {
      const idx = terms.findIndex((t) => t.id === id)
      if (idx === -1) return false
      terms.splice(idx, 1)
      return true
    },
  },
  classes: {
    getAll: () => classes,
    getById: (id: string) => classes.find((c) => c.id === id),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data }
      classes.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = classes.findIndex((c) => c.id === id)
      if (idx === -1) return null
      classes[idx] = { ...classes[idx], ...data }
      return classes[idx]
    },
    delete: (id: string) => {
      const idx = classes.findIndex((c) => c.id === id)
      if (idx === -1) return false
      classes.splice(idx, 1)
      return true
    },
  },
  subjects: {
    getAll: (classId?: string) =>
      classId ? subjects.filter((s) => s.classId === classId) : subjects,
    getById: (id: string) => subjects.find((s) => s.id === id),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data }
      subjects.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = subjects.findIndex((s) => s.id === id)
      if (idx === -1) return null
      subjects[idx] = { ...subjects[idx], ...data }
      return subjects[idx]
    },
    delete: (id: string) => {
      const idx = subjects.findIndex((s) => s.id === id)
      if (idx === -1) return false
      subjects.splice(idx, 1)
      return true
    },
  },
  students: {
    getAll: (classId?: string) =>
      classId ? students.filter((s) => s.classId === classId) : students,
    getById: (id: string) => students.find((s) => s.id === id),
    create: (data: any) => {
      const item = { id: String(Date.now()), studentId: `STU${Date.now()}`, ...data, status: "active" }
      students.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = students.findIndex((s) => s.id === id)
      if (idx === -1) return null
      students[idx] = { ...students[idx], ...data }
      return students[idx]
    },
    delete: (id: string) => {
      const idx = students.findIndex((s) => s.id === id)
      if (idx === -1) return false
      students.splice(idx, 1)
      return true
    },
  },
  staff: {
    getAll: () => staff,
    getById: (id: string) => staff.find((s) => s.id === id),
    create: (data: any) => {
      const item = { id: String(Date.now()), staffId: `STF${Date.now()}`, ...data, status: "active" }
      staff.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = staff.findIndex((s) => s.id === id)
      if (idx === -1) return null
      staff[idx] = { ...staff[idx], ...data }
      return staff[idx]
    },
    delete: (id: string) => {
      const idx = staff.findIndex((s) => s.id === id)
      if (idx === -1) return false
      staff.splice(idx, 1)
      return true
    },
  },
  lessonNotes: {
    getAll: (classId?: string) => classId ? lessonNotes.filter((n) => n.classId === classId) : lessonNotes,
    getById: (id: string) => lessonNotes.find((n) => n.id === id),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data, createdAt: new Date().toISOString().split("T")[0] }
      lessonNotes.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = lessonNotes.findIndex((n) => n.id === id)
      if (idx === -1) return null
      lessonNotes[idx] = { ...lessonNotes[idx], ...data }
      return lessonNotes[idx]
    },
    delete: (id: string) => {
      const idx = lessonNotes.findIndex((n) => n.id === id)
      if (idx === -1) return false
      lessonNotes.splice(idx, 1)
      return true
    },
  },
  assignments: {
    getAll: (classId?: string) => classId ? assignments.filter((a) => a.classId === classId) : assignments,
    getById: (id: string) => assignments.find((a) => a.id === id),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data }
      assignments.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = assignments.findIndex((a) => a.id === id)
      if (idx === -1) return null
      assignments[idx] = { ...assignments[idx], ...data }
      return assignments[idx]
    },
    delete: (id: string) => {
      const idx = assignments.findIndex((a) => a.id === id)
      if (idx === -1) return false
      assignments.splice(idx, 1)
      return true
    },
  },
  timetable: {
    getAll: () => timetable,
    getByDay: (day: string) => timetable.filter((t) => t.day === day),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data }
      timetable.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = timetable.findIndex((t) => t.id === id)
      if (idx === -1) return null
      timetable[idx] = { ...timetable[idx], ...data }
      return timetable[idx]
    },
    delete: (id: string) => {
      const idx = timetable.findIndex((t) => t.id === id)
      if (idx === -1) return false
      timetable.splice(idx, 1)
      return true
    },
  },
  announcements: {
    getAll: () => announcements,
    getById: (id: string) => announcements.find((a) => a.id === id),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data, createdAt: new Date().toISOString() }
      announcements.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = announcements.findIndex((a) => a.id === id)
      if (idx === -1) return null
      announcements[idx] = { ...announcements[idx], ...data }
      return announcements[idx]
    },
    delete: (id: string) => {
      const idx = announcements.findIndex((a) => a.id === id)
      if (idx === -1) return false
      announcements.splice(idx, 1)
      return true
    },
  },
  results: {
    getAll: () => results,
    getByStudent: (studentId: string) => results.filter((r) => r.studentId === studentId),
    getByStudentAndTerm: (studentId: string, term: string) => results.filter((r) => r.studentId === studentId && r.term === term),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data }; results.push(item); return item
    },
  },
  attendance: {
    getByStudent: (studentId: string) => attendanceRecords.filter((a) => a.studentId === studentId),
    getSummary: (studentId: string) => {
      const records = attendanceRecords.filter((a) => a.studentId === studentId)
      return {
        present: records.filter((a) => a.status === "present").length,
        absent: records.filter((a) => a.status === "absent").length,
        late: records.filter((a) => a.status === "late").length,
        total: records.length,
      }
    },
  },
  fees: {
    getByStudent: (studentId: string) => fees.filter((f) => f.studentId === studentId),
    getSummary: (studentId: string) => {
      const records = fees.filter((f) => f.studentId === studentId)
      return {
        total: records.reduce((s, f) => s + f.amount, 0),
        paid: records.reduce((s, f) => s + f.paid, 0),
        outstanding: records.reduce((s, f) => s + (f.amount - f.paid), 0),
        items: records,
      }
    },
  },
  // ===================== CBT Engine =====================
  questions: {
    getAll: (subjectId?: string, classId?: string) => {
      let result = [...questions]
      if (subjectId) result = result.filter((q) => q.subjectId === subjectId)
      if (classId) result = result.filter((q) => q.classId === classId)
      return result
    },
    getById: (id: string) => questions.find((q) => q.id === id),
    create: (data: any) => {
      const now = new Date().toISOString()
      const item = { id: String(Date.now()), ...data, createdAt: now, updatedAt: now }
      questions.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = questions.findIndex((q) => q.id === id)
      if (idx === -1) return null
      questions[idx] = { ...questions[idx], ...data, updatedAt: new Date().toISOString() }
      return questions[idx]
    },
    delete: (id: string) => {
      const idx = questions.findIndex((q) => q.id === id)
      if (idx === -1) return false
      questions.splice(idx, 1)
      return true
    },
  },
  exams: {
    getAll: (subjectId?: string, classId?: string) => {
      let result = [...exams]
      if (subjectId) result = result.filter((e) => e.subjectId === subjectId)
      if (classId) result = result.filter((e) => e.classId === classId)
      return result
    },
    getById: (id: string) => exams.find((e) => e.id === id),
    create: (data: any) => {
      const now = new Date().toISOString()
      const item = { id: String(Date.now()), ...data, status: "draft", createdAt: now, updatedAt: now }
      exams.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = exams.findIndex((e) => e.id === id)
      if (idx === -1) return null
      exams[idx] = { ...exams[idx], ...data, updatedAt: new Date().toISOString() }
      return exams[idx]
    },
    delete: (id: string) => {
      const idx = exams.findIndex((e) => e.id === id)
      if (idx === -1) return false
      exams.splice(idx, 1)
      return true
    },
  },
  examSessions: {
    getAll: (examId?: string) => examId ? examSessions.filter((s) => s.examId === examId) : examSessions,
    getById: (id: string) => examSessions.find((s) => s.id === id),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data, status: "pending", tabSwitches: 0, flagged: false, createdAt: new Date().toISOString() }
      examSessions.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = examSessions.findIndex((s) => s.id === id)
      if (idx === -1) return null
      examSessions[idx] = { ...examSessions[idx], ...data }
      return examSessions[idx]
    },
    delete: (id: string) => {
      const idx = examSessions.findIndex((s) => s.id === id)
      if (idx === -1) return false
      examSessions.splice(idx, 1)
      return true
    },
  },
  submissions: {
    getAll: () => submissions,
    getById: (id: string) => submissions.find((s) => s.id === id),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data, status: "pending" }
      submissions.push(item)
      return item
    },
    update: (id: string, data: any) => {
      const idx = submissions.findIndex((s) => s.id === id)
      if (idx === -1) return null
      submissions[idx] = { ...submissions[idx], ...data }
      return submissions[idx]
    },
  },
  parentLinks: {
    getAll: () => parentLinks,
    getByParent: (parentId: string) => parentLinks.filter((l) => l.parentId === parentId),
    getByStudent: (studentId: string) => parentLinks.find((l) => l.studentId === studentId),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data }; parentLinks.push(item); return item
    },
    delete: (id: string) => {
      const idx = parentLinks.findIndex((l) => l.id === id)
      if (idx === -1) return false; parentLinks.splice(idx, 1); return true
    },
  },
  attendanceLogs: {
    getAll: (date?: string) => date ? attendanceLogs.filter((l) => l.date === date) : attendanceLogs,
    getByUser: (userId: string) => attendanceLogs.filter((l) => l.userId === userId),
    getByUserAndDate: (userId: string, date: string) => attendanceLogs.find((l) => l.userId === userId && l.date === date),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data, timestamp: new Date().toISOString() }; attendanceLogs.push(item); return item
    },
    getToday: () => {
      const today = new Date().toISOString().split("T")[0]
      return attendanceLogs.filter((l) => l.date === today)
    },
  },
  attendanceQRCodes: {
    getAll: () => attendanceQRCodes,
    getByType: (type: string) => attendanceQRCodes.filter((q) => q.type === type),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data, createdAt: new Date().toISOString() }; attendanceQRCodes.push(item); return item
    },
  },
  reportCards: {
    getAll: () => reportCards,
    getByStudent: (studentId: string) => reportCards.filter((r) => r.studentId === studentId),
    create: (data: any) => {
      const item = { id: String(Date.now()), ...data }; reportCards.push(item); return item
    },
  },
  // ===================== Phase 9: Payments & Salary & Documents =====================
  bankDetails: {
    get: () => bankDetails,
    update: (data: any) => { bankDetails = { ...bankDetails, ...data, updatedAt: new Date().toISOString() }; return bankDetails },
  },
  feeStructures: {
    getAll: (classId?: string) => classId ? feeStructures.filter((f) => f.classId === classId) : feeStructures,
    getById: (id: string) => feeStructures.find((f) => f.id === id),
    create: (data: any) => { const item = { id: String(Date.now()), ...data }; feeStructures.push(item); return item },
    update: (id: string, data: any) => { const idx = feeStructures.findIndex((f) => f.id === id); if (idx === -1) return null; feeStructures[idx] = { ...feeStructures[idx], ...data }; return feeStructures[idx] },
    delete: (id: string) => { const idx = feeStructures.findIndex((f) => f.id === id); if (idx === -1) return false; feeStructures.splice(idx, 1); return true },
  },
  payments: {
    getAll: (studentId?: string) => studentId ? payments.filter((p) => p.studentId === studentId) : payments,
    getById: (id: string) => payments.find((p) => p.id === id),
    create: (data: any) => { const item = { id: String(Date.now()), ...data, status: "pending", confirmedAt: null, confirmedBy: null }; payments.push(item); return item },
    update: (id: string, data: any) => { const idx = payments.findIndex((p) => p.id === id); if (idx === -1) return null; payments[idx] = { ...payments[idx], ...data }; return payments[idx] },
    confirm: (id: string, confirmedBy: string) => {
      const idx = payments.findIndex((p) => p.id === id); if (idx === -1) return null
      payments[idx] = { ...payments[idx], status: "confirmed", confirmedAt: new Date().toISOString(), confirmedBy }
      return payments[idx]
    },
    reject: (id: string, confirmedBy: string) => {
      const idx = payments.findIndex((p) => p.id === id); if (idx === -1) return null
      payments[idx] = { ...payments[idx], status: "rejected", confirmedAt: new Date().toISOString(), confirmedBy }
      return payments[idx]
    },
    getPending: () => payments.filter((p) => p.status === "pending"),
    getByStudentAndStatus: (studentId: string, status: string) => payments.filter((p) => p.studentId === studentId && p.status === status),
  },
  salaryStructures: {
    getAll: () => salaryStructures,
    getByStaff: (staffId: string) => salaryStructures.find((s) => s.staffId === staffId),
    create: (data: any) => { const item = { id: String(Date.now()), ...data }; salaryStructures.push(item); return item },
    update: (staffId: string, data: any) => { const idx = salaryStructures.findIndex((s) => s.staffId === staffId); if (idx === -1) return null; salaryStructures[idx] = { ...salaryStructures[idx], ...data }; return salaryStructures[idx] },
  },
  salaryRecords: {
    getAll: (staffId?: string) => staffId ? salaryRecords.filter((r) => r.staffId === staffId) : salaryRecords,
    getByStaffAndMonth: (staffId: string, month: string, year: string) => salaryRecords.find((r) => r.staffId === staffId && r.month === month && r.year === year),
    getById: (id: string) => salaryRecords.find((r) => r.id === id),
    create: (data: any) => { const item = { id: String(Date.now()), ...data, status: "pending", paidAt: null, confirmedAt: null, confirmedBy: null }; salaryRecords.push(item); return item },
    markPaid: (id: string, paidAt: string, confirmedBy: string) => {
      const idx = salaryRecords.findIndex((r) => r.id === id); if (idx === -1) return null
      salaryRecords[idx] = { ...salaryRecords[idx], status: "paid", paidAt, confirmedAt: new Date().toISOString(), confirmedBy }
      return salaryRecords[idx]
    },
    getByMonth: (month: string, year: string) => salaryRecords.filter((r) => r.month === month && r.year === year),
  },
  documents: {
    getAll: (studentId?: string) => studentId ? documents.filter((d) => d.studentId === studentId) : documents,
    getById: (id: string) => documents.find((d) => d.id === id),
    getByType: (type: string) => documents.filter((d) => d.type === type),
    create: (data: any) => { const item = { id: String(Date.now()), ...data, generatedAt: new Date().toISOString(), status: "final" }; documents.push(item); return item },
  },
  schoolSettings: {
    get: () => schoolSettingsData,
    update: (data: any) => { schoolSettingsData = { ...schoolSettingsData, ...data }; return schoolSettingsData },
  },
  admissionApplications: {
    getAll: () => admissionApplications,
    getById: (id: string) => admissionApplications.find((a) => a.id === id),
    getByStatus: (status: string) => admissionApplications.filter((a) => a.status === status),
    create: (data: any) => { const item = { id: String(Date.now()), ...data, status: "pending", appliedAt: new Date().toISOString() }; admissionApplications.push(item); return item },
    update: (id: string, data: any) => { const idx = admissionApplications.findIndex((a) => a.id === id); if (idx === -1) return null; admissionApplications[idx] = { ...admissionApplications[idx], ...data }; return admissionApplications[idx] },
    delete: (id: string) => { const idx = admissionApplications.findIndex((a) => a.id === id); if (idx === -1) return false; admissionApplications.splice(idx, 1); return true },
  },
}
