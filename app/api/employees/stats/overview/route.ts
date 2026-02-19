import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization');
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get('storeId');

        // Build query string
        const queryParams = new URLSearchParams();
        if (storeId) queryParams.append('storeId', storeId);

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/employees/stats/overview${queryString ? `?${queryString}` : ''}`;

        console.log(`🟦 Forwarding stats request to:`, url);

        const response = await fetch(url, {
            headers: {
                'Authorization': token || '',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            // If stats endpoint doesn't exist yet, return default stats
            if (response.status === 404) {
                console.log('🟡 Stats endpoint not found, returning default stats');
                return NextResponse.json({
                    total: 0,
                    byStatus: {},
                    byRole: {},
                    byPosition: [],
                    newHiresLast30Days: 0,
                    averagePerformanceScore: 0,
                    upcomingReviews: 0,
                    turnoverRate: 0,
                    activeEmployees: 0,
                    onLeaveEmployees: 0,
                    terminatedEmployees: 0
                });
            }

            const errorText = await response.text();
            throw new Error(`Backend responded with ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('🔴 Employee stats API Error:', error);

        // Return default stats on error
        return NextResponse.json({
            total: 0,
            byStatus: {},
            byRole: {},
            byPosition: [],
            newHiresLast30Days: 0,
            averagePerformanceScore: 0,
            upcomingReviews: 0,
            turnoverRate: 0,
            activeEmployees: 0,
            onLeaveEmployees: 0,
            terminatedEmployees: 0
        });
    }
}