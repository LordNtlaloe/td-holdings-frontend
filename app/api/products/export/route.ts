// app/api/products/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Products API: Exporting products');

        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'json';
        const storeId = searchParams.get('storeId');
        const type = searchParams.get('type');

        // Build query string
        let queryString = '?limit=10000'; // Get all products for export
        if (storeId) queryString += `&storeId=${storeId}`;
        if (type) queryString += `&type=${type}`;

        // Fetch products from backend
        const response = await fetch(`${API_BASE_URL}/products${queryString}`, {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch products for export' },
                { status: response.status }
            );
        }

        const data = await response.json();
        const products = data.products || data || [];

        // Format based on requested format
        let exportData: string | Blob;
        let contentType: string;
        let filename: string;

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

        if (format === 'csv') {
            // Convert to CSV
            const headers = ['ID', 'Name', 'Type', 'Price', 'Quantity', 'Grade', 'Commodity', 'Store', 'Created At'];
            const rows = products.map((product: any) => [
                product.id,
                `"${product.name}"`,
                product.type,
                product.price,
                product.quantity,
                product.grade,
                `"${product.commodity}"`,
                `"${product.store?.name || ''}"`,
                new Date(product.createdAt).toLocaleDateString(),
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map((row: any[]) => row.join(','))
            ].join('\n');

            exportData = csvContent;
            contentType = 'text/csv';
            filename = `products-export-${timestamp}.csv`;
        } else if (format === 'json') {
            exportData = JSON.stringify(products, null, 2);
            contentType = 'application/json';
            filename = `products-export-${timestamp}.json`;
        } else {
            // For Excel, you would typically use a library like xlsx
            // This is a simplified version
            exportData = JSON.stringify(products);
            contentType = 'application/json';
            filename = `products-export-${timestamp}.json`;
        }

        // Return as downloadable file
        return new NextResponse(exportData, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('Products export API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}