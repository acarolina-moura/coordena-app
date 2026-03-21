"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function responderConvite(conviteId: string, acao: "ACEITE" | "RECUSADO") {
  try {
    const convite = await prisma.convite.findUnique({
      where: { id: conviteId },
      include: { Curso: true } as any
    }) as any;

    if (!convite) throw new Error("Convite não encontrado");

    await prisma.convite.update({
      where: { id: conviteId },
      data: {
        status: acao,
        dataResposta: new Date(),
      } as any
    });

    if (acao === "ACEITE" && convite.formandoId && convite.cursoId) {
      // Verificar se já está inscrito
      const existente = await prisma.inscricao.findFirst({
        where: {
          formandoId: convite.formandoId,
          cursoId: convite.cursoId,
        }
      });

      if (!existente) {
        await (prisma as any).inscricao.create({
          data: {
            formandoId: convite.formandoId,
            cursoId: convite.cursoId,
            dataInicio: new Date(),
            status: "ATIVO"
          } as any
        });
      }
    }

    revalidatePath("/dashboard/convites");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao responder convite:", error);
    return { success: false, error: "Falha ao processar resposta" };
  }
}
