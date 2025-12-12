"use client"
import { DeadStockList } from "@/components/dashboard/dead-stock-list";
import { InventoryKPIs } from "@/components/dashboard/inventory-kpis";
import { ProductList } from "@/components/dashboard/product-list";
import { SalesByStoreChart } from "@/components/dashboard/sales-by-store-chart";
import { SalesGrowthChart } from "@/components/dashboard/sales-growth-chart";
import { SalesKPIs } from "@/components/dashboard/sales-kpis";
import { StockByStoreChart } from "@/components/dashboard/stock-by-store-chart";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/layouts/app-layout";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react"

// Create a fetch helper that automatically includes credentials
async function fetchWithCredentials(endpoint: string) {
    console.log('Fetching:', endpoint);

    const response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
            'Cache-Control': 'no-cache',
        },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Authentication required. Please log in again.');
        }
        const error = await response.json();
        throw new Error(error.error || `Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    return response.json();
}

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading: authLoading, checkAuth } = useAuth();
    const router = useRouter();

    // Inventory States
    const [totalStockValue, setTotalStockValue] = useState(0)
    const [turnoverRate, setTurnoverRate] = useState(0)
    const [lowStockCount, setLowStockCount] = useState(0)
    const [outOfStockCount, setOutOfStockCount] = useState(0)
    const [stockByStore, setStockByStore] = useState<any[]>([])

    // Sales States
    const [todaySales, setTodaySales] = useState(0)
    const [monthSales, setMonthSales] = useState(0)
    const [salesByStore, setSalesByStore] = useState<any[]>([])
    const [salesGrowth, setSalesGrowth] = useState<any[]>([])

    // Product States
    const [topProducts, setTopProducts] = useState<any[]>([])
    const [deadStock, setDeadStock] = useState<any[]>([])

    // UI States
    const [loading, setLoading] = useState(true)
    const [alert, setAlert] = useState<{ message: string; type: 'default' | 'destructive' } | null>(null)
    const [dataLoaded, setDataLoaded] = useState(false)

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setDataLoaded(false);

            console.log('Starting dashboard data fetch...');

            // First, verify authentication
            const isAuthValid = await checkAuth();
            if (!isAuthValid) {
                console.log('Not authenticated, redirecting to login');
                router.push('/sign-in');
                return;
            }

            console.log('Authentication verified, fetching dashboard data...');

            // Fetch all dashboard data in parallel
            const [
                statsData,
                stockData,
                salesStoreData,
                salesGrowthData,
                topProductsData,
                // deadStockData
            ] = await Promise.all([
                // fetchWithCredentials('/api/dashboard'),
                fetchWithCredentials('/api/dashboard/stock-by-store'),
                fetchWithCredentials('/api/dashboard/sales-by-store'),
                fetchWithCredentials('/api/dashboard/sales-growth'),
                fetchWithCredentials('/api/dashboard/top-products'),
                fetchWithCredentials('/api/dashboard/dead-stock')
            ]);

            console.log('Dashboard data fetched successfully');
            console.log('Stats data:', statsData);

            // Set inventory states
            setTotalStockValue(statsData.summary?.totalStockValue || 0);
            setTurnoverRate(statsData.summary?.turnoverRate || 0);
            setLowStockCount(statsData.summary?.lowStockCount || 0);
            setOutOfStockCount(statsData.summary?.outOfStockCount || 0);
            setStockByStore(stockData.data || []);

            // Set sales states
            setTodaySales(statsData.summary?.todaySales || 0);
            setMonthSales(statsData.summary?.monthSales || 0);
            setSalesByStore(salesStoreData.data || []);
            setSalesGrowth(salesGrowthData.data || []);

            // Set product states
            setTopProducts(topProductsData.data || []);
            // setDeadStock(deadStockData.data || []);

            setDataLoaded(true);
            setAlert(null);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);

            if (error instanceof Error && error.message.includes('Authentication required')) {
                console.log('Auth error, redirecting to login');
                router.push('/sign-in');
            } else {
                setAlert({
                    message: `Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    type: 'destructive'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            console.log('Auth state changed, fetching dashboard data');
            fetchDashboardData();
        } else if (!authLoading && !isAuthenticated) {
            console.log('Not authenticated, redirecting to login');
            router.push('/sign-in');
        }
    }, [isAuthenticated, authLoading]);

    // Show loading state
    if (authLoading || (isAuthenticated && loading && !dataLoaded)) {
        return (
            <AppLayout>
                <div className="p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-4">Loading dashboard...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Show authentication required
    if (!isAuthenticated && !authLoading) {
        return (
            <AppLayout>
                <div className="p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <p className="text-lg mb-4">Authentication required</p>
                            <button
                                onClick={() => router.push('/sign-in')}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                {alert && (
                    <Alert variant={alert.type}>
                        {alert.message}
                        <button
                            onClick={fetchDashboardData}
                            className="ml-2 underline"
                        >
                            Retry
                        </button>
                    </Alert>
                )}

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {user?.firstName}!</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Role: {user?.role}
                    </div>
                </div>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Inventory Overview</h2>
                    <InventoryKPIs
                        totalStockValue={totalStockValue}
                        turnoverRate={turnoverRate}
                        lowStockCount={lowStockCount}
                        outOfStockCount={outOfStockCount}
                        loading={loading}
                    />
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Sales Overview</h2>
                    <SalesKPIs
                        todaySales={todaySales}
                        monthSales={monthSales}
                        loading={loading}
                    />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StockByStoreChart
                        data={stockByStore}
                        loading={loading}
                    />
                    <SalesByStoreChart
                        data={salesByStore}
                        loading={loading}
                    />
                </div>

                <SalesGrowthChart
                    data={salesGrowth}
                    loading={loading}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ProductList
                        title="Top Products"
                        products={topProducts}
                        loading={loading}
                        renderItem={(product) => (
                            <span className="text-sm text-muted-foreground">
                                Sold: {product.total_sold || 0} | Revenue: ${product.total_revenue?.toFixed(2) || 0}
                            </span>
                        )}
                    />
                    <DeadStockList
                        products={deadStock}
                        loading={loading}
                    />
                </div>
            </div>
        </AppLayout>
    );
}