import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const searchParams = request.nextUrl.searchParams;
        const threshold = searchParams.get('threshold') || '10';
        const storeId = searchParams.get('storeId');

        const url = new URL(`${API_BASE_URL}/products/low-stock`);
        url.searchParams.append('threshold', threshold);
        if (storeId) url.searchParams.append('storeId', storeId);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json({
            count: data.length,
            items: data
        });
    } catch (error) {
        console.error('Low stock API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}