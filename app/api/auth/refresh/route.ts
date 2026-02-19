import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Refresh token required',
                    message: 'No refresh token provided'
                },
                { status: 400 }
            );
        }

        console.log('🟡 Refresh Token API Route - Forwarding to backend');

        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        const responseText = await response.text();
        let data;

        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('🔴 Failed to parse response:', responseText);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid response',
                    message: 'Backend returned invalid JSON'
                },
                { status: 502 }
            );
        }

        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('🔴 Refresh Token API Route Error:', error);
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