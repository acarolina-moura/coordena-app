import { getFormandoPerfil } from '@/app/dashboard/_data/coordenador';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formandoId: string }> }
) {
  try {
    const { formandoId } = await params;

    if (!formandoId) {
      return NextResponse.json(
        { erro: 'ID do formando é obrigatório' },
        { status: 400 }
      );
    }

    const perfil = await getFormandoPerfil(formandoId);

    if (!perfil) {
      return NextResponse.json(
        { erro: 'Formando não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(perfil);
  } catch (erro) {
    console.error('Erro ao buscar perfil do formando:', erro);
    return NextResponse.json(
      { erro: 'Erro ao buscar dados' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ formandoId: string }> }
) {
  try {
    const { formandoId } = await params;

    // 1. Procurar o formando para obter o userId
    const formando = await prisma.formando.findUnique({
      where: { id: formandoId },
      select: { userId: true }
    });

    if (!formando) {
      return NextResponse.json({ erro: 'Formando não encontrado' }, { status: 404 });
    }

    // 2. Apagar todas as dependências academicas
    // O Prisma recomenda apagar manualmente se não houver Cascade no schema
    await prisma.$transaction([
      prisma.presenca.deleteMany({ where: { formandoId } }),
      prisma.avaliacao.deleteMany({ where: { formandoId } }),
      prisma.inscricao.deleteMany({ where: { formandoId } }),
      prisma.documento.deleteMany({ where: { formandoId } }),
      prisma.formando.delete({ where: { id: formandoId } }),
      // Finalmente apagar o User (isso removerá sessões, contas, etc se houver Cascade lá)
      prisma.user.delete({ where: { id: formando.userId } }),
    ]);

    revalidatePath("/dashboard/formandos");

    return NextResponse.json({ mensagem: "Formando excluído com sucesso" });
  } catch (erro) {
    console.error('[FORMANDO_DELETE]', erro);
    return NextResponse.json(
      { erro: 'Erro ao excluir formando. Verifique as dependências.' },
      { status: 500 }
    );
  }
}

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
