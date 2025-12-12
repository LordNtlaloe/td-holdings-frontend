// components/dashboard/products/product-analytics-chart.tsx
"use client";

import { Product } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';

interface ProductAnalyticsChartProps {
    products: Product[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ProductAnalyticsChart({ products }: ProductAnalyticsChartProps) {
    // Prepare data for charts
    const typeDistribution = [
        {
            name: 'TIRE',
            value: products.filter(p => p.type === 'TIRE').length,
            color: '#0088FE'
        },
        {
            name: 'BALE',
            value: products.filter(p => p.type === 'BALE').length,
            color: '#00C49F'
        }
    ];

    const gradeDistribution = [
        {
            name: 'Grade A',
            value: products.filter(p => p.grade === 'A').length,
            color: '#4CAF50'
        },
        {
            name: 'Grade B',
            value: products.filter(p => p.grade === 'B').length,
            color: '#FFC107'
        },
        {
            name: 'Grade C',
            value: products.filter(p => p.grade === 'C').length,
            color: '#F44336'
        }
    ];

    // Top 10 products by value
    const topProductsByValue = [...products]
        .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
        .slice(0, 10)
        .map(product => ({
            name: product.name.substring(0, 12) + (product.name.length > 12 ? '...' : ''),
            value: product.price * product.quantity,
            quantity: product.quantity,
            type: product.type,
        }));

    // Stock status distribution
    const stockStatusData = [
        {
            name: 'Out of Stock',
            value: products.filter(p => p.quantity === 0).length,
            color: '#F44336'
        },
        {
            name: 'Low Stock',
            value: products.filter(p => p.quantity > 0 && p.quantity <= 10).length,
            color: '#FF9800'
        },
        {
            name: 'In Stock',
            value: products.filter(p => p.quantity > 10).length,
            color: '#4CAF50'
        }
    ];

    // Price ranges
    const priceRangeData = [
        { range: 'Under M100', count: products.filter(p => p.price < 100).length },
        { range: 'M100-500', count: products.filter(p => p.price >= 100 && p.price <= 500).length },
        { range: 'M501-1000', count: products.filter(p => p.price > 500 && p.price <= 1000).length },
        { range: 'Over M1000', count: products.filter(p => p.price > 1000).length },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Type Distribution</CardTitle>
                        <CardDescription>Breakdown by product type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {typeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {typeDistribution.map((item) => (
                                <div key={item.name} className="text-center p-2 border rounded">
                                    <div className="text-lg font-bold" style={{ color: item.color }}>
                                        {item.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{item.name}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Grade Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Grade Distribution</CardTitle>
                        <CardDescription>Product quality grades</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={gradeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {gradeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                            {gradeDistribution.map((item) => (
                                <div key={item.name} className="text-center p-2 border rounded">
                                    <div className="text-lg font-bold" style={{ color: item.color }}>
                                        {item.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{item.name}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products by Value */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Products by Inventory Value</CardTitle>
                    <CardDescription>Highest value products in stock</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProductsByValue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => [`M${Number(value).toLocaleString()}`, 'Value']}
                                />
                                <Legend />
                                <Bar dataKey="value" name="Total Value (M)" fill="#8884d8" />
                                <Bar dataKey="quantity" name="Quantity" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                        {topProductsByValue.slice(0, 5).map((product, index) => (
                            <div key={index} className="text-center p-3 border rounded-lg">
                                <div className="font-bold text-green-600">
                                    M{product.value.toLocaleString()}
                                </div>
                                <div className="text-sm truncate">{product.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    {product.quantity} units • {product.type}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Stock Status & Price Ranges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Stock Status Overview</CardTitle>
                        <CardDescription>Current inventory health</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stockStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
                                    <Bar
                                        dataKey="value"
                                        name="Product Count"
                                        fill="#8884d8"
                                        label={{ position: 'top' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {stockStatusData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="font-bold">{item.value} products</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Price Ranges */}
                <Card>
                    <CardHeader>
                        <CardTitle>Price Distribution</CardTitle>
                        <CardDescription>Products by price range</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={priceRangeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Product Count"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {priceRangeData.map((item) => (
                                <div key={item.range} className="flex items-center justify-between p-2 border rounded">
                                    <span>{item.range}</span>
                                    <span className="font-bold">{item.count} products</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}