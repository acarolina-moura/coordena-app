import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
    const { pathname } = req.nextUrl
    const role = req.auth?.user?.role

    if (!req.auth) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // Proteção de rotas por role no dashboard
    if (pathname.startsWith('/dashboard/cursos') && role !== 'COORDENADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/formadores') && role !== 'COORDENADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/formandos') && role !== 'COORDENADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/modulos') && role !== 'COORDENADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/disponibilidades') && role !== 'COORDENADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (pathname.startsWith('/dashboard/materiais') && role !== 'FORMADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/modulos-atribuidos') && role !== 'FORMADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/notas') && role !== 'FORMADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/trabalhos') && role !== 'FORMANDO') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/meus-cursos-formando') && role !== 'FORMANDO') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/assiduidade') && role === 'COORDENADOR') {
        // Coordenador tem sua própria página de assiduidade em /dashboard/assiduidade
        // mas os formandos também acedem — deixar passar, a página filtra por role
    }

    // Rotas legacy
    if (pathname.startsWith('/coordenador') && role !== 'COORDENADOR') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    if (pathname.startsWith('/formador') && role !== 'FORMADOR') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    if (pathname.startsWith('/formando') && role !== 'FORMANDO') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
})

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/coordenador/:path*',
        '/formador/:path*',
        '/formando/:path*',
    ],
}