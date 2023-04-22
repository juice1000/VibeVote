/*
  Warnings:

  - A unique constraint covering the columns `[spotifyPlaylistId]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "spotifyAccessToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_spotifyPlaylistId_key" ON "Playlist"("spotifyPlaylistId");
