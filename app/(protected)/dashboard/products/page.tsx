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
    Role,
    LowStockProduct
} from "@/types";
import ProductAPI from "@/lib/api/products";
import StoreAPI from "@/lib/api/stores";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

// Components
import { ProductsPageHeader } from "@/components/products/page-header";
import { ProductsTab } from "@/components/products/products-tab";
import { AlertsTab } from "@/components/products/alerts-tab";
import { InventoryTab } from "@/components/products/inventory-tab";
import { ProductsLoadingState } from "@/components/products/loading-state";
import { CreateProductDialog } from "@/components/products/create-products-dialog";
import { EditProductDialog } from "@/components/products/exit-products-dialog";
import { OverviewTab } from "@/components/products/overview-tabs";
import { ProductsTabs } from "@/components/products/tab-navigation";
import { transformPriceStatsToRanges } from "@/utils/product-transformers";

// Utils

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { accessToken, user } = useAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
    const [categoryStats, setCategoryStats] = useState<ProductCategoryStats[]>([]);
    const [priceStats, setPriceStats] = useState<ProductPriceStatistics>({
        minPrice: 0,
        maxPrice: 1000,
        averagePrice: 500,
        priceByType: {},
        priceByGrade: {}
    });
    const [activeTab, setActiveTab] = useState<string>("overview");
    const [filters, setFilters] = useState<ProductFilters>({
        search: "",
        page: 1,
        limit: 50,
        sortBy: "createdAt",
    });

    const isAdminOrManager = user?.role === Role.ADMIN || user?.role === Role.MANAGER;
    const isCashier = user?.role === Role.CASHIER;

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

    // Load products and stats
    const loadProducts = async () => {
        if (!accessToken) return;

        try {
            setLoading(true);
            await loadStores();

            const productsResponse = await ProductAPI.getProducts(accessToken, filters);
            
            // Extract products array
            let productsArray: Product[] = [];
            let productsData: any = productsResponse;

            if (productsResponse && typeof productsResponse === 'object') {
                if ('success' in productsResponse) {
                    const apiResponse = productsResponse as ApiResponse<any>;
                    if (apiResponse.success === false) {
                        throw new Error(apiResponse.error || 'Failed to load products');
                    }
                    productsData = apiResponse.data;
                }
            }

            if (Array.isArray(productsData)) {
                productsArray = productsData;
            } else if (productsData?.data && Array.isArray(productsData.data)) {
                productsArray = productsData.data;
            } else if (productsData?.products && Array.isArray(productsData.products)) {
                productsArray = productsData.products;
            }

            setProducts(productsArray);

            // Load stats in parallel
            const results = await Promise.allSettled([
                ProductAPI.getLowStockProducts(accessToken, 10),
                ProductAPI.getProductStatistics(accessToken, "type"),
                ProductAPI.getPriceStatistics(accessToken)
            ]);

            if (results[0].status === 'fulfilled') {
                setLowStockProducts(results[0].value || []);
            }

            if (results[1].status === 'fulfilled') {
                const statsResult = results[1].value;
                if (statsResult?.success && Array.isArray(statsResult.data)) {
                    setCategoryStats(statsResult.data);
                }
            }

            if (results[2].status === 'fulfilled') {
                setPriceStats(results[2].value as ProductPriceStatistics);
            }

        } catch (error: any) {
            console.error('Error loading products:', error);
            toast.error("Error", {
                description: error.message || "Failed to load products",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            loadProducts();
        }
    }, [accessToken, filters]);

    const handleTabChange = (value: string) => {
        if (value === "inventory" && !isAdminOrManager) {
            toast.error("Access Denied", {
                description: "You don't have permission to view inventory management",
            });
            setActiveTab("overview");
            return;
        }
        setActiveTab(value);
    };

    const handleCreateProduct = async (data: any) => {
        if (!accessToken) return;
        try {
            await ProductAPI.createProduct(accessToken, data);
            toast.success("Success", { description: "Product created successfully" });
            setIsCreating(false);
            loadProducts();
        } catch (error: any) {
            console.error('Error creating product:', error);
            throw error;
        }
    };

    const handleUpdateProduct = async (data: any) => {
        if (!accessToken || !editingProduct) return;
        try {
            await ProductAPI.updateProduct(accessToken, editingProduct.id, data);
            toast.success("Success", { description: "Product updated successfully" });
            setEditingProduct(null);
            loadProducts();
        } catch (error: any) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const handleDeleteProduct = async (product: Product) => {
        if (!accessToken) return;
        try {
            await ProductAPI.deleteProduct(accessToken, product.id);
            toast.success("Success", { description: "Product deleted successfully" });
            loadProducts();
        } catch (error: any) {
            toast.error("Error", { description: error.message || "Failed to delete product" });
        }
    };

    const handleArchiveProduct = async (product: Product) => {
        if (!accessToken) return;
        try {
            await ProductAPI.updateProduct(accessToken, product.id, {
                isActive: false,
                id: ""
            });
            toast.success("Success", { description: "Product archived successfully" });
            loadProducts();
        } catch (error: any) {
            toast.error("Error", { description: "Failed to archive product" });
        }
    };

    const handleViewProduct = (product: Product) => {
        router.push(`/products/${product.id}`);
    };

    const handleExportProducts = () => {
        toast.success("Export started", {
            description: "Your export will download shortly",
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

    const priceRanges = transformPriceStatsToRanges(priceStats);

    if (loading && products.length === 0) {
        return <ProductsLoadingState />;
    }

    return (
        <div className="space-y-6">
            <ProductsPageHeader
                isAdminOrManager={isAdminOrManager}
                isCashier={isCashier}
                onRefresh={loadProducts}
                onExport={handleExportProducts}
                onAddProduct={() => setIsCreating(true)}
                loading={loading}
            />

            <ProductsTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isAdminOrManager={isAdminOrManager}
            />

            {activeTab === "overview" && (
                <OverviewTab
                    stats={stats}
                    categoryStats={categoryStats}
                    priceRanges={priceRanges}
                    lowStockProducts={lowStockProducts}
                    recentProducts={products.slice(0, 5)}
                    onViewProduct={handleViewProduct}
                    onEditProduct={setEditingProduct}
                    onDeleteProduct={handleDeleteProduct}
                    isAdminOrManager={isAdminOrManager}
                />
            )}

            {activeTab === "products" && (
                <ProductsTab
                    products={products}
                    filters={filters}
                    onFilterChange={setFilters}
                    onResetFilters={() => setFilters({ search: "", page: 1, limit: 50, sortBy: "createdAt" })}
                    onViewProduct={handleViewProduct}
                    onEditProduct={setEditingProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onArchiveProduct={handleArchiveProduct}
                    isAdminOrManager={isAdminOrManager}
                />
            )}

            {activeTab === "alerts" && (
                <AlertsTab
                    lowStockProducts={lowStockProducts}
                    onViewProduct={handleViewProduct}
                    onEditProduct={setEditingProduct}
                    isCashier={isCashier}
                />
            )}

            {activeTab === "inventory" && isAdminOrManager && (
                <InventoryTab
                    products={products}
                    stores={stores}
                    accessToken={accessToken}
                    onViewProduct={handleViewProduct}
                    onEditProduct={setEditingProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onArchiveProduct={handleArchiveProduct}
                />
            )}

            <CreateProductDialog
                isOpen={isCreating}
                onOpenChange={setIsCreating}
                stores={stores}
                onSubmit={handleCreateProduct}
            />

            <EditProductDialog
                product={editingProduct}
                stores={stores}
                isOpen={!!editingProduct}
                onOpenChange={(open) => !open && setEditingProduct(null)}
                onSubmit={handleUpdateProduct}
            />
        </div>
    );
}