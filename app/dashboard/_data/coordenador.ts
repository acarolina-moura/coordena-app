import { prisma } from '@/lib/prisma'

export async function getCoordenadorStats() {
    const [cursos, formadores, formandos] = await Promise.all([
        prisma.curso.count({ where: { status: 'ATIVO' } }),
        prisma.formador.count(),
        prisma.formando.count(),
    ])

    return { cursos, formadores, formandos }
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