"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logError } from "@/lib/logger";

export async function updateUserPerfil(
  _userId: string, // ignorado — usamos session.user.id
  nome: string,
  email: string,
  telefone: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { sucesso: false, mensagem: "Não autorizado" };
    }

    // Verificar email duplicado (exceto o próprio utilizador)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser && existingUser.id !== session.user.id) {
      return { sucesso: false, mensagem: "Email já em uso por outro utilizador" };
    }

    const resultado = await prisma.user.update({
      where: { id: session.user.id },
      data: { nome, email, telefone },
    });

    revalidatePath("/dashboard/perfil");
    return { sucesso: true, mensagem: "Perfil actualizado com sucesso!" };
  } catch (erro) {
    logError("Erro em updateUserPerfil:", erro);
    return {
      sucesso: false,
      mensagem: erro instanceof Error ? erro.message : "Erro ao actualizar perfil",
    };
  }
}

export async function updateFormadorPerfil(
  _userId: string, // ignorado
  especialidade: string,
  competencias: string,
  linkedin: string = "",
  github: string = "",
  idioma: string = "",
  nacionalidade: string = "",
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { sucesso: false, mensagem: "Não autorizado" };
    }
    // Só o próprio formador ou um coordenador podem editar
    if (session.user.role !== "FORMADOR" && session.user.role !== "COORDENADOR") {
      return { sucesso: false, mensagem: "Não autorizado" };
    }
    // Se for formador, só pode editar o seu próprio perfil
    if (session.user.role === "FORMADOR") {
      const formador = await prisma.formador.findUnique({
        where: { userId: session.user.id },
      });
      if (!formador) {
        return { sucesso: false, mensagem: "Formador não encontrado" };
      }
    }

    const formador = await prisma.formador.findUnique({
      where: { userId: session.user.id },
    });
    if (!formador) {
      return { sucesso: false, mensagem: "Formador não encontrado" };
    }

    await prisma.formador.update({
      where: { id: formador.id },
      data: { especialidade, competencias, linkedin, github, idioma, nacionalidade },
    });

    revalidatePath("/dashboard/perfil");
    return { sucesso: true, mensagem: "Perfil actualizado com sucesso!" };
  } catch (erro) {
    logError("Erro em updateFormadorPerfil:", erro);
    return {
      sucesso: false,
      mensagem: erro instanceof Error ? erro.message : "Erro ao actualizar perfil",
    };
  }
}
