import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Sales by Store API: Fetching data');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get('period') || 'month';

        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(startDate.getMonth() - 1);
        }

        // Get all stores first
        const storesResponse = await fetch(`${API_BASE_URL}/stores`, {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!storesResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch stores' },
                { status: storesResponse.status }
            );
        }

        const stores = await storesResponse.json();

        // Get sales for each store
        const salesByStore = await Promise.all(
            stores.map(async (store: any) => {
                try {
                    const url = new URL(`${API_BASE_URL}/sales/summary`);
                    url.searchParams.append('storeId', store.id);
                    url.searchParams.append('startDate', startDate.toISOString());
                    url.searchParams.append('endDate', endDate.toISOString());

                    const salesResponse = await fetch(url.toString(), {
                        headers: {
                            'Cookie': `accessToken=${accessToken.value}`,
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    });

                    if (salesResponse.ok) {
                        const data = await salesResponse.json();
                        return {
                            branch_name: store.name,
                            total_sales: data.summary?.totalRevenue || 0,
                        };
                    }
                    return {
                        branch_name: store.name,
                        total_sales: 0,
                    };
                } catch (error) {
                    console.error(`Error fetching sales for store ${store.id}:`, error);
                    return {
                        branch_name: store.name,
                        total_sales: 0,
                    };
                }
            })
        );

        return NextResponse.json({
            data: salesByStore,
        });
    } catch (error) {
        console.error('Sales by store API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
