import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// ─── DELETE /api/aulas/[id] ───────────────────────────────────────────────────

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.aula.delete({ where: { id } });

    revalidatePath("/dashboard");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/aulas/[id]]", error);
    return NextResponse.json(
      { error: "Erro ao eliminar aula" },
      { status: 500 }
    );
  }
}
