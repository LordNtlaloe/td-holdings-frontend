// /app/api/sales/voided/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const path = `/sales/voided${queryString ? `?${queryString}` : ''}`;

    try {
        const token = request.headers.get('Authorization');
        const url = `${API_BASE_URL}${path}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = token;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
            cache: 'no-store',
        });

        const responseText = await response.text();

        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
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
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}