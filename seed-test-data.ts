import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function insertTestData() {
  try {
    // Deletar Formadores primeiro (causa violação de FK se deletar User primeiro)
    await prisma.formador.deleteMany({
      where: {
        user: {
          email: {
            in: ['formador@coordena.pt'],
          },
        },
      },
    });

    // Deletar Formandos
    await prisma.formando.deleteMany({
      where: {
        user: {
          email: {
            in: ['formando@coordena.pt'],
          },
        },
      },
    });

    // Agora pode deletar os Users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['coordenador@coordena.pt', 'formador@coordena.pt', 'formando@coordena.pt'],
        },
      },
    });

    console.log('✓ Utilizadores antigos deletados');

    const passwordHash = '$2b$10$WTkzBJAqnsWJMKyo0C6MTeiP/dNRfKdv7WsH8emFX3oI66ICpggd6';

    // Inserir Coordenador
    const coordenador = await prisma.user.create({
      data: {
        nome: 'Ana',
        email: 'coordenador@coordena.pt',
        senha: passwordHash,
        role: 'COORDENADOR',
      },
    });
    console.log('✓ Coordenador criado:', coordenador.email);

    // Inserir Formador
    const formadorUser = await prisma.user.create({
      data: {
        nome: 'Carlos',
        email: 'formador@coordena.pt',
        senha: passwordHash,
        role: 'FORMADOR',
      },
    });
    const formador = await prisma.formador.create({
      data: {
        userId: formadorUser.id,
      },
    });
    console.log('✓ Formador criado:', formadorUser.email);

    // Inserir Formando
    const formandoUser = await prisma.user.create({
      data: {
        nome: 'Everton',
        email: 'formando@coordena.pt',
        senha: passwordHash,
        role: 'FORMANDO',
      },
    });
    const formando = await prisma.formando.create({
      data: {
        userId: formandoUser.id,
      },
    });
    console.log('✓ Formando criado:', formandoUser.email);

    // Listar todos os utilizadores criados
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['coordenador@coordena.pt', 'formador@coordena.pt', 'formando@coordena.pt'],
        },
      },
    });

    console.log('\n📊 Utilizadores criados:');
    users.forEach((user) => {
      console.log(`  - ${user.nome} (${user.email}) - Role: ${user.role}`);
    });

    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Erro ao inserir dados:', error.message);
    }
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

insertTestData().then((success) => {
  process.exit(success ? 0 : 1);
});
