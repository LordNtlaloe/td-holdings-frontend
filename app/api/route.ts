import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

// Route mapping configuration
const ROUTE_MAPPINGS = {
    // Authentication routes
    'v1/auth/register': '/v1/auth/register',
    'v1/auth/login': '/v1/auth/login',
    'v1/auth/verify': '/v1/auth/verify',
    'v1/auth/logout': '/v1/auth/logout',
    'v1/auth/refresh': '/v1/auth/refresh',
    'v1/auth/profile': '/v1/auth/profile',
    'v1/auth/password/reset-request': '/v1/auth/password/reset-request',
    'v1/auth/password/reset': '/v1/auth/password/reset',
    'v1/auth/password/change': '/v1/auth/password/change',

    // User routes
    'v1/users': '/v1/users',
    'v1/users/[userId]': '/v1/users/[userId]',
    'v1/users/[userId]/deactivate': '/v1/users/[userId]/deactivate',
    'v1/users/[userId]/reactivate': '/v1/users/[userId]/reactivate',

    // Employee routes
    'v1/employees': '/v1/employees',
    'v1/employees/[employeeId]': '/v1/employees/[employeeId]',
    'v1/employees/[employeeId]/transfer': '/v1/employees/[employeeId]/transfer',
    'v1/employees/[employeeId]/performance': '/v1/employees/[employeeId]/performance',
    'v1/employees/store/[storeId]/summary': '/v1/employees/store/[storeId]/summary',

    // Store routes
    'v1/stores': '/v1/stores',
    'v1/stores/public': '/v1/stores/public',
    'v1/stores/[storeId]': '/v1/stores/[storeId]',
    'v1/stores/[storeId]/set-main': '/v1/stores/[storeId]/set-main',
    'v1/stores/[storeId]/inventory-summary': '/v1/stores/[storeId]/inventory-summary',
    'v1/stores/[storeId]/performance': '/v1/stores/[storeId]/performance',
    'v1/stores/main/store': '/v1/stores/main/store',

    // Product routes
    'v1/products': '/v1/products',
    'v1/products/public/catalog': '/v1/products/public/catalog',
    'v1/products/public/attributes': '/v1/products/public/attributes',
    'v1/products/[productId]': '/v1/products/[productId]',
    'v1/products/[productId]/assign-stores': '/v1/products/[productId]/assign-stores',
    'v1/products/[productId]/stores/[storeId]': '/v1/products/[productId]/stores/[storeId]',

    // Inventory routes
    'v1/inventory/allocate': '/v1/inventory/allocate',
    'v1/inventory/reserve': '/v1/inventory/reserve',
    'v1/inventory/[inventoryId]/adjust': '/v1/inventory/[inventoryId]/adjust',
    'v1/inventory/availability/[productId]': '/v1/inventory/availability/[productId]',

    // Transfer routes
    'v1/transfers': '/v1/transfers',
    'v1/transfers/[transferId]': '/v1/transfers/[transferId]',
    'v1/transfers/[transferId]/complete': '/v1/transfers/[transferId]/complete',
    'v1/transfers/[transferId]/cancel': '/v1/transfers/[transferId]/cancel',

    // Sales routes
    'v1/sales': '/v1/sales',
    'v1/sales/[saleId]': '/v1/sales/[saleId]',
    'v1/sales/[saleId]/return': '/v1/sales/[saleId]/return',
    'v1/sales/[saleId]/void': '/v1/sales/[saleId]/void',

    // Report routes
    'v1/reports/sales': '/v1/reports/sales',
    'v1/reports/inventory/movement': '/v1/reports/inventory/movement',
    'v1/reports/employees/performance': '/v1/reports/employees/performance',

    // Audit routes
    'v1/audit/activities': '/v1/audit/activities',

    // Status
    'status': '/status',
} as const;

// Type safety for route mappings
type RoutePath = keyof typeof ROUTE_MAPPINGS;

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleProxyRequest(request, params.path);
}

export async function POST(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleProxyRequest(request, params.path);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleProxyRequest(request, params.path);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleProxyRequest(request, params.path);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    return handleProxyRequest(request, params.path);
}

