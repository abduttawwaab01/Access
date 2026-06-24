-- Add missing Exam fields that exist in the application code but not in the Prisma schema
-- These fields are used by the exam builder form and exam-take experience

ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "showResults" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "requireFullscreen" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "tabSwitchLimit" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "allowCopyPaste" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Exam" ADD COLUMN IF NOT EXISTS "maxAttempts" INTEGER NOT NULL DEFAULT 0;
