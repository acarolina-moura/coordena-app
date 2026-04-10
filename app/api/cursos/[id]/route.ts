import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COORDENADOR") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas coordenadores podem excluir cursos." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verificar se o curso pertence ao coordenador logado
    const curso = await prisma.curso.findUnique({
      where: { id },
      select: { coordenadorId: true }
    });

    if (!curso || curso.coordenadorId !== session.user.coordenadorId) {
      return NextResponse.json(
        { error: "Curso não encontrado ou não pertence ao coordenador" },
        { status: 403 }
      );
    }

    // Apagar as relações Modulo -> FormadorModulo primeiro se existirem módulos
    const modulos = await prisma.modulo.findMany({ where: { cursoId: id } });
    const moduloIds = modulos.map(m => m.id);

    if (moduloIds.length > 0) {
      await prisma.formadorModulo.deleteMany({
        where: { moduloId: { in: moduloIds } }
      });
      await prisma.modulo.deleteMany({
        where: { cursoId: id }
      });
    }

    // Apagar o curso
    await prisma.curso.delete({
      where: { id }
    });

    revalidatePath("/dashboard/cursos");

    return NextResponse.json({ message: "Curso excluído com sucesso" });
  } catch (error) {
    console.error("[CURSO_DELETE]", error);
    return NextResponse.json(
      { error: "Erro ao excluir curso. Verifique se existem formandos inscritos." },
      { status: 500 }
    );
  }
}
