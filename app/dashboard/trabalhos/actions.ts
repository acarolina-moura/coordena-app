"use server";

import { prisma } from "../../../lib/prisma";
import { auth } from "../../../auth";
import { revalidatePath } from "next/cache";

export async function submeterTrabalho(itemId: string, ficheiroUrl: string, comentario?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Não autorizado");

    const formando = await prisma.formando.findUnique({
        where: { userId: session.user.id }
    });

    if (!formando) throw new Error("Formando não encontrado");

    // Criar ou atualizar a submissão
    await (prisma as any).submissaoTrabalho.upsert({
        where: {
            itemId_formandoId: {
                itemId,
                formandoId: formando.id
            }
        },
        update: {
            ficheiroUrl,
            comentario,
            dataEntrega: new Date()
        },
        create: {
            itemId,
            formandoId: formando.id,
            ficheiroUrl,
            comentario,
            dataEntrega: new Date()
        }
    });

    revalidatePath("/dashboard/trabalhos");
    return { success: true };
}
