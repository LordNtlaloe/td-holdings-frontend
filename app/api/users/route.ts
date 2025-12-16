import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const storeId = searchParams.get('storeId');
        const isActive = searchParams.get('isActive');
        const search = searchParams.get('search');
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '50';

        // Build query string
        const queryParams = new URLSearchParams();
        if (role) queryParams.append('role', role);
        if (storeId) queryParams.append('storeId', storeId);
        if (isActive) queryParams.append('isActive', isActive);
        if (search) queryParams.append('search', search);
        queryParams.append('page', page);
        queryParams.append('limit', limit);

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/users/${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Get all users API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}