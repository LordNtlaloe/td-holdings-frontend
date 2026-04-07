'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Store,
    MapPin,
    Phone,
    Mail,
    Users,
    Package,
    Search,
    Plus,
    Edit,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import StoreAPI from '@/lib/api/stores';
import { formatCurrency } from '@/lib/utils';
import type { Store as StoreType } from '@/types';

interface StoreOverviewProps {
    token: string;
    detailed?: boolean;
}

export function StoreOverview({ token, detailed = false }: StoreOverviewProps) {
    const [stores, setStores] = useState<StoreType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await StoreAPI.getStores(token, {
                    limit: detailed ? 100 : 10
                });
                setStores(response.data || []);
            } catch (error) {
                console.error('Failed to fetch stores:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, [token, detailed]);

    const filteredStores = stores.filter(store =>
        store.name?.toLowerCase().includes(search.toLowerCase()) ||
        store.city?.toLowerCase().includes(search.toLowerCase())    );

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Store Overview</CardTitle>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search stores..."
                            className="pl-8 w-62.5"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Store
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {filteredStores.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No stores found</p>
                    ) : (
                        filteredStores.map((store) => (
                            <div key={store.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Store className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{store.name}</h3>
                                                {store.isMainStore && (
                                                    <Badge variant="default">Main Store</Badge>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{store.address}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <span>{store.city} </span>
                                                </div>
                                                {store.phone && (
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{store.phone}</span>
                                                    </div>
                                                )}
                                                {store.email && (
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{store.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {detailed && (
                                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Staff</p>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-lg font-semibold">24</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Products</p>
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-lg font-semibold">156</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                                            <span className="text-lg font-semibold">{formatCurrency(45230)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {!detailed && stores.length > 10 && (
                    <div className="mt-4 text-center">
                        <Button variant="link" asChild>
                            <a href="/admin/stores">View all stores →</a>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}