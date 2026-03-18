import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ─── DELETE /api/formadores/[id] ──────────────────────────────────────────────

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const formador = await prisma.formador.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!formador) {
      return NextResponse.json(
        { error: "Formador não encontrado" },
        { status: 404 },
      );
    }

    // Apaga o formador e o user associado
    await prisma.formador.delete({ where: { id } });
    await prisma.user.delete({ where: { id: formador.userId } });

    return NextResponse.json({ message: "Formador eliminado com sucesso" });
  } catch (error) {
    console.error("[DELETE /api/formadores/[id]]", error);
    return NextResponse.json(
      { error: "Erro ao eliminar formador" },
      { status: 500 },
    );
  }
}
