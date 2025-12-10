// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { forwardRequest, getTokenFromRequest } from '@/lib/api-client';

export async function POST(request: NextRequest) {
    try {
        // Check if user is authenticated (admin only)
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'NO_TOKEN' },
                { status: 401 }
            );
        }

        // Forward to your Express backend
        const response = await forwardRequest('/api/auth/register', 'POST', request);

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Register route error:', error);
        return NextResponse.json(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}