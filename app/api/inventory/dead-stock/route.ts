import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const searchParams = request.nextUrl.searchParams;
        const storeId = searchParams.get('storeId');
        const threshold = searchParams.get('threshold') || '0.1';

        const url = new URL(`${API_BASE_URL}/analytics/inventory-analytics`);
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

        // Filter products with low turnover rate (dead stock)
        const turnoverAnalysis = data.turnoverAnalysis || [];
        const deadStock = turnoverAnalysis.filter((item: any) => {
            const turnoverRate = item.turnoverRate || 0;
            return turnoverRate <= parseFloat(threshold);
        });

        return NextResponse.json(deadStock);
    } catch (error) {
        console.error('Dead stock API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}