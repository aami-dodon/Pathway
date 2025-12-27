import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const GUEST_ONLY_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
]

export function middleware(request: NextRequest) {
    const token = request.cookies.get('pathway-token')?.value
    const { pathname } = request.nextUrl

    // Redirect authenticated users away from guest-only routes
    if (token && GUEST_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        // Add other routes here if needed in the future
    ],
}
