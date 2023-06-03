/*
  Warnings:

  - You are about to drop the column `shoppingCartId` on the `User` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `ShoppingCart` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "image" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_User" ("id", "image", "name", "password", "username") SELECT "id", "image", "name", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE TABLE "new_ShoppingCart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "ShoppingCart_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ShoppingCart" ("createAt", "id", "updatedAt") SELECT "createAt", "id", "updatedAt" FROM "ShoppingCart";
DROP TABLE "ShoppingCart";
ALTER TABLE "new_ShoppingCart" RENAME TO "ShoppingCart";
CREATE UNIQUE INDEX "ShoppingCart_ownerId_key" ON "ShoppingCart"("ownerId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
