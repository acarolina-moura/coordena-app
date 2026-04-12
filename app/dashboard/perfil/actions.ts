"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserPerfil(
  userId: string,
  nome: string,
  email: string,
  telefone: string,
) {
  try {
    const resultado = await prisma.user.update({
      where: { id: userId },
      data: {
        nome,
        email,
        telefone,
      },
    });

    revalidatePath("/dashboard/perfil");
    return { sucesso: true, mensagem: "Perfil actualizado com sucesso!" };
  } catch (erro) {
    console.error("❌ Erro em updateUserPerfil:", erro);
    return {
      sucesso: false,
      mensagem:
        erro instanceof Error ? erro.message : "Erro ao actualizar perfil",
    };
  }
}

export async function updateFormadorPerfil(
  userId: string,
  especialidade: string,
  competencias: string,
  linkedin: string = "",
  github: string = "",
  idioma: string = "",
  nacionalidade: string = "",
) {
  try {
    const formador = await prisma.formador.findUnique({
      where: { userId },
    });

    if (!formador) {
      return { sucesso: false, mensagem: "Formador não encontrado" };
    }

    const resultado = await prisma.formador.update({
      where: { id: formador.id },
      data: {
        especialidade,
        competencias,
        linkedin,
        github,
        idioma,
        nacionalidade,
      },
    });

    revalidatePath("/dashboard/perfil");
    return { sucesso: true, mensagem: "Perfil actualizado com sucesso!" };
  } catch (erro) {
    console.error("❌ Erro em updateFormadorPerfil:", erro);
    return {
      sucesso: false,
      mensagem:
        erro instanceof Error ? erro.message : "Erro ao actualizar perfil",
    };
  }
}
