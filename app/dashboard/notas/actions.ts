'use server';

/**
 * ============================================================================
 * SERVER ACTIONS - SISTEMA DE AVALIAÇÕES COM TEMPLATES
 * ============================================================================
 * 
 * Este arquivo contém as ações do servidor para gerenciar templates de 
 * avaliação e notas parciais. Cada formador pode definir um template
 * diferente para cada módulo que leciona.
 * 
 * As operações incluem:
 * - Criar/atualizar templates de avaliação
 * - Obter template para um módulo
 * - Salvar notas parciais dos alunos
 * - Obter notas parciais por aluno
 * ============================================================================
 */

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * Salvar ou atualizar um template de avaliação para um módulo
 * 
 * @param moduloId - ID do módulo
 * @param items - Array de items do template com nome e peso
 * @returns O template criado/atualizado
 */
export async function salvarTemplateAvaliacao(
  moduloId: string,
  items: Array<{ nome: string; peso: number; ordem: number }>
) {
  try {
    // Validar autenticação
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'FORMADOR') {
      throw new Error('Não autorizado');
    }

    // Buscar formador
    const formador = await prisma.formador.findUnique({
      where: { userId: session.user.id },
    });

    if (!formador) {
      throw new Error('Formador não encontrado');
    }

    // Validar peso total (máx 80%)
    const pesoTotal = items.reduce((acc, item) => acc + item.peso, 0);
    if (pesoTotal !== 80) {
      throw new Error(
        `Peso total dos componentes deve ser 80%. Atual: ${pesoTotal}%`
      );
    }

    // Procurar template existente
    let template = await prisma.templateAvaliacao.findUnique({
      where: {
        formadorId_moduloId: {
          formadorId: formador.id,
          moduloId: moduloId,
        },
      },
      include: { items: true },
    });

    if (template) {
      // Atualizar: deletar items antigos
      await prisma.itemTemplateAvaliacao.deleteMany({
        where: { templateId: template.id },
      });

      // Criar novos items
      await prisma.itemTemplateAvaliacao.createMany({
        data: items.map((item) => ({
          templateId: template!.id,
          nome: item.nome,
          peso: item.peso,
          ordem: item.ordem,
        })),
      });
    } else {
      // Criar novo template
      template = await prisma.templateAvaliacao.create({
        data: {
          formadorId: formador.id,
          moduloId: moduloId,
          items: {
            createMany: {
              data: items.map((item) => ({
                nome: item.nome,
                peso: item.peso,
                ordem: item.ordem,
              })),
            },
          },
        },
        include: { items: true },
      });
    }

    return { success: true, template };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao salvar template:', message);
    return { success: false, error: message };
  }
}

/**
 * Obter o template de avaliação para um módulo e formador
 * 
 * @param moduloId - ID do módulo
 * @returns O template com seus items, ou null se não existir
 */
export async function obterTemplateAvaliacao(moduloId: string) {
  try {
    // Validar autenticação
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'FORMADOR') {
      throw new Error('Não autorizado');
    }

    // Buscar formador
    const formador = await prisma.formador.findUnique({
      where: { userId: session.user.id },
    });

    if (!formador) {
      throw new Error('Formador não encontrado');
    }

    // Buscar template
    const template = await prisma.templateAvaliacao.findUnique({
      where: {
        formadorId_moduloId: {
          formadorId: formador.id,
          moduloId: moduloId,
        },
      },
      include: {
        items: {
          orderBy: { ordem: 'asc' },
        },
      },
    });

    return { success: true, template };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao obter template:', message);
    return { success: false, error: message };
  }
}

/**
 * Salvar notas parciais (valores de avaliação) para um aluno
 * 
 * @param moduloId - ID do módulo
 * @param formandoId - ID do aluno
 * @param notas - Mapa de itemId -> valor (0-20)
 * @returns Confirmação da operação
 */
export async function salvarNotasParciais(
  moduloId: string,
  formandoId: string,
  notas: Record<string, number>
) {
  try {
    // Validar autenticação
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'FORMADOR') {
      throw new Error('Não autorizado');
    }

    // Buscar formador
    const formador = await prisma.formador.findUnique({
      where: { userId: session.user.id },
    });

    if (!formador) {
      throw new Error('Formador não encontrado');
    }

    // Buscar template
    const template = await prisma.templateAvaliacao.findUnique({
      where: {
        formadorId_moduloId: {
          formadorId: formador.id,
          moduloId: moduloId,
        },
      },
      include: { items: true },
    });

    if (!template) {
      throw new Error('Template não encontrado para este módulo');
    }

    // Salvar ou atualizar notas parciais
    for (const [itemId, valor] of Object.entries(notas)) {
      // Validar valor
      if (valor < 0 || valor > 20) {
        throw new Error(`Nota deve estar entre 0 e 20. Recebido: ${valor}`);
      }

      // Verificar se item existe no template
      const itemExists = template.items.some((item) => item.id === itemId);
      if (!itemExists) {
        throw new Error(`Item ${itemId} não encontrado no template`);
      }

      // Upsert nota parcial
      await prisma.notaParcial.upsert({
        where: {
          formandoId_itemId: {
            formandoId: formandoId,
            itemId: itemId,
          },
        },
        update: {
          valor: valor,
        },
        create: {
          formandoId: formandoId,
          itemId: itemId,
          templateId: template.id,
          valor: valor,
        },
      });
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao salvar notas:', message);
    return { success: false, error: message };
  }
}

