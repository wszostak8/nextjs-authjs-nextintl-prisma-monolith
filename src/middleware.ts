/**
 * @autor Wiktor Szostak (@wszostak8)
 * @license MIT
 * @repository https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith
 *
 * Copyright (c) 2025 Wiktor Szostak. All rights reserved.
 */

import { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { auth } from "@/auth"

const intlMiddleware = createMiddleware(routing)

export default auth((request) => {
    const { nextUrl, auth: session } = request
    const pathname = nextUrl.pathname

    const protectedPaths = ['/dashboard']
    const authPaths = ['/auth', '/auth/reset', '/auth/verify-email', '/auth/verify-2fa']

    const isProtectedPath = protectedPaths.some(path => {
        return pathname === path ||
            pathname.startsWith(`/en${path}`) ||
            pathname.startsWith(`/pl${path}`)
    })

    const isAuthPath = authPaths.some(path => {
        return pathname === path ||
            pathname.startsWith(`/en${path}`) ||
            pathname.startsWith(`/pl${path}`)
    })

    if (isProtectedPath && !session) {
        const locale = pathname.startsWith('/en') ? 'en' : 'pl'
        const redirectUrl = new URL(`/${locale}/auth`, request.url)

        console.log('Redirecting to auth - no session')
        return Response.redirect(redirectUrl)
    }

    if (isAuthPath && session) {
        const locale = pathname.startsWith('/en') ? 'en' : 'pl'
        const redirectUrl = new URL(`/${locale}/dashboard`, request.url)

        return Response.redirect(redirectUrl)
    }

    return intlMiddleware(request as NextRequest)
})

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}