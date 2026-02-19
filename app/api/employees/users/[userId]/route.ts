import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// GET employee by user ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        if (!userId || userId === 'undefined') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid user ID',
                    message: 'User ID is required'
                },
                { status: 400 }
            );
        }

        const token = request.headers.get('Authorization');
        const url = `${API_BASE_URL}/employees/users/${userId}`;

        console.log(`🟦 GET Employee by User ID - Forwarding to backend:`, url);
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
        console.log('🟦 Backend response status:', response.status);

        const responseText = await response.text();
        console.log('🟦 Response text length:', responseText.length);

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
        console.error('🔴 Employee by User ID API Route Error:', error);

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