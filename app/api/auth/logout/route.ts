// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { forwardRequest, getTokenFromRequest } from '@/lib/api-client';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'NO_TOKEN' },
                { status: 401 }
            );
        }

        // Forward to your Express backend
        const response = await forwardRequest('/api/auth/logout', 'POST', request);

        const data = await response.json();

        // Clear the refresh token cookie
        const nextResponse = NextResponse.json(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        nextResponse.cookies.delete('refreshToken');

        return nextResponse;
    } catch (error) {
        console.error('Logout route error:', error);
        return NextResponse.json(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}