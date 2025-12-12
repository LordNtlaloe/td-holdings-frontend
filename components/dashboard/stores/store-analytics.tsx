// components/dashboard/stores/store-analytics.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { Download, RefreshCw } from "lucide-react";
import { getStoreStats } from "@/lib/store-api";

interface StoreAnalyticsProps {
    storeId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function StoreAnalytics({ storeId }: StoreAnalyticsProps) {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [storeId]);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            const result = await getStoreStats(storeId);

            if (result.success) {
                setStats(result.data);
            } else {
                setError(result.error || "Failed to load analytics");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load analytics");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        // Export analytics data
        console.log("Export analytics");
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
                <Skeleton className="h-80 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={fetchAnalytics}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!stats) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <p className="text-gray-500">No analytics data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Prepare chart data
    const salesData = stats.recentSales?.slice(0, 10).map((sale: any) => ({
        date: new Date(sale.createdAt).toLocaleDateString(),
        amount: sale.total,
    })) || [];

    const productData = stats.topProducts?.slice(0, 5).map((product: any) => ({
        name: product.productName || "Product",
        value: product._sum?.quantity || 0,
    })) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Store Analytics</h2>
                    <p className="text-muted-foreground">Performance metrics and insights</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchAnalytics}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Sales Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Sales Trend</CardTitle>
                    <CardDescription>Recent sales performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    name="Sales Amount"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Top Products & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>Best selling products</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={productData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {productData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Low Stock Alert */}
                <Card>
                    <CardHeader>
                        <CardTitle>Low Stock Alert</CardTitle>
                        <CardDescription>Products needing restock</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 overflow-y-auto">
                            {stats.lowStock?.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.lowStock.map((product: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-muted-foreground">Type: {product.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${product.quantity <= 5 ? 'text-red-600' : 'text-orange-600'}`}>
                                                    {product.quantity} units
                                                </p>
                                                <p className="text-xs text-muted-foreground">Current stock</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-500">No low stock items</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}