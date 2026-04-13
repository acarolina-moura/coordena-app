import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { nome, email, senha, role, codigoCoordenador } = await req.json()

        if (!nome || !email || !senha || !role) {
            return NextResponse.json(
                { error: 'Todos os campos são obrigatórios' },
                { status: 400 }
            )
        }

        // Validar role
        const validRoles = ['COORDENADOR', 'FORMADOR', 'FORMANDO'] as const;
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Role inválido. Use: COORDENADOR, FORMADOR ou FORMANDO.' },
                { status: 400 }
            )
        }

        // Se for Coordenador, exige código de segurança
        if (role === 'COORDENADOR') {
            const codigoEsperado = process.env.COORDENADOR_REGISTRATION_CODE || 'COORD-2026-SECRET';
            if (codigoCoordenador !== codigoEsperado) {
                return NextResponse.json(
                    { error: 'Código de coordenador inválido. Contacte o administrador.' },
                    { status: 403 },
                );
            }
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
                ...(role === 'FORMADOR' && {
                    formador: { create: {} },
                }),
                ...(role === 'FORMANDO' && {
                    formando: { create: {} },
                }),
                ...(role === 'COORDENADOR' && {
                    coordenador: { create: {} },
                }),
            },
        })

        return NextResponse.json(
            { message: 'Utilizador criado com sucesso', userId: user.id },
            { status: 201 }
        )
    } catch (_error) {
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}