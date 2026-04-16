// Script para debugar módulos do formador
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugModulos() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DEBUG: MÓDULOS DO FORMADOR');
  console.log('='.repeat(60) + '\n');

  try {
    // Buscar o primeiro formador (carlos)
    const formador = await prisma.formador.findFirst({
      include: { user: true },
    });

    if (!formador) {
      console.log('❌ Nenhum formador encontrado!');
      return;
    }

    console.log(`👨‍🏫 Formador: ${formador.user.nome} (${formador.user.email})`);
    console.log(`   ID: ${formador.id}\n`);

    // 1. Módulos via FormadorModulo
    const modulosFormadorModulo = await prisma.formadorModulo.findMany({
      where: { formadorId: formador.id },
      include: { modulo: true },
    });

    console.log(`📌 Módulos via FormadorModulo (convites aceites): ${modulosFormadorModulo.length}`);
    modulosFormadorModulo.forEach((fm) => {
      console.log(`   - ${fm.modulo.nome}`);
    });

    // 2. Módulos via Aulas
    const aulasRaw = await prisma.aula.findMany({
      where: { formadorId: formador.id },
    });

    console.log(`\n📌 Total de Aulas: ${aulasRaw.length}`);

    // Extrair módulos únicos
    const moduloIdsUnicos = [...new Set(aulasRaw.map((a) => a.moduloId))];
    console.log(`📌 Módulos únicos via Aulas: ${moduloIdsUnicos.length}`);

    const modulosAulas = await prisma.modulo.findMany({
      where: { id: { in: moduloIdsUnicos } },
    });

    modulosAulas.forEach((m) => {
      console.log(`   - ${m.nome}`);
    });

    // 3. Total único
    const todosModulosIds = new Set();
    modulosFormadorModulo.forEach((fm) => todosModulosIds.add(fm.modulo.id));
    modulosAulas.forEach((m) => todosModulosIds.add(m.id));

    console.log(`\n📊 TOTAL DE MÓDULOS ÚNICOS: ${todosModulosIds.size}`);
    console.log('\n' + '='.repeat(60));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugModulos();
