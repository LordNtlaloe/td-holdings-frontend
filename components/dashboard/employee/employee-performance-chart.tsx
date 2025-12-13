// components/dashboard/employees/employee-performance.tsx
"use client";

import { useState, useEffect } from "react";
import { EmployeePerformance as EmployeePerformanceType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Target,
    Calendar,
    Award,
    BarChart3,
    Users,
    Package,
    Clock
} from "lucide-react";
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
    Cell,
} from "recharts";
import { getEmployeePerformance } from "@/lib/employee-api";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeePerformanceProps {
    employeeId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function EmployeePerformance({ employeeId }: EmployeePerformanceProps) {
    const [performance, setPerformance] = useState<EmployeePerformanceType | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadPerformance();
    }, [employeeId, period]);

    const loadPerformance = async () => {
        try {
            setLoading(true);
            const result = await getEmployeePerformance(employeeId, period);

            if (result.success && result.data) {
                setPerformance(result.data);
            } else {
                console.error('Failed to load performance:', result.error);
            }
        } catch (error) {
            console.error('Error fetching performance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (!performance) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No Performance Data</h3>
                        <p className="text-sm text-gray-500">Performance data is not available for this employee.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { summary, dailySales, topProducts, recentSales } = performance;
    const employee = performance.employee;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        Performance Analytics
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        {employee?.firstName} {employee?.lastName} • {employee?.position}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" onClick={loadPerformance}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            M{summary?.totalSales?.toLocaleString() || '0'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">
                                {summary?.achievements || '0'}% from last period
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary?.averageTransactionValue?.toLocaleString() || '0'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-muted-foreground">
                                {summary?.averageTransactionValue
                                    ? `Avg: M${summary.averageTransactionValue.toFixed(2)}`
                                    : 'No transactions'
                                }
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary?.totalSales || '0'}%
                        </div>
                        <div className="mt-2">
                            <Progress value={summary?.totalSales || 0} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Daily Sales</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            M{summary?.averageSale?.toFixed(2) || '0'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="text-xs text-muted-foreground">
                                {summary?.totalSales || '0'} work days
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Detailed Analytics */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="products" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Top Products
                    </TabsTrigger>
                    <TabsTrigger value="recent" className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Recent Sales
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daily Sales Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Daily Sales Trend</CardTitle>
                                <CardDescription>Sales performance over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={dailySales || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                formatter={(value) => [`M${Number(value).toLocaleString()}`, 'Sales']}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="sales"
                                                name="Daily Sales"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="transactions"
                                                name="Transactions"
                                                stroke="#82ca9d"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Metrics</CardTitle>
                                <CardDescription>Key performance indicators</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Sales Target Progress */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Sales Target</span>
                                            <span className="text-sm font-bold">
                                                M{summary?.currentSales || '0'} / M{summary?.salesTarget || '0'}
                                            </span>
                                        </div>
                                        <Progress
                                            value={summary?.salesTarget ? (summary.currentSales / summary.salesTarget) * 100 : 0}
                                            className="h-2"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>0%</span>
                                            <span>50%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Top Products Tab */}
                <TabsContent value="products" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Selling Products</CardTitle>
                            <CardDescription>Best performing products by this employee</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topProducts && topProducts.length > 0 ? (
                                <>
                                    <div className="h-80 mb-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topProducts.slice(0, 10)}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="productName"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                    tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                                                />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value, name) => {
                                                        if (name === 'sales') return [`M${Number(value).toLocaleString()}`, 'Sales'];
                                                        return [value, name];
                                                    }}
                                                />
                                                <Legend />
                                                <Bar dataKey="quantity" name="Quantity Sold" fill="#8884d8" />
                                                <Bar dataKey="sales" name="Sales Value" fill="#82ca9d" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {topProducts.slice(0, 6).map((product, index) => (
                                            <Card key={index}>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-semibold">{product.productName}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {product.productType || 'Product'}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            #{index + 1}
                                                        </Badge>
                                                    </div>
                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>Quantity:</span>
                                                            <span className="font-bold">{product.quantity}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span>Sales:</span>
                                                            <span className="font-bold text-green-600">
                                                                M{product.sales?.toLocaleString() || '0'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span>Avg. Price:</span>
                                                            <span className="font-medium">
                                                                M{product.averagePrice?.toFixed(2) || '0'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No Product Data</h3>
                                    <p className="text-sm text-gray-500">
                                        No product sales data available for this period.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Recent Sales Tab */}
                <TabsContent value="recent" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Sales Transactions</CardTitle>
                            <CardDescription>Latest sales activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentSales && recentSales.length > 0 ? (
                                <div className="space-y-3">
                                    {recentSales.map((sale, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <ShoppingCart className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">
                                                        Sale #{sale.id?.slice(-8) || `TRX-${index + 1}`}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {sale.products?.length || 0} items • {sale.customerName || 'Walk-in Customer'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">
                                                    M{sale.totalAmount?.toFixed(2) || '0.00'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No Recent Sales</h3>
                                    <p className="text-sm text-gray-500">
                                        No sales transactions found for this period.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}