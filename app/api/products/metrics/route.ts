// app/api/products/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';

export async function GET(request: NextRequest) {
    try {
        console.log('Products API: Fetching product metrics');

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
        const storeId = searchParams.get('storeId');
        const timeRange = searchParams.get('timeRange') || 'month'; // day, week, month, year
        const type = searchParams.get('type'); // TIRE or BALE

        // Build query string
        let queryString = `?timeRange=${timeRange}`;
        if (storeId) queryString += `&storeId=${storeId}`;
        if (type) queryString += `&type=${type}`;

        // Fetch products first for calculations
        const response = await fetch(`${API_BASE_URL}/products${queryString}&limit=1000`, {
            headers: {
                'Cookie': `accessToken=${accessToken.value}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch product data' },
                { status: response.status }
            );
        }

        const data = await response.json();
        const products = data.products || [];

        // Calculate metrics
        const metrics = calculateProductMetrics(products, timeRange);

        return NextResponse.json(metrics);

    } catch (error) {
        console.error('Product metrics API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function calculateProductMetrics(products: any[], timeRange: string) {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
        case 'day':
            startDate.setDate(now.getDate() - 1);
            break;
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate.setMonth(now.getMonth() - 1);
    }

    // Filter products by time range if they have timestamps
    const recentProducts = products.filter((p: any) =>
        new Date(p.createdAt) >= startDate
    );

    const metrics = {
        // Basic counts
        totalProducts: products.length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
        totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),

        // Type breakdown
        byType: {
            tire: products.filter((p: any) => p.type === 'TIRE').length,
            bale: products.filter((p: any) => p.type === 'BALE').length,
        },

        // Value by type
        valueByType: {
            tire: products
                .filter((p: any) => p.type === 'TIRE')
                .reduce((sum, p) => sum + (p.price * p.quantity), 0),
            bale: products
                .filter((p: any) => p.type === 'BALE')
                .reduce((sum, p) => sum + (p.price * p.quantity), 0),
        },

        // Stock status
        stockStatus: {
            outOfStock: products.filter((p: any) => p.quantity === 0).length,
            lowStock: products.filter((p: any) => p.quantity > 0 && p.quantity <= 10).length,
            inStock: products.filter((p: any) => p.quantity > 10).length,
        },

        // Category breakdown (for tires)
        tireCategories: products
            .filter((p: any) => p.type === 'TIRE' && p.tireCategory)
            .reduce((acc: any, p: any) => {
                acc[p.tireCategory] = (acc[p.tireCategory] || 0) + 1;
                return acc;
            }, {}),

        // Grade distribution
        grades: products
            .filter((p: any) => p.grade)
            .reduce((acc: any, p: any) => {
                acc[p.grade] = (acc[p.grade] || 0) + 1;
                return acc;
            }, {}),

        // Top products by value
        topProductsByValue: products
            .map((p: any) => ({
                id: p.id,
                name: p.name,
                type: p.type,
                quantity: p.quantity,
                price: p.price,
                totalValue: p.price * p.quantity,
                store: p.store?.name || 'Unknown',
            }))
            .sort((a: any, b: any) => b.totalValue - a.totalValue)
            .slice(0, 10),

        // Recent additions
        recentAdditions: recentProducts.length,
        recentValueAdded: recentProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0),

        // Store-wise distribution
        byStore: products.reduce((acc: any, p: any) => {
            const storeName = p.store?.name || 'Unknown';
            if (!acc[storeName]) {
                acc[storeName] = { count: 0, value: 0, quantity: 0 };
            }
            acc[storeName].count += 1;
            acc[storeName].value += p.price * p.quantity;
            acc[storeName].quantity += p.quantity;
            return acc;
        }, {}),

        // Price ranges
        priceRanges: {
            under100: products.filter((p: any) => p.price < 100).length,
            '100-500': products.filter((p: any) => p.price >= 100 && p.price <= 500).length,
            '501-1000': products.filter((p: any) => p.price > 500 && p.price <= 1000).length,
            over1000: products.filter((p: any) => p.price > 1000).length,
        },

        // Quantity ranges
        quantityRanges: {
            '1-10': products.filter((p: any) => p.quantity >= 1 && p.quantity <= 10).length,
            '11-50': products.filter((p: any) => p.quantity >= 11 && p.quantity <= 50).length,
            '51-100': products.filter((p: any) => p.quantity >= 51 && p.quantity <= 100).length,
            over100: products.filter((p: any) => p.quantity > 100).length,
        },

        // Commodity analysis
        topCommodities: products
            .filter((p: any) => p.commodity)
            .reduce((acc: any, p: any) => {
                const commodity = p.commodity.trim().toLowerCase();
                if (!acc[commodity]) {
                    acc[commodity] = { count: 0, value: 0, products: [] };
                }
                acc[commodity].count += 1;
                acc[commodity].value += p.price * p.quantity;
                acc[commodity].products.push(p.id);
                return acc;
            }, {}),

        // Alert metrics
        alerts: {
            zeroStockProducts: products.filter((p: any) => p.quantity === 0).length,
            lowStockProducts: products.filter((p: any) => p.quantity > 0 && p.quantity <= 10).length,
            highValueProducts: products.filter((p: any) => p.price * p.quantity > 10000).length,
        },
    };

    return metrics;
}