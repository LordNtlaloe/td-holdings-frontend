// app/dashboard/stores/[id]/inventory/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Search, Filter, TrendingUp, History } from 'lucide-react';
import InventoryAPI from '@/lib/api/inventory';
import { useAuth } from '@/contexts/auth-context';
import InventoryTable from '@/components/inventory/inventory-table';
import InventoryAdjustmentModal from '@/components/inventory/inventory-adjustment-modal';
// import InventoryHistory from '@/components/inventory/inventory-history';
import { Inventory , InventoryFilters, ProductGrade, ProductType } from '@/types';
import StoreAPI from '@/lib/api/stores';

const StoreInventoryPage = () => {
  const params = useParams();
  const storeId = params.id as string;
  const { user, accessToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [summary, setSummary] = useState<any>(null);
  
  const [filters, setFilters] = useState<InventoryFilters>({
    productId: '',
    productName: '',
    storeId: '',
    storeName: '',
    type: ProductType.BALE,
    grade: ProductGrade.B,
    lowStock: false,
    outOfStock: false,
    hasReorderLevel: false,
    minQuantity: 0,
    maxQuantity: 0,
    minPrice: 0,
    maxPrice: 0,
    page: 0,
    limit: 0,
  });


  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken && storeId) {
      loadStoreData();
    }
  }, [accessToken, storeId, filters]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load store inventory
      const inventoryData = await InventoryAPI.getStoreInventory(accessToken!, storeId, filters);
      setInventory(inventoryData.inventory);
      
      // Load inventory summary
      const summaryData = await StoreAPI.getStoreInventorySummary(accessToken!, storeId);
      setSummary(summaryData);
      
      // TODO: Load store details
      // const storeData = await StoreAPI.getStore(token!, storeId);
      // setStore(storeData);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load store data');
      console.error('Error loading store data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustClick = (item: Inventory) => {
    setSelectedInventory(item);
    setShowAdjustModal(true);
  };

  const handleAdjustSuccess = () => {
    loadStoreData();
    setShowAdjustModal(false);
    setSelectedInventory(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Inventory</h1>
          <p className="text-muted-foreground">
            Manage inventory for {store?.name || 'this store'}
          </p>
        </div>
        <Button onClick={() => setShowAdjustModal(true)}>
          <Package className="mr-2 h-4 w-4" />
          Adjust Inventory
        </Button>
      </div>

      {/* Store Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{summary.totalProducts}</div>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{summary.totalQuantity}</div>
                <p className="text-sm text-muted-foreground">Total Units</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {InventoryAPI.formatCurrency(summary.totalValue)}
                </div>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{summary.lowStockItems}</div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Monitor and adjust stock levels for all products in this store
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 w-[250px]"
                  value={filters.productName}
                  onChange={(e) => setFilters(prev => ({ ...prev, productName: e.target.value }))}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inventory" className="space-y-4">
            <TabsList>
              <TabsTrigger value="inventory">Inventory List</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              <InventoryTable
                inventory={inventory}
                onAdjust={handleAdjustClick}
                pagination={{
                  page: 1,
                  limit: 50,
                  total: inventory.length,
                  totalPages: 1
                }}
                onPageChange={() => {}}
              />
            </TabsContent>

            <TabsContent value="history">
              {/* <InventoryHistory storeId={storeId} /> */}
            </TabsContent>

            <TabsContent value="reports">
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Generate inventory reports for this store, including:
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">Stock Level Report</Button>
                  <Button variant="outline">Value Report</Button>
                  <Button variant="outline">Reorder Report</Button>
                  <Button variant="outline">Turnover Report</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Adjustment Modal */}
      {showAdjustModal && (
        <InventoryAdjustmentModal
          inventory={selectedInventory}
          onClose={() => {
            setShowAdjustModal(false);
            setSelectedInventory(null);
          }}
          onSuccess={handleAdjustSuccess}
        />
      )}
    </div>
  );
};

export default StoreInventoryPage;