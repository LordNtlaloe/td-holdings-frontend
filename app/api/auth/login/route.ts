// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { forwardRequest } from '@/lib/api-client';

export async function POST(request: NextRequest) {
    try {
        // Get the request body
        const body = await request.json();

        // Forward to your Express backend
        const response = await forwardRequest('/api/auth/login', 'POST', request, {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        // Return the same response from backend
        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Login route error:', error);
        return NextResponse.json(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}