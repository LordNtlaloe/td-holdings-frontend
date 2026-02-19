import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function forwardRequest(
    request: NextRequest,
    url: string,
    method: string = 'GET',
    body?: any
) {
    try {
        const token = request.headers.get('Authorization');

        console.log(`🟦 ${method} API Route - Forwarding to backend:`, url);

        const options: RequestInit = {
            method,
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        };

        if (body && method !== 'GET' && method !== 'HEAD') {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        console.log('🟦 Backend response status:', response.status);

        const responseText = await response.text();

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
            data = JSON.parse(responseText);
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

        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('🔴 API Route Error:', error);

        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Connection refused',
                    message: 'Cannot connect to backend server.'
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

// GET employee performance report
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: employeeId } = await params;

        if (!employeeId || employeeId === 'undefined') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid employee ID',
                    message: 'Employee ID is required'
                },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'month';

        const queryParams = new URLSearchParams();
        queryParams.append('period', period);

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/employees/${employeeId}/performance${queryString ? `?${queryString}` : ''}`;

        return forwardRequest(request, url, 'GET');

    } catch (error: any) {
        console.error('🔴 Employee Performance API Route Error:', error);
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