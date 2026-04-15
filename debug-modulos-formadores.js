// Script para verificar proprietário de cada módulo
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugModulosFormadors() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 VERIFICAÇÃO: MÓDULOS E FORMADORES');
  console.log('='.repeat(70) + '\n');

  try {
    // Buscar Carlos
    const carlos = await prisma.formador.findFirst({
      include: { user: true },
    });

    if (!carlos) {
      console.log('❌ Carlos não encontrado!');
      return;
    }

    console.log(`👨‍🏫 Formador: ${carlos.user.nome} (${carlos.user.email})\n`);

    // Obter TODOS os módulos
    const todosModulos = await prisma.modulo.findMany({
      include: {
        formadores: {
          include: {
            formador: { include: { user: true } },
          },
        },
        aulas: {
          include: {
            formador: { include: { user: true } },
          },
          distinct: ['formadorId'],
        },
        curso: true,
      },
      orderBy: { nome: 'asc' },
    });

    console.log(`📚 Total de módulos na BD: ${todosModulos.length}\n`);

    todosModulos.forEach((modulo) => {
      console.log(`\n📍 Módulo: ${modulo.nome}`);
      console.log(`   ID: ${modulo.id}`);
      console.log(`   Curso: ${modulo.curso.nome}`);

      // Via FormadorModulo
      const formadoresViaFM = modulo.formadores.map((fm) => fm.formador.user.nome);
      console.log(`   Formadores (FormadorModulo): ${formadoresViaFM.length > 0 ? formadoresViaFM.join(', ') : 'Nenhum'}`);

      // Via Aulas
      const formadoresViaAulas = [...new Set(modulo.aulas.map((a) => a.formador.user.nome))];
      console.log(`   Formadores (Aulas): ${formadoresViaAulas.length > 0 ? formadoresViaAulas.join(', ') : 'Nenhum'}`);

      // Verificar se Carlos tem este módulo
      const temCarlos = modulo.formadores.some((fm) => fm.formador.user.email === 'formador@coordena.pt') ||
                        modulo.aulas.some((a) => a.formador.user.email === 'formador@coordena.pt');

      console.log(`   ${temCarlos ? '✅ Carlos tem acesso' : '❌ Carlos NÃO tem acesso'}`);
    });

    console.log('\n' + '='.repeat(70));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugModulosFormadors();
