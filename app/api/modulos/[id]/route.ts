import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COORDENADOR") {
      return Response.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const { nome, descricao, ordem, cargaHoraria, cursoId, formadorId } = body;

    // Validações básicas
    if (!nome || !nome.trim()) {
      return Response.json(
        { error: "Nome do módulo é obrigatório" },
        { status: 400 },
      );
    }

    if (!cursoId) {
      return Response.json({ error: "Curso é obrigatório" }, { status: 400 });
    }

    // Verifica se o curso existe
    const cursoExists = await prisma.curso.findUnique({
      where: { id: cursoId },
    });

    if (!cursoExists) {
      return Response.json({ error: "Curso não encontrado" }, { status: 404 });
    }

    // Verifica se o módulo existe
    const moduloExists = await prisma.modulo.findUnique({
      where: { id },
    });

    if (!moduloExists) {
      return Response.json({ error: "Módulo não encontrado" }, { status: 404 });
    }

    // Se houver formadorId, verifica se o formador existe
    if (formadorId) {
      const formadorExists = await prisma.formador.findUnique({
        where: { id: formadorId },
      });

      if (!formadorExists) {
        return Response.json(
          { error: "Formador não encontrado" },
          { status: 404 },
        );
      }
    }

    // Gerencia o convite para o formador
    if (formadorId) {
      // Verificar se já existe um convite pendente para este formador
      const conviteExistente = await prisma.convite.findFirst({
        where: {
          formadorId,
          moduloId: id,
          status: "PENDENTE",
        },
      });

      // Se não existe, criar um novo convite
      if (!conviteExistente) {
        await prisma.convite.create({
          data: {
            id: crypto.randomUUID(),
            formadorId,
            moduloId: id,
            cursoId,
            descricao: `Convite para lecionar o módulo "${nome}"`,
            status: "PENDENTE",
          },
        });
      }
    }

    // Atualiza os dados base do módulo
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

    // ✅ CORREÇÃO: Atualizar de facto o formador no Módulo (limpar o antigo e associar o novo)
    if (formadorId) {
      // 1. Apaga qualquer formador antigo associado a este módulo
      await prisma.formadorModulo.deleteMany({
        where: { moduloId: id },
      });

      // 2. Cria a associação com o novo formador escolhido
      await prisma.formadorModulo.create({
        data: {
          formadorId: formadorId,
          moduloId: id,
        },
      });
    }

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
      formadores: moduloAtualizado?.formadores.map((fm) => fm.formador) || [],
    };

    revalidatePath("/dashboard/modulos");

    return Response.json(resultado);
  } catch (error) {
    console.error("[MODULO_PUT]", error);
    return Response.json(
      { error: "Erro ao atualizar módulo" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "COORDENADOR") {
      return Response.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;

    // 1. Verificar se existem dependências (Aulas, Avaliações)
    // Se quiser permitir a exclusão com dependências, apague-as primeiro ou deixe o Prisma falhar
    // Para ser seguro, vamos apagar as relações FormadorModulo primeiro
    await prisma.formadorModulo.deleteMany({
      where: { moduloId: id },
    });

    // 2. Apagar o módulo
    await prisma.modulo.delete({
      where: { id },
    });

    revalidatePath("/dashboard/modulos");

    return Response.json({ message: "Módulo excluído com sucesso" });
  } catch (error) {
    console.error("[MODULO_DELETE]", error);
    return Response.json(
      { error: "Erro ao excluir módulo. Já pode ter aulas associadas." },
      { status: 500 },
    );
  }
}
