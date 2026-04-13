import { PrismaClient } from '@prisma/client'
import _bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {

    console.log('✅ Seed concluído!')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())