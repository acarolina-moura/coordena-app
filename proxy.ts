import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
    const { pathname } = req.nextUrl
    const role = req.auth?.user?.role

    if (!req.auth) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

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
    matcher: ['/coordenador/:path*', '/formador/:path*', '/formando/:path*'],
}