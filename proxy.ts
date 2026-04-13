import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
    const { pathname } = req.nextUrl
    const role = req.auth?.user?.role

    if (!req.auth) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // Proteção de rotas por role no dashboard
    // IMPORTANTE: rotas mais específicas ANTES de rotas genéricas
    // (modulos-atribuidos antes de modulos)
    if (pathname.startsWith('/dashboard/cursos') && role !== 'COORDENADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/formadores') && role !== 'COORDENADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/formandos') && role !== 'COORDENADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    // Modulos-atribuidos ANTES de modulos (senão o startsWith captura os dois)
    if (pathname.startsWith('/dashboard/modulos-atribuidos') && role !== 'FORMADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    // Exclui modulos-atribuidos para não ser capturado pelo check genérico
    if (pathname.startsWith('/dashboard/modulos') && pathname !== '/dashboard/modulos-atribuidos' && role !== 'COORDENADOR') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/disponibilidades') && role !== 'COORDENADOR' && role !== 'FORMADOR') {
        // Tanto coordenador como formador acedem a disponibilidades
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (pathname.startsWith('/dashboard/materiais') && role !== 'FORMADOR' && role !== 'FORMANDO') {
        // Formador carrega materiais, Formando vê os materiais
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/notas') && role !== 'FORMADOR' && role !== 'FORMANDO') {
        // Formador vê notas que deu, Formando vê as suas notas
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/trabalhos') && role !== 'FORMANDO') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/dashboard/meus-cursos-formando') && role !== 'FORMANDO') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
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