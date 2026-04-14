"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logError } from "@/lib/logger";

export async function justificarFalta(
  presencaId: string,
  comentario: string,
  documentoUrl?: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { sucesso: false, mensagem: "Não autorizado" };
    }

    // Verificar se a presença pertence ao formando logado
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

    // Atualizar a presença para PENDENTE com os dados da justificação
    await prisma.presenca.update({
      where: { id: presencaId },
      data: {
        status: "PENDENTE",
        comentarioFormando: comentario,
        documentoUrl: documentoUrl || null,
        justificativa: null,
      },
    });

    revalidatePath("/dashboard/assiduidade");
    return {
      sucesso: true,
      mensagem: "Pedido de justificação enviado para análise!",
    };
  } catch (erro) {
    logError("Erro ao justificar falta:", erro);
    return {
      sucesso: false,
      mensagem:
        erro instanceof Error ? erro.message : "Erro ao processar justificação",
    };
  }
}

export async function aprovarJustificativa(presencaId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "COORDENADOR") {
      return { sucesso: false, mensagem: "Não autorizado" };
    }

    const presenca = await prisma.presenca.findUnique({
      where: { id: presencaId },
    });
    if (!presenca) {
      return { sucesso: false, mensagem: "Presença não encontrada" };
    }

    if (presenca.status !== "PENDENTE") {
      return {
        sucesso: false,
        mensagem: "Esta justificativa já foi analisada",
      };
    }

    await prisma.presenca.update({
      where: { id: presencaId },
      data: { status: "JUSTIFICADO" },
    });

    revalidatePath("/dashboard/assiduidade");
    return {
      sucesso: true,
      mensagem: "Justificativa aceite e falta justificada",
    };
  } catch (erro) {
    logError("Erro ao aprovar justificativa:", erro);
    return {
      sucesso: false,
      mensagem:
        erro instanceof Error ? erro.message : "Erro ao aprovar justificativa",
    };
  }
}

export async function rejeitarJustificativa(presencaId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "COORDENADOR") {
      return { sucesso: false, mensagem: "Não autorizado" };
    }

    const presenca = await prisma.presenca.findUnique({
      where: { id: presencaId },
    });
    if (!presenca) {
      return { sucesso: false, mensagem: "Presença não encontrada" };
    }

    if (presenca.status !== "PENDENTE") {
      return {
        sucesso: false,
        mensagem: "Esta justificativa já foi analisada",
      };
    }

    await prisma.presenca.update({
      where: { id: presencaId },
      data: {
        status: "AUSENTE",
        comentarioFormando: null,
        documentoUrl: null,
      },
    });

    revalidatePath("/dashboard/assiduidade");
    return {
      sucesso: true,
      mensagem: "Justificativa recusada e falta mantida",
    };
  } catch (erro) {
    logError("Erro ao rejeitar justificativa:", erro);
    return {
      sucesso: false,
      mensagem:
        erro instanceof Error ? erro.message : "Erro ao rejeitar justificativa",
    };
  }
}

export async function getJustificativasFormando(formandoId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COORDENADOR") {
      return [];
    }

    const presencas = await prisma.presenca.findMany({
      where: {
        formandoId,
        status: { in: ["JUSTIFICADO", "PENDENTE"] },
        comentarioFormando: { not: null },
      },
      include: {
        aula: {
          include: {
            modulo: { select: { nome: true } },
          },
        },
      },
      orderBy: { aula: { dataHora: "desc" } },
    });

    return presencas.map((p) => ({
      id: p.id,
      status: p.status,
      comentarioFormando: p.comentarioFormando,
      documentoUrl: p.documentoUrl,
      justificativa: p.justificativa,
      aula: {
        titulo: p.aula.titulo,
        dataHora: p.aula.dataHora.toISOString(),
        modulo: p.aula.modulo,
      },
    }));
  } catch (erro) {
    logError("Erro ao buscar justificativas:", erro);
    return [];
  }
}
