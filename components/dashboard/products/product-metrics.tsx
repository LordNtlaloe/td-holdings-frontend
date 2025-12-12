// app/components/dashboard/products/metrics-dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, DollarSign, Package, TrendingUp, BarChart3, ShoppingCart } from 'lucide-react';
import { getProductMetrics } from '@/lib/products-api';
import { ProductMetrics } from '@/types';

interface MetricsDashboardProps {
    storeId?: string;
}

export default function MetricsDashboard({ storeId }: MetricsDashboardProps) {
    const [metrics, setMetrics] = useState<ProductMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month');

    useEffect(() => {
        loadMetrics();
    }, [storeId, timeRange]);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const result = await getProductMetrics({
                storeId,
                timeRange
            });

            if (result.success && result.data) {
                setMetrics(result.data);
            }
        } catch (error) {
            console.error('Failed to load metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4 mt-2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!metrics) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No metrics available</h3>
                        <p className="text-sm text-gray-500">Failed to load product metrics</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Product Analytics</h2>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Products */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalProducts.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                                Tires: {metrics.byType.tire}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                Bales: {metrics.byType.bale}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Value */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${metrics.totalValue.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            <div className="flex justify-between">
                                <span>Tires: ${metrics.valueByType.tire.toLocaleString()}</span>
                                <span>Bales: ${metrics.valueByType.bale.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stock Status */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>In Stock</span>
                                <span className="font-medium">{metrics.stockStatus.inStock}</span>
                            </div>
                            <Progress value={(metrics.stockStatus.inStock / metrics.totalProducts) * 100} />

                            <div className="flex justify-between text-sm">
                                <span className="text-amber-600">Low Stock</span>
                                <span className="font-medium text-amber-600">{metrics.stockStatus.lowStock}</span>
                            </div>
                            <Progress
                                value={(metrics.stockStatus.lowStock / metrics.totalProducts) * 100}
                                className="bg-amber-100 [&>div]:bg-amber-500"
                            />

                            <div className="flex justify-between text-sm">
                                <span className="text-red-600">Out of Stock</span>
                                <span className="font-medium text-red-600">{metrics.stockStatus.outOfStock}</span>
                            </div>
                            <Progress
                                value={(metrics.stockStatus.outOfStock / metrics.totalProducts) * 100}
                                className="bg-red-100 [&>div]:bg-red-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.recentAdditions}</div>
                        <p className="text-xs text-muted-foreground">
                            {timeRange === 'day' ? 'Added today' :
                                timeRange === 'week' ? 'Added this week' :
                                    timeRange === 'month' ? 'Added this month' : 'Added this year'}
                        </p>
                        <div className="mt-2 text-sm">
                            Value added: ${metrics.recentValueAdded.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Metrics Tabs */}
            <Tabs defaultValue="distribution" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="distribution">Distribution</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="distribution" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Price Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Price Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Under $100</span>
                                        <span className="font-medium">{metrics.priceRanges.under100}</span>
                                    </div>
                                    <Progress value={(metrics.priceRanges.under100 / metrics.totalProducts) * 100} />

                                    <div className="flex justify-between">
                                        <span className="text-sm">$100 - $500</span>
                                        <span className="font-medium">{metrics.priceRanges['100-500']}</span>
                                    </div>
                                    <Progress value={(metrics.priceRanges['100-500'] / metrics.totalProducts) * 100} />

                                    <div className="flex justify-between">
                                        <span className="text-sm">$501 - $1,000</span>
                                        <span className="font-medium">{metrics.priceRanges['501-1000']}</span>
                                    </div>
                                    <Progress value={(metrics.priceRanges['501-1000'] / metrics.totalProducts) * 100} />

                                    <div className="flex justify-between">
                                        <span className="text-sm">Over $1,000</span>
                                        <span className="font-medium">{metrics.priceRanges.over1000}</span>
                                    </div>
                                    <Progress value={(metrics.priceRanges.over1000 / metrics.totalProducts) * 100} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quantity Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Quantity Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm">1 - 10 units</span>
                                        <span className="font-medium">{metrics.quantityRanges['1-10']}</span>
                                    </div>
                                    <Progress value={(metrics.quantityRanges['1-10'] / metrics.totalProducts) * 100} />

                                    <div className="flex justify-between">
                                        <span className="text-sm">11 - 50 units</span>
                                        <span className="font-medium">{metrics.quantityRanges['11-50']}</span>
                                    </div>
                                    <Progress value={(metrics.quantityRanges['11-50'] / metrics.totalProducts) * 100} />

                                    <div className="flex justify-between">
                                        <span className="text-sm">51 - 100 units</span>
                                        <span className="font-medium">{metrics.quantityRanges['51-100']}</span>
                                    </div>
                                    <Progress value={(metrics.quantityRanges['51-100'] / metrics.totalProducts) * 100} />

                                    <div className="flex justify-between">
                                        <span className="text-sm">Over 100 units</span>
                                        <span className="font-medium">{metrics.quantityRanges.over100}</span>
                                    </div>
                                    <Progress value={(metrics.quantityRanges.over100 / metrics.totalProducts) * 100} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tire Categories */}
                        {metrics.tireCategories && Object.keys(metrics.tireCategories).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Tire Categories</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(metrics.tireCategories)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([category, count]) => (
                                                <div key={category} className="flex justify-between items-center">
                                                    <span className="text-sm capitalize">{category.toLowerCase()}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{count}</span>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {((count / metrics.byType.tire) * 100).toFixed(1)}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Grade Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Grade Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(metrics.grades)
                                        .sort(([a], [b]) => a.localeCompare(b))
                                        .map(([grade, count]) => (
                                            <div key={grade} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={grade === 'A' ? 'default' : grade === 'B' ? 'secondary' : 'outline'}
                                                        className={grade === 'A' ? 'bg-green-100 text-green-800' :
                                                            grade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'}
                                                    >
                                                        Grade {grade}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{count}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {((count / metrics.totalProducts) * 100).toFixed(1)}%
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="alerts">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Product Alerts</CardTitle>
                            <CardDescription>Issues requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Zero Stock Alert */}
                                {metrics.alerts.zeroStockProducts > 0 && (
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                            <div>
                                                <h4 className="font-medium text-red-800">Out of Stock Products</h4>
                                                <p className="text-sm text-red-600">
                                                    {metrics.alerts.zeroStockProducts} products have zero stock
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                                            View Details
                                        </Button>
                                    </div>
                                )}

                                {/* Low Stock Alert */}
                                {metrics.alerts.lowStockProducts > 0 && (
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-amber-50 border-amber-200">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                            <div>
                                                <h4 className="font-medium text-amber-800">Low Stock Products</h4>
                                                <p className="text-sm text-amber-600">
                                                    {metrics.alerts.lowStockProducts} products are running low
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="text-amber-600 border-amber-300">
                                            View Details
                                        </Button>
                                    </div>
                                )}

                                {/* High Value Products */}
                                {metrics.alerts.highValueProducts > 0 && (
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
                                        <div className="flex items-center gap-3">
                                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <h4 className="font-medium text-blue-800">High Value Products</h4>
                                                <p className="text-sm text-blue-600">
                                                    {metrics.alerts.highValueProducts} products valued over $10,000 each
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                                            View Details
                                        </Button>
                                    </div>
                                )}

                                {metrics.alerts.zeroStockProducts === 0 &&
                                    metrics.alerts.lowStockProducts === 0 &&
                                    metrics.alerts.highValueProducts === 0 && (
                                        <div className="text-center py-8">
                                            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <TrendingUp className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-lg font-medium">All Good!</h3>
                                            <p className="text-sm text-gray-500">No critical alerts at this time</p>
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}