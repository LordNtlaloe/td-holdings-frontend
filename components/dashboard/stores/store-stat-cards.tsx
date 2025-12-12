// components/dashboard/stores/store-stats-cards.tsx
"use client";

import { Store } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Package, ShoppingCart, MapPin } from "lucide-react";

interface StoreStatsCardsProps {
    stores: Store[];
}

export default function StoreStatsCards({ stores }: StoreStatsCardsProps) {
    const totalEmployees = stores.reduce((sum, store) => sum + (store._count?.employees || 0), 0);
    const totalProducts = stores.reduce((sum, store) => sum + (store._count?.products || 0), 0);
    const totalSales = stores.reduce((sum, store) => sum + (store._count?.sales || 0), 0);
    const avgEmployeesPerStore = stores.length > 0 ? (totalEmployees / stores.length).toFixed(1) : 0;

    const topStore = stores.reduce((prev, current) => {
        const prevSales = prev._count?.sales || 0;
        const currentSales = current._count?.sales || 0;
        return currentSales > prevSales ? current : prev;
    }, stores[0]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stores.length}</div>
                    <p className="text-xs text-muted-foreground">
                        Across all locations
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalEmployees}</div>
                    <p className="text-xs text-muted-foreground">
                        Avg. {avgEmployeesPerStore} per store
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalProducts.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Inventory across all stores
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        All-time transactions
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Store</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-bold truncate">{topStore?.name || 'N/A'}</div>
                    <p className="text-xs text-muted-foreground truncate">
                        {topStore?._count?.sales || 0} sales
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}