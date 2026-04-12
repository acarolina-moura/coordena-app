-- AlterTable
ALTER TABLE "Formador" ADD COLUMN     "criadoPorCoordenadorId" TEXT;

-- AddForeignKey
ALTER TABLE "Formador" ADD CONSTRAINT "Formador_criadoPorCoordenadorId_fkey" FOREIGN KEY ("criadoPorCoordenadorId") REFERENCES "Coordenador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
