/*
  Warnings:

  - You are about to drop the column `dataValidade` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Documento` table. All the data in the column will be lost.
  - Added the required column `tipo` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Made the column `formandoId` on table `Documento` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "StatusConvite" AS ENUM ('PENDENTE', 'ACEITE', 'RECUSADO');

-- DropForeignKey
ALTER TABLE "Documento" DROP CONSTRAINT "Documento_formandoId_fkey";

-- AlterTable
ALTER TABLE "Curso" ADD COLUMN     "cargaHoraria" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Documento" DROP COLUMN "dataValidade",
DROP COLUMN "nome",
ADD COLUMN     "dataExpiracao" TIMESTAMP(3),
ADD COLUMN     "status" "StatusDocumento" NOT NULL DEFAULT 'VALIDO',
ADD COLUMN     "tipo" TEXT NOT NULL,
ALTER COLUMN "formandoId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Convite" (
    "id" TEXT NOT NULL,
    "formadorId" TEXT NOT NULL,
    "cursoId" TEXT,
    "moduloId" TEXT,
    "status" "StatusConvite" NOT NULL DEFAULT 'PENDENTE',
    "descricao" TEXT,
    "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataResposta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Convite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoFormador" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "numero" TEXT,
    "dataEmissao" TIMESTAMP(3),
    "dataExpiracao" TIMESTAMP(3),
    "status" "StatusDocumento" NOT NULL DEFAULT 'EM_FALTA',
    "formadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoFormador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateAvaliacao" (
    "id" TEXT NOT NULL,
    "formadorId" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateAvaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemTemplateAvaliacao" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemTemplateAvaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaParcial" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "formandoId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotaParcial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateAvaliacao_formadorId_moduloId_key" ON "TemplateAvaliacao"("formadorId", "moduloId");

-- CreateIndex
CREATE INDEX "ItemTemplateAvaliacao_templateId_idx" ON "ItemTemplateAvaliacao"("templateId");

-- CreateIndex
CREATE INDEX "NotaParcial_templateId_formandoId_idx" ON "NotaParcial"("templateId", "formandoId");

-- CreateIndex
CREATE UNIQUE INDEX "NotaParcial_formandoId_itemId_key" ON "NotaParcial"("formandoId", "itemId");

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_formandoId_fkey" FOREIGN KEY ("formandoId") REFERENCES "Formando"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convite" ADD CONSTRAINT "Convite_formadorId_fkey" FOREIGN KEY ("formadorId") REFERENCES "Formador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoFormador" ADD CONSTRAINT "DocumentoFormador_formadorId_fkey" FOREIGN KEY ("formadorId") REFERENCES "Formador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateAvaliacao" ADD CONSTRAINT "TemplateAvaliacao_formadorId_fkey" FOREIGN KEY ("formadorId") REFERENCES "Formador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateAvaliacao" ADD CONSTRAINT "TemplateAvaliacao_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemTemplateAvaliacao" ADD CONSTRAINT "ItemTemplateAvaliacao_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TemplateAvaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaParcial" ADD CONSTRAINT "NotaParcial_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplateAvaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaParcial" ADD CONSTRAINT "NotaParcial_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TemplateAvaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
