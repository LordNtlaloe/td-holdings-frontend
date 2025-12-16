import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// GET all employees
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const { searchParams } = new URL(request.url);

        // Extract query parameters
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '50';
        const storeId = searchParams.get('storeId');
        const role = searchParams.get('role');
        const position = searchParams.get('position');
        const search = searchParams.get('search');
        const activeOnly = searchParams.get('activeOnly');

        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);

        if (storeId) queryParams.append('storeId', storeId);
        if (role) queryParams.append('role', role);
        if (position) queryParams.append('position', position);
        if (search) queryParams.append('search', search);
        if (activeOnly) queryParams.append('activeOnly', activeOnly);

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/employees${queryString ? `?${queryString}` : ''}`;

        console.log('🟦 Employees API Route - Forwarding to backend:', url);

        // Forward the request to your backend
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        console.log('🟦 Backend response status:', response.status);

        // Get the response text first to check content type
        const responseText = await response.text();

        // Check if it's HTML
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
            console.error('🔴 Backend returned HTML error page');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Backend server error',
                    message: 'Backend server is not responding properly'
                },
                { status: 502 }
            );
        }

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('🔴 Failed to parse backend response as JSON:', parseError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid response from backend',
                    message: 'Backend returned invalid JSON'
                },
                { status: 502 }
            );
        }

        // Return the backend response with the same status code
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('🔴 Employees API Route Error:', error);

        // Handle network errors
        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Connection refused',
                    message: 'Cannot connect to backend server.'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error.message
            },
            { status: 500 }
        );
    }
}

// POST create new employee
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const body = await request.json();

        console.log('🟦 Create Employee API Route - Forwarding to backend:', `${API_BASE_URL}/employees`);

        // Forward the request to your backend
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('🟦 Backend response status:', response.status);

        // Get the response text first to check content type
        const responseText = await response.text();

        // Check if it's HTML
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
            console.error('🔴 Backend returned HTML error page');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Backend server error',
                    message: 'Backend server is not responding properly'
                },
                { status: 502 }
            );
        }

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('🔴 Failed to parse backend response as JSON:', parseError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid response from backend',
                    message: 'Backend returned invalid JSON'
                },
                { status: 502 }
            );
        }

        // Return the backend response with the same status code
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('🔴 Create Employee API Route Error:', error);

        // Handle network errors
        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Connection refused',
                    message: 'Cannot connect to backend server.'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error.message
            },
            { status: 500 }
        );
    }
}