-- CreateIndex
CREATE INDEX "AdmissionApplication_schoolId_status_idx" ON "AdmissionApplication"("schoolId", "status");

-- CreateIndex
CREATE INDEX "Announcement_schoolId_audience_active_idx" ON "Announcement"("schoolId", "audience", "active");

-- CreateIndex
CREATE INDEX "AttendanceLog_schoolId_userId_date_idx" ON "AttendanceLog"("schoolId", "userId", "date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_schoolId_studentId_date_idx" ON "AttendanceRecord"("schoolId", "studentId", "date");

-- CreateIndex
CREATE INDEX "Conversation_schoolId_idx" ON "Conversation"("schoolId");

-- CreateIndex
CREATE INDEX "Document_schoolId_studentId_type_idx" ON "Document"("schoolId", "studentId", "type");

-- CreateIndex
CREATE INDEX "Event_schoolId_date_type_idx" ON "Event"("schoolId", "date", "type");

-- CreateIndex
CREATE INDEX "Exam_schoolId_classId_subjectId_status_idx" ON "Exam"("schoolId", "classId", "subjectId", "status");

-- CreateIndex
CREATE INDEX "ExamSession_schoolId_examId_studentId_status_idx" ON "ExamSession"("schoolId", "examId", "studentId", "status");

-- CreateIndex
CREATE INDEX "Fee_schoolId_studentId_idx" ON "Fee"("schoolId", "studentId");

-- CreateIndex
CREATE INDEX "FeedbackTicket_schoolId_status_idx" ON "FeedbackTicket"("schoolId", "status");

-- CreateIndex
CREATE INDEX "LessonNote_schoolId_classId_subjectId_createdBy_idx" ON "LessonNote"("schoolId", "classId", "subjectId", "createdBy");

-- CreateIndex
CREATE INDEX "LessonQuizResult_schoolId_studentId_lessonNoteId_idx" ON "LessonQuizResult"("schoolId", "studentId", "lessonNoteId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "ParentLink_schoolId_parentId_studentId_idx" ON "ParentLink"("schoolId", "parentId", "studentId");

-- CreateIndex
CREATE INDEX "Payment_schoolId_studentId_status_idx" ON "Payment"("schoolId", "studentId", "status");

-- CreateIndex
CREATE INDEX "Question_schoolId_classId_subjectId_approved_difficulty_idx" ON "Question"("schoolId", "classId", "subjectId", "approved", "difficulty");

-- CreateIndex
CREATE INDEX "ReportCard_schoolId_studentId_idx" ON "ReportCard"("schoolId", "studentId");

-- CreateIndex
CREATE INDEX "ReportCardEntry_schoolId_classId_term_session_idx" ON "ReportCardEntry"("schoolId", "classId", "term", "session");

-- CreateIndex
CREATE INDEX "Result_schoolId_studentId_classId_term_session_idx" ON "Result"("schoolId", "studentId", "classId", "term", "session");

-- CreateIndex
CREATE INDEX "SalaryRecord_schoolId_staffId_month_year_idx" ON "SalaryRecord"("schoolId", "staffId", "month", "year");

-- CreateIndex
CREATE INDEX "SchemeOfWork_schoolId_classId_subjectId_idx" ON "SchemeOfWork"("schoolId", "classId", "subjectId");

-- CreateIndex
CREATE INDEX "Staff_schoolId_idx" ON "Staff"("schoolId");

-- CreateIndex
CREATE INDEX "Student_schoolId_classId_idx" ON "Student"("schoolId", "classId");

-- CreateIndex
CREATE INDEX "Submission_schoolId_assignmentId_studentId_status_idx" ON "Submission"("schoolId", "assignmentId", "studentId", "status");

-- CreateIndex
CREATE INDEX "TimetableEntry_schoolId_classId_day_idx" ON "TimetableEntry"("schoolId", "classId", "day");

-- CreateIndex
CREATE INDEX "Topic_schoolId_subjectId_idx" ON "Topic"("schoolId", "subjectId");

-- CreateIndex
CREATE INDEX "User_schoolId_role_idx" ON "User"("schoolId", "role");

-- CreateIndex
CREATE INDEX "WeeklyReport_schoolId_studentId_classId_week_idx" ON "WeeklyReport"("schoolId", "studentId", "classId", "week");
