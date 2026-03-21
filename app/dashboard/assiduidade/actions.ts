'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function justificarFalta(presencaId: string, comentario: string, documentoUrl?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { sucesso: false, mensagem: 'Não autorizado' };
    }

    // Verificar se a presença pertence ao formando logado
    const presenca = await prisma.presenca.findUnique({
      where: { id: presencaId },
      include: { formando: true },
    });

    if (!presenca) {
      return { sucesso: false, mensagem: 'Presença não encontrada' };
    }

    if (presenca.formando.userId !== session.user.id) {
      return { sucesso: false, mensagem: 'Não autorizado para esta presença' };
    }

    // Atualizar a presença para PENDENTE com os dados da justificação
    await prisma.presenca.update({
      where: { id: presencaId },
      data: {
        status: 'PENDENTE' as any,
        comentarioFormando: comentario,
        documentoUrl: documentoUrl || null,
        justificativa: null,
      } as any,
    });

    revalidatePath('/dashboard/assiduidade');
    return { sucesso: true, mensagem: 'Pedido de justificação enviado para análise!' };
  } catch (erro) {
    console.error('Erro ao justificar falta:', erro);
    return {
      sucesso: false,
      mensagem: erro instanceof Error ? erro.message : 'Erro ao processar justificação',
    };
  }
}
