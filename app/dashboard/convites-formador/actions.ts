"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logError } from "@/lib/logger";

export async function responderConviteFormador(conviteId: string, acao: "ACEITE" | "RECUSADO") {
  try {
    const session = await auth();
    if (!session?.user?.id) {
        return { sucesso: false, mensagem: "Não autorizado" };
    }

    // Validar que o convite pertence ao formador logado
    const convite = await prisma.convite.findUnique({
        where: { id: conviteId },
        include: { formador: true },
    });
    if (!convite) {
        return { sucesso: false, mensagem: "Convite não encontrado" };
    }
    if (convite.formador?.userId !== session.user.id) {
        return { sucesso: false, mensagem: "Este convite não pertence a si" };
    }

    await prisma.convite.update({
      where: { id: conviteId },
      data: {
        status: acao,
        dataResposta: new Date(),
      },
    });

    revalidatePath("/dashboard/convites-formador");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    logError("Erro ao responder convite:", error);
    return { success: false, error: "Falha ao processar resposta" };
  }
}
