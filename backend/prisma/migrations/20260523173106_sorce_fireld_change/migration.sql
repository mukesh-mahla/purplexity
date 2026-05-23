/*
  Warnings:

  - You are about to drop the column `url` on the `Sources` table. All the data in the column will be lost.
  - Added the required column `link` to the `Sources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sources" DROP COLUMN "url",
ADD COLUMN     "link" TEXT NOT NULL;
