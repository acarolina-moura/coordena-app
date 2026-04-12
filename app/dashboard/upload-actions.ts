"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Atualiza a imagem de perfil (avatar) do utilizador autenticado.
 * O ficheiro já foi enviado para o UploadThing — esta função apenas
 * atualiza o campo `image` do model `User`.
 */
export async function updateAvatar(imageUrl: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Não autorizado — faz login primeiro");
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    revalidatePath("/dashboard/perfil");
    revalidatePath("/");
    return { success: true, mensagem: "Avatar atualizado com sucesso!" };
  } catch (error) {
    console.error("[updateAvatar]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar avatar",
    };
  }
}

/**
 * Regista um material de apoio na base de dados após upload feito via UploadThing.
 */
export async function registarMaterialApoio(
  fileUrl: string,
  titulo: string,
  descricao: string,
  moduloId: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Não autorizado");
    }

    const formador = await prisma.formador.findUnique({
      where: { userId: session.user.id },
    });
    if (!formador) throw new Error("Formador não encontrado");

    // Validar que o módulo pertence ao formador
    const moduloFormador = await prisma.formadorModulo.findFirst({
      where: { formadorId: formador.id, moduloId },
    });
    if (!moduloFormador) {
      throw new Error("Não tens permissão para este módulo");
    }

    await prisma.materialApoio.create({
      data: {
        titulo,
        descricao: descricao || null,
        fileUrl,
        tipo: fileUrl.split(".").pop()?.toUpperCase() ?? "FILE",
        formadorId: formador.id,
        moduloId,
      },
    });

    revalidatePath("/dashboard/materiais");
    return { success: true, mensagem: "Material de apoio publicado!" };
  } catch (error) {
    console.error("[registarMaterialApoio]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao publicar material",
    };
  }
}

/**
 * Regista a submissão de um trabalho na base de dados após upload via UploadThing.
 */
export async function registarSubmissao(
  itemId: string,
  fileUrl: string,
  comentario: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Não autorizado");
    }

    const formando = await prisma.formando.findUnique({
      where: { userId: session.user.id },
    });
    if (!formando) throw new Error("Formando não encontrado");

    // Verifica se já existe submissão para este item
    const existente = await prisma.submissaoTrabalho.findFirst({
      where: { itemId, formandoId: formando.id },
    });

    if (existente) {
      await prisma.submissaoTrabalho.update({
        where: { id: existente.id },
        data: {
          ficheiroUrl: fileUrl,
          comentario: comentario || null,
          dataEntrega: new Date(),
        },
      });
    } else {
      await prisma.submissaoTrabalho.create({
        data: {
          ficheiroUrl: fileUrl,
          comentario: comentario || null,
          itemId,
          formandoId: formando.id,
          dataEntrega: new Date(),
        },
      });
    }

    revalidatePath("/dashboard/trabalhos");
    return { success: true, mensagem: "Trabalho submetido com sucesso!" };
  } catch (error) {
    console.error("[registarSubmissao]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao submeter trabalho",
    };
  }
}
