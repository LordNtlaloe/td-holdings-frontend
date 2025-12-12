import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        // Get cookies from the request
        const cookies = request.cookies.getAll();

        // Forward request with cookies
        const [inventoryResponse, todayResponse, monthResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/analytics/inventory-analytics`, {
                headers: {
                    'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
                    'Content-Type': 'application/json',
                },
            }),
            fetch(`${API_BASE_URL}/sales/summary?period=today`, {
                headers: {
                    'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
                    'Content-Type': 'application/json',
                },
            }),
            fetch(`${API_BASE_URL}/sales/summary?period=month`, {
                headers: {
                    'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
                    'Content-Type': 'application/json',
                },
            }),
        ]);

        const [inventoryData, todayData, monthData] = await Promise.all([
            inventoryResponse.json(),
            todayResponse.json(),
            monthResponse.json(),
        ]);

        if (!inventoryResponse.ok) {
            return NextResponse.json(
                { success: false, error: 'Failed to fetch inventory data' },
                { status: inventoryResponse.status }
            );
        }

        if (!todayResponse.ok) {
            return NextResponse.json(
                { success: false, error: 'Failed to fetch today sales' },
                { status: todayResponse.status }
            );
        }

        if (!monthResponse.ok) {
            return NextResponse.json(
                { success: false, error: 'Failed to fetch month sales' },
                { status: monthResponse.status }
            );
        }

        // Calculate turnover rate
        const turnoverAnalysis = inventoryData.turnoverAnalysis || [];
        let averageTurnover = 0;
        if (turnoverAnalysis.length > 0) {
            const totalTurnover = turnoverAnalysis.reduce((sum: number, item: any) => {
                return sum + (item.turnoverRate || 0);
            }, 0);
            averageTurnover = totalTurnover / turnoverAnalysis.length;
        }

        return NextResponse.json({
            success: true,
            data: {
                inventory: {
                    totalStockValue: inventoryData.summary?.totalValue || 0,
                    turnoverRate: averageTurnover,
                    lowStockCount: inventoryData.summary?.lowStockCount || 0,
                    outOfStockCount: inventoryData.summary?.outOfStockCount || 0,
                },
                sales: {
                    today: todayData.summary?.totalRevenue || 0,
                    month: monthData.summary?.totalRevenue || 0,
                },
            },
        });
    } catch (error) {
        console.error('Dashboard stats API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}