-- CreateEnum
-- CREATE TYPE "StatusDocumento" AS ENUM ('VALIDO', 'EXPIRADO', 'A_EXPIRAR', 'EM_FALTA');

-- CreateEnum
-- CREATE TYPE "StatusConvite" AS ENUM ('PENDENTE', 'ACEITE', 'RECUSADO');

-- AlterTable
-- ALTER TABLE "Curso" ADD COLUMN     "cargaHoraria" INTEGER NOT NULL DEFAULT 0,
-- ADD COLUMN     "dataFim" TIMESTAMP(3),
-- ADD COLUMN     "dataInicio" TIMESTAMP(3);

-- AlterTable
-- ALTER TABLE "Modulo" ADD COLUMN     "cargaHoraria" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
-- CREATE TABLE "Documento" (
--     "id" TEXT NOT NULL,
--     "tipo" TEXT NOT NULL,
--     "numero" TEXT NOT NULL,
--     "dataEmissao" TIMESTAMP(3) NOT NULL,
--     "dataExpiracao" TIMESTAMP(3),
--     "status" "StatusDocumento" NOT NULL DEFAULT 'VALIDO',
--     "formandoId" TEXT NOT NULL,

--     CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
-- );

-- CreateTable
-- CREATE TABLE "DocumentoFormador" (
--     "id" TEXT NOT NULL,
--     "tipo" TEXT NOT NULL,
--     "numero" TEXT,
--     "dataEmissao" TIMESTAMP(3),
--     "dataExpiracao" TIMESTAMP(3),
--     "status" "StatusDocumento" NOT NULL DEFAULT 'EM_FALTA',
--     "formadorId" TEXT NOT NULL,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

--     CONSTRAINT "DocumentoFormador_pkey" PRIMARY KEY ("id")
-- );

-- CreateTable
-- CREATE TABLE "Convite" (
--     "id" TEXT NOT NULL,
--     "formadorId" TEXT NOT NULL,
--     "cursoId" TEXT,
--     "moduloId" TEXT,
--     "status" "StatusConvite" NOT NULL DEFAULT 'PENDENTE',
--     "descricao" TEXT,
--     "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "dataResposta" TIMESTAMP(3),
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

--     CONSTRAINT "Convite_pkey" PRIMARY KEY ("id")
-- );

-- AddForeignKey
-- ALTER TABLE "Documento" ADD CONSTRAINT "Documento_formandoId_fkey" FOREIGN KEY ("formandoId") REFERENCES "Formando"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE "DocumentoFormador" ADD CONSTRAINT "DocumentoFormador_formadorId_fkey" FOREIGN KEY ("formadorId") REFERENCES "Formador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE "Convite" ADD CONSTRAINT "Convite_formadorId_fkey" FOREIGN KEY ("formadorId") REFERENCES "Formador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
