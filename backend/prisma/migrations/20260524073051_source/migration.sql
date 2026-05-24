/*
  Warnings:

  - Added the required column `content` to the `Sources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sources" ADD COLUMN     "content" TEXT NOT NULL;
