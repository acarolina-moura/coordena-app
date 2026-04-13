"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/logger";

export async function submeterReview(moduloId: string, nota: number, comentario: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Não autenticado");

        const formando = await prisma.formando.findUnique({
            where: { userId: session.user.id }
        });

        if (!formando) throw new Error("Formando não encontrado");

        await prisma.reviewModulo.upsert({
            where: {
                formandoId_moduloId: {
                    formandoId: formando.id,
                    moduloId: moduloId
                }
            },
            update: {
                nota,
                comentario,
                updatedAt: new Date()
            },
            create: {
                formandoId: formando.id,
                moduloId: moduloId,
                nota,
                comentario
            }
        });

        revalidatePath("/dashboard/reviews");
        return { success: true };
    } catch (error) {
        logError("Erro ao submeter review:", error);
        return { success: false, error: "Falha ao gravar avaliação" };
    }
}
