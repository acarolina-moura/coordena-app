/*
  Warnings:

  - Added the required column `updatedAt` to the `Documento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- RenameIndex
ALTER INDEX "formadorId_tipo" RENAME TO "Documento_formadorId_tipo_key";
