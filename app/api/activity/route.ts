// app/api/activities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Activities API: Fetching recent activities');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') || '10';
        const type = searchParams.get('type') || 'all';

        // Fetch activities from backend
        // Assuming your backend has an activities endpoint
        let url = `${API_BASE_URL}/activities?limit=${limit}`;
        if (type !== 'all') {
            url += `&type=${type}`;
        }

        const response = await fetch(url, {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            // If activities endpoint doesn't exist, return recent store changes
            return getMockActivitiesFromStores();
        }

        const activities = await response.json();
        return NextResponse.json(activities);

    } catch (error) {
        console.error('Activities API error:', error);
        // Return fallback data
        return getMockActivitiesFromStores();
    }
}

// Fallback function if activities endpoint doesn't exist
async function getMockActivitiesFromStores() {
    try {
        // Fetch stores and create activity log from them
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json([]);
        }

        const response = await fetch(`${process.env.BACKEND_URL}/api/stores`, {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json([]);
        }

        const stores = await response.json();

        // Transform stores into activity items
        const activities = stores.slice(0, 10).map((store: any, index: number) => ({
            id: store.id,
            store: store.name,
            action: index === 0 ? 'created' : index === 1 ? 'updated' : 'modified',
            actor: store.createdBy || 'Admin',
            timestamp: new Date(store.updatedAt).toLocaleDateString(),
            type: 'STORE',
        }));

        return NextResponse.json(activities);
    } catch (error) {
        return NextResponse.json([]);
    }
}