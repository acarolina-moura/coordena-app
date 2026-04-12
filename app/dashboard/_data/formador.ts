import { prisma } from "@/lib/prisma";

export async function getFormadorStats(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
        include: {
            modulosLecionados: {
                include: {
                    modulo: {
                        include: {
                            curso: true,
                        },
                    },
                },
            },
        },
    });

    if (!formador)
        return { modulosAtivos: 0, proximasSessoes: 0, convitesPendentes: 0, cursoNome: null };

    const agora = new Date();

    const [proximasSessoes, convitesPendentes] = await Promise.all([
        prisma.aula.count({
            where: {
                formadorId: formador.id,
                dataHora: { gte: agora },
            },
        }),
        // Contar convites pendentes do formador
        prisma.convite.count({
            where: {
                formadorId: formador.id,
                status: 'PENDENTE',
            },
        }),
    ]);

    // Obtem o primeiro curso do primeiro modulo
    const cursoNome = formador.modulosLecionados[0]?.modulo?.curso?.nome || null;

    return {
        modulosAtivos: formador.modulosLecionados.length,
        proximasSessoes,
        convitesPendentes,
        cursoNome,
    };
}

export async function getProximasSessoesFormador(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
    });

    if (!formador) return [];

    const agora = new Date();

    const aulas = await prisma.aula.findMany({
        where: {
            formadorId: formador.id,
            dataHora: { gte: agora },
        },
        orderBy: { dataHora: "asc" },
        take: 4,
        include: {
            modulo: { include: { curso: true } },
        },
    });

    return aulas.map((aula: (typeof aulas)[0]) => ({
        id: aula.id,
        titulo: `${aula.modulo.curso.nome} · ${aula.titulo}`,
        dataHora: aula.dataHora,
        duracao: aula.duracao,
    }));
}

export type SessaoFormador = Awaited<
    ReturnType<typeof getProximasSessoesFormador>
>[number];

export async function getConvitesPendentesFormador(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
    });

    if (!formador) return [];

    const convites = await prisma.convite.findMany({
        where: {
            formadorId: formador.id,
            status: "PENDENTE",
        },
        include: {
            curso: {
                select: { id: true, nome: true },
            },
            modulo: {
                select: { id: true, nome: true },
            },
        },
        orderBy: { dataEnvio: "desc" },
    });

    return convites.map((convite) => ({
        id: convite.id,
        cursoId: convite.cursoId,
        moduloId: convite.moduloId,
        status: convite.status,
        dataEnvio: convite.dataEnvio,
        dataResposta: convite.dataResposta,
        descricao: convite.descricao || "Sem descrição",
        Curso: convite.curso,
        Modulo: convite.modulo,
    }));
}

export type ConvitePendente = Awaited<
    ReturnType<typeof getConvitesPendentesFormador>
>[number];

export async function getFormadorPerfil(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            formador: true,
        },
    });

    if (!user?.formador) return null;

    return {
        nome: user.nome || '',
        email: user.email || '',
        especialidade: user.formador.especialidade || '',
        competencias: user.formador.competencias || '',
        linkedin: user.formador.linkedin || '',
        github: user.formador.github || '',
        idioma: user.formador.idioma || '',
        nacionalidade: user.formador.nacionalidade || '',
        userId: user.id,
        image: user.image ?? null,
    };
}

/**
 * Obtem todos os modulos atribuidos a um formador
 * @param userId - O user ID do formador
 * @returns Array de modulos com informacoes do curso e alunos inscritos
 */
export async function getModulosAtribuidosFormador(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
        include: {
            modulosLecionados: {
                include: {
                    modulo: {
                        include: {
                            curso: true,
                        },
                    },
                },
            },
        },
    });

    if (!formador) return [];

    // Query unica: buscar todas as inscricoes de todos os cursos de uma vez
    const cursoIds = formador.modulosLecionados.map((fm) => fm.modulo.curso.id);
    const todasInscricoes = await prisma.inscricao.findMany({
        where: { cursoId: { in: cursoIds } },
        include: {
            formando: {
                include: {
                    user: true,
                },
            },
        },
    });

    // Agrupar inscricoes por cursoId em memoria
    const inscricoesPorCurso = new Map<string, typeof todasInscricoes>();
    for (const insc of todasInscricoes) {
        const existing = inscricoesPorCurso.get(insc.cursoId);
        if (existing) existing.push(insc);
        else inscricoesPorCurso.set(insc.cursoId, [insc]);
    }

    const modulosComFormandos = formador.modulosLecionados.map((fm) => {
        const inscricoes = inscricoesPorCurso.get(fm.modulo.curso.id) || [];

        return {
            id: fm.modulo.id,
            nome: fm.modulo.nome,
            codigo: fm.modulo.id.substring(0, 8).toUpperCase(),
            curso: fm.modulo.curso.nome,
            tags: [],
            formandos: inscricoes.length,
            status: 'Ativo' as const,
            estudantes: inscricoes.map((insc) => ({
                id: insc.formando.id,
                nome: insc.formando.user.nome,
                email: insc.formando.user.email,
                dataInscricao: insc.dataInicio,
            })),
        };
    });

    return modulosComFormandos;
}

/**
 * Obtem modulos com alunos e informacoes de presencas para a pagina de notas
 * Retorna dados necessarios para mostrar a tabela de notas mesmo sem template
 */
export async function getModulosComAlunos(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
        include: {
            modulosLecionados: {
                include: {
                    modulo: {
                        include: {
                            curso: true,
                            aulas: true,
                        },
                    },
                },
            },
        },
    });

    if (!formador) return [];

    // Para cada módulo, obter alunos inscritos no curso e suas presenças
    const modulosComDetalhes = await Promise.all(
        formador.modulosLecionados.map(async (fm) => {
            // Obter alunos inscritos neste curso
            const inscricoes = await prisma.inscricao.findMany({
                where: { cursoId: fm.modulo.curso.id },
                include: {
                    formando: {
                        include: {
                            user: true,
                            presencas: {
                                where: {
                                    aula: {
                                        moduloId: fm.modulo.id,
                                        formadorId: formador.id,
                                    },
                                },
                                include: {
                                    aula: true,
                                },
                            },
                        },
                    },
                },
            });

            // Contar total de aulas deste módulo com este formador
            const totalAulas = await prisma.aula.count({
                where: {
                    moduloId: fm.modulo.id,
                    formadorId: formador.id,
                },
            });

            // Para cada aluno, calcular presenças
            const alunos = inscricoes.map((insc) => {
                const presencas = insc.formando.presencas.filter(
                    (p) => p.aula.moduloId === fm.modulo.id
                );
                const totalPresentes = presencas.filter((p) => p.status === 'PRESENTE').length;

                return {
                    id: insc.formando.id,
                    nome: insc.formando.user.nome,
                    presencas: totalPresentes,
                    totalSessoes: totalAulas,
                };
            });

            return {
                id: fm.modulo.id,
                nome: fm.modulo.nome,
                alunos,
            };
        })
    );

    return modulosComDetalhes;
}

// ------------------- MEUS CONVITES (FORMADOR) -------------------
export async function getMeusConvitesFormador(userId: string) {
  const formador = await prisma.formador.findUnique({
    where: { userId },
  });
  if (!formador) return [];

  const convites = await prisma.convite.findMany({
    where: { formadorId: formador.id },
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
