import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Validation ───────────────────────────────────────────────────────────────

const AulaSchema = z.object({
  titulo: z.string().min(2, "O título deve ter pelo menos 2 caracteres"),
  dataHora: z.string(), // ISO string
  duracao: z.coerce.number().int().min(1, "A duração deve ser >= 1 minuto"),
  moduloId: z.string().uuid("moduloId inválido"),
  formadorId: z.string().uuid("formadorId inválido"),
});

import { auth } from "@/auth";

// ─── GET /api/aulas ───────────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { role, id: userId } = session.user;

    let whereClause = {};

    if (role === "FORMANDO") {
      // Buscar cursos onde o formando está inscrito
      const inscricoes = await prisma.inscricao.findMany({
        where: { formando: { userId } },
        select: { cursoId: true },
      });
      const cursoIds = inscricoes.map((i) => i.cursoId);
      whereClause = {
        modulo: {
          cursoId: { in: cursoIds },
        },
      };
    } else if (role === "FORMADOR") {
      // Opcional: Filtro para formadores (ex: apenas sessões que dão ou todas)
      // Por agora, permitimos ver todas no calendário, ou podemos filtrar por formadorId
      // whereClause = { formador: { userId } };
    }

    const aulas = await prisma.aula.findMany({
      where: whereClause,
      orderBy: { dataHora: "asc" },
      include: {
        modulo: {
          include: { curso: true },
        },
        formador: {
          include: { user: true },
        },
      },
    });

    return NextResponse.json(aulas);
  } catch (error) {
    console.error("[GET /api/aulas]", error);
    return NextResponse.json(
      { error: "Erro ao carregar aulas" },
      { status: 500 }
    );
  }
}

// ─── POST /api/aulas ──────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COORDENADOR") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas coordenadores podem criar aulas." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = AulaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { titulo, dataHora, duracao, moduloId, formadorId } = parsed.data;

    // Verificar se o módulo pertence a um curso do coordenador logado
    const modulo = await prisma.modulo.findUnique({
      where: { id: moduloId },
      include: { curso: { select: { coordenadorId: true } } }
    });

    if (!modulo || modulo.curso.coordenadorId !== session.user.coordenadorId) {
      return NextResponse.json(
        { error: "Módulo não encontrado ou não pertence ao coordenador" },
        { status: 403 }
      );
    }

    const aula = await prisma.aula.create({
      data: {
        titulo: titulo.trim(),
        dataHora: new Date(dataHora),
        duracao,
        moduloId,
        formadorId,
      },
      include: {
        modulo: { include: { curso: true } },
        formador: { include: { user: true } },
      },
    });

    revalidatePath("/dashboard");
    return NextResponse.json(aula, { status: 201 });
  } catch (error) {
    console.error("[POST /api/aulas]", error);
    return NextResponse.json({ error: "Erro ao criar aula" }, { status: 500 });
  }
}
