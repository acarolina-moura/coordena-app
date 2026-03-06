import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: 'COORDENADOR' | 'FORMADOR' | 'FORMANDO'
        } & DefaultSession['user']
    }

    interface User {
        role: 'COORDENADOR' | 'FORMADOR' | 'FORMANDO'
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: 'COORDENADOR' | 'FORMADOR' | 'FORMANDO'
    }
}