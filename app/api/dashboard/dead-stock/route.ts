import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Dead Stock API: Fetching data');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get inventory analytics
        const response = await fetch(`${API_BASE_URL}/analytics/inventory-analytics`, {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch inventory data' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Filter products with low turnover (dead stock)
        const turnoverAnalysis = data.turnoverAnalysis || [];
        const deadStock = turnoverAnalysis
            .filter((item: any) => {
                const turnoverRate = item.turnoverRate || 0;
                return turnoverRate < 0.1; // Less than 10% turnover
            })
            .map((item: any) => ({
                id: item.productId || Math.random().toString(),
                product_name: item.productName || 'Unknown Product',
                current_stock: item.currentStock || 0,
                turnover_rate: item.turnoverRate || 0,
                last_sold: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            }));

        return NextResponse.json({
            data: deadStock,
        });
    } catch (error) {
        console.error('Dead stock API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}