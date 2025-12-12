import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const searchParams = request.nextUrl.searchParams;
        const threshold = searchParams.get('threshold') || '0.1';
        const daysThreshold = searchParams.get('daysThreshold') || '90';

        // Get inventory analytics
        const inventoryResponse = await fetch(`${API_BASE_URL}/analytics/inventory-analytics`, {
            method: 'GET',
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
        });

        const inventoryData = await inventoryResponse.json();

        if (!inventoryResponse.ok) {
            return NextResponse.json({ error: 'Failed to fetch inventory analytics' }, { status: 500 });
        }

        // Filter products with low turnover rate
        const turnoverAnalysis = inventoryData.turnoverAnalysis || [];
        const deadStock = turnoverAnalysis
            .filter((item: any) => {
                const turnoverRate = item.turnoverRate || 0;
                return turnoverRate <= parseFloat(threshold);
            })
            .map((item: any) => ({
                id: item.productId,
                product_name: item.productName,
                current_stock: item.currentStock,
                turnover_rate: item.turnoverRate,
                last_sold: new Date(Date.now() - parseInt(daysThreshold) * 24 * 60 * 60 * 1000).toISOString()
            }));

        return NextResponse.json(deadStock);
    } catch (error) {
        console.error('Dead stock API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}