-- CreateTable
CREATE TABLE "MessageRoute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageRoomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "MessageRoute_messageRoomId_fkey" FOREIGN KEY ("messageRoomId") REFERENCES "MessageRoom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MessageRoute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageRouteId" TEXT NOT NULL
);
