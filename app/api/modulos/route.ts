import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import {
  filtroModulosCoordenador,
  cursoPertenceAoCoordenador,
} from "@/lib/coordenador-utils";

// ─── GET /api/modulos ─────────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const modulosFilter = await filtroModulosCoordenador();

    const modulos = await prisma.modulo.findMany({
      where: modulosFilter,
      orderBy: { ordem: "asc" },
      include: { curso: { select: { id: true, nome: true } } },
    });
    return NextResponse.json(modulos);
  } catch (error) {
    console.error("[GET /api/modulos]", error);
    return NextResponse.json(
      { error: "Erro ao carregar módulos" },
      { status: 500 },
    );
  }
}

// ─── POST /api/modulos ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COORDENADOR") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas coordenadores podem criar módulos." },
        { status: 403 },
      );
    }

    const { nome, descricao, ordem, cargaHoraria, cursoId, formadorId } =
      await req.json();

    if (!nome || nome.trim() === "") {
      return NextResponse.json(
        { error: "Nome do módulo é obrigatório" },
        { status: 400 },
      );
    }

    let cursoIdFinal: string | null = cursoId || null;

    if (cursoIdFinal) {
      // Verificar se o curso pertence ao coordenador logado
      const cursoPertence = await cursoPertenceAoCoordenador(cursoIdFinal);
      if (!cursoPertence) {
        return NextResponse.json(
          { error: "Curso não encontrado ou não pertence ao coordenador" },
          { status: 403 },
        );
      }
    }

    if (formadorId) {
      const formadorExiste = await prisma.formador.findUnique({
        where: { id: formadorId },
      });
      if (!formadorExiste) {
        return NextResponse.json(
          { error: "Formador não encontrado" },
          { status: 404 },
        );
      }
    }

    // Criar módulo
    const modulo = await prisma.modulo.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        ordem: parseInt(ordem) || 0,
        cargaHoraria: parseInt(cargaHoraria) || 0,
        cursoId: cursoIdFinal,
      },
    });

    // Criar convite para o formador (se especificado)
    // ✅ NÃO associar o formador a FormadorModulo aqui!
    // Isso só deve acontecer quando o formador ACEITA o convite
    if (formadorId) {
      await prisma.convite.create({
        data: {
          id: crypto.randomUUID(),
          formadorId,
          moduloId: modulo.id,
          cursoId: cursoIdFinal,
          descricao: `Convite para lecionar o módulo "${nome}"`,
          status: "PENDENTE",
        },
      });
    }

    const moduloCompleto = await prisma.modulo.findUnique({
      where: { id: modulo.id },
      include: {
        curso: { select: { id: true, nome: true } },
        formadores: {
          include: {
            formador: { include: { user: true } },
          },
        },
      },
    });

    revalidatePath("/dashboard/modulos");

    const resultado = {
      ...moduloCompleto,
      formadores: moduloCompleto?.formadores.map((fm) => fm.formador) ?? [],
    };

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar módulo:", error);
    return NextResponse.json(
      { error: "Erro ao criar módulo" },
      { status: 500 },
    );
  }
}
