import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = request.headers.get('Authorization');
        const resolvedParams = await params;
        const storeId = resolvedParams?.id;

        // Check if storeId is undefined or invalid
        if (!storeId || storeId === 'undefined') {
            console.error('🔴 Store ID is missing or undefined');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid store ID',
                    message: 'Store ID is required and must be valid'
                },
                { status: 400 }
            );
        }

        console.log('🟦 Store Detail API Route - Forwarding to backend:', `${API_BASE_URL}/stores/${storeId}`);

        // Forward the request to your backend
        const response = await fetch(`${API_BASE_URL}/stores/${storeId}`, {
            method: 'GET',
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
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
        console.error('🔴 Store Detail API Route Error:', error);

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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('Authorization');
        const { id: storeId } = await params;
        const body = await request.json();

        console.log('🟦 Update Store API Route - Forwarding to backend:', `${API_BASE_URL}/stores/${storeId}`);
        console.log('🟦 Request body:', { ...body });

        // Forward the request to your backend
        const response = await fetch(`${API_BASE_URL}/stores/${storeId}`, {
            method: 'PUT',
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
        console.error('🔴 Update Store API Route Error:', error);

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