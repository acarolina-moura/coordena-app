// Script para testar a função getProximasSessoesFormando
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testFunction() {
    console.log("\n" + "=".repeat(70));
    console.log("🧪 TESTANDO getProximasSessoesFormando");
    console.log("=".repeat(70) + "\n");

    try {
        // Buscar o usuário Carlos
        const userCarlos = await prisma.user.findUnique({
            where: { email: "formando@escola.pt" },
        });

        if (!userCarlos) {
            console.log("❌ Usuário não encontrado!");
            return;
        }

        console.log(`✅ Usuário encontrado: ${userCarlos.nome}\n`);

        // Simulando a função getProximasSessoesFormando
        const formando = await prisma.formando.findUnique({
            where: { userId: userCarlos.id },
            include: { inscricoes: true },
        });

        if (!formando) {
            console.log("❌ Formando não encontrado!");
            return;
        }

        const agora = new Date();
        console.log(`🕒 Hora atual: ${agora.toLocaleString("pt-PT")}\n`);

        const cursoIds = formando.inscricoes.map((i) => i.cursoId);
        console.log(`📚 Cursos do formando: ${cursoIds.length}`);

        const aulas = await prisma.aula.findMany({
            where: {
                dataHora: { gte: agora },
                modulo: { cursoId: { in: cursoIds } },
            },
            orderBy: { dataHora: "asc" },
            take: 4,
            include: {
                modulo: { include: { curso: true } },
                formador: { include: { user: true } },
            },
        });

        console.log(`📋 Aulas futuras encontradas: ${aulas.length}\n`);

        const resultado = aulas.map((aula) => ({
            id: aula.id,
            titulo: `${aula.modulo.curso?.nome || "Módulo Geral"} · ${aula.titulo}`,
            formador: aula.formador.user.nome,
            dataHora: aula.dataHora,
            duracao: aula.duracao,
        }));

        console.log("🎯 RESULTADO DA FUNÇÃO:");
        console.log("");
        resultado.forEach((s, idx) => {
            const data = new Date(s.dataHora);
            console.log(`${idx + 1}. ${s.titulo}`);
            console.log(
                `   📅 ${data.toLocaleDateString("pt-PT")} às ${data.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`,
            );
            console.log(`   ⏱️  ${s.duracao}min`);
            console.log(`   👨‍🏫 ${s.formador}\n`);
        });

        console.log("=".repeat(70));
    } catch (error) {
        console.error("❌ Erro:", error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testFunction();
