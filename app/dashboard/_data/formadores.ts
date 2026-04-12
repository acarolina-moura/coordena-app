import { prisma } from "@/lib/prisma";
import { filtroFormadoresCoordenador, filtroModulosCoordenador, getCoordenadorIdOrNull } from "@/lib/coordenador-utils";

// Buscar todos os formadores do coordenador logado
export async function getFormadores() {
  const formadoresFilter = await filtroFormadoresCoordenador();
  
  return await prisma.formador.findMany({
    where: formadoresFilter,
    include: {
      user: true,
      modulosLecionados: {
        where: {
          modulo: await filtroModulosCoordenador()
        }
      },
      documentos: true,
    },
  });
}

// Buscar formador por ID (apenas se pertencer aos cursos do coordenador)
export async function getFormadorById(id: string) {
  const modulosFilter = await filtroModulosCoordenador();
  const coordenadorId = await getCoordenadorIdOrNull();
  
  const formador = await prisma.formador.findUnique({
    where: { id },
    include: {
      user: true,
      modulosLecionados: {
        where: {
          modulo: modulosFilter
        }
      },
      documentos: true,
    },
  });
  
  // Verificar se o formador tem módulos atribuídos nos cursos do coordenador
  if (formador && formador.modulosLecionados.length === 0) {
    // Verificar se ele está atribuído a algum módulo dos cursos do coordenador
    const formadorWithAllModules = await prisma.formador.findUnique({
      where: { id },
      include: {
        modulosLecionados: {
          include: {
            modulo: {
              include: {
                curso: { select: { coordenadorId: true } }
              }
            }
          }
        }
      }
    });
    
    const temAcesso = formadorWithAllModules?.modulosLecionados.some(
      fm => fm.modulo.curso.coordenadorId === coordenadorId
    );
    
    if (!temAcesso) return null;
  }
  
  return formador;
}

// Adicionar novo formador (apenas para coordenador logado)
export async function addFormador(data: { userId: string; especialidade?: string }) {
  // O formador será adicionado sem vínculo direto com coordenador
  // O vínculo é feito através dos módulos/cursos
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
