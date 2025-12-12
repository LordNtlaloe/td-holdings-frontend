import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function POST(request: NextRequest) {
    try {
        console.log('Frontend API: Received login request');

        const body = await request.json();
        console.log('Login email:', body.email);

        // Forward request to backend
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include', // Important for cookies
        });

        console.log('Backend response status:', response.status);

        const data = await response.json();

        if (!response.ok) {
            console.log('Login failed:', data.error);
            return NextResponse.json(data, { status: response.status });
        }

        console.log('Login successful, copying cookies...');

        // Create response with user data
        const nextResponse = NextResponse.json(data);

        // Get all Set-Cookie headers from backend
        const setCookieHeaders = response.headers.getSetCookie();

        console.log('Cookies from backend:', setCookieHeaders);

        // Forward all cookies to frontend
        setCookieHeaders.forEach(cookie => {
            // Parse the cookie string to extract name and value
            const [cookieContent] = cookie.split(';');
            const [name, value] = cookieContent.split('=');

            // Determine cookie options based on environment
            const isProduction = process.env.NODE_ENV === 'production';

            if (name === 'accessToken') {
                nextResponse.cookies.set({
                    name: 'accessToken',
                    value: value,
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'strict' : 'lax',
                    maxAge: 24 * 60 * 60, // 24 hours
                    path: '/',
                });
                console.log('Set accessToken cookie');
            } else if (name === 'refreshToken') {
                nextResponse.cookies.set({
                    name: 'refreshToken',
                    value: value,
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'strict' : 'lax',
                    maxAge: 7 * 24 * 60 * 60, // 7 days
                    path: '/',
                });
                console.log('Set refreshToken cookie');
            }
        });

        console.log('Login API route complete');
        return nextResponse;

    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}