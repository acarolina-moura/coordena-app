import { prisma } from "@/lib/prisma";

export async function getFormadorStats(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
        include: { modulosLecionados: true },
    });

    if (!formador)
        return { modulosAtivos: 0, proximasSessoes: 0, convitesPendentes: 0 };

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

    return {
        modulosAtivos: formador.modulosLecionados.length,
        proximasSessoes,
        convitesPendentes,
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
            status: 'PENDENTE',
        },
        orderBy: { dataEnvio: "desc" },
    });

    return convites.map((convite) => ({
        id: convite.id,
        descricao: convite.descricao || 'Sem descrição',
        dataEnvio: convite.dataEnvio,
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
    };
}

/**
 * Fetches all modules assigned to a trainer (formador)
 * @param userId - The user ID of the trainer
 * @returns Array of assigned modules with course information and enrolled students
 */
export async function getModulosAtribuidosFormador(userId: string) {
    // Find the trainer by userId
    const formador = await prisma.formador.findUnique({
        where: { userId },
        include: {
            // Include the relationship between trainer and modules
            modulosLecionados: {
                include: {
                    // Include module details and course information
                    modulo: {
                        include: {
                            curso: true,
                        },
                    },
                },
            },
        },
    });

    // Return empty array if trainer not found
    if (!formador) return [];

    // For each module, also get the inscriptions (students enrolled in the course)
    const modulosComFormandos = await Promise.all(
        formador.modulosLecionados.map(async (fm) => {
            // Get all students enrolled in this course
            const inscricoes = await prisma.inscricao.findMany({
                where: { cursoId: fm.modulo.curso.id },
                include: {
                    formando: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            return {
                id: fm.modulo.id,
                nome: fm.modulo.nome,
                // Generate a code from the module ID
                codigo: fm.modulo.id.substring(0, 8).toUpperCase(),
                // Get the course name
                curso: fm.modulo.curso.nome,
                // Tags - empty for now (can be expanded later)
                tags: [],
                // Get actual count of students from inscriptions
                formandos: inscricoes.length,
                // Default status is active
                status: 'Ativo' as const,
                // Add list of students enrolled in this course
                estudantes: inscricoes.map((insc) => ({
                    id: insc.formando.id,
                    nome: insc.formando.user.nome,
                    email: insc.formando.user.email,
                    dataInscricao: insc.dataInicio,
                })),
            };
        })
    );

    return modulosComFormandos;
}

/**
 * Obtém módulos com alunos e informações de presenças para a página de notas
 * Retorna dados necessários para mostrar a tabela de notas mesmo sem template
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

export async function getAulasFormador(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
        include: {
            user: true,
            aulas: {
                include: {
                    modulo: true,
                },
                orderBy: { dataHora: "asc" },
            },
        },
    });

    if (!formador) return [];

    return formador.aulas.map((aula) => ({
        id: aula.id,
        titulo: aula.titulo,
        formador: formador.user.nome,
        data: aula.dataHora.toISOString().split("T")[0],
        horaInicio: `${String(aula.dataHora.getHours()).padStart(2, "0")}:${String(aula.dataHora.getMinutes()).padStart(2, "0")}`,
        duracao: `${aula.duracao}h`,
        ufcd: aula.modulo.nome,
        cor: "bg-indigo-100 text-indigo-700 border-indigo-200",
        moduloId: aula.modulo.id,
    }));
}
