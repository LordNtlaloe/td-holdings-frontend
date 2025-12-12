// app/(dashboard)/stores/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "@/layouts/app-layout";
import { Store } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomAlert } from "@/components/ui/custom-alert";
import {
    ArrowLeft,
    Edit,
    Users,
    Package,
    ShoppingCart,
    TrendingUp,
    MapPin,
    Calendar,
    DollarSign,
    BarChart3,
    Activity,
    Store as StoreIcon
} from "lucide-react";
import Link from "next/link";
import { getStoreById, getStoreStats } from "@/lib/store-api";
import StoreAnalytics from "@/components/dashboard/stores/store-analytics";
import StoreEmployees from "@/components/dashboard/stores/store-employees";
import StoreProducts from "@/components/dashboard/stores/store-products";
import StoreSales from "@/components/dashboard/stores/store-products";

export default function StoreDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [store, setStore] = useState<Store | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    const storeId = params.id as string;



    useEffect(() => {
        fetchStoreData();
    }, [storeId]);

    const fetchStoreData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch store details
            const storeResult = await getStoreById(storeId);

            if (!storeResult.success) {
                throw new Error(storeResult.error || "Failed to fetch store");
            }

            setStore(storeResult.data);

            // Fetch store statistics
            const statsResult = await getStoreStats(storeId);

            if (statsResult.success) {
                setStats(statsResult.data);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load store data");
            console.error("Error fetching store data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchStoreData();
    };

    if (isLoading) {
        return (
            <div>
                <div className="container mx-auto px-4 py-8">
                    {/* Header Skeleton */}
                    <div className="mb-6">
                        <Skeleton className="h-10 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>

                    {/* Quick Stats Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <Skeleton className="h-8 w-16 mb-2" />
                                    <Skeleton className="h-4 w-24" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Tabs Skeleton */}
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div>
                <div className="container mx-auto px-4 py-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <StoreIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Store Not Found</h3>
                                <p className="text-gray-500 mb-6">{error || "The requested store could not be found"}</p>
                                <div className="flex justify-center gap-4">
                                    <Button onClick={() => router.push("/stores")}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Stores
                                    </Button>
                                    <Button variant="outline" onClick={handleRefresh}>
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <StoreIcon className="h-8 w-8 text-blue-600" />
                                <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
                                <Badge variant={store.isActive ? "default" : "secondary"}>
                                    {store.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{store.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Created: {new Date(store.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/stores")}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                All Stores
                            </Button>
                            <Link href={`/stores/${storeId}/edit`}>
                                <Button>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Store
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {store._count?.employees || 0}
                            </div>
                            <Link href={`#employees`} className="text-xs text-blue-600 hover:underline">
                                View all employees →
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {store._count?.products || 0}
                            </div>
                            <Link href={`#products`} className="text-xs text-blue-600 hover:underline">
                                View inventory →
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {store._count?.sales || 0}
                            </div>
                            <Link href={`#sales`} className="text-xs text-blue-600 hover:underline">
                                View sales history →
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                M{stats?.salesSummary?.totalRevenue?.toLocaleString() || "0"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Last 30 days
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-2 lg:grid-cols-6">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="employees" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Employees
                        </TabsTrigger>
                        <TabsTrigger value="products" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Products
                        </TabsTrigger>
                        <TabsTrigger value="sales" className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Sales
                        </TabsTrigger>
                        <TabsTrigger value="activities" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Activities
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Store Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Store Information</CardTitle>
                                <CardDescription>Detailed information about this store</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Basic Information</h4>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Store ID</dt>
                                                    <dd className="text-sm font-medium">{store.id}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Location</dt>
                                                    <dd className="text-sm font-medium">{store.location}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Status</dt>
                                                    <dd>
                                                        <Badge variant={store.isActive ? "default" : "secondary"}>
                                                            {store.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Timeline</h4>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Created</dt>
                                                    <dd className="text-sm font-medium">
                                                        {new Date(store.createdAt).toLocaleDateString()}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Last Updated</dt>
                                                    <dd className="text-sm font-medium">
                                                        {new Date(store.updatedAt).toLocaleDateString()}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        {stats && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Metrics</CardTitle>
                                    <CardDescription>Key performance indicators for this store</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 border rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                M{stats.salesSummary?.averageSale?.toFixed(2) || "0"}
                                            </div>
                                            <p className="text-sm text-muted-foreground">Average Sale</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {stats.salesSummary?.totalSales || 0}
                                            </div>
                                            <p className="text-sm text-muted-foreground">Transactions (30d)</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {stats.stats?.productCount || 0}
                                            </div>
                                            <p className="text-sm text-muted-foreground">Products in Stock</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {stats.lowStock?.length || 0}
                                            </div>
                                            <p className="text-sm text-muted-foreground">Low Stock Items</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest updates and changes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats?.recentSales?.slice(0, 5).map((sale: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <ShoppingCart className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Sale #{sale.id?.slice(-8)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {sale.employee?.user?.firstName} {sale.employee?.user?.lastName}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">M{sale.total?.toFixed(2)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(sale.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full" onClick={() => setActiveTab("sales")}>
                                    View All Sales
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics">
                        <StoreAnalytics storeId={storeId} />
                    </TabsContent>

                    {/* Employees Tab */}
                    <TabsContent value="employees">
                        <StoreEmployees storeId={storeId} />
                    </TabsContent>

                    {/* Products Tab */}
                    <TabsContent value="products">
                        <StoreProducts storeId={storeId} />
                    </TabsContent>

                    {/* Sales Tab */}
                    <TabsContent value="sales">
                        <StoreSales storeId={storeId} />
                    </TabsContent>

                    {/* Activities Tab */}
                    <TabsContent value="activities">
                        <Card>
                            <CardHeader>
                                <CardTitle>Store Activities</CardTitle>
                                <CardDescription>Recent actions and changes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Activity Log</h3>
                                    <p className="text-gray-500 mb-6">
                                        Track all store-related activities and changes here.
                                    </p>
                                    <Button>View Activity History</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {error && (
                <CustomAlert
                    message={error}
                    type="error"
                    onClose={() => setError(null)}
                />
            )}
        </div>
    );
}