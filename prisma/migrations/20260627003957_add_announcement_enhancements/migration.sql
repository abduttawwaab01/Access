-- Add announcement enhancement fields + AnnouncementReview model

-- 1. Add new columns to Announcement
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "buttonLabel" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "buttonUrl" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "mediaUrl" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "mediaType" TEXT DEFAULT 'image';
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "reviewEnabled" BOOLEAN NOT NULL DEFAULT false;

-- 2. Create AnnouncementReview table
CREATE TABLE IF NOT EXISTS "AnnouncementReview" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnnouncementReview_pkey" PRIMARY KEY ("id")
);

-- 3. Create index on announcementId
CREATE INDEX IF NOT EXISTS "AnnouncementReview_announcementId_idx" ON "AnnouncementReview"("announcementId");

-- 4. Add foreign key
ALTER TABLE "AnnouncementReview" ADD CONSTRAINT "AnnouncementReview_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
