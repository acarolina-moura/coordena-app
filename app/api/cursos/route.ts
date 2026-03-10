import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

// ─── Validation Schema ────────────────────────────────────────────────────────

const CursoSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  dataInicio: z.string().optional().nullable(),
  dataFim: z.string().optional().nullable(),
  status: z.enum(["ATIVO", "PAUSADO", "ENCERRADO"]).default("ATIVO"),
});

// ─── GET /api/cursos ──────────────────────────────────────────────────────────

export async function GET() {
  try {
    const cursos = await prisma.curso.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        modulos: {
          select: {
            id: true,
            nome: true,
            cargaHoraria: true,
          },
        },
        _count: {
          select: { inscricoes: true },
        },
      },
    });

    const cursosFormatados = cursos.map((curso) => ({
      id: curso.id,
      nome: curso.nome,
      descricao: curso.descricao,
      status: curso.status,
      dataInicio: curso.dataInicio,
      dataFim: curso.dataFim,
      createdAt: curso.createdAt,
      cargaHoraria: curso.modulos.reduce((sum, m) => sum + m.cargaHoraria, 0),
      totalModulos: curso.modulos.length,
      totalFormandos: curso._count.inscricoes,
    }));

    return NextResponse.json(cursosFormatados);
  } catch (error) {
    console.error("[GET /api/cursos]", error);
    return NextResponse.json(
      { error: "Erro ao carregar cursos" },
      { status: 500 },
    );
  }
}

// ─── POST /api/cursos ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = CursoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { nome, descricao, dataInicio, dataFim, status } = parsed.data;

    const curso = await prisma.curso.create({
      data: {
        nome,
        descricao,
        dataInicio: dataInicio ? new Date(dataInicio) : null,
        dataFim: dataFim ? new Date(dataFim) : null,
        status,
      },
    });

    return NextResponse.json(curso, { status: 201 });
  } catch (error) {
    console.error("[POST /api/cursos]", error);
    return NextResponse.json({ error: "Erro ao criar curso" }, { status: 500 });
  }
}
