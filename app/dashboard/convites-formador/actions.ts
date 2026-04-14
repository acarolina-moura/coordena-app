"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logError } from "@/lib/logger";

export async function responderConviteFormador(conviteId: string, acao: "ACEITE" | "RECUSADO") {
  try {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, mensagem: "Não autorizado" };
    }

    // Validar que o convite pertence ao formador logado
    const convite = await prisma.convite.findUnique({
        where: { id: conviteId },
        include: { formador: true },
    });
    if (!convite) {
        return { success: false, mensagem: "Convite não encontrado" };
    }
    if (convite.formador?.userId !== session.user.id) {
        return { success: false, mensagem: "Este convite não pertence a si" };
    }

    await prisma.convite.update({
      where: { id: conviteId },
      data: {
        status: acao,
        dataResposta: new Date(),
      },
    });

    // Se aceitou e tem módulo associado, criar FormadorModulo
    if (acao === "ACEITE" && convite.formadorId && convite.moduloId) {
      await prisma.formadorModulo.upsert({
        where: {
          formadorId_moduloId: {
            formadorId: convite.formadorId,
            moduloId: convite.moduloId,
          },
        },
        create: {
          formadorId: convite.formadorId,
          moduloId: convite.moduloId,
        },
        update: {}, // Se já existe, não faz nada
      });
    }

    // Se recusou e tem módulo, remover FormadorModulo se existir
    if (acao === "RECUSADO" && convite.formadorId && convite.moduloId) {
      await prisma.formadorModulo.deleteMany({
        where: {
          formadorId: convite.formadorId,
          moduloId: convite.moduloId,
        },
      });
    }

    revalidatePath("/dashboard/convites-formador");
    revalidatePath("/dashboard/modulos-atribuidos");
    revalidatePath("/dashboard/meus-cursos");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    logError("Erro ao responder convite:", error);
    return { success: false, error: "Falha ao processar resposta" };
  }
}
