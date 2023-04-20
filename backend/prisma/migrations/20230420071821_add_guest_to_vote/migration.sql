/*
  Warnings:

  - A unique constraint covering the columns `[trackId,guestId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "guestId" TEXT,
ALTER COLUMN "user" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vote_trackId_guestId_key" ON "Vote"("trackId", "guestId");
