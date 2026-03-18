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
