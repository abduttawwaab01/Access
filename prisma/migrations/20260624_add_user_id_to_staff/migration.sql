-- Add userId to Staff table for User record linking

-- 1. Add the column (nullable, unique)
ALTER TABLE "Staff" ADD COLUMN "userId" TEXT;

-- 2. Add unique constraint
CREATE UNIQUE INDEX "Staff_userId_key" ON "Staff"("userId");

-- 3. Add foreign key
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
