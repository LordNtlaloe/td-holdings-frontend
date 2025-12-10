// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { forwardRequest } from '@/lib/api-client';

export async function POST(request: NextRequest) {
    try {
        // Get the request body
        const body = await request.json();

        // Forward to your Express backend
        const response = await forwardRequest('/api/auth/reset-password', 'POST', request, {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Reset password route error:', error);
        return NextResponse.json(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}