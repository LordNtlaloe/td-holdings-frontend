// app/(dashboard)/stores/page.tsx
"use client";

import { useState, useEffect } from "react";
import StoresTable from '@/components/dashboard/stores/stores-table';
import StoreLocationMap from '@/components/dashboard/stores/store-location-map';
import StoreAnalyticsChart from '@/components/dashboard/stores/store-analytics-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Grid, List, Map, BarChart, Activity } from "lucide-react";
import { Store } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StoreStatsCards from "@/components/dashboard/stores/store-stat-cards";
import TopStoresChart from "@/components/dashboard/stores/top-stores-chart";
import EmployeeDistributionChart from "@/components/dashboard/stores/store-employee-distribution";
import RecentStoreActivities from "@/components/dashboard/stores/recent-activities";
import { getAllStores } from "@/lib/store-api";


export default function Stores() {
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState<'table' | 'cards' | 'map'>('table');
    const [selectedTab, setSelectedTab] = useState('overview');

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            setIsLoading(true);
            const fetchedStores = await getAllStores();
            setStores(fetchedStores);
        } catch (error) {
            console.error('Failed to fetch stores:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        // Export stores data
        const csvContent = [
            ['Store Name', 'Location', 'Employees', 'Products', 'Total Sales', 'Created Date'],
            ...stores.map(store => [
                store.name,
                store.location,
                store._count?.employees || 0,
                store._count?.products || 0,
                store._count?.sales || 0,
                new Date(store.createdAt).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stores-export.csv';
        a.click();
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-96 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stores Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage {stores.length} store{stores.length !== 1 ? 's' : ''} across all locations
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex justify-between items-center">
                <Tabs defaultValue="overview" className="w-full" onValueChange={setSelectedTab}>
                    <div className="flex justify-between items-center">
                        <TabsList>
                            <TabsTrigger value="overview">
                                <Grid className="h-4 w-4 mr-2" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="analytics">
                                <BarChart className="h-4 w-4 mr-2" />
                                Analytics
                            </TabsTrigger>
                            <TabsTrigger value="activities">
                                <Activity className="h-4 w-4 mr-2" />
                                Activities
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex space-x-2">
                            <Button
                                variant={activeView === 'table' ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => setActiveView('table')}
                            >
                                <List className="h-4 w-4 mr-2" />
                                Table
                            </Button>
                            <Button
                                variant={activeView === 'cards' ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => setActiveView('cards')}
                            >
                                <Grid className="h-4 w-4 mr-2" />
                                Cards
                            </Button>
                            <Button
                                variant={activeView === 'map' ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => setActiveView('map')}
                            >
                                <Map className="h-4 w-4 mr-2" />
                                Map
                            </Button>
                        </div>
                    </div>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <StoreStatsCards stores={stores} />

                        {/* Main Content View */}
                        {activeView === 'table' && <StoresTable stores={stores} />}
                        {activeView === 'cards' && <StoreCardsView stores={stores} />}
                        {activeView === 'map' && <StoreLocationMap stores={stores} />}
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-6">
                        <StoreAnalyticsChart stores={stores} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Performing Stores</CardTitle>
                                    <CardDescription>By total sales volume</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TopStoresChart stores={stores} />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Employee Distribution</CardTitle>
                                    <CardDescription>Staff count per store</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <EmployeeDistributionChart stores={stores} />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Activities Tab */}
                    <TabsContent value="activities">
                        <RecentStoreActivities />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stores.length}</div>
                        <p className="text-sm text-muted-foreground">Total Stores</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {stores.reduce((sum, store) => sum + (store._count?.employees || 0), 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Employees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {stores.reduce((sum, store) => sum + (store._count?.products || 0), 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Products</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {stores.reduce((sum, store) => sum + (store._count?.sales || 0), 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Store Cards View Component
function StoreCardsView({ stores }: { stores: Store[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
                <Card key={store.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg">{store.name}</CardTitle>
                        <CardDescription>{store.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Employees:</span>
                                <span className="font-medium">{store._count?.employees || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Products:</span>
                                <span className="font-medium">{store._count?.products || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Sales:</span>
                                <span className="font-medium">{store._count?.sales || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Created:</span>
                                <span>{new Date(store.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                            <Button size="sm" variant="outline" className="w-full" asChild>
                                <a href={`/stores/${store.id}`}>View Details</a>
                            </Button>
                            <Button size="sm" variant="secondary" className="w-full" asChild>
                                <a href={`/stores/${store.id}/edit`}>Edit</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
