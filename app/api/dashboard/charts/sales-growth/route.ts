import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');

        // Get last 12 months of sales data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);

        const url = new URL(`${API_BASE_URL}/analytics/sales-analytics`);
        url.searchParams.append('groupBy', 'month');
        url.searchParams.append('startDate', startDate.toISOString());
        url.searchParams.append('endDate', endDate.toISOString());

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

        // Transform data to match component format
        const salesGrowth = data.analytics?.data?.map((item: any) => {
            const date = new Date(item.year, (item.month || 0) - 1);
            return {
                period: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                total_sales: item.totalRevenue || 0
            };
        }) || [];

        return NextResponse.json(salesGrowth);
    } catch (error) {
        console.error('Sales growth API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}