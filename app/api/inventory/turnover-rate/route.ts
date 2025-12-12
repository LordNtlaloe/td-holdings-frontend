import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const searchParams = request.nextUrl.searchParams;
        const storeId = searchParams.get('storeId');

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

        // Calculate average turnover rate from turnoverAnalysis
        const turnoverAnalysis = data.turnoverAnalysis || [];
        let averageTurnover = 0;

        if (turnoverAnalysis.length > 0) {
            const totalTurnover = turnoverAnalysis.reduce((sum: number, item: any) => {
                return sum + (item.turnoverRate || 0);
            }, 0);
            averageTurnover = totalTurnover / turnoverAnalysis.length;
        }

        return NextResponse.json({ turnoverRate: averageTurnover });
    } catch (error) {
        console.error('Turnover rate API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}