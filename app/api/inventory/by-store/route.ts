import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');

        const response = await fetch(`${API_BASE_URL}/analytics/inventory-analytics`, {
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

        // Transform data to match your component's expected format
        const stockByStore = data.distribution?.byStore || [];
        const transformedData = stockByStore.map((store: any) => ({
            branch_name: store.storeName,
            total_value: store.totalValue
        }));

        return NextResponse.json(transformedData);
    } catch (error) {
        console.error('Inventory by store API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}