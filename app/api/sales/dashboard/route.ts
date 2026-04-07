// /app/api/sales/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const dashboardType = searchParams.get('type') || 'summary';
    searchParams.delete('type');

    const queryString = searchParams.toString();

    // FIX: Map frontend /sales/dashboard to backend /sales-dashboard
    // This maps:
    // /api/sales/dashboard?type=summary -> /sales-dashboard/summary
    // /api/sales/dashboard?type=recent-activity -> /sales-dashboard/recent-activity
    // etc.
    const path = `/sales-dashboard/${dashboardType}${queryString ? `?${queryString}` : ''}`;

    try {
        const token = request.headers.get('Authorization');
        const url = `${API_BASE_URL}${path}`;

        // Add logging for debugging
        console.log(`🔍 Proxying: ${request.url} -> ${url}`);

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            // Pass the token exactly as received (should include "Bearer " prefix)
            headers['Authorization'] = token;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });

        const responseText = await response.text();

        // Check for HTML error pages
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
            console.error(`🔴 Backend returned HTML for ${url}`);
            return NextResponse.json({
                success: false,
                error: 'Backend server error',
                message: 'Backend server is not responding properly.'
            }, { status: 502 });
        }

        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            console.error(`🔴 Invalid JSON from ${url}:`, responseText.substring(0, 200));
            return NextResponse.json({
                success: false,
                error: 'Invalid response',
                message: 'Backend returned invalid JSON'
            }, { status: 502 });
        }

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: data.error || data.message || 'Request failed',
                message: data.message
            }, { status: response.status });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('API Route Error:', error);

        // Check for connection refused errors
        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json({
                success: false,
                error: 'Backend connection failed',
                message: 'Unable to connect to backend server. Please ensure it is running.'
            }, { status: 503 });
        }

        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}