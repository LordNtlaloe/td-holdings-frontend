import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // Public paths that don't require authentication
    const publicPaths = [
        '/sign-in',
        '/sign-up',
        '/verify-email',
        '/forgot-password',
        '/reset-password',
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/verify-email',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
    ];

    const { pathname } = request.nextUrl;

    // Check if the path is public
    const isPublicPath = publicPaths.some(path =>
        pathname.startsWith(path)
    );

    if (isPublicPath) {
        return NextResponse.next();
    }

    // Check for auth cookie
    const hasAuthCookie = request.cookies.has('accessToken');

    // If no auth cookie and trying to access protected route, redirect to login
    if (!hasAuthCookie) {
        const loginUrl = new URL('/sign-in', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};