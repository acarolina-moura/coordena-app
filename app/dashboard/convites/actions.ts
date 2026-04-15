"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/logger";

export async function responderConvite(
  conviteId: string,
  acao: "ACEITE" | "RECUSADO",
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, mensagem: "Não autorizado" };
    }
    // Validar ownership — detetar se é formador ou formando
    const convite = await prisma.convite.findUnique({
      where: { id: conviteId },
      include: { formando: true, formador: true },
    });
    if (!convite) return { success: false, mensagem: "Convite não encontrado" };

    // Validar ownership: formador OU formando
    const eFormador = convite.formador?.userId === session.user.id;
    const eFormando = convite.formando?.userId === session.user.id;

    if (!eFormador && !eFormando) {
      return { success: false, mensagem: "Este convite não pertence a si" };
    }

    const conviteDetalhes = await prisma.convite.findUnique({
      where: { id: conviteId },
      include: {
        curso: true,
        modulo: true,
        formando: true,
        formador: true,
      },
    });

    if (!conviteDetalhes) throw new Error("Convite não encontrado");

    await prisma.convite.update({
      where: { id: conviteId },
      data: {
        status: acao,
        dataResposta: new Date(),
      },
    });

    // Se for FORMADOR aceitando um convite de módulo
    if (
      acao === "ACEITE" &&
      eFormador &&
      convite.formadorId &&
      convite.moduloId
    ) {
      // Verificar se já está associado ao módulo
      const existente = await prisma.formadorModulo.findFirst({
        where: {
          formadorId: convite.formadorId,
          moduloId: convite.moduloId,
        },
      });

      if (!existente) {
        await prisma.formadorModulo.create({
          data: {
            formadorId: convite.formadorId,
            moduloId: convite.moduloId,
          },
        });
      }
    }

    // Se for FORMADOR recusando um convite de módulo
    if (
      acao === "RECUSADO" &&
      eFormador &&
      convite.formadorId &&
      convite.moduloId
    ) {
      // Remover a associação do módulo
      await prisma.formadorModulo.deleteMany({
        where: {
          formadorId: convite.formadorId,
          moduloId: convite.moduloId,
        },
      });
    }

    // Se for FORMANDO aceitando um convite de curso
    if (
      acao === "ACEITE" &&
      eFormando &&
      conviteDetalhes.formandoId &&
      conviteDetalhes.cursoId
    ) {
      // Verificar se já está inscrito
      const existente = await prisma.inscricao.findFirst({
        where: {
          formandoId: conviteDetalhes.formandoId,
          cursoId: conviteDetalhes.cursoId,
        },
      });

      if (!existente) {
        await prisma.inscricao.create({
          data: {
            formandoId: conviteDetalhes.formandoId,
            cursoId: conviteDetalhes.cursoId,
            dataInicio: new Date(),
          },
        });
      }
    }

    // Se for FORMANDO recusando um convite de curso
    if (
      acao === "RECUSADO" &&
      eFormando &&
      convite.formandoId &&
      convite.cursoId
    ) {
      // Remover a inscrição do curso
      await prisma.inscricao.deleteMany({
        where: {
          formandoId: convite.formandoId,
          cursoId: convite.cursoId,
        },
      });
    }

    revalidatePath("/dashboard/convites");
    revalidatePath("/dashboard/convites-formador");
    revalidatePath("/dashboard/modulos-atribuidos");
    revalidatePath("/dashboard/meus-cursos-formando");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    logError("Erro ao responder convite:", error);
    return { success: false, error: "Falha ao processar resposta" };
  }
}

export async function criarConvite(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Não autorizado");
    }

    const formadorId = formData.get("formadorId") as string;
    const moduloId = formData.get("moduloId") as string;
    const descricao = formData.get("descricao") as string;

    if (!formadorId || !moduloId || !descricao) {
      throw new Error("Campos obrigatórios não preenchidos");
    }

    // Verificar se o módulo existe e pertence ao coordenador
    const modulo = await prisma.modulo.findUnique({
      where: { id: moduloId },
      include: {
        curso: true,
        formadores: {
          include: {
            formador: true,
          },
        },
      },
    });

    if (!modulo) {
      throw new Error("Módulo não encontrado");
    }

    // Verificar se o formador está associado ao módulo
    const formadorAssociado = modulo.formadores.some(
      (fm: { formadorId: string }) => fm.formadorId === formadorId,
    );
    if (!formadorAssociado) {
      throw new Error("Formador não está associado a este módulo");
    }

    // Verificar se já existe um convite ativo para este formador neste módulo
    const conviteExistente = await prisma.convite.findFirst({
      where: {
        formadorId: formadorId,
        moduloId: moduloId,
        status: "PENDENTE",
      },
    });

    if (conviteExistente) {
      throw new Error(
        "Já existe um convite pendente para este formador neste módulo",
      );
    }

    // Criar o convite
    await prisma.convite.create({
      data: {
        formadorId: formadorId,
        moduloId: moduloId,
        descricao: descricao,
        status: "PENDENTE",
        dataEnvio: new Date(),
      },
    });

    revalidatePath("/dashboard/convites");
    return { success: true };
  } catch (error) {
    logError("Erro ao criar convite:", error);
    throw error;
  }
}
