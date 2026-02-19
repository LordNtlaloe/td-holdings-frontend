// app/api/inventory/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function forwardRequest(
    request: NextRequest,
    path: string,
    method: string = 'GET',
    body?: any
) {
    try {
        // Get the full token including 'Bearer ' prefix
        const authHeader = request.headers.get('Authorization');
        
        // Construct the full URL with query parameters
        const searchParams = request.nextUrl.searchParams;
        const queryString = searchParams.toString();
        const url = `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

        console.log(`🟦 Forwarding ${method} request to:`, url);
        console.log(`🟦 Authorization Header Present:`, !!authHeader);

        const options: RequestInit = {
            method,
            headers: {
                ...(authHeader && { 'Authorization': authHeader }),
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            cache: 'no-store',
        };

        if (body && method !== 'GET' && method !== 'HEAD') {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        console.log(`🟦 Backend response status:`, response.status);
        
        // Log response headers for debugging
        console.log(`🟦 Backend response headers:`, Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log(`🟦 Backend response (first 500 chars):`, responseText.substring(0, 500));

        // Handle HTML error pages
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

        // Return the response with the same status code
        return NextResponse.json(data, { 
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error: any) {
        console.error('🔴 API Route Error:', error);
        console.error('🔴 Error details:', error.message, error.code);

        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Connection refused',
                    message: 'Cannot connect to backend server. Make sure backend is running on port 4000.'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error.message || 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}

// GET - Get all inventory
export async function GET(request: NextRequest) {
    // Forward to the correct backend endpoint for global inventory
    const path = '/products/inventory';
    return forwardRequest(request, path);
}

// POST - Create new inventory adjustment
export async function POST(request: NextRequest) {
    const body = await request.json();
    return forwardRequest(request, '/products/inventory', 'POST', body);
}