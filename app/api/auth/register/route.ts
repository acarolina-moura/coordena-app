import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { nome, email, senha, role } = await req.json()

        if (!nome || !email || !senha || !role) {
            return NextResponse.json(
                { error: 'Todos os campos são obrigatórios' },
                { status: 400 }
            )
        }

        const userExistente = await prisma.user.findUnique({
            where: { email },
        })

        if (userExistente) {
            return NextResponse.json(
                { error: 'Email já está em uso' },
                { status: 400 }
            )
        }

        const senhaHash = await bcrypt.hash(senha, 10)

        const user = await prisma.user.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                role,
                // Cria automaticamente o perfil conforme o role
                ...(role === 'COORDENADOR' && {
                    coordenador: { create: {} },
                }),
                ...(role === 'FORMADOR' && {
                    formador: { create: {} },
                }),
                ...(role === 'FORMANDO' && {
                    formando: { create: {} },
                }),
            },
        })

        return NextResponse.json(
            { message: 'Utilizador criado com sucesso', userId: user.id },
            { status: 201 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}