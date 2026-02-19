import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';


// PUT update employee
export async function PUT(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const body = await request.json();

        // Extract ID from the URL path
        const { pathname } = new URL(request.url);
        const id = pathname.split('/').pop();

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing employee ID',
                    message: 'Employee ID is required'
                },
                { status: 400 }
            );
        }

        const url = `${API_BASE_URL}/employees/${id}`;

        console.log(`🟦 Forwarding PUT request to:`, url);
        console.log(`🟦 Request body:`, body);

        const options: RequestInit = {
            method: 'PUT',
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

// PATCH partially update employee
export async function PATCH(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const body = await request.json();

        // Extract ID from the URL path
        const { pathname } = new URL(request.url);
        const id = pathname.split('/').pop();

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing employee ID',
                    message: 'Employee ID is required'
                },
                { status: 400 }
            );
        }

        const url = `${API_BASE_URL}/employees/${id}`;

        console.log(`🟦 Forwarding PATCH request to:`, url);
        console.log(`🟦 Request body:`, body);

        const options: RequestInit = {
            method: 'PATCH',
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

// DELETE employee
export async function DELETE(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');

        // Extract ID from the URL path
        const { pathname } = new URL(request.url);
        const id = pathname.split('/').pop();

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing employee ID',
                    message: 'Employee ID is required'
                },
                { status: 400 }
            );
        }

        const url = `${API_BASE_URL}/employees/${id}`;

        console.log(`🟦 Forwarding DELETE request to:`, url);

        const options: RequestInit = {
            method: 'DELETE',
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        };

        const response = await fetch(url, options);
        console.log(`🟦 Backend response status:`, response.status);

        const responseText = await response.text();

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