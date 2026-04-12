-- Migration: unify_documento_model
-- 1. Adicionar formadorId a Documento (se ainda nao existir)
-- 2. Tornar campos nullable
-- 3. Adicionar constraint unica para formadorId + tipo
-- 4. Migrar dados de DocumentoFormador para Documento
-- 5. Remover tabela DocumentoFormador

-- Passo 1: Adicionar colunas se necessario
ALTER TABLE "Documento" ADD COLUMN IF NOT EXISTS "formadorId" TEXT;
ALTER TABLE "Documento" ADD COLUMN IF NOT EXISTS "fileUrl" TEXT;
ALTER TABLE "Documento" ADD COLUMN IF NOT EXISTS "tipo" TEXT;

-- Passo 2: Tornar nullable
ALTER TABLE "Documento" ALTER COLUMN "numero" DROP NOT NULL;
ALTER TABLE "Documento" ALTER COLUMN "dataEmissao" DROP NOT NULL;
ALTER TABLE "Documento" ALTER COLUMN "formandoId" DROP NOT NULL;

-- Passo 3: Migrar dados de DocumentoFormador para Documento
INSERT INTO "Documento" ("id", "tipo", "numero", "dataEmissao", "dataExpiracao", "status", "formadorId", "createdAt", "fileUrl")
SELECT "id", "tipo", "numero", "dataEmissao", "dataExpiracao", "status", "formadorId", "createdAt", "fileUrl"
FROM "DocumentoFormador"
ON CONFLICT ("id") DO NOTHING;

-- Passo 4: Adicionar constraint unica
ALTER TABLE "Documento" ADD CONSTRAINT "formadorId_tipo" UNIQUE ("formadorId", "tipo");

-- Passo 5: Remover foreign keys de DocumentoFormador
ALTER TABLE "DocumentoFormador" DROP CONSTRAINT IF EXISTS "DocumentoFormador_formadorId_fkey";

-- Passo 6: Remover tabela DocumentoFormador
DROP TABLE IF EXISTS "DocumentoFormador";
