/*
  Warnings:

  - A unique constraint covering the columns `[trackId,user]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `album` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationMs` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "album" TEXT NOT NULL,
ADD COLUMN     "durationMs" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vote_trackId_user_key" ON "Vote"("trackId", "user");
