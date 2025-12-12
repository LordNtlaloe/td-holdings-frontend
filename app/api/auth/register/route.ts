// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { forwardRequest } from '@/lib/api-client';

export async function POST(request: NextRequest) {
    try {
        console.log('Register API route called');

        // Get the request body
        const body = await request.json();
        console.log('Request body:', body);

        // Forward to your Express backend
        const response = await forwardRequest('/api/auth/register', 'POST', request, {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        console.log('Backend response status:', response.status);

        const data = await response.json();
        console.log('Backend response data:', data);

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Register route error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}