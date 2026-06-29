# Skoolar Access — Complete Portal Feature Reference

> Multi-tenant school management platform with **5 role-based portals**, a **public website**, and a **standalone exam engine**.
> Built with Next.js, Prisma (PostgreSQL), Tailwind CSS.

---

## Table of Contents

1. [Super Admin Portal](#1-super-admin-portal-superadmin)
2. [Admin Portal](#2-admin-portal-admin)
3. [Teacher Portal](#3-teacher-portal-teacher)
4. [Student Portal](#4-student-portal-student)
5. [Parent Portal](#5-parent-portal-parent)
6. [Public Pages](#6-public-pages)
7. [Feature Matrix](#7-feature-matrix-summary)

---

## 1. Super Admin Portal (`/superadmin`)

**Role:** Cross-school system-wide administrator. Manages all aspects of a school from a single interface.

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Dashboard** | Stats cards (Staff, Teachers, Students, Classes, Subjects, Exams, etc.), system monitoring, pending admissions inline accept/reject |
| 2 | **School Settings** | Edit school profile (name, short name, motto, address, phone, email, logo, about text), colour config (primary/secondary/accent), toggle login, set/clear expiration date, change super admin password |
| 3 | **AI Assistant** | System-wide AI chat with quick actions (System Overview, Financial Health, Academic Performance, Pending Tasks, User Statistics, Data Export Help) |
| 4 | **Classes** | CRUD with name, arm (optional), section (optional); shows student count per class |
| 5 | **Subjects** | CRUD with name, code, class association |
| 6 | **Sessions** | CRUD academic sessions with name, start/end date, term count |
| 7 | **Terms** | CRUD with session association, start/end dates |
| 8 | **Timetable** | CRUD entries with day (Mon-Fri), start/end time, subject, class, room |
| 9 | **Staff** | CRUD (name, email, password, department, role: teacher/admin) |
| 10 | **Teachers** | Teacher assignment manager — select teacher, toggle class + subject assignments |
| 11 | **Students** | CRUD (name, email, password, gender, class) |
| 12 | **Parents** | Link parents to students (name, email, phone, password, linked student) |
| 13 | **Question Bank** | View all questions with type, class, subject, difficulty, points; approve/reject workflow; delete |
| 14 | **Exams** | CRUD (title, class, subject, duration), publish/unpublish toggle |
| 15 | **Scheme of Work** | View all schemes, approve/reject, delete |
| 16 | **Lesson Notes** | View/edit with inline modal, approve/reject, OCR integration, delete |
| 17 | **OCR Tool** | Client-side image-to-text extraction via `ImageToText` component |
| 18 | **Fee Structures** | CRUD per class/type/amount/term/session/due date |
| 19 | **Payments** | View all, confirm/reject pending payments |
| 20 | **Salary** | Create salary records (staff, amount, month, year), mark as paid |
| 21 | **Admissions** | View applications, accept/reject/delete |
| 22 | **Attendance** | View attendance logs filtered by date |
| 23 | **Documents** | View/delete generated documents |
| 24 | **Communication (Chat)** | Cross-school messaging — conversation list, real-time messaging, new chat creation |
| 25 | **Certificates** | Certificate generator with 10 templates (ClassicGold, ProfessionalBlue, PremiumDark, etc.) |
| 26 | **Behaviour Chart** | Star achievement chart generator with 6 templates |
| 27 | **Announcements** | Advanced CRUD — display types (banner/ticker/overlay), audience targeting (all/admin/teachers/parents/students), priority, media, CTA, review toggle |
| 28 | **Announcement Reviews** | View/delete user reviews with star ratings on announcements |
| 29 | **Feedback Tickets** | View/resolve tickets with resolution notes |
| 30 | **Bank Details** | Edit school bank info (bank name, account name, account number) |
| 31 | **Data Export** | Full ZIP archive, 12 individual CSV exports, single JSON export |
| 32 | **Danger Zone** | Backup-first selective data deletion by category (Academic Records, Assessment Content, Finance, Communication, Schedule, People, Academic Setup, Miscellaneous); Wipe All School Data |

---

## 2. Admin Portal (`/admin`)

**Role:** School-level administrator — full operational control of a single school.

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Dashboard** | Pending tasks, alerts, quick actions (Add Student, Create Exam, Take Attendance, Send Notice, Add Teacher, Record Payment), upcoming events, shortcut cards |
| 2 | **Sessions** | CRUD academic sessions, set current session |
| 3 | **Classes** | CRUD with arms, sections, levels, student counts |
| 4 | **Subjects** | CRUD with codes, filtered by class |
| 5 | **Scheme of Work** | CRUD, publish/approve, export (PNG, PDF, DOC, print) |
| 6 | **Lesson Notes** | CRUD, approve/reject, AI generate, OCR image-to-text, lesson viewer, embedded quizzes |
| 7 | **Assignments** | CRUD with due dates, class/subject filters, progress tracking |
| 8 | **Timetable** | Create sets (Regular, Exam, Event, Holiday), add/remove entries, conflict detection, export (CSV, PNG, PDF, DOC) |
| 9 | **Students** | CRUD with detail view (personal, contact, academic, medical), passport photo upload, search/filter by class |
| 10 | **Teachers & Staff** | CRUD with roles (teacher/admin/librarian/counselor/support), departments, class/subject assignments, class teacher toggle |
| 11 | **Parents** | CRUD, link/unlink parents to students, detail view |
| 12 | **CBT Exams** | CRUD (regular/entrance), security settings (fullscreen, tab switch limit, shuffle, max attempts), publish/draft |
| 13 | **CBT Questions** | CRUD (MCQ, True/False, Theory, Coding), points, subject/class filters |
| 14 | **CBT Sessions** | Monitor attempts, filter by exam/status, scores, tab switches, flagging, export CSV |
| 15 | **Question Bank** | Full bank with pagination, difficulty levels, topics, bulk actions, search, multiple filters |
| 16 | **Results (Score Entry)** | Enter CA + exam scores per class/subject/term, grade distribution, pass rates, export (PNG, PDF, CSV, DOC) |
| 17 | **Report Cards** | Generate with domain scores, teacher/principal comments, attendance, radar/bar charts, bulk export |
| 18 | **Reports (Analytical)** | Term trends, subject averages, student performance, export JSON |
| 19 | **Fees Management** | Fee structures per class/term/type, payments (pending/confirmed), collection rate, bar/pie charts, bank details |
| 20 | **Salary Management** | Salary structures per staff, monthly payroll, mark paid, totals dashboard |
| 21 | **Admissions** | 4 tabs: Dashboard (stats, pie/bar charts), Applications (detail, exam scoring, accept/reject/defer/delete), Entrance Scores (radar charts, strengths/weaknesses, WhatsApp share, export PNG/PDF/DOC), Reports (CSV) |
| 22 | **Smart Attendance** | 4 tabs: QR Scanner (camera-based), Manual check-in by code, Today's Logs (student/staff filter), QR Codes generation. Face recognition placeholder |
| 23 | **Communication (Chat)** | Direct messaging with teachers, parents, staff; Announcements tab |
| 24 | **Announcements** | CRUD with audience targeting (Everyone/Teachers/Parents/Students), priority levels |
| 25 | **Notifications** | View school announcements/updates with priority icons |
| 26 | **Analytics Overview** | Trends, student/teacher stats, pass rates, subject averages, attendance rate chart, fee collection, KPIs, export |
| 27 | **Deep Analysis** | Per-class mastery rates, student sorting, radar charts, subject breakdown, topic-level gaps, export (PNG, PDF, CSV, DOC) |
| 28 | **AI Assistant** | GPT-powered chat with quick actions (class performance, generate lesson notes, intervention needs, draft announcements, teacher insights, attendance insights) |
| 29 | **ID Cards** | Generate student/staff ID cards (front/back), portrait/landscape, bulk export as PNG/PDF/print |
| 30 | **Certificates** | Certificate generator with customization and download |
| 31 | **Documents** | Receipts + 12+ school letter templates (Acceptance, Transfer, Excuse, Warning, Recommendation, Thank You, Fee Reminder, Permission, Invitation, Report, Congratulations, Credentials). Preview, print, download |
| 32 | **Behaviour Chart** | Star achievement chart with colour codes and reward milestones |
| 33 | **Events** | CRUD (Exam, Holiday, Meeting, Sports, Cultural, Other) with dates/times, type/audience filter |
| 34 | **Feedback** | Submit feedback tickets, view/delete (Pending/In Progress/Resolved) |
| 35 | **Weekly Reports** | Create per-student weekly reports with subject scores, behavioural ratings, teacher comments, save draft/publish |
| 36 | **Data Export** | One-click CSV/JSON export grouped by People, Academics, Curriculum, Finance, Operations |
| 37 | **Profile** | View/edit admin profile (name, email, phone) |
| 38 | **Settings** | School name, contact, logo, motto, colours (primary/secondary/accent), ID card config (student & staff card layouts, custom fields, rules text), QR code download, export header text |

---

## 3. Teacher Portal (`/teacher`)

**Role:** Classroom teacher — manages content, assessments, student data, and professional info.

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Dashboard** | Stats (classes, students, lesson notes, assignments), pending tasks (unpublished notes, ungraded assignments, unmarked attendance), today's schedule, active assignments, 6 quick action buttons, upcoming events |
| 2 | **AI Assistant** | Chat with 6 quick actions (Lesson Ideas, Analyze My Class, Draft Report Comment, Create Quiz, Teaching Strategies, Weekly Report Help) |
| 3 | **Analytics** | Summary cards, performance area chart, class enrollment bar chart, subject bar chart, subject radar chart, attendance donut, assignment ring, teaching insights tab, export (PNG/PDF/DOC) |
| 4 | **Assignments** | CRUD with AI-generated descriptions, filter tabs (All/Active/Closed), overdue detection, submission progress bars |
| 5 | **Student Attendance** | 3 tabs: Mark (class selector, present/late per student), Scan QR (auto late after 9 AM), Today (today's logs). Sound effects |
| 6 | **Classes** | Teacher's assigned classes as expandable card grid, student roster with details |
| 7 | **Communication** | Chat tab (real-time messaging via ConversationList/ChatWindow) + Announcements tab (view and create) |
| 8 | **Handwriting Sheets** | Create, customise, and print handwriting practice sheets (line style, spacing, colour, orientation, paper size, tracing text) |
| 9 | **Lesson Notes** | Full CRUD with AI generation + OCR, student note / lesson plan tabs, embedded quiz builder (MCQ/T-F), version tracking, viewer/printer |
| 10 | **Notifications** | School announcements feed with priority icons/colours |
| 11 | **Profile** | View/edit teacher profile |
| 12 | **Question Bank** | CRUD (MCQ, True/False, Theory, Coding), AI generation via Wikipedia, filter by class/subject/topic/difficulty/status, pagination (50/page) |
| 13 | **Report Cards** | Domain scoring (6 standard domains), teacher comment, position computation, preview, export (PDF/PNG/Print), WhatsApp share |
| 14 | **Results** | 2 tabs: Score Entry (input CA/Exam per student, auto-calculate total/grade) + Dashboard (stats, grade distribution bar, score distribution bar, export CSV/PNG/PDF) |
| 15 | **Salary** | View salary structure, summary cards (Base Salary, Total Earned, Last Payment, Status), payment history |
| 16 | **Scheme of Work** | CRUD with AI-generated weeks, multi-week expandable cards, status workflow (draft → pending → published), export (PNG/PDF/DOC/Print) |
| 17 | **Staff Attendance (Check-In)** | QR code scanner for staff, auto-detects late after 8 AM, confirmation with time/status, sound effects |
| 18 | **Timetable** | Day-by-day schedule with time slots, type filter, set selector, break detection, subject colour coding, export (CSV/PNG/PDF) |
| 19 | **Weekly Reports** | Per-student reports (week 1-13), subject performance scores, behavioural assessment (1-5: Punctuality, Attentiveness, Conduct, Homework, Teamwork), overall rating (1-5 stars), teacher comment, save draft/publish |
| 20 | **CBT - Exams** | CRUD templates with security settings (fullscreen, copy-paste, tab switch limit, max attempts), shuffle, show results toggle, publish/unpublish |
| 21 | **CBT - Exam Detail** | Add/remove questions, auto-populate from bank (filter by difficulty/topic), browse bank with multi-select, edit per-exam overrides |
| 22 | **CBT - Sessions** | List student attempts with flag indicators for suspicious activity, filter by exam/status, export CSV |
| 23 | **CBT - Session Detail** | Grading tab (auto-grade MCQ/T-F, manual for theory/coding) + Analysis tab (radar chart, pie chart, question-type breakdown, topic gaps, strengths/weaknesses, export CSV/PNG/PDF/DOC) |
| 24 | **CBT - Questions** | CRUD standalone questions (MCQ, True/False, Theory, Coding) filtered by type/subject |

---

## 4. Student Portal (`/student`)

**Role:** Student — views own academic data, takes exams, reads learning material.

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Dashboard** | Greeting with name/class, stats (Avg Score, Attendance %, Subjects, Exams Done), performance bar chart, quick links (6), upcoming events, subject breakdown |
| 2 | **Analytics** | 4 tabs: Performance (area chart, grade distribution bar), Subjects (bar chart, radar chart, breakdown with progress bars), Attendance (overview, monthly trend line), Insights (personalised tips). Export PNG/PDF/DOC |
| 3 | **Assignments** | 3 tabs (Active/Overdue/Closed), expandable cards with descriptions, submission progress bars, empty state illustrations |
| 4 | **Attendance** | Present/Absent/Late counts, donut chart with percentage, recent records list |
| 5 | **CBT Exams** | Available exams list (excludes entrance type), start flow (creates session → redirects to `/exam-take/[sessionId]`), attempt history with "View Analysis" links |
| 6 | **CBT Exam Analysis** | Score/grade/percentage, question-by-question breakdown, radar chart, correct/partial/wrong pie, performance by question type grid, topic breakdown, insights (strengths/areas to improve/recommendations), teacher feedback, export CSV/PNG/PDF/DOC |
| 7 | **Fees** | Paid vs due progress bar, fee breakdown per item, payment history with status badges |
| 8 | **Lesson Notes** | Browse published notes by class, expandable cards, mark as read, built-in quiz system with retakes (MCQ/T-F, progress bar, pass/fail, answer review) |
| 9 | **Notifications** | School announcements filtered for students, priority icons/colours |
| 10 | **Profile** | View/edit student profile |
| 11 | **Report Card** | Full printable report card: school info, student info, subject scores with CA/Exam/grades, psychomotor domains, attendance summary, teacher/principal comments, class position, next term info. Export: Print, PDF, PNG, WhatsApp share |
| 12 | **Results** | 2 views: Academic Results (term comparison bar chart, subject radar, per-subject cards) + Exam Sessions (completed CBT list with scores/grades). Export CSV/PNG/PDF/DOC |
| 13 | **Timetable** | Weekly schedule with type/set filters, 7 time slots × 5 days, break indicators, free periods, export CSV/PNG/PDF |

**Standalone Exam Engine** (`/exam-take/[sessionId]`): Full secure CBT environment — fullscreen enforcement, tab switch detection and limits, timed exams, auto-submit.

---

## 5. Parent Portal (`/parent`)

**Role:** Parent/guardian — monitors linked children's progress, fees, and communications.

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Dashboard** | Child selector pills, summary card (name, class, avg score, present days, fees paid), subject performance bar chart, quick action cards, upcoming events, attendance mini-widget, fees mini-widget |
| 2 | **My Children** | List of linked children with avatars, names, classes, scores (colour-coded), quick links (Results, Attendance, Timetable) |
| 3 | **Academic Analytics** | 4 tabs with child selector: Performance (area chart, grade bar), Subjects (bar chart, radar chart, progress bars), Attendance (overview, monthly line), Insights (personalised recommendations). Export PNG/PDF/DOC |
| 4 | **Attendance Records** | Per-child attendance rate, stat cards (Present/Late/Absent/Total), pie chart, recent records |
| 5 | **Fees & Payments** | Summary header (paid vs due, progress), Overview tab (fee breakdown), History tab (payment list with status badges) |
| 6 | **Lesson Notes** | Browse published notes per child/class, expandable cards, built-in quiz system with retakes and review |
| 7 | **Results & Performance** | Child selector, 2 views: Academic Results (term tabs, bar/radar charts, subject breakdown) + Exam Sessions (completed CBT list). Export CSV/PNG/PDF/DOC |
| 8 | **Report Card** | Full report card: school header, student info, subject scores (CA/Exam/grades/remarks), psychomotor domains, attendance, teacher/principal comments, class position, next term info. Export: Print, PDF, PNG, WhatsApp share |
| 9 | **Timetable** | Child selector, type/set filters, 7×5 grid view, break indicators, export CSV/PNG/PDF |
| 10 | **Communication** | Chat tab (real-time messaging with school) + Announcements tab (filtered for parents) |
| 11 | **Notifications** | School announcements feed with priority indicators |
| 12 | **Documents** | View official documents (receipts, letters) for linked children with status badges and print action |
| 13 | **Weekly Reports** | Child selector, term filter, accordion weeks — per-week: star rating, subject performance table, behavioural assessment (5 dimensions), teacher comment. Export PDF/PNG per report, WhatsApp share, preview modal |
| 14 | **Profile** | View/edit parent profile |
| 15 | **Settings** | Profile info editing, notification preferences (Email/SMS toggles), change password |

---

## 6. Public Pages

| Page | Description |
|------|-------------|
| **Landing Page** (`/`) | Full marketing website: hero, program overview, stats, features, testimonials, CTA |
| **About** (`/about`) | School information page |
| **Admissions** (`/admissions`) | Admissions info portal |
| **Admissions Apply** (`/admissions/apply`) | Online application form |
| **Entrance Exam** (`/admissions/entrance`) | Entrance exam portal for prospective students |

---

## 7. Feature Matrix Summary

| Feature Area | Super Admin | Admin | Teacher | Student | Parent |
|---|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| AI Assistant | ✓ | ✓ | ✓ | — | — |
| School Settings | ✓ | ✓ | — | — | — |
| Classes (manage) | ✓ | ✓ | — | — | — |
| Classes (view roster) | — | — | ✓ | — | — |
| Subjects (manage) | ✓ | ✓ | — | — | — |
| Sessions / Terms | ✓ | ✓ | — | — | — |
| Timetable (manage) | ✓ | ✓ | — | — | — |
| Timetable (view) | — | — | ✓ | ✓ | ✓ |
| Staff Management | ✓ | ✓ | — | — | — |
| Student Management | ✓ | ✓ | — | — | — |
| Parent Management | ✓ | ✓ | — | — | — |
| Teacher Assignments | ✓ | ✓ | — | — | — |
| Question Bank | ✓ | ✓ | ✓ | — | — |
| Exams (CRUD) | ✓ | ✓ | ✓ | — | — |
| Exams (take) | — | — | — | ✓ | — |
| Exam Sessions (monitor) | — | ✓ | ✓ | — | — |
| Exam Analysis | — | — | ✓ | ✓ | — |
| Scheme of Work | ✓ | ✓ | ✓ | — | — |
| Lesson Notes (manage) | ✓ | ✓ | ✓ | — | — |
| Lesson Notes (read) | — | — | — | ✓ | ✓ |
| Lesson Quizzes | — | — | ✓ | ✓ | ✓ |
| Assignments (manage) | — | ✓ | ✓ | — | — |
| Assignments (view/submit) | — | — | — | ✓ | — |
| Results (enter) | — | ✓ | ✓ | — | — |
| Results (view) | — | — | — | ✓ | ✓ |
| Report Cards (generate) | — | ✓ | ✓ | — | — |
| Report Cards (view) | — | — | — | ✓ | ✓ |
| Analytics / Insights | — | ✓ | ✓ | ✓ | ✓ |
| Weekly Reports (manage) | — | ✓ | ✓ | — | — |
| Weekly Reports (view) | — | — | — | — | ✓ |
| Attendance (manage) | — | ✓ | ✓ | — | — |
| Attendance (view) | ✓ | — | — | ✓ | ✓ |
| Fees / Payments | ✓ | ✓ | — | ✓ | ✓ |
| Salary | ✓ | ✓ | ✓ | — | — |
| Admissions | ✓ | ✓ | — | — | — |
| Certificates | ✓ | ✓ | — | — | — |
| Behaviour Charts | ✓ | ✓ | — | — | — |
| ID Cards | — | ✓ | — | — | — |
| Handwriting Sheets | — | — | ✓ | — | — |
| Documents / Letters | ✓ | ✓ | — | — | ✓ |
| Communication / Chat | ✓ | ✓ | ✓ | — | ✓ |
| Announcements (manage) | ✓ | ✓ | ✓ | — | — |
| Announcements (view) | — | ✓ | ✓ | ✓ | ✓ |
| Events | — | ✓ | — | — | — |
| Feedback | ✓ | ✓ | — | — | — |
| Data Export | ✓ | ✓ | — | — | — |
| OCR Tool | ✓ | — | ✓ | — | — |
| Danger Zone | ✓ | — | — | — | — |
| Staff Attendance | — | — | ✓ | — | — |
| Profile | — | ✓ | ✓ | ✓ | ✓ |
| Settings | — | ✓ | — | — | ✓ |
| Notifications | — | ✓ | ✓ | ✓ | ✓ |

---

**Legend:** ✓ = feature available, — = feature not available

*Document generated from codebase audit — covers all routes, pages, components, and API interactions as of June 2026.*
