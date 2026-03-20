import { prisma } from '@/lib/prisma'

export async function getFormandoStats(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: { inscricoes: true },
    })

    if (!formando) return { cursosInscritos: 0, modulosCompletos: 0, totalModulos: 0, proximasSessoes: 0, pendingInvitations: 0 }

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
        pendingInvitations: 0,
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
    }) as any

    if (!formando || (formando.inscricoes as any[]).length === 0) return null

    const inscricao = formando.inscricoes[0]
    const curso = inscricao.curso
    const hoje = new Date()

    const modulos = curso.modulos.map((m: any) => {
        const notas = m.avaliacoes.map((a: any) => a.nota)
        const media = notas.length > 0 ? notas.reduce((s: any, n: any) => s + n, 0) / notas.length : null
        const totalAulas = m.aulas.length
        const aulasFuturas = m.aulas.filter((a: any) => new Date(a.dataHora) > hoje).length
        const progresso = totalAulas > 0
            ? Math.round(((totalAulas - aulasFuturas) / totalAulas) * 100)
            : 0

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

    return aulas.map((aula: any) => ({
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
    }) as any

    if (!formando) return []

    const hoje = new Date()

    return (formando.inscricoes as any[]).map(insc => {
        const curso = insc.curso
        const modulos = curso.modulos.map((m: any) => {
            const notas = m.avaliacoes.map((a: any) => a.nota)
            const media = notas.length > 0 ? notas.reduce((s: any, n: any) => s + n, 0) / notas.length : null
            const totalAulas = m.aulas.length
            const aulasFuturas = m.aulas.filter((a: any) => new Date(a.dataHora) > hoje).length
            const progresso = totalAulas > 0
                ? Math.round(((totalAulas - aulasFuturas) / totalAulas) * 100)
                : 0

            return {
                id: m.id,
                nome: m.nome,
                codigo: `UFCD-${m.id.slice(0, 4).toUpperCase()}`,
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
    })

    if (!formando) return []

    const notasParciais = await prisma.notaParcial.findMany({
        where: { formandoId: formando.id },
        include: {
            item: true,
            template: {
                include: {
                    modulo: {
                        include: { curso: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return notasParciais.map(n => ({
        id: n.id,
        modulo: n.template.modulo.nome,
        codigo: `UFCD-${n.template.modulo.id.slice(0, 4).toUpperCase()}`,
        componente: n.item.nome,
        peso: n.item.peso,
        nota: n.valor,
        createdAt: n.createdAt,
    }))
}

export async function getMinhasPresencas(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: {
            presencas: {
                include: {
                    aula: {
                        include: {
                            modulo: true,
                        },
                    },
                },
                orderBy: {
                    aula: {
                        dataHora: 'desc',
                    },
                },
            },
        },
    }) as any

    if (!formando) return []

    return (formando.presencas as any[]).map((p: any) => ({
        id: p.id,
        dataHora: p.aula.dataHora.toISOString(),
        modulo: p.aula.modulo.nome,
        aula: p.aula.titulo,
        status: p.status,
        justificativa: p.justificativa,
        comentarioFormando: p.comentarioFormando,
        documentoUrl: p.documentoUrl,
    }))
}

export async function getCourseSchedule(userId: string) {
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
                                    formadores: {
                                        include: { formador: { include: { user: true } } }
                                    },
                                    aulas: {
                                        orderBy: { dataHora: 'asc' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    }) as any

    if (!formando) return []

    return (formando.inscricoes as any[]).map(insc => ({
        cursoId: insc.curso.id,
        cursoNome: insc.curso.nome,
        modulos: (insc.curso.modulos as any[]).map(m => ({
            id: m.id,
            nome: m.nome,
            cargaHoraria: m.cargaHoraria,
            formadorPrincipal: m.formadores[0]?.formador.user.nome || 'Não atribuído',
            aulas: (m.aulas as any[]).map(a => ({
                id: a.id,
                titulo: a.titulo,
                dataHora: a.dataHora,
                duracao: a.duracao,
            })),
        }))
    }))
}

export async function getMeusTrabalhos(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
    })

    if (!formando) return []

    const inscricoes = await prisma.inscricao.findMany({
        where: { formandoId: formando.id },
        include: {
            curso: {
                include: {
                    modulos: {
                        orderBy: { ordem: 'asc' },
                        include: {
                            templatesAvaliacao: {
                                include: {
                                    items: {
                                        orderBy: { ordem: 'asc' },
                                        include: {
                                            submissoes: {
                                                where: { formandoId: formando.id },
                                            } as any
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    const hoje = new Date()

    return (inscricoes as any[]).flatMap((insc: any) =>
        (insc.curso.modulos as any[]).flatMap((modulo: any) =>
            (modulo.templatesAvaliacao as any[]).flatMap((template: any) =>
                (template.items as any[]).map((item: any) => {
                    const submissao = item.submissoes?.[0] as any

                    let status: 'PENDENTE' | 'ENTREGUE' | 'EM_FALTA' | 'ATRASADO' = 'PENDENTE'

                    if (submissao) {
                        if (item.dataLimite && new Date(submissao.dataEntrega) > new Date(item.dataLimite)) {
                            status = 'ATRASADO'
                        } else {
                            status = 'ENTREGUE'
                        }
                    } else if (item.dataLimite && new Date(item.dataLimite) < hoje) {
                        status = 'EM_FALTA'
                    }

                    return {
                        moduloId: modulo.id,
                        moduloNome: modulo.nome,
                        id: item.id,
                        nome: item.nome,
                        descricao: item.descricao,
                        dataLimite: item.dataLimite,
                        ficheiroAnexoUrl: item.ficheiroAnexoUrl,
                        peso: item.peso,
                        status,
                        submissao: submissao ? {
                            id: submissao.id,
                            ficheiroUrl: submissao.ficheiroUrl,
                            dataEntrega: submissao.dataEntrega,
                            comentario: submissao.comentario,
                        } : null,
                    }
                })
            )
        )
    )
}

// Convites são apenas para Formadores — não existe formandoId no modelo Convite
export async function getMeusConvites(userId: string) {
    return []
}

// Modelo "reviews" não existe no schema
export async function getModulosParaReview(userId: string) {
    return []
}

export type MeusConvites = Awaited<ReturnType<typeof getMeusConvites>>
export type ModuloReviewData = Awaited<ReturnType<typeof getModulosParaReview>>[number]
export type CursoFormando = Awaited<ReturnType<typeof getCursoFormando>>
export type SessaoFormando = Awaited<ReturnType<typeof getProximasSessoesFormando>>[number]
export type MeusCursos = Awaited<ReturnType<typeof getMeusCursos>>
export type MinhasNotas = Awaited<ReturnType<typeof getMinhasNotas>>
export type MinhasPresencas = Awaited<ReturnType<typeof getMinhasPresencas>>
export type CronogramaCurso = Awaited<ReturnType<typeof getCourseSchedule>>
export type MeusTrabalhos = Awaited<ReturnType<typeof getMeusTrabalhos>>