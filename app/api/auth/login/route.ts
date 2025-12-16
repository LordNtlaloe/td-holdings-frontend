import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        console.log('🟦 Login API Route - Forwarding to backend:', `${API_BASE_URL}/auth/login`);
        console.log('🟦 Request body:', { email, password: '***' });

        // Forward the request to your backend
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        console.log('🟦 Backend response status:', response.status);

        // Get the response text first to check content type
        const responseText = await response.text();

        // Check if it's HTML
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
            console.error('🔴 Backend returned HTML error page');
            console.error('🔴 HTML preview:', responseText.substring(0, 500));

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
            console.error('🔴 Response text:', responseText);

            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid response from backend',
                    message: 'Backend returned invalid JSON'
                },
                { status: 502 }
            );
        }

        console.log('🟦 Backend response data:', data);

        // Return the backend response with the same status code
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('🔴 Login API Route Error:', error);

        // Handle network errors
        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Connection refused',
                    message: 'Cannot connect to backend server. Make sure it is running on port 4000.'
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