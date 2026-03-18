/*
  Warnings:

  - You are about to drop the column `status` on the `Documento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Documento" DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
