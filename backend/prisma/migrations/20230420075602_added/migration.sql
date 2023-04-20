/*
  Warnings:

  - A unique constraint covering the columns `[trackId,user,playlistId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trackId,guestId,playlistId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Vote_trackId_guestId_key";

-- DropIndex
DROP INDEX "Vote_trackId_user_key";

-- CreateIndex
CREATE UNIQUE INDEX "Vote_trackId_user_playlistId_key" ON "Vote"("trackId", "user", "playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_trackId_guestId_playlistId_key" ON "Vote"("trackId", "guestId", "playlistId");
