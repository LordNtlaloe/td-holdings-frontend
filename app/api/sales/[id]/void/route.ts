// app/api/sales/[id]/void/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// POST /api/sales/[id]/void
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const url = `${API_BASE_URL}/sales/${id}/void`;

        const token = request.headers.get('Authorization');
        const body = await request.text();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
            body,
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