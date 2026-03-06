import { prisma } from '@/lib/prisma'

export async function getCoordenadorStats() {
    const [cursos, formadores, formandos] = await Promise.all([
        prisma.curso.count({ where: { status: 'ATIVO' } }),
        prisma.formador.count(),
        prisma.formando.count(),
    ])

    return { cursos, formadores, formandos }
}

export type CursoComDetalhes = {
  id: string
  nome: string
  descricao: string | null
  dataInicio: Date | null
  dataFim: Date | null
  cargaHoraria: number
  status: 'ATIVO' | 'PAUSADO' | 'ENCERRADO'
  createdAt: Date
  modulos: Array<{
    id: string
    nome: string
    descricao: string | null
    ordem: number
    cargaHoraria: number
  }>
  formandos: number
}

export async function getCursos(): Promise<CursoComDetalhes[]> {
  const cursos = await prisma.curso.findMany({
    include: {
      modulos: true,
      inscricoes: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return cursos.map(curso => ({
    ...curso,
    formandos: curso.inscricoes.length,
  }))
}

export async function getProximasSessoes() {
    const agora = new Date()

    const aulas = await prisma.aula.findMany({
        where: { dataHora: { gte: agora } },
        orderBy: { dataHora: 'asc' },
        take: 4,
        include: {
            modulo: { include: { curso: true } },
            formador: { include: { user: true } },
        },
    })

    return aulas.map((aula: (typeof aulas)[0]) => ({
        id: aula.id,
        titulo: `${aula.modulo.curso.nome} · ${aula.titulo}`,
        formador: aula.formador.user.nome,
        dataHora: aula.dataHora,
        duracao: aula.duracao,
    }))
}

type FormandoRiscoResult = {
    id: string
    nome: string
    curso: string
    negativas: number
}

export async function getFormandosEmRisco(): Promise<FormandoRiscoResult[]> {
    const avaliacoes = await prisma.avaliacao.groupBy({
        by: ['formandoId', 'moduloId'],
        _avg: { nota: true },
        having: { nota: { _avg: { lt: 10 } } },
    })

    const formandoIds = [...new Set(avaliacoes.map((a: (typeof avaliacoes)[0]) => a.formandoId))]

    if (formandoIds.length === 0) return []

    const formandos = await prisma.formando.findMany({
        where: { id: { in: formandoIds } },
        include: {
            user: true,
            inscricoes: { include: { curso: true } },
        },
        take: 5,
    })

    return formandos.map((f: (typeof formandos)[0]) => ({
        id: f.id,
        nome: f.user.nome,
        curso: f.inscricoes[0]?.curso.nome ?? '—',
        negativas: avaliacoes.filter((a: (typeof avaliacoes)[0]) => a.formandoId === f.id).length,
    }))
}

// ─── Tipos exportados para usar nos componentes ───────────────────────────────
export type ProximaSessao = Awaited<ReturnType<typeof getProximasSessoes>>[number]
export type FormandoEmRisco = Awaited<ReturnType<typeof getFormandosEmRisco>>[number]

export type ModuloComDetalhes = {
  id: string
  nome: string
  descricao: string | null
  ordem: number
  cargaHoraria: number
  cursoId: string
  curso?: {
    id: string
    nome: string
  }
  formadores?: Array<{
    id: string
    especialidade: string | null
    user: {
      id: string
      nome: string
    }
  }>
}

export async function getModulos(): Promise<ModuloComDetalhes[]> {
  return await prisma.modulo.findMany({
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
    orderBy: { ordem: 'asc' },
  }).then(modulos =>
    modulos.map(mod => ({
      ...mod,
      formadores: mod.formadores.map(fm => fm.formador),
    }))
  )
}

export type FormadorComDetalhes = {
  id: string
  especialidade: string | null
  user: {
    id: string
    nome: string
    email: string
  }
}

export async function getFormadores(): Promise<FormadorComDetalhes[]> {
  return await prisma.formador.findMany({
    include: {
      user: {
        select: { id: true, nome: true, email: true },
      },
    },
    orderBy: { user: { nome: 'asc' } },
  })
}