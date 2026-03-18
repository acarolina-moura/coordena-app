-- CreateEnum
CREATE TYPE "StatusDocumento" AS ENUM ('VALIDO', 'EXPIRADO', 'A_EXPIRAR', 'EM_FALTA');

-- AlterTable
ALTER TABLE "Curso" ADD COLUMN     "dataFim" TIMESTAMP(3),
ADD COLUMN     "dataInicio" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Modulo" ADD COLUMN     "cargaHoraria" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataValidade" TIMESTAMP(3),
    "status" "StatusDocumento" NOT NULL DEFAULT 'VALIDO',
    "formandoId" TEXT,
    "formadorId" TEXT,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_formandoId_fkey" FOREIGN KEY ("formandoId") REFERENCES "Formando"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_formadorId_fkey" FOREIGN KEY ("formadorId") REFERENCES "Formador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
