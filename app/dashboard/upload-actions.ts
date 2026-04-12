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

/**
 * Justifica falta com URL real de comprovativo (UploadThing).
 */
export async function justificarFaltaComUrl(
  presencaId: string,
  comentario: string,
  documentoUrl: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { sucesso: false, mensagem: "Não autorizado" };
    }

    const presenca = await prisma.presenca.findUnique({
      where: { id: presencaId },
      include: { formando: true },
    });

    if (!presenca) {
      return { sucesso: false, mensagem: "Presença não encontrada" };
    }

    if (presenca.formando.userId !== session.user.id) {
      return { sucesso: false, mensagem: "Não autorizado para esta presença" };
    }

    await prisma.presenca.update({
      where: { id: presencaId },
      data: {
        status: "PENDENTE" as any,
        comentarioFormando: comentario,
        documentoUrl,
        justificativa: null,
      } as any,
    });

    revalidatePath("/dashboard/assiduidade");
    return {
      sucesso: true,
      mensagem: "Pedido de justificação enviado com comprovativo!",
    };
  } catch (error) {
    console.error("[justificarFaltaComUrl]", error);
    return {
      sucesso: false,
      mensagem:
        error instanceof Error ? error.message : "Erro ao justificar falta",
    };
  }
}
