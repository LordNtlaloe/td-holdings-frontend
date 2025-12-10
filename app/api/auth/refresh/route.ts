// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { forwardRequest } from '@/lib/api-client';

export async function POST(request: NextRequest) {
    try {
        // Get the request body
        const body = await request.json();

        // Forward to your Express backend - rename to backendResponse
        const backendResponse = await forwardRequest('/api/auth/refresh', 'POST', request, {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await backendResponse.json();

        // Set refresh token as HTTP-only cookie if returned
        if (data.refreshToken) {
            // Create NextResponse with backend's status
            const nextResponse = NextResponse.json(data, {
                status: backendResponse.status,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Set HTTP-only cookie for refresh token
            nextResponse.cookies.set('refreshToken', data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60, // 7 days
                path: '/'
            });

            // Remove refreshToken from response body for security
            const { refreshToken, ...responseData } = data;
            return NextResponse.json(responseData, {
                status: backendResponse.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': nextResponse.cookies.toString()
                }
            });
        }

        return NextResponse.json(data, {
            status: backendResponse.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Refresh token route error:', error);
        return NextResponse.json(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}