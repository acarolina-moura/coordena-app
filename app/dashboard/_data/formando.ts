import { prisma } from "@/lib/prisma";

// ------------------- STATS -------------------
export async function getFormandoStats(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: { inscricoes: true },
    });

    // Se não tem formando, retorna stats vazios (é formador, não formando)
    if (!formando) {
        console.log("[getFormandoStats] Formando not found for userId:", userId);
        return {
            cursosInscritos: 0,
            modulosCompletos: 0,
            totalModulos: 0,
            proximasSessoes: 0,
            pendingInvitations: 0,
        };
    }

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const cursoIds = formando.inscricoes.map((i) => i.cursoId);

    const [modulos, proximasSessoes, convitesPendentes] = await Promise.all([
        prisma.modulo.findMany({
            where: { cursoId: { in: cursoIds } },
        }),
        prisma.aula.count({
            where: {
                dataHora: { gte: inicioDoDia },
                modulo: { cursoId: { in: cursoIds } },
            },
        }),
        prisma.convite.count({
            where: {
                formandoId: formando.id,
                status: "PENDENTE",
            },
        }),
    ]);

    const avaliacoesPositivas = await prisma.avaliacao.groupBy({
        by: ["moduloId"],
        where: {
            formandoId: formando.id,
            nota: { gte: 10 },
        },
    });

    return {
        cursosInscritos: formando.inscricoes.length,
        modulosCompletos: avaliacoesPositivas.length,
        totalModulos: modulos.length,
        proximasSessoes,
        pendingInvitations: convitesPendentes,
    };
}

