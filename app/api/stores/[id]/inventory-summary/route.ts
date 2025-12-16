import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.headers.get('Authorization');
        const { id: storeId } = await params;

        console.log('🟦 Store Inventory Summary API Route - Forwarding to backend:', `${API_BASE_URL}/stores/${storeId}/inventory-summary`);

        const response = await fetch(`${API_BASE_URL}/stores/${storeId}/inventory-summary`, {
            method: 'GET',
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
        });

        console.log('🟦 Backend response status:', response.status);

        const responseText = await response.text();

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

        return NextResponse.json(data, { status: response.status });

    } catch (error: any) {
        console.error('🔴 Store Inventory Summary API Route Error:', error);

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