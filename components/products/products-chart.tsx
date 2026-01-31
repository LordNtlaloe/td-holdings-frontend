"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { ProductCategoryStats, Product } from "@/types";
import { Package } from "lucide-react";

interface ProductChartsProps {
    categoryStats: ProductCategoryStats[] | null | undefined;
    priceRanges: Array<{ range: string; count: number }>;
    products?: Product[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function ProductCharts({ categoryStats, priceRanges, products }: ProductChartsProps) {
    // Safely transform categoryStats for the pie chart
    const pieChartData = Array.isArray(categoryStats) 
        ? categoryStats.map(stat => ({
            name: stat.category || "Uncategorized",
            value: stat.count || 0,
            totalInventory: stat.totalInventory || 0,
            averagePrice: stat.averagePrice || 0,
        }))
        : [];

    // Filter out empty price ranges for better visualization
    const filteredPriceRanges = Array.isArray(priceRanges) 
        ? priceRanges.filter(range => range.count > 0)
        : [];

    // If no data in price ranges, show message
    const hasPriceData = filteredPriceRanges.length > 0;
    const hasCategoryData = pieChartData.length > 0 && pieChartData.some(item => item.value > 0);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Category Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Products by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    {hasCategoryData ? (
                        <div className="h-75">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.name}: ${entry.value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name, props) => [
                                            value,
                                            props.payload.name
                                        ]}
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-75 flex flex-col items-center justify-center text-muted-foreground">
                            <Package className="h-12 w-12 mb-4" />
                            <p>No category data available</p>
                            {!Array.isArray(categoryStats) && categoryStats !== null && (
                                <p className="text-sm mt-2 text-red-500">
                                    Invalid category stats format
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Price Range Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Products by Price Range</CardTitle>
                </CardHeader>
                <CardContent>
                    {hasPriceData ? (
                        <div className="h-75">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={filteredPriceRanges}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="range"
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [`${value} products`, 'Count']}
                                        labelFormatter={(label) => `Price Range: ${label}`}
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="count"
                                        name="Product Count"
                                        fill="#8884d8"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-75 flex flex-col items-center justify-center text-muted-foreground">
                            <Package className="h-12 w-12 mb-4" />
                            <p>No price range data available</p>
                            {!Array.isArray(priceRanges) && (
                                <p className="text-sm mt-2 text-red-500">
                                    Invalid price ranges format
                                </p>
                            )}
                            {products && products.length > 0 && (
                                <p className="text-sm mt-2">
                                    {products.length} products loaded but no price ranges calculated
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}