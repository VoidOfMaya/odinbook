/*
  Warnings:

  - A unique constraint covering the columns `[gitId]` on the table `git` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "git" ADD COLUMN     "gitId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "git_gitId_key" ON "git"("gitId");
