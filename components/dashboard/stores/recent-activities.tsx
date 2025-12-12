// components/dashboard/stores/recent-store-activities.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity as ActivityIcon, Plus, Edit, Trash2, Users, Package, ShoppingCart, RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Activity, getRecentActivities } from "@/lib/activities-api";

export default function RecentStoreActivities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getRecentActivities(10);
            setActivities(data);
        } catch (err) {
            console.error('Failed to fetch activities:', err);
            setError('Failed to load activities');
            // Keep the UI working with empty data
            setActivities([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const getActionIcon = (action: string, type: string) => {
        switch (action.toLowerCase()) {
            case 'created':
                return { icon: Plus, color: "bg-green-100 text-green-600" };
            case 'updated':
            case 'modified':
                return { icon: Edit, color: "bg-blue-100 text-blue-600" };
            case 'deleted':
                return { icon: Trash2, color: "bg-red-100 text-red-600" };
            case 'added':
                return type === 'EMPLOYEE'
                    ? { icon: Users, color: "bg-purple-100 text-purple-600" }
                    : { icon: Plus, color: "bg-green-100 text-green-600" };
            default:
                return { icon: ActivityIcon, color: "bg-gray-100 text-gray-600" };
        }
    };

    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, { label: string, variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            'STORE': { label: 'Store', variant: 'default' },
            'EMPLOYEE': { label: 'Employee', variant: 'secondary' },
            'PRODUCT': { label: 'Product', variant: 'outline' },
            'SALE': { label: 'Sale', variant: 'outline' },
        };

        return typeMap[type] || { label: type, variant: 'outline' };
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
                    <CardTitle>Recent Activities</CardTitle>
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
                    <CardTitle>Recent Activities</CardTitle>
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
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>No recent activities found</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <ActivityIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No activities to display yet.</p>
                        <p className="text-sm mt-2">Activities will appear here as changes are made.</p>
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
                        <CardTitle>Recent Activities</CardTitle>
                        <CardDescription>Latest changes across all stores</CardDescription>
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
                        <ActivityIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity) => {
                        const { icon: Icon, color } = getActionIcon(activity.action, activity.type);
                        const { label: typeLabel, variant: badgeVariant } = getTypeBadge(activity.type);

                        return (
                            <div
                                key={activity.id}
                                className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-gray-100">
                                        {getActorInitials(activity.actor)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        <span className="font-semibold">{activity.actor}</span>
                                        {" "}{activity.action}{" "}
                                        {activity.store && (
                                            <a
                                                href={activity.storeId ? `/stores/${activity.storeId}` : '#'}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {activity.store}
                                            </a>
                                        )}
                                    </p>

                                    {activity.details && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {Object.entries(activity.details)
                                                .map(([key, value]) => `${key}: ${value}`)
                                                .join(', ')}
                                        </p>
                                    )}

                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatTimestamp(activity.timestamp)}
                                    </p>
                                </div>

                                <Badge variant={badgeVariant} className="text-xs shrink-0">
                                    {typeLabel}
                                </Badge>
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
                            onClick={() => window.location.href = '/activities'}
                        >
                            View All Activities
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}