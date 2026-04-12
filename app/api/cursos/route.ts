import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { filtroCursosCoordenador, getCoordenadorIdOrNull } from "@/lib/coordenador-utils";

// ─── Validation Schema ────────────────────────────────────────────────────────

const CursoSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  dataInicio: z.string().optional().nullable(),
  dataFim: z.string().optional().nullable(),
  cargaHoraria: z.coerce.number().int().min(0).default(0),
  status: z.enum(["ATIVO", "PAUSADO", "ENCERRADO"]).default("ATIVO"),
});

// ─── GET /api/cursos ──────────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const cursosFilter = await filtroCursosCoordenador();
    
    const cursos = await prisma.curso.findMany({
      where: cursosFilter,
      orderBy: { createdAt: "desc" },
      include: {
        modulos: true,
        _count: { select: { inscricoes: true } },
      },
    });

    const cursosFormatados = cursos.map((curso) => ({
      ...curso,
      formandos: curso._count.inscricoes,
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
    const session = await auth();
    if (!session?.user || session.user.role !== "COORDENADOR") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas coordenadores podem criar cursos." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const parsed = CursoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { nome, descricao, dataInicio, dataFim, cargaHoraria, status } =
      parsed.data;

    const coordenadorId = await getCoordenadorIdOrNull();

    const curso = await prisma.curso.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        dataInicio: dataInicio ? new Date(dataInicio) : null,
        dataFim: dataFim ? new Date(dataFim) : null,
        cargaHoraria,
        status,
        coordenadorId,
      },
      include: {
        modulos: true,
        inscricoes: true,
      },
    });

    revalidatePath("/dashboard/cursos");

    return NextResponse.json(
      { ...curso, formandos: curso.inscricoes.length },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/cursos]", error);
    return NextResponse.json({ error: "Erro ao criar curso" }, { status: 500 });
  }
}
