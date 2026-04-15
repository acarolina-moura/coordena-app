import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// ─── DELETE /api/aulas/[id] ───────────────────────────────────────────────────

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COORDENADOR") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas coordenadores podem excluir aulas." },
        { status: 403 },
      );
    }

    const { id } = await params;

    // Verificar se a aula pertence a um módulo de um curso do coordenador
    const aula = await prisma.aula.findUnique({
      where: { id },
      include: {
        modulo: { select: { curso: { select: { coordenadorId: true } } } },
      },
    });

    if (
      !aula ||
      !aula.modulo.curso ||
      aula.modulo.curso.coordenadorId !== session.user.coordenadorId
    ) {
      return NextResponse.json(
        { error: "Aula não encontrada ou não pertence ao coordenador" },
        { status: 403 },
      );
    }

    await prisma.aula.delete({ where: { id } });

    revalidatePath("/dashboard");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/aulas/[id]]", error);
    return NextResponse.json(
      { error: "Erro ao eliminar aula" },
      { status: 500 },
    );
  }
}
