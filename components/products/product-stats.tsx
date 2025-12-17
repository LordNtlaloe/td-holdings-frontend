'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Package,
    DollarSign,
    TrendingUp,
    TrendingDown,
    BarChart3,
    ShoppingCart,
    AlertTriangle,
    Layers,
    Store,
    Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCategoryStats, ProductPriceStatistics } from '@/types';

interface ProductStatsProps {
    categoryStats: ProductCategoryStats[];
    priceStats: ProductPriceStatistics | null;
}

export function ProductStats({ categoryStats, priceStats }: ProductStatsProps) {
    const totalProducts = categoryStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalInventory = categoryStats.reduce((sum, stat) => sum + stat.totalInventory, 0);
    const averagePrice = priceStats?.averagePrice || 0;
    const lowStockProducts = categoryStats.filter(stat => stat.totalInventory <= 10).length;

    const statCards = [
        {
            title: 'Total Products',
            value: totalProducts,
            icon: <Package className="h-4 w-4" />,
            description: 'Across all categories',
            color: 'bg-blue-500/10 text-blue-600',
            trend: null,
        },
        {
            title: 'Total Inventory',
            value: totalInventory,
            icon: <Layers className="h-4 w-4" />,
            description: 'Units in stock',
            color: 'bg-green-500/10 text-green-600',
            trend: '+5%',
        },
        {
            title: 'Avg Price',
            value: `$${averagePrice.toFixed(2)}`,
            icon: <DollarSign className="h-4 w-4" />,
            description: 'Across all products',
            color: 'bg-purple-500/10 text-purple-600',
            trend: '+2.5%',
        },
        {
            title: 'Price Range',
            value: `$${priceStats?.minPrice.toFixed(2) || '0.00'} - $${priceStats?.maxPrice.toFixed(2) || '0.00'}`,
            icon: <BarChart3 className="h-4 w-4" />,
            description: 'Min to Max',
            color: 'bg-orange-500/10 text-orange-600',
            trend: null,
        },
        {
            title: 'Low Stock',
            value: lowStockProducts,
            icon: <AlertTriangle className="h-4 w-4" />,
            description: 'Products needing attention',
            color: 'bg-yellow-500/10 text-yellow-600',
            trend: lowStockProducts > 0 ? 'Needs attention' : 'All good',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className={cn("p-2 rounded-full", stat.color)}>
                            {stat.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-bold">{stat.value}</div>
                            {stat.trend && (
                                <div className={cn(
                                    "text-xs font-medium px-2 py-1 rounded-full",
                                    stat.trend.includes('+')
                                        ? "bg-green-100 text-green-800"
                                        : stat.trend.includes('Needs')
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                )}>
                                    {stat.trend}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}