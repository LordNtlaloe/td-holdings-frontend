'use client';

import { EmployeePerformanceReport } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    Cell
} from 'recharts';
import {
    TrendingUp,
    Target,
    DollarSign,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Award,
    TrendingDown,
    Minus
} from 'lucide-react';

interface PerformanceChartsProps {
    performance: EmployeePerformanceReport;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

interface SalesDataPoint {
    date: string;
    revenue: number;
    transactions: number;
}

interface MetricsDataPoint {
    subject: string;
    value: number;
    fullMark: number;
}

interface ComparisonDataPoint {
    name: string;
    score: number | undefined;
    color: string;
}

interface ProductDataPoint {
    name: string;
    quantity: number;
    revenue: number;
}

// Define the tooltip formatter types
type TooltipFormatter = (value: unknown, name: string, props: any) => [string, string];
type PercentageTooltipFormatter = (value: unknown, name: string, props: any) => [string, string];

export function PerformanceCharts({ performance }: PerformanceChartsProps) {
    // Prepare data for sales performance chart
    const salesData: SalesDataPoint[] = performance.sales.salesByHour?.map((hourData, _index) => ({
        date: `${hourData.hour}:00`,
        revenue: hourData.revenue,
        transactions: hourData.sales,
    })) || [];

    // Prepare data for performance metrics radar chart
    const metricsData: MetricsDataPoint[] = [
        { subject: 'Revenue', value: Math.min((performance.sales.revenue / 100000) * 100, 100), fullMark: 100 },
        { subject: 'Transactions', value: Math.min((performance.sales.transactions / 100) * 100, 100), fullMark: 100 },
        { subject: 'Avg. Transaction', value: Math.min((performance.sales.averageTransaction / 500) * 100, 100), fullMark: 100 },
    ];

    // Prepare data for comparison chart
    const comparisonData: ComparisonDataPoint[] = [
        {
            name: 'Revenue',
            score: performance.sales.revenue,
            color: '#0088FE'
        },
        {
            name: 'Transactions',
            score: performance.sales.transactions,
            color: '#00C49F'
        },
    ].filter(item => item.score !== undefined);

    // Prepare data for best selling products
    const productData: ProductDataPoint[] = performance.sales.bestSellingProducts.slice(0, 5).map(product => ({
        name: product.productName.length > 15 ? product.productName.substring(0, 15) + '...' : product.productName,
        quantity: product.quantity,
        revenue: product.revenue,
    }));

    // Format value for tooltip
    const formatTooltipValue: TooltipFormatter = (value: unknown, name: string) => {
        if (typeof value === 'number') {
            return name === 'revenue' || name === 'Revenue'
                ? [`$${Number(value).toLocaleString()}`, 'Revenue']
                : [value.toString(), name === 'transactions' || name === 'Transactions' ? 'Transactions' : 'Quantity'];
        }
        return [String(value), name];
    };

    // Format percentage for tooltip
    const formatPercentageTooltip: PercentageTooltipFormatter = (value: unknown) => {
        return typeof value === 'number' ? [`${value}%`, 'Score'] : [String(value), 'Score'];
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${performance.sales.revenue.toLocaleString()}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                            Performance metric
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {performance.sales.transactions.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Avg: ${performance.sales.averageTransaction.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${performance.sales.averageTransaction.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                                Performance
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {performance.sales.bestSellingProducts.reduce((acc: number, product) => acc + product.quantity, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Top product: {performance.sales.bestSellingProducts[0]?.productName || 'N/A'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Performance</CardTitle>
                        <CardDescription>
                            Hourly revenue and transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip
                                        formatter={formatTooltipValue as any}
                                    />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#8884d8"
                                        name="Revenue"
                                        strokeWidth={2}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="transactions"
                                        stroke="#82ca9d"
                                        name="Transactions"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                        <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metricsData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar
                                        name="Performance"
                                        dataKey="value"
                                        stroke="#8884d8"
                                        fill="#8884d8"
                                        fillOpacity={0.6}
                                    />
                                    <Legend />
                                    <Tooltip formatter={formatPercentageTooltip as any} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Analysis</CardTitle>
                    <CardDescription>Comprehensive performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="comparison">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="comparison" className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Comparison
                            </TabsTrigger>
                            <TabsTrigger value="products" className="flex items-center gap-2">
                                <PieChartIcon className="h-4 w-4" />
                                Top Products
                            </TabsTrigger>
                            <TabsTrigger value="details" className="flex items-center gap-2">
                                <LineChartIcon className="h-4 w-4" />
                                Details
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="comparison" className="space-y-4">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={comparisonData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip formatter={formatPercentageTooltip as any} />
                                        <Legend />
                                        <Bar
                                            dataKey="score"
                                            name="Performance Score"
                                            fill="#8884d8"
                                        >
                                            {comparisonData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>

                        <TabsContent value="products" className="space-y-4">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={productData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={formatTooltipValue as any}
                                        />
                                        <Legend />
                                        <Bar dataKey="quantity" name="Quantity Sold" fill="#0088FE" />
                                        <Bar dataKey="revenue" name="Revenue" fill="#00C49F" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>

                        <TabsContent value="details" className="space-y-4">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium">Performance Metrics</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Revenue</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    ${performance.sales.revenue.toLocaleString()}
                                                </span>
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Transactions</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {performance.sales.transactions}
                                                </span>
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Average Transaction</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    ${performance.sales.averageTransaction.toFixed(2)}
                                                </span>
                                                <Minus className="h-4 w-4 text-yellow-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium">Top Products</h4>
                                    <div className="space-y-3">
                                        {performance.sales.bestSellingProducts.slice(0, 5).map((product, index) => (
                                            <div key={product.productId} className="flex items-center justify-between">
                                                <span className="text-sm">
                                                    {index + 1}. {product.productName}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {product.quantity} sold
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ${product.revenue.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}