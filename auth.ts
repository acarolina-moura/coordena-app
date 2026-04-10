import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
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
                    select: { id: true, nome: true, email: true, role: true, image: true, senha: true, coordenador: { select: { id: true } } }
                })

                if (!user || !user.senha) return null

                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.senha
                )

                if (!passwordMatch) return null

                // Retorna apenas campos essenciais — mínimo para JWT pequeno
                return {
                    id: user.id,
                    name: user.nome,
                    email: user.email,
                    role: user.role,
                    coordenadorId: user.coordenador?.id ?? null,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    coordenadorId: user.coordenadorId,
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as "COORDENADOR" | "FORMADOR" | "FORMANDO"
                session.user.coordenadorId = token.coordenadorId as string | undefined | null
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
    },
})
