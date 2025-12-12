import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Get sales analytics by store
        const url = new URL(`${API_BASE_URL}/analytics/sales-analytics`);
        url.searchParams.append('groupBy', 'store');
        if (startDate) url.searchParams.append('startDate', startDate);
        if (endDate) url.searchParams.append('endDate', endDate);

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
        const salesByStore = data.analytics?.data?.map((store: any) => ({
            branch_name: store.storeName || 'Unknown',
            total_sales: store.totalRevenue || 0
        })) || [];

        return NextResponse.json(salesByStore);
    } catch (error) {
        console.error('Sales by store API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}