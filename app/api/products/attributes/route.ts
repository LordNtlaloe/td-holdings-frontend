// app/api/products/attributes/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// GET product attributes - PUBLIC ENDPOINT
export async function GET(request: NextRequest) {
    const path = `/products/attributes`;

    try {
        const url = `${API_BASE_URL}${path}`;

        console.log(`Fetching product attributes from: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // No Authorization header needed for public endpoint
            },
            cache: 'no-store',
        });

        console.log(`🟦 Backend response status: ${response.status}`);

        const responseText = await response.text();

        // Handle non-JSON responses
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
            console.error('Backend returned HTML error page');
            // Return default attributes if backend fails
            return NextResponse.json({
                success: true,
                data: {
                    productTypes: ['TIRE', 'BALE'],
                    productGrades: ['A', 'B', 'C'],
                    tireCategories: ['NEW', 'SECOND_HAND'],
                    tireUsages: ['FOUR_BY_FOUR', 'REGULAR', 'TRUCK'],
                    origins: [],
                    commodities: []
                }
            });
        }

        let data;
        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
            console.error('Failed to parse backend response:', responseText.substring(0, 200));
            // Return default attributes if parsing fails
            return NextResponse.json({
                success: true,
                data: {
                    productTypes: ['TIRE', 'BALE'],
                    productGrades: ['A', 'B', 'C'],
                    tireCategories: ['NEW', 'SECOND_HAND'],
                    tireUsages: ['FOUR_BY_FOUR', 'REGULAR', 'TRUCK'],
                    origins: [],
                    commodities: []
                }
            });
        }

        // If backend returns an error, use defaults
        if (!response.ok || data.error) {
            console.warn('Backend returned error, using default attributes');
            return NextResponse.json({
                success: true,
                data: {
                    productTypes: ['TIRE', 'BALE'],
                    productGrades: ['A', 'B', 'C'],
                    tireCategories: ['NEW', 'SECOND_HAND'],
                    tireUsages: ['FOUR_BY_FOUR', 'REGULAR', 'TRUCK'],
                    origins: [],
                    commodities: []
                }
            });
        }

        console.log('✅ Product attributes retrieved successfully');

        // Return the data with consistent structure
        return NextResponse.json({
            success: true,
            data: {
                productTypes: data.productTypes || data.data?.productTypes || ['TIRE', 'BALE'],
                productGrades: data.productGrades || data.data?.productGrades || ['A', 'B', 'C'],
                tireCategories: data.tireCategories || data.data?.tireCategories || ['NEW', 'SECOND_HAND'],
                tireUsages: data.tireUsages || data.data?.tireUsages || ['FOUR_BY_FOUR', 'REGULAR', 'TRUCK'],
                origins: data.origins || data.data?.origins || [],
                commodities: data.commodities || data.data?.commodities || []
            }
        });

    } catch (error: any) {
        console.error('API Route Error:', error);

        // Return default attributes on any error
        return NextResponse.json({
            success: true,
            data: {
                productTypes: ['TIRE', 'BALE'],
                productGrades: ['A', 'B', 'C'],
                tireCategories: ['NEW', 'SECOND_HAND'],
                tireUsages: ['FOUR_BY_FOUR', 'REGULAR', 'TRUCK'],
                origins: [],
                commodities: []
            }
        }, { status: 200 }); // Still return 200 with defaults
    }
}