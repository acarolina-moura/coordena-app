// Script para verificar templates no banco de dados
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarTemplates() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 VERIFICAÇÃO DE TEMPLATES');
  console.log('='.repeat(60) + '\n');

  try {
    // 1. Verificar quantos templates existem
    const totalTemplates = await prisma.templateAvaliacao.count();
    console.log(`📊 Total de templates: ${totalTemplates}`);

    if (totalTemplates === 0) {
      console.log('   ⚠️  NENHUM TEMPLATE ENCONTRADO!\n');
    }

    // 2. Listar todos os templates
    const templates = await prisma.templateAvaliacao.findMany({
      include: {
        formador: { include: { user: true } },
        modulo: true,
        items: true,
      },
    });

    if (templates.length > 0) {
      console.log('\n📋 TEMPLATES ENCONTRADOS:\n');
      templates.forEach((template, index) => {
        console.log(`${index + 1}. Formador: ${template.formador.user.name || template.formador.user.email}`);
        console.log(`   Módulo: ${template.modulo.nome}`);
        console.log(`   Items: ${template.items.length}`);
        template.items.forEach((item, i) => {
          console.log(`     - ${i + 1}. ${item.nome} (${item.peso}%)`);
        });
        console.log();
      });
    }

    // 3. Verificar formadores e módulos
    const formadores = await prisma.formador.count();
    const modulos = await prisma.modulo.count();
    const formadoresModulo = await prisma.formadorModulo.count();

    console.log('📈 ESTATÍSTICAS:');
    console.log(`   Formadores: ${formadores}`);
    console.log(`   Módulos: ${modulos}`);
    console.log(`   Associações Formador-Módulo: ${formadoresModulo}\n`);

    // 4. Listar formadores e seus módulos (sem templates)
    if (totalTemplates === 0) {
      console.log('📌 FORMADORES E MÓDULOS (sem templates):\n');
      const formadoresComModulos = await prisma.formador.findMany({
        include: {
          formadorModulos: { include: { modulo: true } },
          aulas: { include: { modulo: true } },
          user: true,
        },
      });

      formadoresComModulos.forEach((formador) => {
        console.log(`👨‍🏫 ${formador.user.name || formador.user.email}`);
        const modulosUnicos = new Set();
        formador.formadorModulos.forEach((fm) =>
          modulosUnicos.add(`${fm.modulo.id}: ${fm.modulo.nome}`)
        );
        formador.aulas.forEach((aula) =>
          modulosUnicos.add(`${aula.modulo.id}: ${aula.modulo.nome}`)
        );
        if (modulosUnicos.size > 0) {
          modulosUnicos.forEach((m) => console.log(`  - ${m}`));
        } else {
          console.log('  (sem módulos associados)');
        }
        console.log();
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTemplates();
