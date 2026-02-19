// app/api/products/store/[storeId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params;

        console.log('🟦 Received storeId:', storeId);
        console.log('🟦 StoreId type:', typeof storeId);
        console.log('🟦 StoreId length:', storeId?.length);

        // Enhanced validation
        if (!storeId || storeId === 'undefined' || storeId === 'null') {
            console.error('🔴 Invalid store ID - missing or undefined');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid store ID',
                    message: 'Store ID is required and must be valid'
                },
                { status: 400 }
            );
        }

        // Check if storeId looks like a valid ID format (CUIDs are 25 chars starting with 'c')
        if (!storeId.match(/^c[0-9a-z]{24,25}$/)) {
            console.error(`🔴 Invalid store ID format: ${storeId}`);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid store ID format',
                    message: 'The provided store ID is not in the correct format'
                },
                { status: 400 }
            );
        }

        const token = request.headers.get('Authorization');
        
        if (!token) {
            console.error('🔴 Missing Authorization token');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authorization token is required'
                },
                { status: 401 }
            );
        }

        // Forward query params to backend
        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();
        const url = `${API_BASE_URL}/products/store/${storeId}${queryString ? `?${queryString}` : ''}`;

        console.log(`🟦 GET Products by Store ID - Forwarding to backend:`, url);
        console.log(`🟦 Token:`, token ? 'Present' : 'Missing');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        console.log('🟦 Backend response status:', response.status);

        const responseText = await response.text();
        console.log('🟦 Response text length:', responseText.length);
        
        if (responseText.length > 0) {
            console.log('🟦 Response preview:', responseText.substring(0, 200));
        }

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

        // Return the response with the same status code
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('🔴 Products by Store ID API Route Error:', error);

        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Connection refused',
                    message: 'Cannot connect to backend server. Please ensure the backend is running.'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error.message || 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
}