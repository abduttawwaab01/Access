-- DropIndex
DROP INDEX "Exam_schoolId_classId_subjectId_status_idx";

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "subjectIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill subjectIds from existing subjectId values
UPDATE "Exam" SET "subjectIds" = ARRAY["subjectId"] WHERE "subjectIds" IS NULL OR "subjectIds" = ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Exam_schoolId_classId_status_idx" ON "Exam"("schoolId", "classId", "status");
