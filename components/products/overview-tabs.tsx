'use client';

import { Product, ProductCategoryStats, LowStockProduct } from "@/types";
import { ProductStats } from "./product-stats";
import { LowStockAlert } from "./product-low-stock-alert";
import { ProductCharts } from "./products-chart";
import { RecentProductsTable } from "./recent-products-table";

interface OverviewTabProps {
    stats: {
        totalProducts: number;
        totalValue: number;
        averagePrice: number;
        lowStockCount: number;
    };
    categoryStats: ProductCategoryStats[];
    priceRanges: any[];
    lowStockProducts: LowStockProduct[];
    recentProducts: Product[];
    onViewProduct: (product: Product) => void;
    onEditProduct?: (product: Product) => void;
    onDeleteProduct?: (product: Product) => void;
    isAdminOrManager: boolean;
}

export const OverviewTab = ({
    stats,
    categoryStats,
    priceRanges,
    lowStockProducts,
    recentProducts,
    onViewProduct,
    onEditProduct,
    onDeleteProduct,
    isAdminOrManager,
}: OverviewTabProps) => {
    return (
        <div className="space-y-6">
            <ProductStats
                categoryStats={categoryStats}
                priceStats={{
                    minPrice: 0,
                    maxPrice: 1000,
                    averagePrice: stats.averagePrice,
                    priceByType: {},
                    priceByGrade: {}
                }}
                {...stats}
            />

            <LowStockAlert products={lowStockProducts} />

            <ProductCharts
                categoryStats={categoryStats}
                priceRanges={priceRanges}
            />

            <RecentProductsTable
                products={recentProducts}
                onView={onViewProduct}
                onEdit={isAdminOrManager ? onEditProduct : undefined}
                onDelete={isAdminOrManager ? onDeleteProduct : undefined}
                showActions={isAdminOrManager}
            />
        </div>
    );
};