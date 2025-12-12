import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');

        // Fetch all stores and their inventory
        const storesResponse = await fetch(`${API_BASE_URL}/stores`, {
            method: 'GET',
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
        });

        const stores = await storesResponse.json();

        if (!storesResponse.ok) {
            return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
        }

        // For each store, fetch inventory value
        const stockByStore = await Promise.all(
            stores.map(async (store: any) => {
                const inventoryResponse = await fetch(`${API_BASE_URL}/analytics/inventory-analytics?storeId=${store.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': token || '',
                        'Content-Type': 'application/json',
                    },
                });

                if (inventoryResponse.ok) {
                    const data = await inventoryResponse.json();
                    return {
                        branch_name: store.name,
                        total_value: data.summary?.totalValue || 0
                    };
                }
                return {
                    branch_name: store.name,
                    total_value: 0
                };
            })
        );

        return NextResponse.json(stockByStore);
    } catch (error) {
        console.error('Stock by store API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}