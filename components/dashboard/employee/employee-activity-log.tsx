// components/dashboard/employees/employee-activity-log.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    Calendar,
    Activity,
    User,
    Clock,
    ExternalLink,
    RefreshCw,
    Download
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatDate, formatTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmployeeActivities } from "@/lib/employee-api";

interface EmployeeActivityLogProps {
    employeeId: string;
    initialActivities?: any[];
}

export default function EmployeeActivityLog({ employeeId, initialActivities }: EmployeeActivityLogProps) {
    const [activities, setActivities] = useState<any[]>(initialActivities || []);
    const [isLoading, setIsLoading] = useState(!initialActivities);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<string>("30d");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchActivities = async () => {
        try {
            setIsLoading(true);
            const result = await getEmployeeActivities(employeeId, {
                page,
                limit: 20,
                ...(dateRange !== "all" && {
                    startDate: getStartDate(dateRange)
                })
            });

            if (result.success && result.data) {
                setActivities(result.data.activities || []);
                setTotalPages(result.data.pagination?.pages || 1);
            }
        } catch (error) {
            console.error("Error fetching activities:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStartDate = (range: string): string => {
        const date = new Date();
        switch (range) {
            case "today":
                date.setHours(0, 0, 0, 0);
                break;
            case "7d":
                date.setDate(date.getDate() - 7);
                break;
            case "30d":
                date.setDate(date.getDate() - 30);
                break;
            case "90d":
                date.setDate(date.getDate() - 90);
                break;
            default:
                return "";
        }
        return date.toISOString();
    };

    useEffect(() => {
        if (!initialActivities) {
            fetchActivities();
        }
    }, [employeeId, page, dateRange, initialActivities]);

    useEffect(() => {
        setPage(1); // Reset to first page when filters change
    }, [dateRange, actionFilter]);

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = searchTerm === "" ||
            activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            JSON.stringify(activity.details).toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = actionFilter === "all" || activity.action === actionFilter;

        return matchesSearch && matchesAction;
    });

    // Get unique actions for filter
    const uniqueActions = Array.from(new Set(activities.map(a => a.action)));

    const getActionBadge = (action: string) => {
        const actionType = action.split('_')[0].toLowerCase();

        switch (actionType) {
            case 'create':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Create</Badge>;
            case 'update':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Update</Badge>;
            case 'delete':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Delete</Badge>;
            case 'deactivate':
            case 'reset':
                return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Security</Badge>;
            default:
                return <Badge variant="outline">{action}</Badge>;
        }
    };

    const getEntityIcon = (entityType: string) => {
        switch (entityType) {
            case 'EMPLOYEE':
                return <User className="h-4 w-4" />;
            case 'SALE':
                return <Activity className="h-4 w-4" />;
            case 'PRODUCT':
                return <Activity className="h-4 w-4" />;
            case 'STORE':
                return <Activity className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Activity Log
                        </CardTitle>
                        <CardDescription>
                            Track employee system activities and actions
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={fetchActivities}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search activities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Action" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                {uniqueActions.map((action) => (
                                    <SelectItem key={action} value={action}>
                                        {action.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="all">All time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Activity List */}
                <div className="space-y-4">
                    {filteredActivities.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No Activities Found</h3>
                            <p className="text-sm text-gray-500">
                                {searchTerm || actionFilter !== "all" || dateRange !== "all"
                                    ? "No activities match your filters"
                                    : "No activities recorded for this employee"
                                }
                            </p>
                        </div>
                    ) : (
                        filteredActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {getEntityIcon(activity.entityType)}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">
                                                    {activity.action.replace('_', ' ')}
                                                </h4>
                                                {getActionBadge(activity.action)}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.entityType} • {activity.entityId}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatTime(activity.createdAt)}
                                        </div>
                                        <div>{formatDate(activity.createdAt)}</div>
                                    </div>
                                </div>

                                {/* Details */}
                                {activity.details && Object.keys(activity.details).length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="text-sm">
                                            <p className="font-medium mb-2">Details:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {Object.entries(activity.details).map(([key, value]) => (
                                                    <div key={key} className="flex gap-2">
                                                        <span className="font-medium text-muted-foreground">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                        </span>
                                                        <span className="flex-1">
                                                            {typeof value === 'object'
                                                                ? JSON.stringify(value, null, 2)
                                                                : String(value)
                                                            }
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* User Info */}
                                {activity.user && (
                                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                <User className="h-4 w-4 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {activity.user.firstName} {activity.user.lastName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.user.email}
                                                </p>
                                            </div>
                                        </div>
                                        {activity.ipAddress && (
                                            <div className="text-xs text-muted-foreground">
                                                IP: {activity.ipAddress}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}