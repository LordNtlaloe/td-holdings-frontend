import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// POST transfer employee
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('Authorization');
        const { id: employeeId } = await params;
        const body = await request.json();

        // Check if employeeId is undefined or invalid
        if (!employeeId || employeeId === 'undefined') {
            console.error('🔴 Employee ID is missing or undefined');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid employee ID',
                    message: 'Employee ID is required and must be valid'
                },
                { status: 400 }
            );
        }

        console.log('🟦 Transfer Employee API Route - Forwarding to backend:', `${API_BASE_URL}/employees/${employeeId}/transfer`);

        // Forward the request to your backend
        const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/transfer`, {
            method: 'POST',
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
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid response from backend',
                    message: 'Backend returned invalid JSON'
                },
                { status: 502 }
            );
        }

        // Return the backend response with the same status code
        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('🔴 Transfer Employee API Route Error:', error);

        // Handle network errors
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