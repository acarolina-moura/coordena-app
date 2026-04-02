-- DropIndex
DROP INDEX "Disponibilidade_formadorId_diaSemana_hora_minuto_key";

-- AlterTable
ALTER TABLE "Disponibilidade" ADD COLUMN     "semana" INTEGER NOT NULL DEFAULT 1;
