import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get('period') || 'today';
        const storeId = searchParams.get('storeId');

        const url = new URL(`${API_BASE_URL}/sales/summary`);
        url.searchParams.append('period', period);
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

        return NextResponse.json(data);
    } catch (error) {
        console.error('Sales summary API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}