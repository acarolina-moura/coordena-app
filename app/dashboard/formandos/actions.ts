'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function adicionarFormando(dados: {
  nome: string;
  email: string;
  telefone?: string;
  cursoId: string;
}) {
  try {
    // Validar dados
    if (!dados.nome?.trim() || !dados.email?.trim() || !dados.cursoId?.trim()) {
      throw new Error('Nome, email e curso são obrigatórios');
    }

    // Verificar se email já existe
    const userExistente = await prisma.user.findUnique({
      where: { email: dados.email },
    });

    if (userExistente) {
      throw new Error('Email já está registado');
    }

    // Criar usuário e formando
    const user = await prisma.user.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        role: 'FORMANDO',
        formando: {
          create: {},
        },
      },
      include: {
        formando: true,
      },
    });

    // Criar inscrição no curso
    await prisma.inscricao.create({
      data: {
        formandoId: user.formando!.id,
        cursoId: dados.cursoId,
      },
    });

    revalidatePath('/dashboard/formandos');
    return { sucesso: true, mensagem: 'Formando adicionado com sucesso!' };
  } catch (erro) {
    return {
      sucesso: false,
      mensagem: erro instanceof Error ? erro.message : 'Erro ao adicionar formando',
    };
  }
}
