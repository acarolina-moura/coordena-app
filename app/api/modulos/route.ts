import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ─── GET /api/modulos ─────────────────────────────────────────────────────────

export async function GET() {
  try {
    const modulos = await prisma.modulo.findMany({
      orderBy: { ordem: 'asc' },
      include: { curso: { select: { id: true, nome: true } } },
    })
    return Response.json(modulos)
  } catch (error) {
    console.error('[GET /api/modulos]', error)
    return Response.json({ error: 'Erro ao carregar módulos' }, { status: 500 })
  }
}

// ─── POST /api/modulos ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { nome, descricao, ordem, cargaHoraria, cursoId, formadorId } = await req.json()

    // Validação básica
    if (!nome || nome.trim() === '') {
      return Response.json(
        { error: 'Nome do módulo é obrigatório' },
        { status: 400 }
      )
    }

    if (!cursoId) {
      return Response.json(
        { error: 'Curso é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o curso existe
    const cursoExiste = await prisma.curso.findUnique({
      where: { id: cursoId },
    })

    if (!cursoExiste) {
      return Response.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o formador existe (se fornecido)
    if (formadorId) {
      const formadorExiste = await prisma.formador.findUnique({
        where: { id: formadorId },
      })

      if (!formadorExiste) {
        return Response.json(
          { error: 'Formador não encontrado' },
          { status: 404 }
        )
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
    })

    // Criar Convite para o formador se fornecido
    // (em vez de atribuir diretamente, deixa-se o formador aceitar/recusar)
    if (formadorId) {
      await prisma.convite.create({
        data: {
          id: crypto.randomUUID(),
          formadorId,
          moduloId: modulo.id,
          cursoId: cursoId,
          descricao: `Convite para lecionar o módulo "${nome}"`,
          status: 'PENDENTE',
        },
      })
    }

    // Buscar o módulo completo com formadores
    const moduloCompleto = await prisma.modulo.findUnique({
      where: { id: modulo.id },
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
    })

    // Revalidar a página
    revalidatePath('/dashboard/modulos')

    // Mapear para retornar a mesma estrutura do getModulos
    const resultado = {
      ...moduloCompleto,
      formadores: moduloCompleto?.formadores.map(fm => fm.formador) || [],
    }

    return Response.json(resultado, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar módulo:', error)
    return Response.json(
      { error: 'Erro ao criar módulo' },
      { status: 500 }
    )
  }
}
