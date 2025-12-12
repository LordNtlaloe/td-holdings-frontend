// components/dashboard/stores/store-analytics-chart.tsx
"use client";

import { Store } from '@/types';
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
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface StoreAnalyticsChartProps {
    stores: Store[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function StoreAnalyticsChart({ stores }: StoreAnalyticsChartProps) {
    // Prepare data for charts
    const salesData = stores
        .map(store => ({
            name: store.name,
            sales: store._count?.sales || 0,
            employees: store._count?.employees || 0,
            products: store._count?.products || 0,
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

    const employeeData = stores
        .map(store => ({
            name: store.name,
            value: store._count?.employees || 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const monthlyTrendData = [
        { month: 'Jan', sales: 4000, employees: 24 },
        { month: 'Feb', sales: 3000, employees: 28 },
        { month: 'Mar', sales: 2000, employees: 32 },
        { month: 'Apr', sales: 2780, employees: 35 },
        { month: 'May', sales: 1890, employees: 38 },
        { month: 'Jun', sales: 2390, employees: 40 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by Store */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Stores</CardTitle>
                        <CardDescription>Sales volume by store</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="sales" name="Total Sales" fill="#8884d8" />
                                    <Bar dataKey="employees" name="Employees" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Employee Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Distribution</CardTitle>
                        <CardDescription>Staff count per store</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={employeeData}
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
                                        {employeeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Trends</CardTitle>
                    <CardDescription>Sales and employee growth</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyTrendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="sales"
                                    name="Sales"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="employees"
                                    name="Employees"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}