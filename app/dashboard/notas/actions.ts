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
import { logError } from '@/lib/logger';

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
    logError('Erro ao salvar template:', message);
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
    logError('Erro ao obter template:', message);
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

    // Buscar ou criar template
    let template = await prisma.templateAvaliacao.findUnique({
      where: {
        formadorId_moduloId: {
          formadorId: formador.id,
          moduloId: moduloId,
        },
      },
      include: { items: true },
    });

    let templateWasJustCreated = false;

    // Se não existe template, criar um automaticamente
    if (!template) {
      templateWasJustCreated = true;
      template = await prisma.templateAvaliacao.create({
        data: {
          formadorId: formador.id,
          moduloId: moduloId,
          items: {
            create: Object.entries(notas).map(([_, valor], index) => {
              const peso = Math.round((100 / Object.keys(notas).length) * 100) / 100;
              return {
                nome: `Componente ${index + 1}`,
                peso,
                ordem: index,
              };
            }),
          },
        },
        include: { items: true },
      });
    }

    // Salvar ou atualizar notas parciais
    if (templateWasJustCreated) {
      // Se template foi criado agora, guardar as notas em ordem dos items criados
      const notasArray = Object.values(notas);
      for (let i = 0; i < template.items.length && i < notasArray.length; i++) {
        const valor = notasArray[i];
        if (typeof valor === 'number' && valor >= 0 && valor <= 20) {
          await prisma.notaParcial.upsert({
            where: {
              formandoId_itemId: {
                formandoId: formandoId,
                itemId: template.items[i].id,
              },
            },
            update: { valor: valor },
            create: {
              formandoId: formandoId,
              itemId: template.items[i].id,
              templateId: template.id,
              valor: valor,
            },
          });
        }
      }
    } else {
      // Se template já existia, validar itemIds como de costume
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
          update: { valor: valor },
          create: {
            formandoId: formandoId,
            itemId: itemId,
            templateId: template.id,
            valor: valor,
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    logError('Erro ao salvar notas:', message);
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
    // Procura em QUALQUER template do módulo, não apenas do formador atual
    const notas = await prisma.notaParcial.findMany({
      where: {
        formandoId: formandoId,
        item: {
          template: {
            moduloId: moduloId,
          },
        },
      },
      include: {
        item: {
          include: {
            template: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, notas };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    logError('Erro ao obter notas:', message);
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

    // Buscar template com seus items
    const template = await prisma.templateAvaliacao.findFirst({
      where: {
        moduloId: moduloId,
      },
      include: {
        items: true,
      },
    });

    // Buscar todas as notas parciais
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

    if (notas.length === 0) {
      return { success: true, notaFinal: null };
    }

    // Calcular média ponderada das notas usando os pesos do template
    let mediaComponentes = 0;
    let pesoTotal = 0;

    if (template && template.items.length > 0) {
      // Média ponderada pelos pesos do template
      for (const nota of notas) {
        const item = template.items.find(i => i.id === nota.itemId);
        if (item) {
          mediaComponentes += nota.valor * (item.peso / 100);
          pesoTotal += item.peso / 100;
        }
      }
      // Normalizar pelo peso total (caso não tenha todos os items preenchidos)
      if (pesoTotal > 0) {
        mediaComponentes = mediaComponentes / pesoTotal;
      }
    } else {
      // Fallback: média simples se não houver template
      mediaComponentes =
        notas.reduce((acc, nota) => acc + nota.valor, 0) / notas.length;
    }

    // Converter assiduidade de percentual (0-100) para escala 0-20
    const notaAssiduidade = (percentualAssiduidade / 100) * 20;

    // Aplicar fórmula: 20% assiduidade + 80% componentes
    const notaFinal =
      notaAssiduidade * 0.2 + mediaComponentes * 0.8;

    const notaFinalArredondada = Math.round(notaFinal * 10) / 10;

    // Guardar a nota final na tabela Avaliacao
    const formador = await prisma.formador.findUnique({
      where: { userId: session.user.id },
    });

    if (formador) {
      // Verificar se já existe avaliação para este módulo/formando
      const avaliacaoExistente = await prisma.avaliacao.findFirst({
        where: {
          moduloId: moduloId,
          formandoId: formandoId,
          formadorId: formador.id,
        },
      });

      if (avaliacaoExistente) {
        // Atualizar avaliação existente
        await prisma.avaliacao.update({
          where: { id: avaliacaoExistente.id },
          data: { nota: notaFinalArredondada },
        });
      } else {
        // Criar nova avaliação
        await prisma.avaliacao.create({
          data: {
            nota: notaFinalArredondada,
            moduloId: moduloId,
            formandoId: formandoId,
            formadorId: formador.id,
            descricao: `Nota final calculada automaticamente (${percentualAssiduidade}% assiduidade + componentes)`,
          },
        });
      }
    }

    return { success: true, notaFinal: notaFinalArredondada };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    logError('Erro ao calcular nota final:', message);
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
    });

    if (!formador) {
      return { success: true, modulos: [], message: 'Formador não encontrado' };
    }

    // Combinação de 2 cenários:
    // 1. Módulos onde este formador tem FormadorModulo (é o "dono")
    // 2. Módulos que NÃO têm NENHUM FormadorModulo E este formador tem aulas neles

    // Obter módulos via FormadorModulo (convites aceites) - CENÁRIO 1
    const modulosFormadorModulo = await prisma.formadorModulo.findMany({
      where: { formadorId: formador.id },
      include: {
        modulo: {
          include: {
            curso: true,
          },
        },
      },
    });

    console.log(`[DEBUG] Módulos via FormadorModulo (cenário 1): ${modulosFormadorModulo.length}`);
    modulosFormadorModulo.forEach((fm) => {
      console.log(`  - ${fm.modulo.nome} (ID: ${fm.modulo.id})`);
    });

    // Obter IDs dos módulos que já têm FormadorModulo associado
    const modulosComFormadorModulo = await prisma.modulo.findMany({
      where: {
        formadores: {
          some: {}, // Se tem QUALQUER FormadorModulo
        },
      },
      select: { id: true },
    });
    const modulosComFormadorModuloIds = new Set(modulosComFormadorModulo.map((m) => m.id));
    console.log(`[DEBUG] Módulos que TÊM FormadorModulo: ${modulosComFormadorModuloIds.size}`);

    // Obter módulos do formador atual que NÃO têm FormadorModulo (CENÁRIO 2)
    const aulasFormadorAtualSemControle = await prisma.aula.findMany({
      where: { 
        formadorId: formador.id,
        modulo: {
          formadores: {
            none: {}, // Módulos QUE NÃO TÊM FormadorModulo
          },
        },
      },
      select: { moduloId: true },
      distinct: ['moduloId'],
    });

    console.log(`[DEBUG] Módulos via Aulas SEM controle de FormadorModulo (cenário 2): ${aulasFormadorAtualSemControle.length}`);
    aulasFormadorAtualSemControle.forEach((a) => {
      console.log(`  - Módulo ID: ${a.moduloId}`);
    });

    // Combinar IDs únicos de módulos
    const moduloIdsSet = new Set<string>();
    modulosFormadorModulo.forEach((fm) => moduloIdsSet.add(fm.modulo.id));
    aulasFormadorAtualSemControle.forEach((a) => {
      if (a.moduloId) {
        moduloIdsSet.add(a.moduloId);
      }
    });

    if (moduloIdsSet.size === 0) {
      return { success: true, modulos: [], message: 'Nenhum módulo encontrado para este formador' };
    }

    console.log(`[DEBUG] Encontrados ${moduloIdsSet.size} módulos únicos:`, Array.from(moduloIdsSet));

    // Buscar todos os módulos com detalhes
    const modulos = await prisma.modulo.findMany({
      where: { id: { in: Array.from(moduloIdsSet) } },
      include: {
        curso: true,
      },
      orderBy: { nome: 'asc' },
    });

    console.log(`[DEBUG] Módulos retornados pela query: ${modulos.length}`);
    modulos.forEach((m) => {
      console.log(`  - ${m.nome} (ID: ${m.id})`);
    });

    // Para cada módulo, obter alunos inscritos no curso e suas presenças
    const modulosComDetalhes = await Promise.all(
      modulos.map(async (modulo) => {
        // Obter alunos inscritos neste curso
        const inscricoes = await prisma.inscricao.findMany({
          where: { cursoId: modulo.cursoId },
          include: {
            formando: {
              include: {
                user: true,
              },
            },
          },
        });

        console.log(`[DEBUG] Módulo "${modulo.nome}": encontradas ${inscricoes.length} inscrições no curso`);

        // Contar total de aulas deste módulo com este formador
        const totalAulas = await prisma.aula.count({
          where: {
            moduloId: modulo.id,
            formadorId: formador.id,
          },
        });

        console.log(`[DEBUG] Módulo "${modulo.nome}": ${totalAulas} aulas com este formador`);

        // Para cada aluno, calcular presenças a partir das aulas
        const alunos = await Promise.all(
          inscricoes.map(async (insc) => {
            // Contar presenças PRESENTE deste aluno nas aulas deste módulo/formador
            const presencasPresente = await prisma.presenca.count({
              where: {
                formandoId: insc.formando.id,
                status: 'PRESENTE',
                aula: {
                  moduloId: modulo.id,
                  formadorId: formador.id,
                },
              },
            });

            return {
              id: insc.formando.id,
              nome: insc.formando.user.nome,
              presencas: presencasPresente,
              totalSessoes: totalAulas,
            };
          })
        );

        console.log(`[DEBUG] Módulo "${modulo.nome}": retornando ${alunos.length} alunos`);

        return {
          id: modulo.id,
          nome: modulo.nome,
          alunos,
        };
      })
    );

    console.log(`[DEBUG] Módulos com detalhes a retornar: ${modulosComDetalhes.length}`);

    return { success: true, modulos: modulosComDetalhes };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    logError('Erro ao obter módulos:', message);
    return { success: false, error: message, modulos: [] };
  }
}

/**
 * Obter todas as notas finais (Avaliacao) de um formador para seus módulos
 * 
 * @returns Mapa de { formandoId: notaFinal }
 */
export async function obterNotasFinais() {
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

    // Buscar todas as avaliações (notas finais) deste formador
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        formadorId: formador.id,
      },
    });

    // Mapear para formato { moduloId_formandoId: notaFinal }
    const notasFinaisMap: Record<string, number> = {};
    avaliacoes.forEach((av) => {
      const key = `${av.moduloId}_${av.formandoId}`; // Chave composta por módulo
      notasFinaisMap[key] = av.nota;
    });

    return { success: true, notasFinais: notasFinaisMap };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao obter notas finais:', message);
    return { success: false, error: message, notasFinais: {} };
  }
}