// ------------------- CURSO DO FORMANDO -------------------
export async function getCursoFormando(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: {
            inscricoes: {
                include: {
                    curso: {
                        include: {
                            modulos: {
                                orderBy: { ordem: "asc" },
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
    });

    if (!formando || formando.inscricoes.length === 0) return null;

    const inscricao = formando.inscricoes[0];
    const curso = inscricao.curso;
    const hoje = new Date();

    const modulos = curso.modulos.map((m) => {
        const notas = m.avaliacoes.map((a) => a.nota);
        const media =
            notas.length > 0
                ? notas.reduce((s, n) => s + n, 0) / notas.length
                : null;

        const totalAulas = m.aulas.length;
        const aulasPassadas = m.aulas.filter(
            (a) => new Date(a.dataHora) <= hoje,
        );

        let progresso = 0;
        if (m.cargaHoraria > 0) {
            const minutosRealizados = aulasPassadas.reduce(
                (s, a) => s + a.duracao,
                0,
            );
            const horasRealizadas = minutosRealizados / 60;
            progresso = Math.min(
                100,
                Math.round((horasRealizadas / m.cargaHoraria) * 100),
            );
        } else {
            const aulasFuturas = m.aulas.filter(
                (a) => new Date(a.dataHora) > hoje,
            ).length;
            progresso =
                totalAulas > 0
                    ? Math.round(
                          ((totalAulas - aulasFuturas) / totalAulas) * 100,
                      )
                    : 0;
        }

        return {
            id: m.id,
            nome: m.nome,
            nota: media !== null ? Math.round(media * 10) / 10 : null,
            progresso,
        };
    });

    const cargaHorariaTotal = curso.modulos.reduce(
        (total, m) => total + m.cargaHoraria,
        0,
    );
    let progressoGeral = 0;

    if (cargaHorariaTotal > 0) {
        let minutosCompletos = 0;
        curso.modulos.forEach((m) => {
            const aulasP = m.aulas.filter((a) => new Date(a.dataHora) <= hoje);
            minutosCompletos += aulasP.reduce((s, a) => s + a.duracao, 0);
        });
        progressoGeral = Math.min(
            100,
            Math.round((minutosCompletos / 60 / cargaHorariaTotal) * 100),
        );
    } else {
        progressoGeral =
            modulos.length > 0
                ? Math.round(
                      modulos.reduce((s, m) => s + m.progresso, 0) /
                          modulos.length,
                  )
                : 0;
    }

    return {
        id: curso.id,
        nome: curso.nome,
        status: curso.status,
        dataInicio: inscricao.dataInicio,
        modulos,
        progressoGeral,
    };
}

// ------------------- PRÓXIMAS SESSÕES -------------------
export async function getProximasSessoesFormando(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: { inscricoes: true },
    });

    if (!formando) return [];

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const cursoIds = formando.inscricoes.map((i) => i.cursoId);

    const aulas = await prisma.aula.findMany({
        where: {
            dataHora: { gte: inicioDoDia },
            modulo: { cursoId: { in: cursoIds } },
        },
        orderBy: { dataHora: "asc" },
        take: 4,
        include: {
            modulo: { include: { curso: true } },
            formador: { include: { user: true } },
        },
    });

    return aulas.map((aula) => ({
        id: aula.id,
        titulo: `${aula.modulo.curso.nome} · ${aula.titulo}`,
        formador: aula.formador.user.nome,
        dataHora: aula.dataHora,
        duracao: aula.duracao,
    }));
}

// ------------------- MEUS CURSOS -------------------

export async function getMeusCursos(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: {
            inscricoes: {
                include: {
                    curso: {
                        include: {
                            modulos: {
                                orderBy: { ordem: "asc" },
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
                orderBy: { dataInicio: "desc" },
            },
        },
    });

    if (!formando) return [];

    const hoje = new Date();

    return formando.inscricoes.map((insc) => {
        const curso = insc.curso;

        const modulos = curso.modulos.map((m) => {
            const notas = m.avaliacoes.map((a) => a.nota);
            const media =
                notas.length > 0
                    ? notas.reduce((s, n) => s + n, 0) / notas.length
                    : null;

            const totalAulas = m.aulas.length;
            const aulasPassadas = m.aulas.filter(
                (a) => new Date(a.dataHora) <= hoje,
            );

            let progresso = 0;
            if (m.cargaHoraria > 0) {
                const minutosRealizados = aulasPassadas.reduce(
                    (s, a) => s + a.duracao,
                    0,
                );
                const horasRealizadas = minutosRealizados / 60;
                progresso = Math.min(
                    100,
                    Math.round((horasRealizadas / m.cargaHoraria) * 100),
                );
            } else {
                const aulasFuturas = m.aulas.filter(
                    (a) => new Date(a.dataHora) > hoje,
                ).length;
                progresso =
                    totalAulas > 0
                        ? Math.round(
                              ((totalAulas - aulasFuturas) / totalAulas) * 100,
                          )
                        : 0;
            }

            return {
                id: m.id,
                nome: m.nome,
                codigo: `UFCD-${m.id.slice(0, 4).toUpperCase()}`,
                nota: media !== null ? Math.round(media * 10) / 10 : null,
                progresso,
            };
        });

        const cargaHorariaTotal = curso.modulos.reduce(
            (total, m) => total + m.cargaHoraria,
            0,
        );
        let progressoGeral = 0;

        if (cargaHorariaTotal > 0) {
            let minutosCompletos = 0;
            curso.modulos.forEach((m) => {
                const aulasP = m.aulas.filter(
                    (a) => new Date(a.dataHora) <= hoje,
                );
                minutosCompletos += aulasP.reduce((s, a) => s + a.duracao, 0);
            });
            progressoGeral = Math.min(
                100,
                Math.round((minutosCompletos / 60 / cargaHorariaTotal) * 100),
            );
        } else {
            progressoGeral =
                modulos.length > 0
                    ? Math.round(
                          modulos.reduce((s, m) => s + m.progresso, 0) /
                              modulos.length,
                      )
                    : 0;
        }

        return {
            id: curso.id,
            nome: curso.nome,
            status: curso.status,
            cargaHoraria: curso.cargaHoraria,
            dataInicio: insc.dataInicio,
            dataFim: curso.dataFim,
            modulos,
            progressoGeral,
        };
    });
}

// ------------------- MINHAS NOTAS -------------------
export async function getMinhasNotas(userId: string) {
    const formando = await prisma.formando.findUnique({ where: { userId } });
    if (!formando) return [];

    const notasParciais = await prisma.notaParcial.findMany({
        where: { formandoId: formando.id },
        include: {
            item: true,
            template: { include: { modulo: { include: { curso: true } } } },
        },
        orderBy: { createdAt: "desc" },
    });

    return notasParciais.map((n) => ({
        id: n.id,
        modulo: n.template.modulo.nome,
        codigo: `UFCD-${n.template.modulo.id.slice(0, 4).toUpperCase()}`,
        componente: n.item.nome,
        peso: n.item.peso,
        nota: n.valor,
        createdAt: n.createdAt,
    }));
}

// ------------------- MINHAS PRESENÇAS -------------------
export async function getMinhasPresencas(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: {
            presencas: {
                include: { aula: { include: { modulo: true } } },
                orderBy: { aula: { dataHora: "desc" } },
            },
        },
    });
    if (!formando) return [];

    return formando.presencas.map((p) => ({
        id: p.id,
        dataHora: p.aula.dataHora.toISOString(),
        modulo: p.aula.modulo.nome,
        aula: p.aula.titulo,
        status: p.status,
        justificativa: p.justificativa,
        comentarioFormando: p.comentarioFormando,
        documentoUrl: p.documentoUrl,
    }));
}

// ------------------- CRONOGRAMA -------------------
export async function getCourseSchedule(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: {
            inscricoes: {
                include: {
                    curso: {
                        include: {
                            modulos: {
                                orderBy: { ordem: "asc" },
                                include: {
                                    formadores: {
                                        include: {
                                            formador: {
                                                include: { user: true },
                                            },
                                        },
                                    },
                                    aulas: { orderBy: { dataHora: "asc" } },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!formando) return [];

    return formando.inscricoes.map((insc) => ({
        cursoId: insc.curso.id,
        cursoNome: insc.curso.nome,
        modulos: insc.curso.modulos.map((m) => ({
            id: m.id,
            nome: m.nome,
            cargaHoraria: m.cargaHoraria,
            formadorPrincipal:
                m.formadores[0]?.formador.user.nome ?? "Não atribuído",
            aulas: m.aulas.map((a) => ({
                id: a.id,
                titulo: a.titulo,
                dataHora: a.dataHora,
                duracao: a.duracao,
            })),
        })),
    }));
}

// ------------------- MEUS TRABALHOS -------------------
export async function getMeusTrabalhos(userId: string) {
    const formando = await prisma.formando.findUnique({ where: { userId } });
    if (!formando) return [];

    const inscricoes = await prisma.inscricao.findMany({
        where: { formandoId: formando.id },
        include: {
            curso: {
                include: {
                    modulos: {
                        orderBy: { ordem: "asc" },
                        include: {
                            templatesAvaliacao: {
                                include: {
                                    items: {
                                        orderBy: { ordem: "asc" },
                                        include: {
                                            submissoes: {
                                                where: {
                                                    formandoId: formando.id,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const hoje = new Date();

    return inscricoes.flatMap((insc) =>
        insc.curso.modulos.flatMap((modulo) =>
            modulo.templatesAvaliacao.flatMap((template) =>
                template.items.map((item) => {
                    const submissao = item.submissoes?.[0];

                    let status:
                        | "PENDENTE"
                        | "ENTREGUE"
                        | "EM_FALTA"
                        | "ATRASADO" = "PENDENTE";
                    if (submissao) {
                        if (
                            item.dataLimite &&
                            submissao.dataEntrega &&
                            new Date(submissao.dataEntrega) >
                                new Date(item.dataLimite)
                        ) {
                            status = "ATRASADO";
                        } else {
                            status = "ENTREGUE";
                        }
                    } else if (
                        item.dataLimite &&
                        new Date(item.dataLimite) < hoje
                    ) {
                        status = "EM_FALTA";
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
                        submissao: submissao
                            ? {
                                  id: submissao.id,
                                  ficheiroUrl: submissao.ficheiroUrl,
                                  dataEntrega: submissao.dataEntrega,
                                  comentario: submissao.comentario,
                              }
                            : null,
                    };
                }),
            ),
        ),
    );
}

// ------------------- CONVITES & REVIEWS -------------------
export async function getMeusConvites(userId: string) {
  const formando = await prisma.formando.findUnique({
    where: { userId },
  });
  if (!formando) return [];

  const convites = await prisma.convite.findMany({
    where: { formandoId: formando.id },
    include: {
      curso: { select: { nome: true } },
      modulo: { select: { nome: true } },
    },
    orderBy: { dataEnvio: "desc" },
  });

  return convites.map((c) => ({
    id: c.id,
    status: c.status,
    descricao: c.descricao,
    dataEnvio: c.dataEnvio,
    dataResposta: c.dataResposta,
    cursoNome: c.curso?.nome ?? null,
    moduloNome: c.modulo?.nome ?? null,
  }));
}

export async function getModulosParaReview(userId: string) {
    const formando = await prisma.formando.findUnique({
        where: { userId },
        include: {
            inscricoes: {
                include: {
                    curso: {
                        include: {
                            modulos: {
                                orderBy: { ordem: "asc" },
                                include: {
                                    reviews: {
                                        where: { formando: { userId } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!formando) return [];

    return formando.inscricoes.flatMap((insc) =>
        insc.curso.modulos.map((m) => ({
            id: m.id,
            nome: m.nome,
            cursoNome: insc.curso.nome,
            hasReview: m.reviews.length > 0,
            review: m.reviews[0]
                ? {
                      nota: m.reviews[0].nota,
                      comentario: m.reviews[0].comentario ?? "",
                      data: m.reviews[0].createdAt,
                  }
                : undefined,
        })),
    );
}

// ------------------- TYPES -------------------
export type MeusConvites = Awaited<ReturnType<typeof getMeusConvites>>;
export type ModuloReviewData = Awaited<
    ReturnType<typeof getModulosParaReview>
>[number];
export type CursoFormando = Awaited<ReturnType<typeof getCursoFormando>>;
export type SessaoFormando = Awaited<
    ReturnType<typeof getProximasSessoesFormando>
>[number];
export type MeusCursos = Awaited<ReturnType<typeof getMeusCursos>>;
export type MinhasNotas = Awaited<ReturnType<typeof getMinhasNotas>>;
export type MinhasPresencas = Awaited<ReturnType<typeof getMinhasPresencas>>;
export type CronogramaCurso = Awaited<ReturnType<typeof getCourseSchedule>>;
export type MeusTrabalhos = Awaited<ReturnType<typeof getMeusTrabalhos>>;
