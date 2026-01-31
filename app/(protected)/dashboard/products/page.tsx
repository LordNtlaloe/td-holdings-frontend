// app/(dashboard)/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Product,
    ProductFilters,
    ProductCategoryStats,
    ProductPriceStatistics,
    ApiResponse,
    Store,
    ProductType
} from "@/types";
import ProductAPI from "@/lib/api/products";
import StoreAPI from "@/lib/api/stores";
import { useAuth } from "@/contexts/auth-context";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    Grid3x3,
    Table as TableIcon,
    Plus,
    RefreshCw,
    Download,
    BarChart3,
    AlertTriangle,
    Package,
    ChartArea,
} from "lucide-react";
import { toast } from "sonner";
import { ProductStats } from "@/components/products/product-stats";
import { ProductFilter } from "@/components/products/product-filters";
import { LowStockAlert } from "@/components/products/product-low-stock-alert";
import { ProductCard } from "@/components/products/products-card";
import { ProductCharts } from "@/components/products/products-chart";
import { ProductForm } from "@/components/products/products-form";
import { ProductTable } from "@/components/products/products-table";
import { StoreInventory } from "@/components/products/inventory";

// Helper function to transform Product to form-compatible format
const transformProductToFormData = (product: Product) => {
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        type: product.type,
        grade: product.grade,
        commodity: product.commodity,
        // Transform tire-specific fields
        tireSpecific: product.tireSpecific ? {
            tireCategory: product.tireCategory,
            tireUsage: product.tireUsage,
            tireSize: product.tireSize,
            loadIndex: product.loadIndex,
            speedRating: product.speedRating,
            warrantyPeriod: product.warrantyPeriod
        } : undefined,
        // Transform bale-specific fields
        baleSpecific: product.baleSpecific ? {
            baleWeight: product.baleWeight,
            baleCategory: product.baleCategory,
            originCountry: product.originCountry,
            importDate: product.importDate
        } : undefined,
        // Transform inventories
        inventories: product.inventories?.map(inv => ({
            id: `${inv.productId}-${inv.storeId}`,
            storeId: inv.storeId,
            store: inv.store,
            quantity: inv.quantity,
            reorderLevel: inv.reorderLevel,
            optimalLevel: inv.optimalLevel,
            storePrice: inv.storePrice
        })),
        // Transform store assignments
        storeAssignments: product.inventories?.map(inv => ({
            storeId: inv.storeId,
            store: inv.store,
            reorderLevel: inv.reorderLevel,
            optimalLevel: inv.optimalLevel,
            storePrice: inv.storePrice,
            quantity: inv.quantity
        })),
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
    };
};

