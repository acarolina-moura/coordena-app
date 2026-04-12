"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/logger";

export async function responderConvite(conviteId: string, acao: "ACEITE" | "RECUSADO") {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { sucesso: false, mensagem: "Não autorizado" };
    }
    // Validar ownership
    const convite = await prisma.convite.findUnique({
      where: { id: conviteId },
      include: { formando: true },
    });
    if (!convite) return { sucesso: false, mensagem: "Convite não encontrado" };
    if (convite.formando?.userId !== session.user.id) {
      return { sucesso: false, mensagem: "Este convite não pertence a si" };
    }

    const conviteDetalhes = await prisma.convite.findUnique({
      where: { id: conviteId },
      include: {
        curso: true,
        modulo: true,
        formando: true,
        formador: true,
      }
    });

    if (!conviteDetalhes) throw new Error("Convite não encontrado");

    await prisma.convite.update({
      where: { id: conviteId },
      data: {
        status: acao,
        dataResposta: new Date(),
      }
    });

    // Se for FORMANDO aceitando um convite de curso
    if (acao === "ACEITE" && conviteDetalhes.formandoId && conviteDetalhes.cursoId) {
      // Verificar se já está inscrito
      const existente = await prisma.inscricao.findFirst({
        where: {
          formandoId: conviteDetalhes.formandoId,
          cursoId: conviteDetalhes.cursoId,
        }
      });

      if (!existente) {
        await prisma.inscricao.create({
          data: {
            formandoId: conviteDetalhes.formandoId,
            cursoId: conviteDetalhes.cursoId,
            dataInicio: new Date(),
          }
        });
      }
    }

    revalidatePath("/dashboard/convites");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    logError("Erro ao responder convite:", error);
    return { success: false, error: "Falha ao processar resposta" };
  }
}
