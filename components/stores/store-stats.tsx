import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    TrendingUp,
    Package,
    Users,
    ShoppingCart,
    AlertTriangle,
    PackageX,
    Building,
    Home,
    Warehouse,
    Store
} from 'lucide-react';
import { StoreType } from '@/types';

interface StoreStatsProps {
    stats: {
        totalStores: number;
        mainStore?: string;
        totalEmployees: number;
        totalProducts: number;
        totalSales: number;
        lowStockItems: number;
        outOfStockItems: number;
        storesByType?: {
            type: StoreType;
            count: number;
        }[];
    };
}

const storeTypeIcons = {
    [StoreType.MAIN]: Home,
    [StoreType.BRANCH]: Building,
    [StoreType.WAREHOUSE]: Warehouse,
};

export function StoreStats({ stats }: StoreStatsProps) {
    const statCards = [
        {
            title: 'Total Stores',
            value: stats.totalStores,
            icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
            description: stats.mainStore ? `Main: ${stats.mainStore}` : 'No main store set',
            color: 'bg-blue-500/10',
        },
        {
            title: 'Total Employees',
            value: stats.totalEmployees,
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
            description: 'Across all stores',
            color: 'bg-green-500/10',
        },
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: <Package className="h-4 w-4 text-muted-foreground" />,
            description: 'In inventory',
            color: 'bg-purple-500/10',
        },
        {
            title: 'Total Sales',
            value: stats.totalSales,
            icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />,
            description: 'All time transactions',
            color: 'bg-orange-500/10',
        },
        {
            title: 'Low Stock',
            value: stats.lowStockItems,
            icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
            description: 'Items need restocking',
            color: 'bg-yellow-500/10',
        },
        {
            title: 'Out of Stock',
            value: stats.outOfStockItems,
            icon: <PackageX className="h-4 w-4 text-muted-foreground" />,
            description: 'Items need attention',
            color: 'bg-red-500/10',
        },
    ];

    return (
        <div className="space-y-4">
            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {statCards.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={stat.color + " p-2 rounded-full"}>
                                {stat.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Store Type Breakdown */}
            {stats.storesByType && stats.storesByType.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Stores by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {stats.storesByType.map((typeData) => {
                                const Icon = storeTypeIcons[typeData.type] || Building;
                                return (
                                    <div
                                        key={typeData.type}
                                        className="flex items-center gap-3 rounded-lg border p-3"
                                    >
                                        <div className="rounded-full bg-muted p-2">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold">{typeData.count}</div>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {typeData.type.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}