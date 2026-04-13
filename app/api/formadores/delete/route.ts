import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "COORDENADOR") {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 403 },
            );
        }

        const { id } = await req.json();
        if (!id) {
            return NextResponse.json(
                { error: "ID obrigatório" },
                { status: 400 },
            );
        }
        // Elimina apenas o formador
        await prisma.formador.delete({ where: { id } });
        return NextResponse.json({ message: "Formador eliminado com sucesso" });
    } catch (error) {
        return NextResponse.json(
            { error: "Erro ao eliminar formador." },
            { status: 500 },
        );
    }
}
