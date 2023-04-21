/*
  Warnings:

  - Added the required column `spotifyPlaylistId` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "spotifyPlaylistId" TEXT NOT NULL;
