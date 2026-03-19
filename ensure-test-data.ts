import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function ensureTestData() {
  try {
    console.log('🔍 Verificando dados de teste...');

    // Verificar se os dados já existem
    const coordenador = await prisma.user.findUnique({
      where: { email: 'coordenador@coordena.pt' },
    });

    const formador = await prisma.user.findUnique({
      where: { email: 'formador@coordena.pt' },
    });

    const formando = await prisma.user.findUnique({
      where: { email: 'formando@coordena.pt' },
    });

    if (coordenador && formador && formando) {
      console.log('✅ Dados já existem!');
      console.log(`  - Ana (COORDENADOR)`);
      console.log(`  - Carlos (FORMADOR)`);
      console.log(`  - Everton (FORMANDO)`);
      return true;
    }

    console.log('📝 Criando dados de teste...');

    const passwordHash = await bcrypt.hash('123456', 10);

    if (!coordenador) {
      await prisma.user.create({
        data: {
          nome: 'Ana',
          email: 'coordenador@coordena.pt',
          senha: passwordHash,
          role: 'COORDENADOR',
        },
      });
      console.log('✓ Coordenador criado');
    }

    if (!formador) {
      const formadorUser = await prisma.user.create({
        data: {
          nome: 'Carlos',
          email: 'formador@coordena.pt',
          senha: passwordHash,
          role: 'FORMADOR',
        },
      });
      await prisma.formador.create({
        data: {
          userId: formadorUser.id,
        },
      });
      console.log('✓ Formador criado');
    }

    if (!formando) {
      const formandoUser = await prisma.user.create({
        data: {
          nome: 'Everton',
          email: 'formando@coordena.pt',
          senha: passwordHash,
          role: 'FORMANDO',
        },
      });
      await prisma.formando.create({
        data: {
          userId: formandoUser.id,
        },
      });
      console.log('✓ Formando criado');
    }

    console.log('\n✅ Dados de teste prontos!');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Erro:', error.message);
    }
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

ensureTestData().then((success) => {
  process.exit(success ? 0 : 1);
});
