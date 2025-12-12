import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Sales Growth API: Fetching data');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get last 12 months of sales data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12);

        const url = new URL(`${API_BASE_URL}/analytics/sales-analytics`);
        url.searchParams.append('groupBy', 'day');
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
                { error: 'Failed to fetch sales growth data' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Group by month and transform data
        const monthlyData: { [key: string]: number } = {};
        
        if (data.analytics?.data) {
            data.analytics.data.forEach((item: any) => {
                const date = new Date(item.date);
                const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = 0;
                }
                monthlyData[monthKey] += item.total_revenue || 0;
            });
        }

        // Convert to array format
        const salesGrowth = Object.entries(monthlyData).map(([period, total_sales]) => ({
            period,
            total_sales,
        }));

        return NextResponse.json({
            data: salesGrowth,
        });
    } catch (error) {
        console.error('Sales growth API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
