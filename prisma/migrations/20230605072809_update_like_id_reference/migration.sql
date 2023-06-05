/*
  Warnings:

  - The primary key for the `MovieLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MovieLike` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MovieLike" (
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "movieId"),
    CONSTRAINT "MovieLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MovieLike_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MovieLike" ("liked", "movieId", "userId") SELECT "liked", "movieId", "userId" FROM "MovieLike";
DROP TABLE "MovieLike";
ALTER TABLE "new_MovieLike" RENAME TO "MovieLike";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
