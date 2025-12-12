// app/api/stores/[id]/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const storeId = params.id;
        console.log(`Stores API: Fetching employees for store ${storeId}`);

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '20';
        const position = searchParams.get('position');
        const search = searchParams.get('search');

        let url = `${API_BASE_URL}/stores/${storeId}/employees?page=${page}&limit=${limit}`;
        if (position) url += `&position=${position}`;
        if (search) url += `&search=${search}`;

        const response = await fetch(url, {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch store employees' },
                { status: response.status }
            );
        }

        const employees = await response.json();

        return NextResponse.json(employees);

    } catch (error) {
        console.error('Store employees API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const storeId = params.id;
        console.log(`Stores API: Adding employee to store ${storeId}`);

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { userId, position = 'Clerk' } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/stores/${storeId}/employees`, {
            method: 'POST',
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, position }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || 'Failed to add employee' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        console.error('Add employee API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}