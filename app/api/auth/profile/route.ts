// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { forwardRequest, getTokenFromRequest } from '@/lib/api-client';

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'NO_TOKEN' },
                { status: 401 }
            );
        }

        // Forward to your Express backend
        const response = await forwardRequest('/api/auth/profile', 'GET', request);

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Get profile route error:', error);
        return NextResponse.json(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Check authentication
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required', code: 'NO_TOKEN' },
                { status: 401 }
            );
        }

        // Forward to your Express backend
        const response = await forwardRequest('/api/auth/profile', 'PUT', request);

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Update profile route error:', error);
        return NextResponse.json(
            { error: 'Internal server error', code: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}