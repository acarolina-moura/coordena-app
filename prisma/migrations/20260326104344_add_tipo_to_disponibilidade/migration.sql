-- CreateEnum
CREATE TYPE "TipoDisponibilidade" AS ENUM ('TOTAL', 'PARCIAL');

-- AlterEnum
ALTER TYPE "StatusPresenca" ADD VALUE 'PENDENTE';

-- AlterTable
ALTER TABLE "Convite" ADD COLUMN     "formandoId" TEXT,
ALTER COLUMN "formadorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "DocumentoFormador" ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "ItemTemplateAvaliacao" ADD COLUMN     "dataLimite" TIMESTAMP(3),
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "ficheiroAnexoUrl" TEXT;

-- AlterTable
ALTER TABLE "Presenca" ADD COLUMN     "comentarioFormando" TEXT,
ADD COLUMN     "documentoUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "Disponibilidade" (
    "id" TEXT NOT NULL,
    "formadorId" TEXT NOT NULL,
    "diaSemana" TEXT NOT NULL,
    "hora" INTEGER NOT NULL,
    "minuto" INTEGER NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "tipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disponibilidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissaoTrabalho" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "formandoId" TEXT NOT NULL,
    "ficheiroUrl" TEXT NOT NULL,
    "dataEntrega" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comentario" TEXT,

    CONSTRAINT "SubmissaoTrabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewModulo" (
    "id" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "formandoId" TEXT NOT NULL,
    "moduloId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewModulo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Disponibilidade_formadorId_diaSemana_hora_minuto_key" ON "Disponibilidade"("formadorId", "diaSemana", "hora", "minuto");

-- CreateIndex
CREATE INDEX "SubmissaoTrabalho_formandoId_idx" ON "SubmissaoTrabalho"("formandoId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissaoTrabalho_itemId_formandoId_key" ON "SubmissaoTrabalho"("itemId", "formandoId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewModulo_formandoId_moduloId_key" ON "ReviewModulo"("formandoId", "moduloId");

-- AddForeignKey
ALTER TABLE "Disponibilidade" ADD CONSTRAINT "Disponibilidade_formadorId_fkey" FOREIGN KEY ("formadorId") REFERENCES "Formador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convite" ADD CONSTRAINT "Convite_formandoId_fkey" FOREIGN KEY ("formandoId") REFERENCES "Formando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convite" ADD CONSTRAINT "Convite_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convite" ADD CONSTRAINT "Convite_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissaoTrabalho" ADD CONSTRAINT "SubmissaoTrabalho_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplateAvaliacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissaoTrabalho" ADD CONSTRAINT "SubmissaoTrabalho_formandoId_fkey" FOREIGN KEY ("formandoId") REFERENCES "Formando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewModulo" ADD CONSTRAINT "ReviewModulo_formandoId_fkey" FOREIGN KEY ("formandoId") REFERENCES "Formando"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewModulo" ADD CONSTRAINT "ReviewModulo_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
