<<<<<<< HEAD
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function responderConvite(conviteId: string, acao: "ACEITE" | "RECUSADO") {
    try {
        const convite = await prisma.convite.findUnique({
            where: { id: conviteId },
            include: { Curso: true } as any
        }) as any;

        if (!convite) throw new Error("Convite não encontrado");

        await prisma.convite.update({
            where: { id: conviteId },
            data: {
                status: acao,
                dataResposta: new Date(),
            } as any
        });

        if (acao === "ACEITE" && convite.formandoId && convite.cursoId) {
            // Verificar se já está inscrito
            const existente = await prisma.inscricao.findFirst({
                where: {
                    formandoId: convite.formandoId,
                    cursoId: convite.cursoId,
                }
            });

            if (!existente) {
                await (prisma as any).inscricao.create({
                    data: {
                        formandoId: convite.formandoId,
                        cursoId: convite.cursoId,
                        dataInicio: new Date(),
                        status: "ATIVO"
                    } as any
                });
            }
        }

        revalidatePath("/dashboard/convites");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Erro ao responder convite:", error);
        return { success: false, error: "Falha ao processar resposta" };
    }
}
=======
/**
 * Server Actions - Funcionalidades de Convites
 * Arquivo com funções do servidor para gestão de convites de módulos
 * Os formadores recebem convites do coordenador para lecionar um módulo
 * e precisam aceitar ou recusar cada convite
 */
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Buscar todos os convites do formador autenticado
 * 
 * Fluxo:
 * 1. Verifica a sessão do utilizador
 * 2. Confirma que o utilizador é um formador
 * 3. Busca todos os convites desse formador
 * 4. Para cada convite, busca detalhes do módulo e curso
 * 5. Formata e retorna os dados
 * 
 * @returns Array de convites formatados para o frontend
 * @throws Erro se não autenticado ou não é formador
 */
export async function obterConvites() {
  try {
    // 1. Verificar autenticação
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error('Não autenticado');
    }

    // 2. Buscar utilizador e verificar se é formador
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { formador: true },
    });

    if (!user?.formador) {
      throw new Error('Utilizador não é formador');
    }

    // 3. Buscar todos os convites do formador
    const convites = await prisma.convite.findMany({
      where: { formadorId: user.formador.id },
      include: {
        Formador: {
          include: { user: true },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDENTE vem primeiro (alfabeticamente)
        { dataEnvio: 'desc' }, // Mais recentes primeiro
      ],
    });

    // 4. Para cada convite, buscar detalhes complementares (módulo e curso)
    const convitesComDetalhes = await Promise.all(
      convites.map(async (convite) => {
        let modulo = null;
        let curso = null;

        // Buscar info do módulo (se tem moduloId)
        if (convite.moduloId) {
          modulo = await prisma.modulo.findUnique({
            where: { id: convite.moduloId },
          });
        }

        // Buscar info do curso (se tem cursoId)
        if (convite.cursoId) {
          curso = await prisma.curso.findUnique({
            where: { id: convite.cursoId },
          });
        }

        // 5. Retornar objeto formatado para o frontend
        return {
          id: convite.id,
          modulo: modulo?.nome || 'Módulo não disponível',
          codigo: modulo?.id || '', // ID do módulo (pode ser UFCD)
          curso: curso?.nome || (modulo ? 'Curso não disponível' : ''),
          coordenador: convite.Formador?.user?.nome || 'Desconhecido', // Quem enviou o convite
          dataEnvio: convite.dataEnvio.toLocaleDateString('pt-PT'), // Formatar data para português
          status: convite.status.toLowerCase() as 'pendente' | 'aceite' | 'recusado',
        };
      })
    );

    return convitesComDetalhes;
  } catch (error) {
    console.error('Erro ao buscar convites:', error);
    throw error;
  }
}

/**
 * Responder a um convite (aceitar ou recusar)
 * 
 * Fluxo:
 * 1. Verifica autenticação
 * 2. Atualiza o status do convite com a resposta (ACEITE/RECUSADO)
 * 3. Se aceitar, adiciona o formador à tabela FormadorModulo
 * 4. Revalida o cache da página
 * 
 * @param conviteId - ID do convite a responder
 * @param resposta - ACEITE ou RECUSADO
 * @returns Convite atualizado
 * @throws Erro se não autenticado
 */
export async function responderConvite(
  conviteId: string,
  resposta: 'ACEITE' | 'RECUSADO'
) {
  try {
    // 1. Verificar autenticação
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error('Não autenticado');
    }

    // 2. Atualizar status do convite na BD
    const conviteAtualizado = await prisma.convite.update({
      where: { id: conviteId },
      data: {
        status: resposta,
        dataResposta: new Date(), // Registar quando respondeu
      },
    });

    // 3. Se foi aceite, adicionar formador ao módulo
    if (resposta === 'ACEITE' && conviteAtualizado.moduloId) {
      // Buscar dados do formador autenticado
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { formador: true },
      });

      if (user?.formador) {
        // Usar upsert para criar ou ignorar se já existe (relação FormadorModulo)
        await prisma.formadorModulo.upsert({
          where: {
            formadorId_moduloId: {
              formadorId: user.formador.id,
              moduloId: conviteAtualizado.moduloId,
            },
          },
          update: {}, // Se já existe, não fazer nada
          create: { // Se não existe, criar nova relação
            formadorId: user.formador.id,
            moduloId: conviteAtualizado.moduloId,
          },
        });
      }
    }

    // 4. Revalidar cache para atualizar a página
    revalidatePath('/dashboard/convites');
    return conviteAtualizado;
  } catch (error) {
    console.error('Erro ao responder convite:', error);
    throw error;
  }
}
>>>>>>> 56238e2b0e5f26a79e4271bffc3fe9ccc15ee8e5
