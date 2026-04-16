// Script para verificar inscrições dos alunos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarInscricoes() {
  console.log('\n' + '='.repeat(70));
  console.log('👥 VERIFICAÇÃO DE INSCRIÇÕES DOS ALUNOS');
  console.log('='.repeat(70) + '\n');

  try {
    // Buscar todos os alunos
    const alunos = await prisma.formando.findMany({
      include: {
        user: true,
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

    if (alunos.length === 0) {
      console.log('❌ Nenhum aluno encontrado!');
      return;
    }

    console.log(`📊 Total de alunos: ${alunos.length}\n`);

    alunos.forEach((aluno) => {
      console.log(`👤 Aluno: ${aluno.user.nome}`);
      console.log(`   Email: ${aluno.user.email}`);

      if (aluno.inscricoes.length === 0) {
        console.log(`   ❌ SEM INSCRIÇÕES`);
      } else {
        console.log(`   ✅ Inscrições: ${aluno.inscricoes.length}`);
        aluno.inscricoes.forEach((insc) => {
          console.log(`     📚 Curso: ${insc.curso.nome}`);
          if (insc.curso.modulos.length > 0) {
            console.log(`        Módulos neste curso: ${insc.curso.modulos.length}`);
            insc.curso.modulos.forEach((m) => {
              console.log(`          - ${m.nome}`);
            });
          } else {
            console.log(`        (sem módulos)`);
          }
          console.log(`        Data inscrição: ${new Date(insc.createdAt).toLocaleDateString('pt-PT')}`);
        });
      }

      console.log();
    });

    // Resumo de cursos
    console.log('\n' + '='.repeat(70));
    console.log('📚 RESUMO DE CURSOS');
    console.log('='.repeat(70) + '\n');

    const cursos = await prisma.curso.findMany({
      include: {
        modulos: true,
        inscricoes: true,
      },
    });

    cursos.forEach((curso) => {
      console.log(`📖 Curso: ${curso.nome}`);
      console.log(`   ID: ${curso.id}`);
      console.log(`   Módulos: ${curso.modulos.length}`);
      console.log(`   Alunos inscritos: ${curso.inscricoes.length}`);
      console.log();
    });

    console.log('='.repeat(70));
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificarInscricoes();
