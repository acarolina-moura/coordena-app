"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function responderConvite(conviteId: string, acao: "ACEITE" | "RECUSADO") {
  try {
    const convite = await prisma.convite.findUnique({
      where: { id: conviteId },
      include: { 
        curso: true,
        modulo: true,
        formando: true,
        formador: true,
      }
    });

    if (!convite) throw new Error("Convite não encontrado");

    await prisma.convite.update({
      where: { id: conviteId },
      data: {
        status: acao,
        dataResposta: new Date(),
      }
    });

    // Se for FORMADOR aceitando um convite de módulo
    if (acao === "ACEITE" && convite.formadorId && convite.moduloId) {
      // Verificar se já está associado ao módulo
      const existente = await prisma.formadorModulo.findFirst({
        where: {
          formadorId: convite.formadorId,
          moduloId: convite.moduloId,
        }
      });

      if (!existente) {
        await prisma.formadorModulo.create({
          data: {
            formadorId: convite.formadorId,
            moduloId: convite.moduloId,
          }
        });
      }
    }

    // Se for FORMADOR recusando um convite de módulo
    if (acao === "RECUSADO" && convite.formadorId && convite.moduloId) {
      // Remover a associação do módulo
      await prisma.formadorModulo.deleteMany({
        where: {
          formadorId: convite.formadorId,
          moduloId: convite.moduloId,
        }
      });
    }

    // Se for FORMANDO aceitando um convite de curso
    if (acao === "ACEITE" && convite.formandoId && convite.cursoId) {
      // Verificar se já está inscrito
      const existente = await prisma.inscricao.findFirst({
        where: {
          formandoId: convite.formandoId,
          cursoId: convite.cursoId,
        }
      });

      if (!existente) {
        await prisma.inscricao.create({
          data: {
            formandoId: convite.formandoId,
            cursoId: convite.cursoId,
            dataInicio: new Date(),
          }
        });
      }
    }

    // Se for FORMANDO recusando um convite de curso
    if (acao === "RECUSADO" && convite.formandoId && convite.cursoId) {
      // Remover a inscrição do curso
      await prisma.inscricao.deleteMany({
        where: {
          formandoId: convite.formandoId,
          cursoId: convite.cursoId,
        }
      });
    }

    revalidatePath("/dashboard/convites");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao responder convite:", error);
    return { success: false, error: "Falha ao processar resposta" };
  }
}
