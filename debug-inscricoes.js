// Script para debugar módulos e inscrições
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugInscricoes() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DEBUG: MÓDULOS E INSCRIÇÕES');
  console.log('='.repeat(60) + '\n');

  try {
    // Buscar o primeiro formador
    const formador = await prisma.formador.findFirst({
      include: { user: true },
    });

    if (!formador) {
      console.log('❌ Nenhum formador encontrado!');
      return;
    }

    console.log(`👨‍🏫 Formador: ${formador.user.nome}\n`);

    // Obter módulos do formador
    const modulosFormadorModulo = await prisma.formadorModulo.findMany({
      where: { formadorId: formador.id },
      include: {
        modulo: {
          include: {
            curso: true,
          },
        },
      },
    });

    const aulasModulos = await prisma.aula.findMany({
      where: { formadorId: formador.id },
      include: {
        modulo: {
          include: {
            curso: true,
          },
        },
      },
    });

    // Combinar módulos únicos
    const modulosMap = new Map();
    modulosFormadorModulo.forEach((fm) => {
      modulosMap.set(fm.modulo.id, fm.modulo);
    });
    aulasModulos.forEach((aula) => {
      modulosMap.set(aula.modulo.id, aula.modulo);
    });

    console.log(`📌 Total de módulos do formador: ${modulosMap.size}\n`);

    // Para cada módulo, debugar inscrições
    for (const [moduloId, modulo] of modulosMap) {
      console.log(`\n📍 Módulo: ${modulo.nome}`);
      console.log(`   ID: ${moduloId}`);
      console.log(`   CursoID: ${modulo.cursoId || 'NULL'}`);

      if (!modulo.cursoId) {
        console.log(`   ⚠️  Módulo SEM cursoId associado!`);
        continue;
      }

      // Buscar inscrições neste curso
      const inscricoes = await prisma.inscricao.findMany({
        where: { cursoId: modulo.cursoId },
        include: {
          formando: {
            include: { user: true },
          },
        },
      });

      console.log(`   Inscrições no curso: ${inscricoes.length}`);
      if (inscricoes.length > 0) {
        inscricoes.forEach((insc) => {
          console.log(`     - ${insc.formando.user.nome}`);
        });
      }
    }

    console.log('\n' + '='.repeat(60));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugInscricoes();
