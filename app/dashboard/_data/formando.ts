import { prisma } from '@/lib/prisma'

export async function getFormandoStats(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: { inscricoes: true },
    })

    if (!formando) return { cursosInscritos: 0, modulosCompletos: 0, totalModulos: 0, proximasSessoes: 0 }

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);
    const cursoIds = formando.inscricoes.map((i: any) => i.cursoId)

    const [modulos, proximasSessoes] = await Promise.all([
        prisma.modulo.findMany({
            where: { cursoId: { in: cursoIds } },
        }),
        prisma.aula.count({
            where: {
                dataHora: { gte: inicioDoDia },
                modulo: { cursoId: { in: cursoIds } },
            },
        }),
    ])

    // Módulos com pelo menos uma avaliação positiva = completo
    const avaliacoesPositivas = await prisma.avaliacao.groupBy({
        by: ['moduloId'],
        where: {
            formandoId: formando.id,
            nota: { gte: 10 },
        },
    })

    return {
        cursosInscritos: formando.inscricoes.length,
        modulosCompletos: avaliacoesPositivas.length,
        totalModulos: modulos.length,
        proximasSessoes,
    }
}

export async function getCursoFormando(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: {
            inscricoes: {
                include: {
                    curso: {
                        include: {
                            modulos: {
                                orderBy: { ordem: 'asc' },
                                include: {
                                    avaliacoes: {
                                        where: { formando: { userId } },
                                    },
                                    aulas: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    if (!formando || formando.inscricoes.length === 0) return null

    const inscricao = formando.inscricoes[0]
    const curso = inscricao.curso

    const modulos = curso.modulos.map((m: (typeof curso.modulos)[0]) => {
        const notas = m.avaliacoes.map((a: any) => a.nota)
        const media = notas.length > 0 ? notas.reduce((s: any, n: any) => s + n, 0) / notas.length : null
        const totalAulas = m.aulas.length
        const aulasConcluidas = m.aulas.filter((a: any) => new Date(a.dataHora) < new Date()).length
        const progresso = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0

        return {
            id: m.id,
            nome: m.nome,
            nota: media !== null ? Math.round(media * 10) / 10 : null,
            progresso,
        }
    })

    const progressoGeral = modulos.length > 0
        ? Math.round(modulos.reduce((s: any, m: any) => s + m.progresso, 0) / modulos.length)
        : 0

    return {
        id: curso.id,
        nome: curso.nome,
        status: curso.status,
        dataInicio: inscricao.dataInicio,
        modulos,
        progressoGeral,
    }
}

export async function getProximasSessoesFormando(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: { inscricoes: true },
    })

    if (!formando) return []

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);
    const cursoIds = formando.inscricoes.map((i: any) => i.cursoId)

    const aulas = await prisma.aula.findMany({
        where: {
            dataHora: { gte: inicioDoDia },
            modulo: { cursoId: { in: cursoIds } },
        },
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

export async function getMeusCursos(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: {
            inscricoes: {
                include: {
                    curso: {
                        include: {
                            modulos: {
                                orderBy: { ordem: 'asc' },
                                include: {
                                    avaliacoes: {
                                        where: { formando: { userId } },
                                    },
                                    aulas: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { dataInicio: 'desc' }
            },
        },
    })

    if (!formando) return []

    return formando.inscricoes.map(insc => {
        const curso = insc.curso
        const modulos = curso.modulos.map(m => {
            const notas = m.avaliacoes.map(a => a.nota)
            const media = notas.length > 0 ? notas.reduce((s, n) => s + n, 0) / notas.length : null
            const totalAulas = m.aulas.length
            const aulasConcluidas = m.aulas.filter(a => new Date(a.dataHora) < new Date()).length
            const progresso = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0

            return {
                id: m.id,
                nome: m.nome,
                codigo: `UFCD-${m.id.slice(0, 4).toUpperCase()}`, // Simulando código se não houver no schema
                nota: media !== null ? Math.round(media * 10) / 10 : null,
                progresso,
            }
        })

        const progressoGeral = modulos.length > 0
            ? Math.round(modulos.reduce((s, m) => s + m.progresso, 0) / modulos.length)
            : 0

        return {
            id: curso.id,
            nome: curso.nome,
            status: curso.status,
            cargaHoraria: curso.cargaHoraria,
            dataInicio: insc.dataInicio,
            dataFim: curso.dataFim,
            modulos,
            progressoGeral,
        }
    })
}

export async function getMinhasNotas(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: {
            avaliacoes: {
                include: {
                    modulo: { include: { curso: true } },
                },
                orderBy: { createdAt: 'desc' }
            },
        },
    })

    if (!formando) return []

    return formando.avaliacoes.map(a => ({
        id: a.id,
        modulo: a.modulo.nome,
        codigo: `UFCD-${a.modulo.id.slice(0, 4).toUpperCase()}`,
        nota: a.nota,
        createdAt: a.createdAt,
    }))
}

export type CursoFormando = Awaited<ReturnType<typeof getCursoFormando>>
export type SessaoFormando = Awaited<ReturnType<typeof getProximasSessoesFormando>>[number]
export type MeusCursos = Awaited<ReturnType<typeof getMeusCursos>>
export type MinhasNotas = Awaited<ReturnType<typeof getMinhasNotas>>