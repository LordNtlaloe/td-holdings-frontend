import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const searchParams = request.nextUrl.searchParams;
        const limit = searchParams.get('limit') || '10';

        // Get top selling products from last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        const url = new URL(`${API_BASE_URL}/analytics/sales-analytics`);
        url.searchParams.append('groupBy', 'product');
        url.searchParams.append('startDate', startDate.toISOString());
        url.searchParams.append('endDate', endDate.toISOString());
        url.searchParams.append('limit', limit);

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
        const topProducts = data.analytics?.data?.map((product: any) => ({
            id: product.productId,
            product_name: product.productName,
            total_sold: product.totalSold || 0,
            total_revenue: product.totalRevenue || 0,
            updated_at: new Date().toISOString()
        })) || [];

        return NextResponse.json(topProducts);
    } catch (error) {
        console.error('Top products API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}