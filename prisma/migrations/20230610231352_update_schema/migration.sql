/*
  Warnings:

  - You are about to drop the column `messageRouteId` on the `MessageRoom` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MessageRoom" (
    "id" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_MessageRoom" ("id") SELECT "id" FROM "MessageRoom";
DROP TABLE "MessageRoom";
ALTER TABLE "new_MessageRoom" RENAME TO "MessageRoom";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
