// Script para verificar próximas sessões dos formandos
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugSessoes() {
    console.log("\n" + "=".repeat(70));
    console.log("📅 VERIFICAÇÃO DE PRÓXIMAS SESSÕES");
    console.log("=".repeat(70) + "\n");

    try {
        // Buscar todos os formandos
        const formandos = await prisma.formando.findMany({
            include: {
                user: true,
                inscricoes: {
                    include: {
                        curso: {
                            include: {
                                modulos: {
                                    include: {
                                        aulas: {
                                            include: {
                                                formador: {
                                                    include: {
                                                        user: true,
                                                    },
                                                },
                                            },
                                            orderBy: { dataHora: "asc" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (formandos.length === 0) {
            console.log("❌ Nenhum formando encontrado!");
            return;
        }

        console.log(`📊 Total de formandos: ${formandos.length}\n`);

        const agora = new Date();
        console.log(`🕒 Hora atual: ${agora.toLocaleString("pt-PT")}\n`);

        formandos.forEach((formando) => {
            console.log(`👤 Formando: ${formando.user.nome}`);
            console.log(`   ID: ${formando.id}`);
            console.log(`   Email: ${formando.user.email}`);

            if (formando.inscricoes.length === 0) {
                console.log(`   ❌ SEM INSCRIÇÕES`);
            } else {
                console.log(`   ✅ Inscrições: ${formando.inscricoes.length}`);

                let totalSessoesFuturas = 0;

                formando.inscricoes.forEach((insc) => {
                    const curso = insc.curso;
                    console.log(`\n   📚 Curso: ${curso.nome}`);

                    const todasAsAulas = [];
                    curso.modulos.forEach((mod) => {
                        todasAsAulas.push(
                            ...mod.aulas.map((a) => ({
                                ...a,
                                moduloNome: mod.nome,
                            })),
                        );
                    });

                    const aulasFuturas = todasAsAulas.filter(
                        (a) => new Date(a.dataHora) >= agora,
                    );
                    const aulasPassadas = todasAsAulas.filter(
                        (a) => new Date(a.dataHora) < agora,
                    );

                    totalSessoesFuturas += aulasFuturas.length;

                    console.log(
                        `      📊 Total aulas no curso: ${todasAsAulas.length}`,
                    );
                    console.log(
                        `      ⏱️  Aulas passadas: ${aulasPassadas.length}`,
                    );
                    console.log(
                        `      ⏳ Aulas futuras: ${aulasFuturas.length}`,
                    );

                    if (aulasFuturas.length > 0) {
                        console.log(`      \n      📋 Próximas aulas:`);
                        aulasFuturas.slice(0, 4).forEach((aula, idx) => {
                            const data = new Date(aula.dataHora);
                            console.log(
                                `         ${idx + 1}. ${aula.titulo} (${aula.moduloNome})`,
                            );
                            console.log(
                                `            📅 ${data.toLocaleDateString("pt-PT")} às ${data.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`,
                            );
                            console.log(`            ⏱️  ${aula.duracao}min`);
                            console.log(
                                `            👨‍🏫 ${aula.formador.user.nome}`,
                            );
                        });
                    } else {
                        console.log(`      ❌ Nenhuma aula futura`);
                    }
                });

                console.log(
                    `\n   🎯 TOTAL DE SESSÕES FUTURAS: ${totalSessoesFuturas}`,
                );
            }

            console.log("\n" + "-".repeat(70) + "\n");
        });

        // Resumo geral
        console.log("=".repeat(70));
        console.log("📊 RESUMO GERAL");
        console.log("=".repeat(70) + "\n");

        const totalAulas = await prisma.aula.count();
        const aulasFuturas = await prisma.aula.count({
            where: {
                dataHora: { gte: agora },
            },
        });
        const aulasPassadas = totalAulas - aulasFuturas;

        console.log(`📚 Total de aulas no sistema: ${totalAulas}`);
        console.log(`✅ Aulas futuras: ${aulasFuturas}`);
        console.log(`⏱️  Aulas passadas: ${aulasPassadas}\n`);

        // Verificar se há cursos sem aulas
        const cursosComAulas = await prisma.aula.groupBy({
            by: ["moduloId"],
            where: {},
        });

        const modulos = await prisma.modulo.findMany({
            include: {
                aulas: true,
                curso: true,
            },
        });

        const modulosSemAulas = modulos.filter((m) => m.aulas.length === 0);

        if (modulosSemAulas.length > 0) {
            console.log(
                `⚠️  ${modulosSemAulas.length} módulos SEM aulas definidas:`,
            );
            modulosSemAulas.slice(0, 5).forEach((m) => {
                console.log(
                    `   - ${m.nome} (Curso: ${m.curso?.nome || "N/A"})`,
                );
            });
        }

        console.log("\n" + "=".repeat(70));
    } catch (error) {
        console.error("❌ Erro:", error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

debugSessoes();
