// app/api/products/low-stock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Products API: Fetching low stock products');

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
        const threshold = searchParams.get('threshold') || '10';

        // Fetch low stock products from backend
        const response = await fetch(`${API_BASE_URL}/products/low-stock?threshold=${threshold}`, {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch low stock products' },
                { status: response.status }
            );
        }

        const lowStockProducts = await response.json();
        return NextResponse.json(lowStockProducts);

    } catch (error) {
        console.error('Low stock products API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}