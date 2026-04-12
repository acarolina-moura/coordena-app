import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ─── POST /api/convites ──────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COORDENADOR") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { formadorId, formandoId, cursoId, moduloId, descricao } =
      await req.json();

    if (!formadorId && !formandoId) {
      return NextResponse.json(
        { error: "É necessário indicar formadorId ou formandoId" },
        { status: 400 },
      );
    }

    if (!cursoId && !moduloId) {
      return NextResponse.json(
        { error: "É necessário indicar cursoId ou moduloId" },
        { status: 400 },
      );
    }

    // Se moduloId foi dado, buscar o cursoId associado
    let finalCursoId = cursoId;
    if (moduloId && !cursoId) {
      const modulo = await prisma.modulo.findUnique({
        where: { id: moduloId },
        select: { cursoId: true },
      });
      if (!modulo) {
        return NextResponse.json(
          { error: "Módulo não encontrado" },
          { status: 404 },
        );
      }
      finalCursoId = modulo.cursoId;
    }

    // Verificar se já existe convite pendente para este par
    const existingConvite = await prisma.convite.findFirst({
      where: {
        ...(formadorId ? { formadorId } : {}),
        ...(formandoId ? { formandoId } : {}),
        cursoId: finalCursoId,
        ...(moduloId ? { moduloId } : {}),
        status: "PENDENTE",
      },
    });

    if (existingConvite) {
      return NextResponse.json(
        { error: "Já existe um convite pendente para este convite." },
        { status: 409 },
      );
    }

    const convite = await prisma.convite.create({
      data: {
        formadorId: formadorId ?? null,
        formandoId: formandoId ?? null,
        cursoId: finalCursoId,
        moduloId: moduloId ?? null,
        descricao: descricao ?? null,
      },
    });

    return NextResponse.json(
      { message: "Convite enviado com sucesso", convite },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/convites]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
