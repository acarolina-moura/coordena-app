import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { nome, descricao, ordem, cargaHoraria, cursoId, formadorId } = body;

    // Validações básicas
    if (!nome || !nome.trim()) {
      return Response.json(
        { error: "Nome do módulo é obrigatório" },
        { status: 400 }
      );
    }

    if (!cursoId) {
      return Response.json(
        { error: "Curso é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se o curso existe
    const cursoExists = await prisma.curso.findUnique({
      where: { id: cursoId },
    });

    if (!cursoExists) {
      return Response.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se o módulo existe
    const moduloExists = await prisma.modulo.findUnique({
      where: { id },
    });

    if (!moduloExists) {
      return Response.json(
        { error: "Módulo não encontrado" },
        { status: 404 }
      );
    }

    // Se houver formadorId, verifica se o formador existe
    if (formadorId) {
      const formadorExists = await prisma.formador.findUnique({
        where: { id: formadorId },
      });

      if (!formadorExists) {
        return Response.json(
          { error: "Formador não encontrado" },
          { status: 404 }
        );
      }
    }

    // Gerencia a atribuição de formador
    if (formadorId) {
      // Remove todos os formadores atuais
      await prisma.formadorModulo.deleteMany({
        where: { moduloId: id },
      });

      // Adiciona o novo formador
      await prisma.formadorModulo.create({
        data: {
          formadorId,
          moduloId: id,
        },
      });
    } else {
      // Remove todos os formadores se nenhum foi selecionado
      await prisma.formadorModulo.deleteMany({
        where: { moduloId: id },
      });
    }

    // Atualiza o módulo
    const modulo = await prisma.modulo.update({
      where: { id },
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        ordem: parseInt(ordem) || 0,
        cargaHoraria: parseInt(cargaHoraria) || 0,
        cursoId,
      },
    });

    // Busca o módulo atualizado com os formadores
    const moduloAtualizado = await prisma.modulo.findUnique({
      where: { id },
      include: {
        curso: {
          select: { id: true, nome: true },
        },
        formadores: {
          include: {
            formador: {
              include: { user: true },
            },
          },
        },
      },
    });

    // Mapeia para retornar a mesma estrutura do getModulos
    const resultado = {
      ...moduloAtualizado,
      formadores: moduloAtualizado?.formadores.map(fm => fm.formador) || [],
    };

    revalidatePath("/dashboard/modulos");

    return Response.json(resultado);
  } catch (error) {
    console.error("[MODULO_PUT]", error);
    return Response.json(
      { error: "Erro ao atualizar módulo" },
      { status: 500 }
    );
  }
}
