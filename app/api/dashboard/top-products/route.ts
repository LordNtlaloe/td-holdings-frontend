import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Top Products API: Fetching data');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const limit = searchParams.get('limit') || '10';

        // Get last 30 days of sales data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const url = new URL(`${API_BASE_URL}/analytics/sales-analytics`);
        url.searchParams.append('groupBy', 'product');
        url.searchParams.append('startDate', startDate.toISOString());
        url.searchParams.append('endDate', endDate.toISOString());

        const response = await fetch(url.toString(), {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch top products' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Transform to match your component format
        const topProducts = (data.analytics?.data || [])
            .slice(0, parseInt(limit))
            .map((product: any) => ({
                id: product.productId || Math.random().toString(),
                product_name: product.productName || 'Unknown Product',
                total_sold: product.totalSold || 0,
                total_revenue: product.totalRevenue || 0,
                updated_at: new Date().toISOString(),
            }));

        return NextResponse.json({
            data: topProducts,
        });
    } catch (error) {
        console.error('Top products API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
