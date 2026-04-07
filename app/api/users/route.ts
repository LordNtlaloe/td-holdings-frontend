import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Add this debug version to see what's going on

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        console.log('🟦 Auth header present:', !!authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('🟥 Invalid auth header format:', authHeader);
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
        const url = `${API_BASE_URL}/auth/users${queryString ? `?${queryString}` : ''}`;

        console.log('🟦 Forwarding users request to:', url);

        // Log the token (first few chars only for security)
        const token = authHeader.replace('Bearer ', '');
        console.log('🟦 Token prefix:', token.substring(0, 10) + '...');

        // Try to decode the token to see if it's valid (optional)
        try {
            const base64Payload = token.split('.')[1];
            const payload = JSON.parse(atob(base64Payload));
            console.log('🟦 Token payload:', {
                userId: payload.sub || payload.userId,
                role: payload.role,
                exp: new Date(payload.exp * 1000).toISOString()
            });
        } catch (e) {
            console.log('🟦 Could not decode token');
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        console.log('🟦 Backend response status:', response.status);

        const data = await response.json();
        console.log('🟦 Backend response data:', data);

        if (!response.ok) {
            console.error('🟥 Backend responded with error:', response.status, data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('🔴 Get all users API error:', error);
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