// Helper function to transform stores for form
const transformStoresForForm = (stores: Store[]) => {
    return stores.map(store => ({
        id: store.id,
        name: store.name,
        isMainStore: store.isMainStore || false
    }));
};

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { accessToken } = useAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [isCreating, setIsCreating] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [assigningProduct, setAssigningProduct] = useState<Product | null>(null);
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
    const [categoryStats, setCategoryStats] = useState<ProductCategoryStats[]>([]);
    const [priceRanges, setPriceRanges] = useState<any[]>([]);

    // Update the filters initialization
    const [filters, setFilters] = useState<ProductFilters>({
        search: "",
        page: 1,
        limit: 50,
        sortBy: "createdAt",
    });

    const transformPriceStatsToRanges = (priceStats: ProductPriceStatistics) => {
        // Example: Create price ranges based on min/max prices
        const minPrice = priceStats.minPrice;
        const maxPrice = priceStats.maxPrice;
        const rangeSize = Math.ceil((maxPrice - minPrice) / 5);

        const ranges = [];
        for (let i = 0; i < 5; i++) {
            const start = minPrice + (i * rangeSize);
            const end = minPrice + ((i + 1) * rangeSize);
            ranges.push({
                range: `LSL${start.toFixed(0)}-LSL${end.toFixed(0)}`,
                count: 0, // You'll need to calculate actual counts from products
            });
        }

        return ranges;
    };

    // Load stores
    const loadStores = async () => {
        if (!accessToken) return;

        try {
            const storesData = await StoreAPI.getStores(accessToken, { limit: 100 });
            if (Array.isArray(storesData)) {
                setStores(storesData);
            } else if (storesData?.data && Array.isArray(storesData.data)) {
                setStores(storesData.data);
            } else if (storesData?.stores && Array.isArray(storesData.stores)) {
                setStores(storesData.stores);
            }
        } catch (error) {
            console.error('Error loading stores:', error);
        }
    };

    const loadProducts = async () => {
        if (!accessToken) return;

        try {
            setLoading(true);
            console.log('🟦 Loading products with filters:', filters);

            // Load stores first
            await loadStores();

            // Load products
            const productsResponse = await ProductAPI.getProducts(accessToken, filters);
            console.log('🟦 Products response:', productsResponse);

            // Handle the response with proper type checking
            let productsArray: Product[] = [];
            let productsData: any;

            // Check if response is an ApiResponse type
            if (typeof productsResponse === 'object' && productsResponse !== null) {
                // Check for success property (ApiResponse format)
                if ('success' in productsResponse) {
                    const apiResponse = productsResponse as ApiResponse<any>;
                    if (apiResponse.success === false) {
                        throw new Error(apiResponse.error || 'Failed to load products');
                    }
                    productsData = apiResponse.data;
                } else {
                    productsData = productsResponse;
                }
            }

            // Extract products array from various possible structures
            if (Array.isArray(productsData)) {
                productsArray = productsData;
            } else if (productsData?.data && Array.isArray(productsData.data)) {
                // PaginatedResponse format
                productsArray = productsData.data;
            } else if (productsData?.products && Array.isArray(productsData.products)) {
                // Old format with products property
                productsArray = productsData.products;
            }

            console.log('🟦 Extracted products array:', productsArray.length, 'products');

            // Load other data in parallel
            const [lowStockResponse, statsResponse, priceStats] = await Promise.all([
                ProductAPI.getLowStockProducts(accessToken, 10).catch(() => ({ success: false, data: [] })),
                ProductAPI.getProductStatistics(accessToken, "type").catch(() => []),
                ProductAPI.getPriceStatistics(accessToken).catch(() => ({
                    minPrice: 0,
                    maxPrice: 1000,
                    averagePrice: 500,
                    priceByType: {},
                    priceByGrade: {}
                }))
            ]);

            setProducts(productsArray);

            // Handle the low stock products response
            let lowStockArray: any[] = [];
            if (Array.isArray(lowStockResponse)) {
                lowStockArray = lowStockResponse;
            } else if (lowStockResponse && typeof lowStockResponse === 'object') {
                // Check for ApiResponse format
                if ('success' in lowStockResponse && lowStockResponse.success) {
                    if (Array.isArray(lowStockResponse.data)) {
                        lowStockArray = lowStockResponse.data;
                    } else if (Array.isArray(lowStockResponse.data)) {
                        lowStockArray = lowStockResponse.data;
                    }
                } else if (Array.isArray(lowStockResponse.data)) {
                    lowStockArray = lowStockResponse.data;
                } else if (Array.isArray(lowStockResponse.data)) {
                    lowStockArray = lowStockResponse.data;
                }
            }
            setLowStockProducts(lowStockArray);

            // Handle the category stats response - extract data if it's in ApiResponse format
            let categoryStatsArray: ProductCategoryStats[] = [];
            if (Array.isArray(statsResponse)) {
                categoryStatsArray = statsResponse;
            } else if (statsResponse && typeof statsResponse === 'object' && 'success' in statsResponse && statsResponse.success && Array.isArray(statsResponse.data)) {
                // ApiResponse format with success boolean
                categoryStatsArray = statsResponse.data;
            }
            setCategoryStats(categoryStatsArray);

            // Transform price statistics
            const priceRanges = transformPriceStatsToRanges(priceStats);
            setPriceRanges(priceRanges);

        } catch (error: any) {
            console.error('🔴 Error loading products:', error);
            toast.error("Error", {
                description: error.message || "Failed to load products",
            });
            setProducts([]); // Ensure products is set to empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            loadProducts();
        }
    }, [accessToken, filters]);

    const handleCreateProduct = async (data: any) => {
        if (!accessToken) return;

        try {
            console.log('🟦 ========================================');
            console.log('🟦 handleCreateProduct STARTED');
            console.log('🟦 Raw form data:', JSON.stringify(data, null, 2));
            console.log('🟦 baleWeight from form:', data.baleWeight);

            // Transform the data to match the API expectations - USE FLAT FIELDS
            const apiData: any = {
                name: data.name,
                description: data.description,
                basePrice: data.basePrice,
                type: data.type,
                grade: data.grade,
                commodity: data.commodity || undefined,
                // CRITICAL: Pass these directly
                warehouseQuantity: data.warehouseQuantity || 0,
                warehouseReorderLevel: data.warehouseReorderLevel,
                warehouseOptimalLevel: data.warehouseOptimalLevel,
            };

            // Add tire-specific fields if product is a tire - USE FLAT FIELDS
            if (data.type === ProductType.TIRE) {
                console.log('🟦 Adding TIRE fields to API data');
                console.log('🟦 tireCategory from form:', data.tireCategory);
                console.log('🟦 tireUsage from form:', data.tireUsage);

                apiData.tireCategory = data.tireCategory;
                apiData.tireUsage = data.tireUsage;
                apiData.tireSize = data.tireSize || undefined;
                apiData.loadIndex = data.loadIndex || undefined;
                apiData.speedRating = data.speedRating || undefined;
                apiData.warrantyPeriod = data.warrantyPeriod || undefined;
            }

            // Add bale-specific fields if product is a bale - USE FLAT FIELDS
            if (data.type === ProductType.BALE) {
                console.log('🟦 Adding BALE fields to API data');
                console.log('🟦 baleWeight from form:', data.baleWeight);
                console.log('🟦 baleCategory from form:', data.baleCategory);

                // CRITICAL FIX: Use data.baleWeight, not data.baleSpecific.baleWeight
                apiData.baleWeight = data.baleWeight;
                apiData.baleCategory = data.baleCategory || undefined;
                apiData.originCountry = data.originCountry || undefined;
                apiData.importDate = data.importDate || undefined;
            }

            // Add store assignments (filtered to only assigned stores)
            if (data.storeAssignments && data.storeAssignments.length > 0) {
                const assignedStores = data.storeAssignments
                    .filter((assignment: any) => assignment.isAssigned)
                    .map((assignment: any) => ({
                        storeId: assignment.storeId,
                        quantity: assignment.existingQuantity || 0,
                        reorderLevel: assignment.reorderLevel,
                        optimalLevel: assignment.optimalLevel,
                        storePrice: assignment.storePrice,
                    }));

                console.log('🟦 Assigned stores:', assignedStores);
                apiData.storeAssignments = assignedStores;
            }

            console.log('🟦 Final API data:', JSON.stringify(apiData, null, 2));
            console.log('🟦 baleWeight in final API data:', apiData.baleWeight);

            // Call the API
            await ProductAPI.createProduct(accessToken, apiData); // REMOVED assignment to result

            toast.success("Success", {
                description: "Product created successfully",
            });

            setIsCreating(false);
            loadProducts();
            // REMOVED: return result;

        } catch (error: any) {
            console.error('🔴 Error in handleCreateProduct:', error);
            throw error;
        }
    };

    const handleUpdateProduct = async (data: any) => {
        if (!accessToken || !editingProduct) return;

        try {
            console.log('🟦 handleUpdateProduct STARTED');
            console.log('🟦 Raw form data:', JSON.stringify(data, null, 2));

            // Transform the data for update - USE FLAT FIELDS
            const apiData: any = {
                name: data.name,
                description: data.description,
                basePrice: data.basePrice,
                grade: data.grade,
                commodity: data.commodity || undefined,
                // Inventory fields
                warehouseReorderLevel: data.warehouseReorderLevel,
                warehouseOptimalLevel: data.warehouseOptimalLevel,
                isActive: data.isActive,
            };

            // Add tire-specific fields if product is a tire - USE FLAT FIELDS
            if (data.type === ProductType.TIRE) {
                console.log('🟦 Adding TIRE fields to update');
                apiData.tireCategory = data.tireCategory;
                apiData.tireUsage = data.tireUsage;
                apiData.tireSize = data.tireSize || undefined;
                apiData.loadIndex = data.loadIndex || undefined;
                apiData.speedRating = data.speedRating || undefined;
                apiData.warrantyPeriod = data.warrantyPeriod || undefined;
            }

            // Add bale-specific fields if product is a bale - USE FLAT FIELDS
            if (data.type === ProductType.BALE) {
                console.log('🟦 Adding BALE fields to update');
                console.log('🟦 baleWeight for update:', data.baleWeight);

                apiData.baleWeight = data.baleWeight;
                apiData.baleCategory = data.baleCategory || undefined;
                apiData.originCountry = data.originCountry || undefined;
                apiData.importDate = data.importDate || undefined;
            }

            // Add store assignments (filtered to only assigned stores)
            if (data.storeAssignments && data.storeAssignments.length > 0) {
                apiData.storeAssignments = data.storeAssignments
                    .filter((assignment: any) => assignment.isAssigned)
                    .map((assignment: any) => ({
                        storeId: assignment.storeId,
                        reorderLevel: assignment.reorderLevel,
                        optimalLevel: assignment.optimalLevel,
                        storePrice: assignment.storePrice,
                    }));
            }

            console.log('🟦 Update API data:', JSON.stringify(apiData, null, 2));
            console.log('🟦 baleWeight in update API data:', apiData.baleWeight);

            await ProductAPI.updateProduct(accessToken, editingProduct.id, apiData); // NO assignment

            toast.success("Success", {
                description: "Product updated successfully",
            });

            setEditingProduct(null);
            loadProducts();
            // NO return statement

        } catch (error: any) {
            console.error('🔴 Error in handleUpdateProduct:', error);
            throw error;
        }
    };

    const handleDeleteProduct = async (product: Product) => {
        if (!accessToken) return;

        try {
            await ProductAPI.deleteProduct(accessToken, product.id);
            toast.success("Success", {
                description: "Product deleted successfully",
            });
            loadProducts();
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to delete product",
            });
        }
    };

    const handleArchiveProduct = async (product: Product) => {
        if (!accessToken) return;

        try {
            // Archive by setting isActive to false
            await ProductAPI.updateProduct(accessToken, product.id, {
                isActive: false
            });
            toast.success("Success", {
                description: "Product archived successfully",
            });
            loadProducts();
        } catch (error: any) {
            toast.error("Error", {
                description: "Failed to archive product",
            });
        }
    };

    const handleViewProduct = (product: Product) => {
        router.push(`/products/${product.id}`);
    };

    const handleExportProducts = async () => {
        if (!accessToken) return;

        try {
            // Implementation for export
            toast.success("Export started", {
                description: "Your export will download shortly",
            });
        } catch (error: any) {
            toast.error("Error", {
                description: "Failed to export products",
            });
        }
    };

    const handleFilterChange = (newFilters: ProductFilters) => {
        setFilters({ ...newFilters, page: 1 });
    };

    const handleResetFilters = () => {
        setFilters({
            search: "",
            page: 1,
            limit: 50,
            sortBy: "createdAt",
        });
    };

    const stats = {
        totalProducts: products.length,
        totalValue: products.reduce((sum, product) => sum + product.basePrice, 0),
        averagePrice: products.length > 0
            ? products.reduce((sum, product) => sum + product.basePrice, 0) / products.length
            : 0,
        lowStockCount: lowStockProducts.length,
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">
                        Manage your product catalog across all stores
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={loadProducts}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExportProducts}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Dialog open={isCreating} onOpenChange={setIsCreating}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Product</DialogTitle>
                                <DialogDescription>
                                    Add a new product to your catalog
                                </DialogDescription>
                            </DialogHeader>
                            <ProductForm
                                mode="create"
                                stores={transformStoresForForm(stores)}
                                onSubmit={handleCreateProduct}
                                onCancel={() => setIsCreating(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <ProductStats categoryStats={[]} priceStats={null} {...stats} />

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="products">
                        <TableIcon className="h-4 w-4 mr-2" />
                        Products
                    </TabsTrigger>
                    <TabsTrigger value="alerts">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Alerts
                    </TabsTrigger>
                    <TabsTrigger value="inventory">
                        <ChartArea className="h-4 w-4 mr-2" />
                        Inventory
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <LowStockAlert products={lowStockProducts} />

                    <ProductCharts
                        categoryStats={categoryStats}
                        priceRanges={priceRanges}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Products</CardTitle>
                            <CardDescription>
                                Recently added or updated products
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProductTable
                                products={products.slice(0, 5)}
                                onView={handleViewProduct}
                                onEdit={setEditingProduct}
                                onDelete={handleDeleteProduct}
                                showActions={false}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle>Product Catalog</CardTitle>
                                    <CardDescription>
                                        {products.length} products found
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ProductFilter
                                        filters={filters}
                                        onFilterChange={handleFilterChange}
                                        onReset={handleResetFilters}
                                    />
                                    <div className="flex border rounded-md">
                                        <Button
                                            variant={viewMode === "grid" ? "default" : "ghost"}
                                            size="sm"
                                            className="rounded-r-none"
                                            onClick={() => setViewMode("grid")}
                                        >
                                            <Grid3x3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === "table" ? "default" : "ghost"}
                                            size="sm"
                                            className="rounded-l-none"
                                            onClick={() => setViewMode("table")}
                                        >
                                            <TableIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {products.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                                    <p className="text-muted-foreground mt-2">
                                        {filters.name || filters.type || filters.grade
                                            ? "Try adjusting your filters"
                                            : "Get started by adding your first product"}
                                    </p>
                                </div>
                            ) : viewMode === "table" ? (
                                <ProductTable
                                    products={products}
                                    onView={handleViewProduct}
                                    onEdit={setEditingProduct}
                                    onDelete={handleDeleteProduct}
                                    onArchive={handleArchiveProduct}
                                />
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onView={handleViewProduct}
                                            onEdit={setEditingProduct}
                                            onDelete={handleDeleteProduct}
                                            onArchive={handleArchiveProduct}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="alerts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Low Stock Alerts</CardTitle>
                            <CardDescription>
                                Products that need restocking
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lowStockProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
                                    <p className="mt-4 text-muted-foreground">
                                        No low stock alerts at this time
                                    </p>
                                </div>
                            ) : (
                                <ProductTable
                                    products={lowStockProducts.map((p) => p.product)}
                                    onView={handleViewProduct}
                                    onEdit={setEditingProduct}
                                    showActions={false}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory">
                    <Card>
                        <CardHeader>
                            <CardTitle>Store Inventory</CardTitle>
                            <CardDescription>
                                View inventory distribution across stores
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {accessToken && stores.length > 0 ? (
                                <div className="space-y-6">
                                    {/* Store Selector */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {stores.map((store) => (
                                            <div key={store.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-medium">{store.name}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {store.isMainStore ? 'Main Store/Warehouse' : 'Branch Store'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            // You might want to show a modal with detailed inventory
                                                            // Or use a state to show inventory for selected store
                                                            toast.info("Store Inventory", {
                                                                description: `Viewing inventory for ${store.name}`,
                                                            });
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Inventory Table with Store Details */}
                                    <ProductTable
                                        products={products}
                                        stores={stores}
                                        onView={handleViewProduct}
                                        onEdit={setEditingProduct}
                                        onDelete={handleDeleteProduct}
                                        onArchive={handleArchiveProduct}
                                        showStoreDetails={true}
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                                    <p className="mt-4 text-muted-foreground">
                                        No stores found or not authenticated
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>
                            Update product information
                        </DialogDescription>
                    </DialogHeader>
                    {editingProduct && (
                        <ProductForm
                            mode="edit"
                            product={transformProductToFormData(editingProduct)}
                            stores={transformStoresForForm(stores)}
                            onSubmit={handleUpdateProduct}
                            onCancel={() => setEditingProduct(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}