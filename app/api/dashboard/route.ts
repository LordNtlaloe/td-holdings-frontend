import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Dashboard API: Fetching dashboard data');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        console.log('Access token found:', !!accessToken);

        if (!accessToken) {
            console.log('No access token in cookies');
            return NextResponse.json(
                { error: 'Unauthorized - No token' },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const storeId = searchParams.get('storeId');
        const period = searchParams.get('period') || 'month';

        const url = new URL(`${API_BASE_URL}/dashboard`);
        if (storeId) url.searchParams.append('storeId', storeId);
        url.searchParams.append('period', period);

        console.log('Fetching from backend:', url.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `accessToken=${accessToken.value}`,
            },
            credentials: 'include',
        });

        console.log('Backend response status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.log('Dashboard fetch failed:', error);
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        console.log('Dashboard data retrieved successfully');

        return NextResponse.json(data);
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
