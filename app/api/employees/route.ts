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
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);

        if (storeId) queryParams.append('storeId', storeId);
        if (role) queryParams.append('role', role);
        if (position) queryParams.append('position', position);
        if (status) queryParams.append('status', status);
        if (search) queryParams.append('search', search);

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/employees${queryString ? `?${queryString}` : ''}`;

        console.log(`🟦 Forwarding GET request to:`, url);
        console.log(`🟦 Token:`, token ? 'Present' : 'Missing');

        const options: RequestInit = {
            method: 'GET',
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        };

        const response = await fetch(url, options);
        console.log(`🟦 Backend response status:`, response.status);

        // Try to get response as text first
        const responseText = await response.text();
        console.log(`🟦 Response text length:`, responseText.length);

        // Check if it's HTML error page
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
            console.error('🔴 Backend returned HTML error page');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Backend server error',
                    message: 'Backend server is not responding properly',
                    data: [],
                    meta: {
                        total: 0,
                        page: 1,
                        limit: 50,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false
                    }
                },
                { status: 200 } // Return 200 with empty data instead of error
            );
        }

        // Parse JSON response
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            console.error('🔴 Failed to parse backend response as JSON:', parseError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid response from backend',
                    message: 'Backend returned invalid JSON',
                    data: [],
                    meta: {
                        total: 0,
                        page: 1,
                        limit: 50,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false
                    }
                },
                { status: 200 } // Return 200 with empty data instead of error
            );
        }

        // Ensure consistent response format
        return NextResponse.json({
            success: response.ok,
            data: data.data || data.employees || data,
            meta: data.meta || {
                total: Array.isArray(data) ? data.length : 0,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil((Array.isArray(data) ? data.length : 0) / parseInt(limit)),
                hasNext: false,
                hasPrev: false
            }
        }, { status: response.status });

    } catch (error: any) {
        console.error('🔴 API Route Error:', error);

        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Connection refused',
                    message: 'Cannot connect to backend server.',
                    data: [],
                    meta: {
                        total: 0,
                        page: 1,
                        limit: 50,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false
                    }
                },
                { status: 200 } // Return 200 with empty data
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error.message,
                data: [],
                meta: {
                    total: 0,
                    page: 1,
                    limit: 50,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false
                }
            },
            { status: 200 } // Return 200 with empty data
        );
    }
}

// POST create new employee
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const body = await request.json();
        const url = `${API_BASE_URL}/employees`;

        console.log(`🟦 Forwarding POST request to:`, url);
        console.log(`🟦 Request body:`, body);

        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            cache: 'no-store',
        };

        const response = await fetch(url, options);
        console.log(`🟦 Backend response status:`, response.status);

        const responseText = await response.text();
        console.log(`🟦 Response text:`, responseText.substring(0, 200));

        // Check if it's HTML error page
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

        // Parse JSON response
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
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

        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('🔴 API Route Error:', error);

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