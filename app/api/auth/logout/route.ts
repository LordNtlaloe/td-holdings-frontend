import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function POST(request: NextRequest) {
    try {
        console.log('Frontend API: Logout request');

        const cookieStore = cookies();
        const accessToken = (await cookieStore).get('accessToken');
        const refreshToken = (await cookieStore).get('refreshToken');

        // Call backend logout endpoint
        if (accessToken || refreshToken) {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `accessToken=${accessToken?.value || ''}; refreshToken=${refreshToken?.value || ''}`,
                },
                credentials: 'include',
            });
        }

        // Clear cookies on frontend
        const response = NextResponse.json({ message: 'Logged out successfully' });

        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');

        console.log('Logout complete, cookies cleared');

        return response;

    } catch (error) {
        console.error('Logout API error:', error);

        // Even if backend fails, clear frontend cookies
        const response = NextResponse.json(
            { message: 'Logged out (frontend only)' },
            { status: 200 }
        );

        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');

        return response;
    }
}