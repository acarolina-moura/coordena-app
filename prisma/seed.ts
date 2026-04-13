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
            coordenador: { create: {} },
        },
    })


    console.log('✅ Seed concluído!')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())