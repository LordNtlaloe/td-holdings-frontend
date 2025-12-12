// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log(`Products API: Fetching product ${params.id}`);

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/products/${params.id}`, {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch product' },
                { status: response.status }
            );
        }

        const product = await response.json();
        return NextResponse.json(product);

    } catch (error) {
        console.error('Get product API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log(`Products API: Updating product ${params.id}`);

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const response = await fetch(`${API_BASE_URL}/products/${params.id}`, {
            method: 'PUT',
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
                { error: data.error || 'Failed to update product' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Update product API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log(`Products API: Patching product ${params.id}`);

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Handle quantity update specifically
        const response = await fetch(`${API_BASE_URL}/products/${params.id}/quantity`, {
            method: 'PATCH',
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
                { error: data.error || 'Failed to update product quantity' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Patch product API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log(`Products API: Deleting product ${params.id}`);

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/products/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: error.error || 'Failed to delete product' },
                { status: response.status }
            );
        }

        return NextResponse.json({ message: 'Product deleted successfully' });

    } catch (error) {
        console.error('Delete product API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}