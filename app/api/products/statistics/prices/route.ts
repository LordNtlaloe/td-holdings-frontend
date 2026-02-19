// app/api/products/statistics/prices/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// GET product price statistics
export async function GET(request: NextRequest) {
    const path = `/products/statistics/prices`;

    try {
        const token = request.headers.get('Authorization');

        if (!token) {
            console.log('🔴 No token provided in request');
            return NextResponse.json({
                success: false,
                error: 'No token provided',
                message: 'Authentication required'
            }, { status: 401 });
        }

        const url = `${API_BASE_URL}${path}`;

        console.log('🔵 ========================================');
        console.log('🔵 PRICE STATISTICS API ROUTE');
        console.log('🔵 ========================================');
        console.log('🔵 Full URL:', url);
        console.log('🔵 Token present:', !!token);
        console.log('🔵 Token first 20 chars:', token.substring(0, 20) + '...');

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': token // Make sure token format is correct (should include "Bearer ")
        };

        console.log('🔵 Headers being sent:', JSON.stringify(headers, null, 2));

        const response = await fetch(url, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });

        console.log('🔵 Backend response status:', response.status);
        console.log('🔵 Backend response status text:', response.statusText);

        // Get response as text first
        const responseText = await response.text();
        console.log('🔵 Raw response text (first 500 chars):', responseText.substring(0, 500));

        // Handle HTML error pages
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
            console.error('🔴 Backend returned HTML error page');
            return NextResponse.json({
                success: false,
                error: 'Backend server error',
                message: 'Backend server is not responding properly.',
                html: responseText.substring(0, 200) // Include part of the HTML for debugging
            }, { status: 502 });
        }

        // Try to parse as JSON
        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
            console.log('🔵 Parsed response data:', JSON.stringify(data, null, 2));
        } catch (parseError) {
            console.error('🔴 Failed to parse backend response:', parseError);
            console.error('🔴 Response text that failed to parse:', responseText.substring(0, 500));
            return NextResponse.json({
                success: false,
                error: 'Invalid JSON response from backend',
                message: 'Backend returned invalid JSON',
                rawResponse: responseText.substring(0, 200)
            }, { status: 502 });
        }

        // Handle error responses
        if (!response.ok) {
            console.error(`🔴 Backend returned error (${response.status}):`, data);
            return NextResponse.json({
                success: false,
                error: data.error || data.message || 'Request failed',
                message: data.message || data.error,
                statusCode: response.status
            }, { status: response.status });
        }

        console.log('🔵 Price statistics retrieved successfully');
        console.log('🔵 ========================================');

        // Return the backend response directly
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('🔴 API Route Error:', error);
        console.error('🔴 Error name:', error.name);
        console.error('🔴 Error message:', error.message);
        console.error('🔴 Error stack:', error.stack);

        // Check for specific error types
        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json({
                success: false,
                error: 'Connection refused',
                message: 'Cannot connect to backend server. Please ensure the backend is running at ' + API_BASE_URL
            }, { status: 503 });
        }

        if (error.code === 'ECONNRESET') {
            return NextResponse.json({
                success: false,
                error: 'Connection reset',
                message: 'The connection to the backend was reset.'
            }, { status: 503 });
        }

        if (error.type === 'invalid-json') {
            return NextResponse.json({
                success: false,
                error: 'Invalid JSON',
                message: error.message
            }, { status: 502 });
        }

        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}