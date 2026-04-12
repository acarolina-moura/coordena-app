import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/formandos/[formandoId]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ formandoId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (session.user.role !== "COORDENADOR") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { formandoId } = await params;

  const formando = await prisma.formando.findUnique({
    where: { id: formandoId },
    include: {
      user: { select: { id: true, nome: true, email: true } },
      inscricoes: {
        include: {
          curso: {
            include: {
              modulos: { select: { id: true, nome: true, cargaHoraria: true } },
            },
          },
        },
      },
      avaliacoes: {
        include: {
          modulo: {
            include: { curso: { select: { id: true, nome: true } } },
          },
        },
      },
    },
  });

  if (!formando) {
    return NextResponse.json(
      { error: "Formando não encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    id: formando.id,
    nome: formando.user.nome,
    email: formando.user.email,
    avatar: null,
    cursos: formando.inscricoes.map((insc) => ({
      id: insc.curso.id,
      nome: insc.curso.nome,
      dataInicio: insc.curso.dataInicio,
      dataFim: insc.curso.dataFim,
      cargaHoraria: insc.curso.cargaHoraria,
      modulos: insc.curso.modulos.map((mod) => {
        const avaliacao = formando.avaliacoes.find(
          (a) => a.moduloId === mod.id,
        );

        return {
          id: mod.id,
          nome: mod.nome,
          cargaHoraria: mod.cargaHoraria,
          nota: avaliacao?.nota ?? null,
        };
      }),
    })),
    avaliacoes: formando.avaliacoes,
  });
}

// PATCH /api/formandos/[formandoId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ formandoId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (session.user.role !== "COORDENADOR") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { formandoId } = await params;

  const body = await req.json();
  const { userId, nome, email, cursoId, novaSenha } = body;

  if (!userId) {
    return NextResponse.json(
      { error: "userId é obrigatório" },
      { status: 400 },
    );
  }

  if (!nome?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "Nome e email são obrigatórios" },
      { status: 400 },
    );
  }

  try {
    const updateData: Record<string, unknown> = {
      nome: nome.trim(),
      email: email.trim(),
    };

    if (novaSenha?.trim()) {
      updateData.senha = await bcrypt.hash(novaSenha.trim(), 10);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    if (cursoId !== undefined) {
      await prisma.inscricao.deleteMany({
        where: { formandoId },
      });

      if (cursoId) {
        await prisma.inscricao.create({
          data: { formandoId, cursoId },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/formandos/[formandoId]]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar formando" },
      { status: 500 },
    );
  }
}

// DELETE /api/formandos/[formandoId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ formandoId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (session.user.role !== "COORDENADOR") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { formandoId } = await params;

  try {
    const formando = await prisma.formando.findUnique({
      where: { id: formandoId },
      select: { id: true, userId: true },
    });

    if (!formando) {
      return NextResponse.json(
        { error: "Formando não encontrado" },
        { status: 404 },
      );
    }

    // Apagar dependências primeiro (evita erro FK)
    await prisma.inscricao.deleteMany({ where: { formandoId } });
    await prisma.avaliacao.deleteMany({ where: { formandoId } });

    // Se tiver estas tabelas no schema, vão funcionar.
    // Se não tiver, vai dar erro no build -> aí removemos.
    await prisma.presenca.deleteMany({ where: { formandoId } });
    await prisma.documento.deleteMany({ where: { formandoId } });
    await prisma.submissaoTrabalho.deleteMany({ where: { formandoId } });
    await prisma.reviewModulo.deleteMany({ where: { formandoId } });
    await prisma.convite.deleteMany({ where: { formandoId } });

    // Apagar formando
    await prisma.formando.delete({
      where: { id: formandoId },
    });

    // Apagar user vinculado
    await prisma.user.delete({
      where: { id: formando.userId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/formandos/[formandoId]]", error);
    return NextResponse.json(
      { error: "Erro ao excluir formando" },
      { status: 500 },
    );
  }
}
