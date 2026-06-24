-- Create EntranceExamCode model for entrance exam code-based admission system
-- Add fields to AdmissionApplication for tracking exam sessions and user enrollment

-- 1. Create EntranceExamCode table
CREATE TABLE "EntranceExamCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntranceExamCode_pkey" PRIMARY KEY ("id")
);

-- 2. Add unique constraint on code
CREATE UNIQUE INDEX "EntranceExamCode_code_key" ON "EntranceExamCode"("code");

-- 3. Add foreign key for school
ALTER TABLE "EntranceExamCode" ADD CONSTRAINT "EntranceExamCode_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Add new columns to AdmissionApplication
ALTER TABLE "AdmissionApplication" ADD COLUMN "previousSchool" TEXT;
ALTER TABLE "AdmissionApplication" ADD COLUMN "entranceCodeId" TEXT;
ALTER TABLE "AdmissionApplication" ADD COLUMN "examSessionId" TEXT;
ALTER TABLE "AdmissionApplication" ADD COLUMN "userId" TEXT;
