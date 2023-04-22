-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "spotifyRefreshToken" TEXT,
ADD COLUMN     "spotifyTokenExpiresAt" TIMESTAMP(3);
