const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
    const aulas = await prisma.aula.findMany({
        include: {
            modulo: { include: { curso: true } },
            formador: { include: { user: true } },
        },
        orderBy: { dataHora: "asc" },
    });

    console.log("📋 TODAS AS AULAS:");
    console.log("");
    aulas.forEach((a) => {
        const data = new Date(a.dataHora);
        const agora = new Date();
        const status = data >= agora ? "⏳ FUTURA" : "✅ PASSADA";
        console.log(`${status} - ${a.titulo}`);
        console.log(`  📅 ${data.toLocaleString("pt-PT")}`);
        console.log(`  🏫 ${a.modulo.curso?.nome || "N/A"} > ${a.modulo.nome}`);
        console.log(`  👨‍🏫 ${a.formador.user.nome}`);
        console.log("");
    });

    await prisma.$disconnect();
})();
