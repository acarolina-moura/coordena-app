'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function updateFormandoPerfil(
  userId: string,
  nome: string,
  email: string,
  novaSenha?: string
) {
  try {
    // Verificar se o email já está em uso por outro utilizador
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser && existingUser.id !== userId) {
      return { sucesso: false, mensagem: 'Este email já está em uso por outro utilizador.' }
    }

    const data: any = {
      nome,
      email,
    }

    if (novaSenha && novaSenha.trim() !== '') {
      data.senha = await bcrypt.hash(novaSenha, 10)
    }

    await prisma.user.update({
      where: { id: userId },
      data,
    })

    revalidatePath('/dashboard/perfil')
    return { sucesso: true, mensagem: 'Perfil atualizado com sucesso!' }
  } catch (error) {
    console.error('Erro ao atualizar perfil do formando:', error)
    return { sucesso: false, mensagem: 'Erro ao atualizar o perfil. Tente novamente mais tarde.' }
  }
}
