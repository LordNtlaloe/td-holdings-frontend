import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/verify',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/auth/register',
    '/api/auth/sign-in',
    '/api/auth/verify',
    '/api/auth/password/reset-request',
    '/api/auth/password/reset',
    '/api/auth/refresh'
];

// Role-based route permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
    ADMIN: [
        '/dashboard',
        '/dashboard/users',
        '/dashboard/employees',
        '/dashboard/stores',
        '/dashboard/products',
        '/dashboard/inventory',
        '/dashboard/transfers',
        '/dashboard/sales',
        '/dashboard/reports',
        '/dashboard/audit',
        '/dashboard/analytics',
        '/dashboard/settings',
        '/dashboard/categories',
        '/dashboard/suppliers',
        '/dashboard/customers',
        '/dashboard/warehouses',
        '/dashboard/system'
    ],
    MANAGER: [
        '/dashboard',
        '/dashboard/employees',
        '/dashboard/stores',
        '/dashboard/products',
        '/dashboard/inventory',
        '/dashboard/transfers',
        '/dashboard/sales',
        '/dashboard/reports',
        '/dashboard/analytics',
        '/dashboard/suppliers',
        '/dashboard/customers',
        '/dashboard/warehouses'
    ],
    CASHIER: [
        '/dashboard',
        '/dashboard/products',
        '/dashboard/inventory',
        '/dashboard/sales',
        '/dashboard/customers',
        '/dashboard/checkout',
        '/dashboard/pos'
    ]
};

interface DecodedToken {
    userId: string;
    email: string;
    role: string;
    storeId?: string;
    exp: number;
}

async function verifyToken(token: string): Promise<DecodedToken | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as DecodedToken;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route => {
        if (route === '/') return pathname === '/';
        return pathname.startsWith(route);
    });
}

function hasRoutePermission(role: string, pathname: string): boolean {
    const allowedRoutes = ROLE_PERMISSIONS[role] || [];

    // Allow access to dashboard home for all authenticated users
    if (pathname === '/dashboard') {
        return true;
    }

    // Check if the requested path starts with any allowed route
    return allowedRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );
}

function shouldRefreshToken(decodedToken: DecodedToken): boolean {
    // Refresh token if it expires in less than 5 minutes
    const expiresIn = decodedToken.exp * 1000 - Date.now();
    return expiresIn < 5 * 60 * 1000;
}

// Changed from "middleware" to "proxy" named export
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // Get token from cookies or Authorization header
    let token = request.cookies.get('accessToken')?.value;

    if (!token) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    // If no token and trying to access protected route, redirect to login
    if (!token) {
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    }

    // Verify the token
    const decodedToken = await verifyToken(token);

    if (!decodedToken) {
        // Clear invalid token and redirect to login
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
    }

    // Check if token needs refresh
    if (shouldRefreshToken(decodedToken)) {
        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (refreshToken) {
            try {
                const refreshResponse = await fetch(new URL('/api/auth/refresh', request.url), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken }),
                });

                if (refreshResponse.ok) {
                    const { accessToken, refreshToken: newRefreshToken } = await refreshResponse.json();

                    // Update cookies with new tokens
                    const response = NextResponse.next();
                    response.cookies.set('accessToken', accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 24 * 60 * 60, // 24 hours
                    });

                    if (newRefreshToken) {
                        response.cookies.set('refreshToken', newRefreshToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'strict',
                            maxAge: 7 * 24 * 60 * 60, // 7 days
                        });
                    }

                    return response;
                }
            } catch (error) {
                console.error('Token refresh failed:', error);
            }
        }
    }

    // Check route permissions for dashboard routes
    if (pathname.startsWith('/dashboard')) {
        if (!hasRoutePermission(decodedToken.role, pathname)) {
            console.warn(`User ${decodedToken.role} attempted to access unauthorized route: ${pathname}`);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', decodedToken.userId);
        requestHeaders.set('x-user-email', decodedToken.email);
        requestHeaders.set('x-user-role', decodedToken.role);
        if (decodedToken.storeId) {
            requestHeaders.set('x-user-store-id', decodedToken.storeId);
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

// Optional: You can also export a default function if you prefer
// export default proxy;

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};