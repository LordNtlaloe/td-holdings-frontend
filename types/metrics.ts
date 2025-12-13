export interface ProductMetrics {
    totalProducts: number;
    totalValue: number;
    totalQuantity: number;
    byType: {
        tire: number;
        bale: number;
    };
    valueByType: {
        tire: number;
        bale: number;
    };
    stockStatus: {
        outOfStock: number;
        lowStock: number;
        inStock: number;
    };
    tireCategories: Record<string, number>;
    grades: Record<string, number>;
    topProductsByValue: Array<{
        id: string;
        name: string;
        type: string;
        quantity: number;
        price: number;
        totalValue: number;
        store: string;
    }>;
    recentAdditions: number;
    recentValueAdded: number;
    byStore: Record<string, { count: number; value: number; quantity: number }>;
    priceRanges: {
        under100: number;
        '100-500': number;
        '501-1000': number;
        over1000: number;
    };
    quantityRanges: {
        '1-10': number;
        '11-50': number;
        '51-100': number;
        over100: number;
    };
    alerts: {
        zeroStockProducts: number;
        lowStockProducts: number;
        highValueProducts: number;
    };
}

export interface StoreStats {
    stats: {
        employeeCount: number;
        productCount: number;
        saleCount: number;
    };
    salesSummary: {
        totalRevenue: number;
        totalSales: number;
        averageSale: number;
    };
    recentSales: any[];
    topProducts: any[];
    lowStock: any[];
}