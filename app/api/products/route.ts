// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Products API: Fetching products');

        // Await the cookies() promise
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get('storeId');
        const type = searchParams.get('type');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '20';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Build query string
        let queryString = `?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        if (storeId) queryString += `&storeId=${storeId}`;
        if (type) queryString += `&type=${type}`;
        if (category) queryString += `&category=${category}`;
        if (search) queryString += `&search=${encodeURIComponent(search)}`;

        // Fetch products from backend
        const response = await fetch(`${API_BASE_URL}/products${queryString}`, {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.error || 'Failed to fetch products' },
                { status: response.status }
            );
        }

        const products = await response.json();
        return NextResponse.json(products);

    } catch (error) {
        console.error('Products API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('Products API: Creating product');

        // Await the cookies() promise
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Required fields validation
        if (!body.name || !body.price || !body.quantity || !body.type || !body.commodity) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Type-specific validation
        if (body.type === 'TIRE') {
            if (!body.tireSize || !body.tireCategory || !body.tireUsage) {
                return NextResponse.json(
                    { error: 'Tire products require size, category, and usage' },
                    { status: 400 }
                );
            }
        } else if (body.type === 'BALE') {
            if (!body.baleWeight || !body.baleCategory || !body.originCountry) {
                return NextResponse.json(
                    { error: 'Bale products require weight, category, and origin country' },
                    { status: 400 }
                );
            }
        }

        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Failed to create product' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        console.error('Create product API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}