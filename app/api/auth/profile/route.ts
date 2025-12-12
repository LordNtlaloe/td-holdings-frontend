import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Frontend API: Getting profile');

        // Get cookies from the request
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

        // Forward request to backend with cookie
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `accessToken=${accessToken.value}`,
            },
            credentials: 'include',
        });

        console.log('Backend profile response status:', response.status);

        const data = await response.json();

        if (!response.ok) {
            console.log('Profile fetch failed:', data.error);
            return NextResponse.json(data, { status: response.status });
        }

        console.log('Profile retrieved successfully for:', data.email);
        return NextResponse.json(data);

    } catch (error) {
        console.error('Profile API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const cookieStore = cookies();
        const accessToken = (await cookieStore).get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `accessToken=${accessToken.value}`,
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Update profile API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}