import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Stock by Store API: Fetching data');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            console.log('No access token');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all stores
        const storesResponse = await fetch(`${API_BASE_URL}/stores`, {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!storesResponse.ok) {
            console.log('Failed to fetch stores');
            return NextResponse.json(
                { error: 'Failed to fetch stores' },
                { status: storesResponse.status }
            );
        }

        const stores = await storesResponse.json();
        console.log('Fetched stores:', stores.length);

        // Get inventory value for each store
        const stockData = await Promise.all(
            stores.map(async (store: any) => {
                try {
                    const inventoryResponse = await fetch(
                        `${API_BASE_URL}/analytics/inventory-analytics?storeId=${store.id}`,
                        {
                            headers: {
                                'Cookie': `accessToken=${accessToken.value}`,
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                        }
                    );

                    if (inventoryResponse.ok) {
                        const data = await inventoryResponse.json();
                        return {
                            branch_name: store.name,
                            total_value: data.summary?.totalValue || 0,
                        };
                    }
                    return {
                        branch_name: store.name,
                        total_value: 0,
                    };
                } catch (error) {
                    console.error(`Error fetching inventory for store ${store.id}:`, error);
                    return {
                        branch_name: store.name,
                        total_value: 0,
                    };
                }
            })
        );

        return NextResponse.json({
            data: stockData,
        });
    } catch (error) {
        console.error('Stock by store API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
