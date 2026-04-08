-- CreateTable
CREATE TABLE "MaterialApoio" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "fileUrl" TEXT NOT NULL,
    "tipo" TEXT,
    "moduloId" TEXT NOT NULL,
    "formadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialApoio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MaterialApoio_moduloId_idx" ON "MaterialApoio"("moduloId");

-- CreateIndex
CREATE INDEX "MaterialApoio_formadorId_idx" ON "MaterialApoio"("formadorId");

-- AddForeignKey
ALTER TABLE "MaterialApoio" ADD CONSTRAINT "MaterialApoio_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialApoio" ADD CONSTRAINT "MaterialApoio_formadorId_fkey" FOREIGN KEY ("formadorId") REFERENCES "Formador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
