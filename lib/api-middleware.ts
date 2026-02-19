import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

interface DecodedToken {
    userId: string;
    email: string;
    role: string;
    storeId?: string;
    exp: number;
}

export async function verifyToken(token: string): Promise<DecodedToken | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as DecodedToken;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

export async function withAuth(
    request: NextRequest,
    handler: (request: NextRequest, user: DecodedToken) => Promise<NextResponse>
) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                    message: 'No authentication token provided'
                },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const decodedToken = await verifyToken(token);

        if (!decodedToken) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid or expired token'
                },
                { status: 401 }
            );
        }

        // Check token expiration
        const expiresIn = decodedToken.exp * 1000 - Date.now();
        if (expiresIn < 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Token has expired'
                },
                { status: 401 }
            );
        }

        // Call the handler with the authenticated user
        return handler(request, decodedToken);
    } catch (error) {
        console.error('Auth middleware error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: 'Authentication failed'
            },
            { status: 500 }
        );
    }
}

export async function withRole(
    request: NextRequest,
    allowedRoles: string[],
    handler: (request: NextRequest, user: DecodedToken) => Promise<NextResponse>
) {
    return withAuth(request, async (req, user) => {
        if (!allowedRoles.includes(user.role)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Forbidden',
                    message: 'You do not have permission to access this resource'
                },
                { status: 403 }
            );
        }
        return handler(req, user);
    });
}