// app/api/inventory/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function forwardRequest(request: NextRequest) {
    try {
        // Get the full token including 'Bearer ' prefix
        const authHeader = request.headers.get('Authorization');

        const url = `${API_BASE_URL}/products/inventory-summary`;

        console.log(`🟦 Forwarding GET request to:`, url);
        console.log(`🟦 Authorization Header:`, authHeader ? 'Present' : 'Missing');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...(authHeader && { 'Authorization': authHeader }),
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        console.log(`🟦 Backend response status:`, response.status);

        const responseText = await response.text();
        console.log(`🟦 Backend response:`, responseText.substring(0, 500));

        // Handle HTML error pages
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
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
            console.error('🔴 Failed to parse JSON:', parseError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid response',
                    message: 'Backend returned invalid JSON'
                },
                { status: 502 }
            );
        }

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error: any) {
        console.error('🔴 Summary API Error:', error);

        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Connection refused',
                    message: 'Backend server is not running on port 4000'
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

export async function GET(request: NextRequest) {
    return forwardRequest(request);
}