/**
 * Obter todas as notas parciais de um aluno em um módulo
 * 
 * @param formandoId - ID do aluno
 * @param moduloId - ID do módulo
 * @returns Array de notas parciais com seus items
 */
export async function obterNotasParciaisAluno(
  formandoId: string,
  moduloId: string
) {
  try {
    // Validar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Não autorizado');
    }

    // Buscar todas as notas parciais deste aluno neste módulo
    const notas = await prisma.notaParcial.findMany({
      where: {
        formandoId: formandoId,
        template: {
          moduloId: moduloId,
        },
      },
      include: {
        item: true,
      },
    });

    return { success: true, notas };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao obter notas:', message);
    return { success: false, error: message };
  }
}

/**
 * Calcular a nota final de um aluno em um módulo
 * 
 * Fórmula:
 * NotaFinal = (Assiduidade × 0.20) + (MédiaComponentes × 0.80)
 * 
 * @param formandoId - ID do aluno
 * @param moduloId - ID do módulo
 * @param percentualAssiduidade - Percentual de presenças (0-100)
 * @returns Nota final (0-20) ou null se não houver notas
 */
export async function calcularNotaFinal(
  formandoId: string,
  moduloId: string,
  percentualAssiduidade: number
) {
  try {
    // Validar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Não autorizado');
    }

    // Buscar todas as notas parciais
    const notas = await prisma.notaParcial.findMany({
      where: {
        formandoId: formandoId,
        template: {
          moduloId: moduloId,
        },
      },
    });

    if (notas.length === 0) {
      return { success: true, notaFinal: null };
    }

    // Calcular média das notas (já em escala 0-20)
    const mediaComponentes =
      notas.reduce((acc, nota) => acc + nota.valor, 0) / notas.length;

    // Converter assiduidade de percentual (0-100) para escala 0-20
    const notaAssiduidade = (percentualAssiduidade / 100) * 20;

    // Aplicar fórmula
    const notaFinal =
      notaAssiduidade * 0.2 + mediaComponentes * 0.8;

    return { success: true, notaFinal: Math.round(notaFinal * 10) / 10 };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao calcular nota final:', message);
    return { success: false, error: message };
  }
}

/**
 * Obter módulos com alunos para a página de notas
 * Carrega todos os módulos do formador com lista de alunos inscritos
 * 
 * @returns Array de módulos com alunos e presenças
 */
export async function obterModulosComAlunos() {
  try {
    // Validar autenticação
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'FORMADOR') {
      throw new Error('Não autorizado');
    }

    const formador = await prisma.formador.findUnique({
      where: { userId: session.user.id },
      include: {
        modulosLecionados: {
          include: {
            modulo: {
              include: {
                curso: true,
                aulas: true,
              },
            },
          },
        },
      },
    });

    if (!formador) {
      return { success: true, modulos: [], message: 'Formador não encontrado' };
    }

    // Para cada módulo, obter alunos inscritos no curso e suas presenças
    const modulosComDetalhes = await Promise.all(
      formador.modulosLecionados.map(async (fm) => {
        // Obter alunos inscritos neste curso
        const inscricoes = await prisma.inscricao.findMany({
          where: { cursoId: fm.modulo.curso.id },
          include: {
            formando: {
              include: {
                user: true,
              },
            },
          },
        });

        // Contar total de aulas deste módulo com este formador
        const totalAulas = await prisma.aula.count({
          where: {
            moduloId: fm.modulo.id,
            formadorId: formador.id,
          },
        });

        // Para cada aluno, calcular presenças a partir das aulas
        const alunos = inscricoes.map((insc) => {
          return {
            id: insc.formando.id,
            nome: insc.formando.user.nome,
            presencas: 0, // Placeholder - pode ser preenchido dinamicamente
            totalSessoes: totalAulas,
          };
        });

        return {
          id: fm.modulo.id,
          nome: fm.modulo.nome,
          alunos,
        };
      })
    );

    return { success: true, modulos: modulosComDetalhes };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao obter módulos:', message);
    return { success: false, error: message, modulos: [] };
  }
}
