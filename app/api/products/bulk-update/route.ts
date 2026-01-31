// app/api/products/bulk-update/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// POST bulk update products
export async function POST(request: NextRequest) {
    const path = '/products/bulk-update';

    try {
        const token = request.headers.get('Authorization');
        const url = `${API_BASE_URL}${path}`;

        // Parse the request body
        const body = await request.json();

        console.log(`Forwarding POST request to: ${url}`);
        console.log(`Bulk update for ${body.products?.length || 0} products`);

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = token;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            cache: 'no-store',
        });

        console.log(`Backend response status: ${response.status}`);

        const responseText = await response.text();

        // Handle HTML error pages
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
            console.error('Backend returned HTML error page');
            return NextResponse.json({
                success: false,
                error: 'Backend server error',
                message: 'Backend server is not responding properly.'
            }, { status: 502 });
        }

        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            console.error('Failed to parse backend response:', responseText.substring(0, 500));
            return NextResponse.json({
                success: false,
                error: 'Invalid response',
                message: 'Backend returned invalid JSON'
            }, { status: 502 });
        }

        // Handle errors
        if (!response.ok) {
            console.error(`Backend returned error (${response.status}):`, data);
            return NextResponse.json({
                success: false,
                error: data.error || data.message || 'Request failed',
                message: data.message || data.error,
                details: data.details || data.errors
            }, { status: response.status });
        }

        console.log(`Bulk update completed successfully - ${data.results?.length || 0} products updated`);

        // Return the backend response directly
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('API Route Error:', error);

        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json({
                success: false,
                error: 'Connection refused',
                message: 'Cannot connect to backend server. Please ensure the backend is running.'
            }, { status: 503 });
        }

        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}