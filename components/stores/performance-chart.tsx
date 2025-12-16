"use client"
import { StorePerformance } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    LineChart,
    Line,
} from 'recharts';

interface PerformanceChartsProps {
    performance: StorePerformance;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function PerformanceCharts({ performance }: PerformanceChartsProps) {
    // Prepare data for best-selling products chart
    const productData = performance.sales.bestSellingProducts.slice(0, 5).map((product) => ({
        name: product.productName,
        quantity: product.quantity,
        revenue: product.revenue,
    }));

    // Prepare data for top employees chart
    const employeeData = performance.sales.topEmployees.slice(0, 5).map((employee) => ({
        name: employee.employeeName.split(' ')[0], // First name only
        sales: employee.sales,
        revenue: employee.revenue,
    }));

    // Prepare data for inventory categories (simulated)
    const inventoryData = [
        { name: 'Fast Moving', value: 40 },
        { name: 'Slow Moving', value: 25 },
        { name: 'Seasonal', value: 20 },
        { name: 'New Arrivals', value: 15 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Revenue</CardTitle>
                        <CardDescription>
                            Revenue: ${performance.sales.revenue.toLocaleString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={employeeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                                    <Bar dataKey="sales" name="Transactions" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>Best selling products by quantity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={productData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="quantity" name="Quantity Sold" fill="#0088FE" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="inventory">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="inventory">Inventory</TabsTrigger>
                            <TabsTrigger value="sales">Sales Trends</TabsTrigger>
                            <TabsTrigger value="categories">Product Mix</TabsTrigger>
                        </TabsList>

                        <TabsContent value="inventory" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Turnover Rate</h4>
                                    <div className="text-2xl font-bold">
                                        {performance.inventory.turnoverRate.toFixed(2)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Higher is better
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Days of Inventory</h4>
                                    <div className="text-2xl font-bold">
                                        {performance.inventory.daysOfInventory.toFixed(0)} days
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Lower is better
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Stock-out Rate</h4>
                                    <div className="text-2xl font-bold">
                                        {(performance.inventory.stockOutRate * 100).toFixed(1)}%
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Lower is better
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="sales">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={[
                                            { month: 'Jan', revenue: 4000 },
                                            { month: 'Feb', revenue: 3000 },
                                            { month: 'Mar', revenue: 5000 },
                                            { month: 'Apr', revenue: 2780 },
                                            { month: 'May', revenue: 1890 },
                                            { month: 'Jun', revenue: 2390 },
                                        ]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#8884d8"
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>

                        <TabsContent value="categories">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={inventoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) =>
                                                `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                                            }
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {inventoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}