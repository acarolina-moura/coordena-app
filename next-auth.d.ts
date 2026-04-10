import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: 'COORDENADOR' | 'FORMADOR' | 'FORMANDO'
            coordenadorId?: string | null
        } & DefaultSession['user']
    }

    interface User {
        id: string
        name?: string | null
        email?: string | null
        role: 'COORDENADOR' | 'FORMADOR' | 'FORMANDO'
        coordenadorId?: string | null
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: 'COORDENADOR' | 'FORMADOR' | 'FORMANDO'
        coordenadorId?: string | null
    }
}
