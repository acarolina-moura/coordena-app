'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { auth } from "@/auth";
import { logError } from "@/lib/logger";

export async function updateFormandoPerfil(
  _userId: string, // ignorado
  nome: string,
  email: string,
  novaSenha?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { sucesso: false, mensagem: "Não autorizado" };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== session.user.id) {
      return { sucesso: false, mensagem: "Este email já está em uso por outro utilizador." };
    }

    const data: { nome: string; email: string; senha?: string } = { nome, email };
    if (novaSenha && novaSenha.trim() !== '') {
      data.senha = await bcrypt.hash(novaSenha, 10);
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    revalidatePath('/dashboard/perfil');
    return { sucesso: true, mensagem: 'Perfil atualizado com sucesso!' };
  } catch (error) {
    logError('Erro ao atualizar perfil:', error);
    return { sucesso: false, mensagem: 'Erro ao atualizar o perfil. Tente novamente.' };
  }
}
