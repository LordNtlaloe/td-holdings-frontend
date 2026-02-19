// app/api/products/reports/low-stock/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// GET low stock products
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const path = `/products/reports/low-stock${queryString ? `?${queryString}` : ''}`;

    try {
        const token = request.headers.get('Authorization');
        const url = `${API_BASE_URL}${path}`;

        console.log(`Forwarding GET request to: ${url}`);

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = token;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
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
                message: data.message || data.error
            }, { status: response.status });
        }

        console.log(`Low stock report retrieved - threshold: ${searchParams.get('threshold') || 'default'}`);

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