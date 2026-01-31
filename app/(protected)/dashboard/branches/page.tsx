'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, PaginatedStoresResponse } from '@/types';
import StoreAPI from '@/lib/api/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Building,
    Plus,
    Search,
    Grid,
    List,
    Filter,
    RefreshCw,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { StoreCard } from '@/components/stores/store-cards';
import { StoreForm } from '@/components/stores/store-form';
import { StoreStats } from '@/components/stores/store-stats';
import { StoreTable } from '@/components/stores/store-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function StoresPage() {
    const router = useRouter();
    const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();

    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [isCreating, setIsCreating] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        isMainStore: undefined as boolean | undefined,
    });

    // Stats
    const [stats, setStats] = useState({
        totalStores: 0,
        mainStore: '',
        totalEmployees: 0,
        totalProducts: 0,
        totalSales: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
    });

    const loadStores = async () => {
        // Don't attempt to load if not authenticated or no token
        if (!isAuthenticated || !accessToken) {
            console.log('⚠️ Cannot load stores: not authenticated or no token');
            return;
        }

        try {
            setLoading(true);
            console.log('🔵 Loading stores with token:', accessToken.substring(0, 20) + '...');

            const response: PaginatedStoresResponse = await StoreAPI.getStores(accessToken, {
                ...filters,
                page: 1,
                limit: 50,
            });

            console.log('✅ Stores loaded:', response);

            // Use response.data instead of response.stores
            const storesArray = response.data || [];
            setStores(storesArray);

            // Calculate stats
            const totalEmployees = storesArray.reduce((sum, store) =>
                sum + (store._count?.employees || 0), 0
            );
            const totalProducts = storesArray.reduce((sum, store) =>
                sum + (store._count?.inventories || 0), 0
            );
            const totalSales = storesArray.reduce((sum, store) =>
                sum + (store._count?.sales || 0), 0
            );
            const mainStore = storesArray.find(store => store.isMainStore)?.name || '';

            setStats({
                totalStores: response.total,
                mainStore,
                totalEmployees,
                totalProducts,
                totalSales,
                lowStockItems: 0,
                outOfStockItems: 0,
            });
            
            // Success toast for loading stores
            toast.success('Stores Loaded', {
                description: `Successfully loaded ${storesArray.length} stores`,
                icon: <CheckCircle className="h-4 w-4" />,
            });
        } catch (error: any) {
            console.error('❌ Error loading stores:', error);
            toast.error('Failed to Load Stores', {
                description: error.message || 'Unable to fetch stores from the server',
                icon: <AlertCircle className="h-4 w-4" />,
            });
        } finally {
            setLoading(false);
        }
    };

    // Load stores when authenticated and token is available
    useEffect(() => {
        if (!authLoading && isAuthenticated && accessToken) {
            loadStores();
        } else if (!authLoading && !isAuthenticated) {
            setLoading(false);
        }
    }, [authLoading, isAuthenticated, accessToken, filters]);

    const handleCreateStore = async (data: any) => {
        if (!accessToken) {
            toast.error('Authentication Required', {
                description: 'Please log in to create a store',
                icon: <AlertCircle className="h-4 w-4" />,
            });
            return;
        }

        try {
            // Show loading toast
            const loadingToast = toast.loading('Creating store...');
            
            await StoreAPI.createStore(accessToken, data);
            
            // Dismiss loading toast and show success
            toast.dismiss(loadingToast);
            toast.success('Store Created', {
                description: `${data.name} has been successfully created`,
                icon: <CheckCircle className="h-4 w-4" />,
            });
            
            setIsCreating(false);
            loadStores();
        } catch (error: any) {
            let errorMessage = 'Failed to create store';
            
            // Handle specific error messages
            if (error.message.includes('STORE_EXISTS')) {
                errorMessage = 'A store with this email already exists';
            } else if (error.message.includes('MAIN_STORE_EXISTS')) {
                errorMessage = 'A main store already exists';
            } else if (error.message.includes('400')) {
                errorMessage = 'Invalid store data provided';
            } else if (error.message.includes('401')) {
                errorMessage = 'Unauthorized - Please check your permissions';
            } else if (error.message.includes('403')) {
                errorMessage = 'You do not have permission to create stores';
            }
            
            toast.error('Creation Failed', {
                description: errorMessage,
                icon: <AlertCircle className="h-4 w-4" />,
            });
            throw error;
        }
    };

    const handleUpdateStore = async (data: any) => {
        if (!accessToken || !editingStore) {
            toast.error('Update Failed', {
                description: 'Missing required information',
                icon: <AlertCircle className="h-4 w-4" />,
            });
            return;
        }

        try {
            // Show loading toast
            const loadingToast = toast.loading('Updating store...');
            
            await StoreAPI.updateStore(accessToken, editingStore.id, data);
            
            // Dismiss loading toast and show success
            toast.dismiss(loadingToast);
            toast.success('Store Updated', {
                description: `${data.name || editingStore.name} has been successfully updated`,
                icon: <CheckCircle className="h-4 w-4" />,
            });
            
            setEditingStore(null);
            loadStores();
        } catch (error: any) {
            let errorMessage = 'Failed to update store';
            
            // Handle specific error messages
            if (error.message.includes('STORE_EXISTS')) {
                errorMessage = 'A store with this email already exists';
            } else if (error.message.includes('MAIN_STORE_EXISTS')) {
                errorMessage = 'A main store already exists';
            } else if (error.message.includes('400')) {
                errorMessage = 'Invalid store data provided';
            } else if (error.message.includes('401')) {
                errorMessage = 'Unauthorized - Please check your permissions';
            } else if (error.message.includes('403')) {
                errorMessage = 'You do not have permission to update stores';
            } else if (error.message.includes('404')) {
                errorMessage = 'Store not found';
            }
            
            toast.error('Update Failed', {
                description: errorMessage,
                icon: <AlertCircle className="h-4 w-4" />,
            });
            throw error;
        }
    };

    const handleSetMainStore = async (storeId: string) => {
        if (!accessToken) {
            toast.error('Authentication Required', {
                description: 'Please log in to set main store',
                icon: <AlertCircle className="h-4 w-4" />,
            });
            return;
        }

        const storeToUpdate = stores.find(store => store.id === storeId);
        if (!storeToUpdate) {
            toast.error('Store Not Found', {
                description: 'The selected store could not be found',
                icon: <AlertCircle className="h-4 w-4" />,
            });
            return;
        }

        try {
            // Show loading toast
            const loadingToast = toast.loading('Setting main store...');
            
            await StoreAPI.setMainStore(accessToken, storeId);
            
            // Dismiss loading toast and show success
            toast.dismiss(loadingToast);
            toast.success('Main Store Updated', {
                description: `${storeToUpdate.name} is now the main store`,
                icon: <CheckCircle className="h-4 w-4" />,
            });
            
            loadStores();
        } catch (error: any) {
            let errorMessage = 'Failed to set main store';
            
            // Handle specific error messages
            if (error.message.includes('400')) {
                errorMessage = 'Invalid request';
            } else if (error.message.includes('401')) {
                errorMessage = 'Unauthorized - Please check your permissions';
            } else if (error.message.includes('403')) {
                errorMessage = 'You do not have permission to set main store';
            } else if (error.message.includes('404')) {
                errorMessage = 'Store not found';
            }
            
            toast.error('Action Failed', {
                description: errorMessage,
                icon: <AlertCircle className="h-4 w-4" />,
            });
        }
    };

    const handleViewStore = (storeId: string) => {
        router.push(`/branches/${storeId}`);
    };

    // Show loading state while auth is initializing
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Initializing...</p>
                </div>
            </div>
        );
    }

    // Show not authenticated message
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-muted-foreground">Not authenticated. Please log in.</p>
                </div>
            </div>
        );
    }

    if (loading && stores.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Loading stores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
                    <p className="text-muted-foreground">
                        Manage your stores and view performance metrics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={loadStores}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Dialog open={isCreating} onOpenChange={setIsCreating}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Store
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[95vw] lg:max-w-300 max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Store</DialogTitle>
                                <DialogDescription>
                                    Add a new store to your retail network
                                </DialogDescription>
                            </DialogHeader>
                            <StoreForm
                                onSubmit={handleCreateStore}
                                onCancel={() => setIsCreating(false)}
                                mode="create"
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <StoreStats stats={stats} />

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Store Management</CardTitle>
                            <CardDescription>
                                View and manage all your stores
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search stores..."
                                    className="pl-8 w-50 lg:w-75"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                            <Select
                                value={filters.isMainStore?.toString() || 'all'}
                                onValueChange={(value) =>
                                    setFilters({
                                        ...filters,
                                        isMainStore: value === 'all' ? undefined : value === 'true'
                                    })
                                }
                            >
                                <SelectTrigger className="w-32.5">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Stores</SelectItem>
                                    <SelectItem value="true">Main Store</SelectItem>
                                    <SelectItem value="false">Branch Stores</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex border rounded-md">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="rounded-r-none"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="rounded-l-none"
                                    onClick={() => setViewMode('table')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {stores.length === 0 ? (
                        <div className="text-center py-12">
                            <Building className="h-12 w-12 mx-auto text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No stores found</h3>
                            <p className="text-muted-foreground mt-2">
                                {filters.search || filters.isMainStore !== undefined
                                    ? 'Try adjusting your filters'
                                    : 'Get started by creating your first store'}
                            </p>
                            {!filters.search && filters.isMainStore === undefined && (
                                <Button className="mt-4" onClick={() => setIsCreating(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Store
                                </Button>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {stores.map((store) => (
                                <StoreCard
                                    key={store.id}
                                    store={store}
                                    onSetMain={handleSetMainStore}
                                    onEdit={setEditingStore}
                                    showActions={user?.role === 'ADMIN'}
                                />
                            ))}
                        </div>
                    ) : (
                        <StoreTable
                            stores={stores}
                            onSetMain={handleSetMainStore}
                            onEdit={setEditingStore}
                            onView={handleViewStore}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editingStore} onOpenChange={(open) => !open && setEditingStore(null)}>
                <DialogContent className="sm:max-w-[95vw] lg:max-w-300 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Store</DialogTitle>
                        <DialogDescription>
                            Update store information
                        </DialogDescription>
                    </DialogHeader>
                    {editingStore && (
                        <StoreForm
                            store={editingStore}
                            onSubmit={handleUpdateStore}
                            onCancel={() => setEditingStore(null)}
                            mode="edit"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}