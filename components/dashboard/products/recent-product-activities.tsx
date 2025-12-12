// components/dashboard/products/recent-product-activities.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity as ActivityIcon, Plus, Edit, Trash2, Package, RefreshCw, AlertCircle, ArrowRight, ShoppingCart, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

// Mock activity data - replace with your actual API call
const mockActivities = [
    {
        id: "1",
        actor: "John Doe",
        action: "created",
        type: "PRODUCT",
        store: "Main Store",
        storeId: "1",
        details: { name: "Premium Tires", quantity: "100", price: "M150" },
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
        id: "2",
        actor: "Jane Smith",
        action: "updated",
        type: "PRODUCT",
        store: "Branch Store",
        storeId: "2",
        details: { name: "Cotton Bales", quantity: "50", price: "M500" },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
        id: "3",
        actor: "Bob Wilson",
        action: "sold",
        type: "PRODUCT",
        store: "Main Store",
        storeId: "1",
        details: { name: "All-Season Tires", quantity: "5", total: "M750" },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
        id: "4",
        actor: "Alice Johnson",
        action: "transferred",
        type: "PRODUCT",
        store: "Warehouse",
        storeId: "3",
        details: { name: "Wool Bales", quantity: "20", from: "Warehouse", to: "Main Store" },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    },
    {
        id: "5",
        actor: "Charlie Brown",
        action: "restocked",
        type: "PRODUCT",
        store: "Branch Store",
        storeId: "2",
        details: { name: "SUV Tires", quantity: "30", supplier: "TireCo" },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    },
];

export default function RecentProductActivities() {
    const [activities, setActivities] = useState<any[]>(mockActivities);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Replace with your actual API call:
            // const data = await getRecentProductActivities(10);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            setActivities(mockActivities);
        } catch (err) {
            console.error('Failed to fetch activities:', err);
            setError('Failed to load activities');
            setActivities([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const getActionIcon = (action: string) => {
        switch (action.toLowerCase()) {
            case 'created':
            case 'added':
                return { icon: Plus, color: "bg-green-100 text-green-600", label: "Created" };
            case 'updated':
            case 'modified':
                return { icon: Edit, color: "bg-blue-100 text-blue-600", label: "Updated" };
            case 'deleted':
            case 'removed':
                return { icon: Trash2, color: "bg-red-100 text-red-600", label: "Deleted" };
            case 'sold':
                return { icon: ShoppingCart, color: "bg-purple-100 text-purple-600", label: "Sold" };
            case 'transferred':
                return { icon: Truck, color: "bg-orange-100 text-orange-600", label: "Transferred" };
            case 'restocked':
                return { icon: Package, color: "bg-teal-100 text-teal-600", label: "Restocked" };
            default:
                return { icon: ActivityIcon, color: "bg-gray-100 text-gray-600", label: "Activity" };
        }
    };

    const formatTimestamp = (timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
            return timestamp;
        }
    };

    const getActorInitials = (actor: string) => {
        return actor
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Product Activities</CardTitle>
                    <CardDescription>Loading activities...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-start space-x-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-6 w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Product Activities</CardTitle>
                    <CardDescription>Error loading activities</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={fetchActivities} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (activities.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Product Activities</CardTitle>
                    <CardDescription>No recent activities found</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <ActivityIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No product activities to display yet.</p>
                        <p className="text-sm mt-2">Activities will appear here as product changes are made.</p>
                        <Button className="mt-4" variant="outline">
                            <Package className="h-4 w-4 mr-2" />
                            Add First Product
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Recent Product Activities</CardTitle>
                        <CardDescription>Latest product changes and transactions</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchActivities}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity) => {
                        const { icon: Icon, color, label } = getActionIcon(activity.action);

                        return (
                            <div
                                key={activity.id}
                                className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <div className={`p-2 rounded-lg ${color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold">{activity.actor}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {label}
                                        </Badge>
                                    </div>

                                    <p className="text-sm">
                                        {activity.action} {activity.details?.name || 'product'}
                                        {activity.store && (
                                            <span>
                                                {" "}at{" "}
                                                <a
                                                    href={activity.storeId ? `/stores/${activity.storeId}` : '#'}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {activity.store}
                                                </a>
                                            </span>
                                        )}
                                    </p>

                                    {activity.details && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {Object.entries(activity.details).map(([key, value]) => (
                                                <span
                                                    key={key}
                                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                                >
                                                    {key}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground mt-2">
                                        {formatTimestamp(activity.timestamp)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {activities.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-sm"
                            onClick={() => window.location.href = '/activities?type=product'}
                        >
                            View All Product Activities
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}