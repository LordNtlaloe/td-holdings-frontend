// app/api/products/transfer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function POST(request: NextRequest) {
    try {
        console.log('Products API: Transferring product');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, fromStoreId, toStoreId, quantity } = body;

        // Validate required fields
        if (!productId || !fromStoreId || !toStoreId || !quantity) {
            return NextResponse.json(
                { error: 'productId, fromStoreId, toStoreId, and quantity are required' },
                { status: 400 }
            );
        }

        if (quantity <= 0) {
            return NextResponse.json(
                { error: 'Quantity must be greater than 0' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/products/transfer`, {
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
                { error: data.error || 'Failed to transfer product' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        console.error('Transfer product API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}