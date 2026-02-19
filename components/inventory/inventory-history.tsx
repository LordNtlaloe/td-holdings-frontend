// components/inventory/InventoryHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Filter, Search, User, FileText, RefreshCw } from 'lucide-react';
import {
    InventoryHistory as InventoryHistoryType,
    InventoryChangeType,
    InventoryHistoryFilters
} from '@/types';
import InventoryAPI from '@/lib/api/inventory';
import { useAuth } from '@/contexts/auth-context';
import { format } from 'date-fns';

interface InventoryHistoryProps {
    productId?: string;
    storeId?: string;
    limit?: number;
}

// Extend the filters interface to include search for UI
interface ExtendedInventoryHistoryFilters extends InventoryHistoryFilters {
    search?: string;
    startDateString?: string; // For input fields
    endDateString?: string; // For input fields
}

const InventoryHistory = ({ productId, storeId, limit = 20 }: InventoryHistoryProps) => {
    const { accessToken: token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<InventoryHistoryType[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<InventoryHistoryType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ExtendedInventoryHistoryFilters>({
        productId,
        storeId,
        changeType: undefined,
        search: '',
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit
    });

    useEffect(() => {
        if (token) {
            loadHistory();
        }
    }, [token, productId, storeId]);

    useEffect(() => {
        filterHistory();
    }, [history, filters.search, filters.changeType, filters.startDate, filters.endDate]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            // Create API filters (excluding UI-only fields)
            const apiFilters: InventoryHistoryFilters = {
                productId: filters.productId,
                storeId: filters.storeId,
                changeType: filters.changeType,
                startDate: filters.startDate,
                endDate: filters.endDate,
                page: filters.page,
                limit: filters.limit
            };

            const response = await InventoryAPI.getInventoryHistory(token!, apiFilters);
            setHistory(response.history);
        } catch (err: any) {
            setError(err.message || 'Failed to load history');
            console.error('Error loading inventory history:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterHistory = () => {
        let filtered = [...history];

        // Filter by change type
        if (filters.changeType) {
            filtered = filtered.filter(item => item.changeType === filters.changeType);
        }

        // Filter by search term
        if (filters.search && filters.search.trim()) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(item => {
                const notes = item.notes?.toLowerCase() || '';
                const referenceId = item.referenceId?.toLowerCase() || '';
                const userFirstName = item.user?.firstName?.toLowerCase() || '';
                const userLastName = item.user?.lastName?.toLowerCase() || '';

                return notes.includes(searchLower) ||
                    referenceId.includes(searchLower) ||
                    userFirstName.includes(searchLower) ||
                    userLastName.includes(searchLower);
            });
        }

        // Filter by date range
        if (filters.startDate) {
            const start = new Date(filters.startDate);
            filtered = filtered.filter(item => {
                const itemDate = item.createdAt ? new Date(item.createdAt) : null;
                return itemDate && itemDate >= start;
            });
        }

        if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(item => {
                const itemDate = item.createdAt ? new Date(item.createdAt) : null;
                return itemDate && itemDate <= end;
            });
        }

        setFilteredHistory(filtered);
    };

    const getChangeTypeInfo = (changeType: InventoryChangeType) => {
        return InventoryAPI.getChangeTypeInfo(changeType);
    };

    const formatQuantityChange = (change: number) => {
        const sign = change > 0 ? '+' : '';
        return `${sign}${change}`;
    };

    const clearFilters = () => {
        setFilters({
            ...filters,
            search: '',
            changeType: undefined,
            startDate: undefined,
            endDate: undefined,
            startDateString: '',
            endDateString: ''
        });
    };

    const handleDateChange = (dateType: 'startDate' | 'endDate', value: string) => {
        if (value) {
            const date = new Date(value);
            setFilters(prev => ({
                ...prev,
                [dateType]: date,
                [`${dateType}String`]: value
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [dateType]: undefined,
                [`${dateType}String`]: ''
            }));
        }
    };

    // Format date for input field
    const formatDateForInput = (date?: Date): string => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search in notes or references..."
                                className="pl-9"
                                value={filters.search || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>

                        <Select
                            value={filters.changeType || ''}
                            onValueChange={(value) => setFilters(prev => ({
                                ...prev,
                                changeType: value ? value as InventoryChangeType : undefined
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Change Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Types</SelectItem>
                                {Object.values(InventoryChangeType).map(type => (
                                    <SelectItem key={type} value={type}>
                                        {getChangeTypeInfo(type).label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="space-y-1">
                            <label htmlFor="startDate" className="text-xs text-muted-foreground">
                                Start Date
                            </label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formatDateForInput(filters.startDate)}
                                onChange={(e) => handleDateChange('startDate', e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="endDate" className="text-xs text-muted-foreground">
                                End Date
                            </label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formatDateForInput(filters.endDate)}
                                onChange={(e) => handleDateChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            {filteredHistory.length} of {history.length} records
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                disabled={!filters.search && !filters.changeType && !filters.startDate && !filters.endDate}
                            >
                                Clear Filters
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadHistory}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* History List */}
            {filteredHistory.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No History Found</h3>
                        <p className="text-muted-foreground">
                            {history.length === 0
                                ? 'No inventory changes recorded yet.'
                                : 'No records match your current filters.'
                            }
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredHistory.map((record) => {
                        const changeTypeInfo = getChangeTypeInfo(record.changeType);

                        return (
                            <Card key={record.id} className="hover:bg-accent/50 transition-colors">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center space-x-3">
                                                <Badge
                                                    className={changeTypeInfo.color}
                                                    variant={changeTypeInfo.badgeVariant}
                                                >
                                                    {changeTypeInfo.icon} {changeTypeInfo.label}
                                                </Badge>

                                                <div className="flex items-center space-x-2 text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="text-sm">
                                                        {record.createdAt
                                                            ? format(new Date(record.createdAt), 'MMM d, yyyy h:mm a')
                                                            : 'Date not available'
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <div className="text-sm font-medium">Product</div>
                                                    <div className="font-semibold">
                                                        {record.inventory?.product?.name || 'Unknown Product'}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-sm font-medium">Store</div>
                                                    <div className="font-semibold">
                                                        {record.inventory?.store?.name || 'Unknown Store'}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="text-sm font-medium">Quantity Change</div>
                                                    <div className={`font-bold text-lg ${record.quantityChange > 0
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                        }`}>
                                                        {formatQuantityChange(record.quantityChange)} units
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {record.previousQuantity} → {record.newQuantity}
                                                    </div>
                                                </div>
                                            </div>

                                            {record.notes && (
                                                <div className="pt-2">
                                                    <div className="text-sm font-medium">Notes</div>
                                                    <p className="text-sm">{record.notes}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                    <User className="h-4 w-4" />
                                                    <span>
                                                        {record.user?.firstName} {record.user?.lastName}
                                                    </span>
                                                </div>

                                                {record.referenceId && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Ref: {record.referenceId}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Load More */}
            {filteredHistory.length > 0 && filteredHistory.length < history.length && (
                <div className="text-center">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setFilters(prev => ({
                                ...prev,
                                page: (prev.page || 1) + 1
                            }));
                        }}
                    >
                        Load More History
                    </Button>
                </div>
            )}
        </div>
    );
};

export default InventoryHistory;