async function handleProxyRequest(
    request: NextRequest,
    pathSegments: string[]
) {
    try {
        const fullPath = pathSegments.join('/');

        // Find matching route pattern
        const matchingRoute = findMatchingRoute(fullPath);

        if (!matchingRoute) {
            console.warn(`No route mapping found for: ${fullPath}`);
            return NextResponse.json(
                { error: 'Route not found', path: fullPath },
                { status: 404 }
            );
        }

        const backendPath = getBackendPath(matchingRoute, pathSegments);

        console.log(`Frontend API: ${request.method} /api/${fullPath} -> ${backendPath}`);

        // Forward to backend
        const backendUrl = `${API_BASE_URL}${backendPath}${request.nextUrl.search}`;

        const response = await fetch(backendUrl, {
            method: request.method,
            headers: {
                'Content-Type': 'application/json',
                ...Object.fromEntries(request.headers.entries()),
            },
            body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
                ? await getRequestBody(request)
                : undefined,
            credentials: 'include',
        });

        console.log(`Backend response: ${response.status}`);

        // Handle response
        const data = await parseResponse(response);
        const nextResponse = NextResponse.json(data, { status: response.status });

        // Forward cookies
        await forwardCookies(response, nextResponse);

        return nextResponse;

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            {
                error: 'ProxyError',
                message: 'Failed to communicate with backend',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 502 }
        );
    }
}

// Helper functions
function findMatchingRoute(frontendPath: string): string | null {
    // Try exact match first
    if (ROUTE_MAPPINGS[frontendPath as RoutePath]) {
        return frontendPath;
    }

    // Try pattern matching for dynamic routes
    for (const pattern of Object.keys(ROUTE_MAPPINGS)) {
        if (isRouteMatch(pattern, frontendPath)) {
            return pattern;
        }
    }

    return null;
}

function isRouteMatch(pattern: string, path: string): boolean {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) {
        return false;
    }

    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith('[') && patternParts[i].endsWith(']')) {
            // Dynamic segment, matches anything
            continue;
        }
        if (patternParts[i] !== pathParts[i]) {
            return false;
        }
    }

    return true;
}

function getBackendPath(pattern: string, pathSegments: string[]): string {
    const backendPattern: string = ROUTE_MAPPINGS[pattern as RoutePath];
    const patternParts = pattern.split('/');

    let backendPath: string = backendPattern;

    // Replace dynamic segments
    patternParts.forEach((part, index) => {
        if (part.startsWith('[') && part.endsWith(']')) {
            const paramName = part.slice(1, -1);
            backendPath = backendPath.replace(`[${paramName}]`, pathSegments[index]);
        }
    });

    return backendPath;
}

async function getRequestBody(request: NextRequest): Promise<string | null> {
    try {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const body = await request.json();
            return JSON.stringify(body);
        }
        return await request.text();
    } catch {
        return null;
    }
}

async function parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return await response.json();
    }
    return await response.text();
}

async function forwardCookies(
    backendResponse: Response,
    nextResponse: NextResponse
) {
    const setCookieHeaders = backendResponse.headers.getSetCookie();
    if (!setCookieHeaders.length) return;

    const isProduction = process.env.NODE_ENV === 'production';

    setCookieHeaders.forEach(cookie => {
        const [cookieContent, ...options] = cookie.split(';').map(opt => opt.trim());
        const [name, ...valueParts] = cookieContent.split('=');
        const value = valueParts.join('=');

        const cookieOpts: any = {
            name,
            value,
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            path: '/',
        };

        // Parse cookie options
        options.forEach(option => {
            const [optName, optValue] = option.split('=').map(s => s.trim());
            const optNameLower = optName.toLowerCase();

            switch (optNameLower) {
                case 'max-age':
                    const maxAge = parseInt(optValue, 10);
                    if (!isNaN(maxAge)) cookieOpts.maxAge = maxAge;
                    break;
                case 'expires':
                    cookieOpts.expires = new Date(optValue);
                    break;
                case 'path':
                    cookieOpts.path = optValue;
                    break;
                case 'secure':
                    cookieOpts.secure = true;
                    break;
                case 'httponly':
                    cookieOpts.httpOnly = true;
                    break;
                case 'samesite':
                    cookieOpts.sameSite = optValue as 'strict' | 'lax' | 'none';
                    break;
            }
        });

        nextResponse.cookies.set(cookieOpts);
    });
}