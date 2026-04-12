import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function diagnose() {
  const userId = "738d8ae6-9d1a-4d47-80c1-8bfd996f5237";

  console.log("=== DIAGNÓSTICO DE CONVITES ===\n");

  // 1. Verificar se o user existe e que tipo é
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { formando: true, formador: true },
  });

  console.log("1. USER:", user?.email, "| Role:", user?.role);
  console.log("   - Tem Formando?", !!user?.formando);
  console.log("   - Tem Formador?", !!user?.formador);

  if (user?.formando) {
    console.log("   - Formando ID:", user.formando.id);
  }
  if (user?.formador) {
    console.log("   - Formador ID:", user.formador.id);
  }

  // 2. Ver TODOS os convites na BD
  const todosConvites = await prisma.convite.findMany({
    include: {
      formando: { include: { user: { select: { email: true } } } },
      formador: { include: { user: { select: { email: true } } } },
      curso: { select: { nome: true } },
    },
  });

  console.log("\n2. TODOS OS CONVITES NA BD:", todosConvites.length);
  todosConvites.forEach((c) => {
    console.log(`   - ID: ${c.id}`);
    console.log(`     Formando: ${c.formando?.user.email} (${c.formandoId})`);
    console.log(`     Formador: ${c.formador?.user.email} (${c.formadorId})`);
    console.log(`     Curso: ${c.curso?.nome}`);
    console.log(`     Status: ${c.status}\n`);
  });

  // 3. Verificar contagem do getFormandoStats
  if (user?.formando) {
    const count = await prisma.convite.count({
      where: {
        formandoId: user.formando.id,
        status: "PENDENTE",
      },
    });
    console.log(
      `\n3. Convites PENDENTES para formandoId ${user.formando.id}:`,
      count
    );
  }

  // 4. Verificar se há convites com formandoId NULL
  const convitesComNullFormando = await prisma.convite.findMany({
    where: { formandoId: null },
    include: { formador: { include: { user: { select: { email: true } } } } },
  });

  console.log(
    "\n4. Convites com formandoId NULL:",
    convitesComNullFormando.length
  );
  convitesComNullFormando.forEach((c) => {
    console.log(
      `   - Para formador: ${c.formador?.user.email} (${c.formadorId})`
    );
  });
}

diagnose()
  .catch(console.error)
  .finally(() => process.exit(0));
