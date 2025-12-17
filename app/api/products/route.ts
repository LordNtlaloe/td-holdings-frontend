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

        // Check if it's HTML error page
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

        // Parse JSON response
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

// GET all products (with filtering and pagination)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';
    const name = searchParams.get('name');
    const type = searchParams.get('type');
    const grade = searchParams.get('grade');
    const commodity = searchParams.get('commodity');
    const tireCategory = searchParams.get('tireCategory');
    const tireUsage = searchParams.get('tireUsage');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const storeId = searchParams.get('storeId');

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    if (name) queryParams.append('name', name);
    if (type) queryParams.append('type', type);
    if (grade) queryParams.append('grade', grade);
    if (commodity) queryParams.append('commodity', commodity);
    if (tireCategory) queryParams.append('tireCategory', tireCategory);
    if (tireUsage) queryParams.append('tireUsage', tireUsage);
    if (minPrice) queryParams.append('minPrice', minPrice);
    if (maxPrice) queryParams.append('maxPrice', maxPrice);
    if (inStock) queryParams.append('inStock', inStock);
    if (storeId) queryParams.append('storeId', storeId);

    const queryString = queryParams.toString();
    const path = `/catalogue/products${queryString ? `?${queryString}` : ''}`;

    return forwardRequest(request, path);
}

// POST create new product
export async function POST(request: NextRequest) {
    const body = await request.json();
    return forwardRequest(request, '/catalogue/products', 'POST', body);
}