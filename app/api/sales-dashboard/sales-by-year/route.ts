// app/api/sales-dashboard/sales-by-year/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const url = `${API_BASE_URL}/sales-dashboard/sales-by-year${qs ? `?${qs}` : ''}`;

    try {
        const token = request.headers.get('Authorization');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
            cache: 'no-store',
        });

        const text = await response.text();

        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            return NextResponse.json({ error: 'Backend server error' }, { status: 502 });
        }

        const data = text ? JSON.parse(text) : {};
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json({ error: 'Cannot connect to backend' }, { status: 503 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}