/**
 * Obter trabalhos entregues por um aluno num módulo
 * 
 * @param formandoId - ID do aluno
 * @param moduloId - ID do módulo
 * @returns Array de items com status de entrega
 */
export async function obterTrabalhosPorAluno(
  formandoId: string,
  moduloId: string
) {
  try {
    // Validar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Não autorizado');
    }

    // Buscar template do módulo
    const template = await prisma.templateAvaliacao.findFirst({
      where: {
        moduloId: moduloId,
      },
      include: {
        items: {
          orderBy: { ordem: 'asc' },
        },
      },
    });

    if (!template) {
      return { success: true, trabalhos: [] };
    }

    // Buscar submissões do aluno
    const submissoes = await prisma.submissaoTrabalho.findMany({
      where: {
        formandoId: formandoId,
        item: {
          templateId: template.id,
        },
      },
      include: {
        item: true,
      },
    });

    // Mapear items com status de entrega
    const trabalhos = template.items.map((item) => {
      const submissao = submissoes.find((sub) => sub.itemId === item.id);
      return {
        itemId: item.id,
        nome: item.nome,
        ordem: item.ordem,
        peso: item.peso,
        entregue: !!submissao,
        dataEntrega: submissao?.dataEntrega?.toISOString() || null,
        ficheiro: submissao?.ficheiroUrl || null,
        comentario: submissao?.comentario || null,
      };
    });

    return { success: true, trabalhos };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao obter trabalhos:', message);
    return { success: false, error: message, trabalhos: [] };
  }
}
