// Script para adicionar aulas futuras ao formando Carlos
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function addFutureClasses() {
    console.log("\n" + "=".repeat(70));
    console.log("📅 ADICIONANDO AULAS FUTURAS AO CARLOS FORMANDO");
    console.log("=".repeat(70) + "\n");

    try {
        // Buscar o usuário Carlos (formando@escola.pt)
        const userCarlos = await prisma.user.findUnique({
            where: { email: "formando@escola.pt" },
            include: { formando: true },
        });

        if (!userCarlos || !userCarlos.formando) {
            console.log("❌ Carlos Formando não encontrado!");
            return;
        }

        const formando = await prisma.formando.findUnique({
            where: { id: userCarlos.formando.id },
            include: {
                inscricoes: {
                    include: {
                        curso: {
                            include: {
                                modulos: true,
                            },
                        },
                    },
                },
            },
        });

        // Buscar o Bruno Formador
        const userBruno = await prisma.user.findUnique({
            where: { email: "formador@escola.pt" },
            include: { formador: true },
        });

        if (!userBruno || !userBruno.formador) {
            console.log("❌ Bruno Formador não encontrado!");
            return;
        }

        const formadorId = userBruno.formador.id;

        console.log(`✅ Encontrado: ${userCarlos.nome}`);
        console.log(
            `   Cursos: ${formando.inscricoes.map((i) => i.curso.nome).join(", ")}`,
        );
        console.log(`✅ Formador: ${userBruno.nome}`);

        const agora = new Date();
        let totalAdicionadas = 0;

        // Para cada curso do formando
        for (const inscricao of formando.inscricoes) {
            const curso = inscricao.curso;
            console.log(
                `\n   📚 Adicionando aulas futuras ao curso: ${curso.nome}`,
            );

            // Adicionar aulas futuras a cada módulo
            for (let i = 0; i < curso.modulos.length; i++) {
                const modulo = curso.modulos[i];

                // Criar 2 aulas futuras por módulo
                for (let j = 1; j <= 2; j++) {
                    const dataAula = new Date(agora);
                    dataAula.setDate(dataAula.getDate() + i * 3 + j * 2); // Distribuir ao longo do tempo
                    dataAula.setHours(10 + i, 0, 0, 0);

                    const aula = await prisma.aula.create({
                        data: {
                            titulo: `${modulo.nome} - Aula ${j}`,
                            dataHora: dataAula,
                            duracao: 120,
                            moduloId: modulo.id,
                            formadorId: formadorId,
                        },
                    });

                    console.log(`      ✅ Aula criada: ${aula.titulo}`);
                    console.log(
                        `         📅 ${new Date(aula.dataHora).toLocaleString("pt-PT")}`,
                    );
                    totalAdicionadas++;
                }
            }
        }

        console.log(
            `\n✨ Total de aulas futuras adicionadas: ${totalAdicionadas}`,
        );
        console.log("\n" + "=".repeat(70));
    } catch (error) {
        console.error("❌ Erro:", error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

addFutureClasses();
