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

    // Usamos uma transação para garantir que tudo é apagado ou nada é apagado
    await prisma.$transaction(async (tx) => {
      // 1. Apagar atribuições de módulos
      await tx.formadorModulo.deleteMany({ where: { formadorId: id } });

      // 2. Apagar convites
      await tx.convite.deleteMany({ where: { formadorId: id } });

      // 3. Tentar apagar o formador
      // Se houver Aulas ou Avaliações, o Prisma lançará erro aqui se não houver Cascade
      await tx.formador.delete({ where: { id } });

      // 4. Apagar o utilizador (isso limpará sessões/contas se houver Cascade no schema)
      await tx.user.delete({ where: { id: formador.userId } });
    });

    return NextResponse.json({ message: "Formador eliminado com sucesso" });
  } catch (error: unknown) {
    console.error("[DELETE /api/formadores/[id]]", error);

    // Verificar se o erro é de restrição de chave estrangeira (P2003)
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Não é possível eliminar o formador porque existem registos (aulas ou avaliações) associados." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erro ao eliminar formador" },
      { status: 500 },
    );
  }
}
