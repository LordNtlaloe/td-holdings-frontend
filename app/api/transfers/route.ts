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

// GET all transfers with filters
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';
    const productId = searchParams.get('productId');
    const fromStoreId = searchParams.get('fromStoreId');
    const toStoreId = searchParams.get('toStoreId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    if (productId) queryParams.append('productId', productId);
    if (fromStoreId) queryParams.append('fromStoreId', fromStoreId);
    if (toStoreId) queryParams.append('toStoreId', toStoreId);
    if (status) queryParams.append('status', status);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const queryString = queryParams.toString();
    const path = `/transfers${queryString ? `?${queryString}` : ''}`;

    return forwardRequest(request, path);
}

// POST create product transfer
export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
        // Route for creating transfer for specific product
        const body = await request.json();
        const path = `/products/${productId}/transfers`;
        return forwardRequest(request, path, 'POST', body);
    } else {
        // Generic transfer creation (if needed)
        const body = await request.json();
        return forwardRequest(request, '/transfers', 'POST', body);
    }
}