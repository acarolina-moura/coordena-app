import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Coordenador
    await prisma.user.upsert({
        where: { email: 'coordenador@coordena.pt' },
        update: {},
        create: {
            nome: 'Ana',
            email: 'coordenador@coordena.pt',
            senha: await bcrypt.hash('123456', 10),
            role: 'COORDENADOR',
        },
    })

    // Formador
    await prisma.user.upsert({
        where: { email: 'formador@coordena.pt' },
        update: {},
        create: {
            nome: 'Carlos',
            email: 'formador@coordena.pt',
            senha: await bcrypt.hash('123456', 10),
            role: 'FORMADOR',
            formador: { create: {} },
        },
    })

    // Formando
    await prisma.user.upsert({
        where: { email: 'formando@coordena.pt' },
        update: {},
        create: {
            nome: 'Everton',
            email: 'formando@coordena.pt',
            senha: await bcrypt.hash('123456', 10),
            role: 'FORMANDO',
            formando: { create: {} },
        },
    })

    console.log('✅ Seed concluído!')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())