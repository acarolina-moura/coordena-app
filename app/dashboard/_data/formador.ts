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
        // placeholder para quando tiveres o modelo de convites
        Promise.resolve(0),
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
