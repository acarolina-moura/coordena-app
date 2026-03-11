import { prisma } from "@/lib/prisma";

// Buscar todos os formadores
export async function getFormadores() {
  return await prisma.formador.findMany({
    include: {
      user: true,
      modulosLecionados: true,
      documentos: true,
    },
  });
}

// Buscar formador por ID
export async function getFormadorById(id: string) {
  return await prisma.formador.findUnique({
    where: { id },
    include: {
      user: true,
      modulosLecionados: true,
      documentos: true,
    },
  });
}

// Adicionar novo formador
export async function addFormador(data: { userId: string; especialidade?: string }) {
  return await prisma.formador.create({
    data,
  });
}

// Atualizar formador
export async function updateFormador(id: string, data: Partial<{ especialidade: string }>) {
  return await prisma.formador.update({
    where: { id },
    data,
  });
}

// Remover formador
export async function removeFormador(id: string) {
  return await prisma.formador.delete({
    where: { id },
  });
}
