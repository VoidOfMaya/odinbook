/*
  Warnings:

  - You are about to drop the column `state` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "state";

-- CreateTable
CREATE TABLE "git" (
    "id" TEXT NOT NULL,
    "state" TEXT,

    CONSTRAINT "git_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "git_state_key" ON "git"("state");
