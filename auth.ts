import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma) as import("@auth/core/adapters").Adapter,
    session: { strategy: 'jwt' },
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!user || !user.senha) return null

                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.senha
                )

                if (!passwordMatch) return null

                return {
                    id: user.id,
                    name: user.nome,
                    email: user.email,
                    role: user.role,
                    image: user.image,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as { role?: string }).role
                token.picture = user.image
                
                // Se o usuário é um coordenador, buscar e armazenar coordenadorId
                if ((user as { role?: string }).role === 'COORDENADOR') {
                    const { prisma } = await import('@/lib/prisma')
                    const coordenador = await prisma.coordenador.findUnique({
                        where: { userId: user.id },
                        select: { id: true }
                    })
                    if (coordenador) {
                        token.coordenadorId = coordenador.id
                    }
                }
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
                session.user.role = token.role as "COORDENADOR" | "FORMADOR" | "FORMANDO"
                session.user.image = token.picture as string | undefined | null
                session.user.coordenadorId = token.coordenadorId as string | undefined
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
    },
})