-- Drop the existing index
DROP INDEX IF EXISTS "Result_schoolId_studentId_classId_term_session_idx";

-- Add unique constraint on (schoolId, studentId, subjectId, classId, term, session)
-- Remove duplicate rows first (keep the latest one per unique combination)
DELETE FROM "Result" a USING (
  SELECT MIN(ctid) as ctid, "schoolId", "studentId", "subjectId", "classId", "term", COALESCE("session", '') as "session"
  FROM "Result"
  GROUP BY "schoolId", "studentId", "subjectId", "classId", "term", COALESCE("session", '')
  HAVING COUNT(*) > 1
) b
WHERE a."schoolId" = b."schoolId"
  AND a."studentId" = b."studentId"
  AND a."subjectId" = b."subjectId"
  AND a."classId" = b."classId"
  AND a."term" = b."term"
  AND COALESCE(a."session", '') = b."session"
  AND a.ctid <> b.ctid;

CREATE UNIQUE INDEX "Result_schoolId_studentId_subjectId_classId_term_session_key" ON "Result"("schoolId", "studentId", "subjectId", "classId", "term", "session");

-- Re-add the existing index for query performance
CREATE INDEX "Result_schoolId_studentId_classId_term_session_idx" ON "Result"("schoolId", "studentId", "classId", "term", "session");
