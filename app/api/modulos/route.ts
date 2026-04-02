import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── GET /api/modulos ─────────────────────────────────────────────────────────

export async function GET() {
  try {
    const modulos = await prisma.modulo.findMany({
      orderBy: { ordem: "asc" },
      include: { curso: { select: { id: true, nome: true } } },
    });
    return Response.json(modulos);
  } catch (error) {
    console.error("[GET /api/modulos]", error);
    return Response.json(
      { error: "Erro ao carregar módulos" },
      { status: 500 },
    );
  }
}

// ─── POST /api/modulos ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { nome, descricao, ordem, cargaHoraria, cursoId, formadorId } =
      await req.json();

    if (!nome || nome.trim() === "") {
      return Response.json(
        { error: "Nome do módulo é obrigatório" },
        { status: 400 },
      );
    }

    if (!cursoId) {
      return Response.json({ error: "Curso é obrigatório" }, { status: 400 });
    }

    const cursoExiste = await prisma.curso.findUnique({
      where: { id: cursoId },
    });
    if (!cursoExiste) {
      return Response.json({ error: "Curso não encontrado" }, { status: 404 });
    }

    if (formadorId) {
      const formadorExiste = await prisma.formador.findUnique({
        where: { id: formadorId },
      });
      if (!formadorExiste) {
        return Response.json(
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
        cursoId,
      },
    });

    // Associar formador diretamente via FormadorModulo
    if (formadorId) {
      await prisma.formadorModulo.create({
        data: {
          formadorId,
          moduloId: modulo.id,
        },
      });
    }

    // Buscar o módulo completo
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

    return Response.json(resultado, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar módulo:", error);
    return Response.json({ error: "Erro ao criar módulo" }, { status: 500 });
  }
}
