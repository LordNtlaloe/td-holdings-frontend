// app/api/inventory/levels/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function forwardRequest(
    request: NextRequest,
    path: string,
    method: string = 'GET',
    body?: any
) {
    try {
        const token = request.headers.get('Authorization');
        const url = `${API_BASE_URL}${path}`;

        console.log(`🟦 Forwarding ${method} request to:`, url);

        const options: RequestInit = {
            method,
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        };

        if (body && method !== 'GET' && method !== 'HEAD') {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        console.log(`🟦 Backend response status:`, response.status);

        const responseText = await response.text();

        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
            console.error('🔴 Backend returned HTML error page');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Backend server error',
                    message: 'Backend server is not responding properly'
                },
                { status: 502 }
            );
        }

        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            console.error('🔴 Failed to parse backend response as JSON:', parseError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid response from backend',
                    message: 'Backend returned invalid JSON'
                },
                { status: 502 }
            );
        }

        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('🔴 API Route Error:', error);

        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Connection refused',
                    message: 'Cannot connect to backend server.'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error.message
            },
            { status: 500 }
        );
    }
}

// PUT - Set inventory levels
export async function PUT(request: NextRequest) {
    const body = await request.json();
    const path = '/products/inventory/levels';
    return forwardRequest(request, path, 'PUT', body);
}