// app/(dashboard)/products/[id]/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product, Store } from "@/types";
import ProductAPI from "@/lib/api/products";
import StoreAPI from "@/lib/api/stores";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Edit,
    Store as StoreIcon,
    Package,
    DollarSign,
    BarChart3,
    History,
    Warehouse,
    AlertTriangle,
    Share2,
    Download,
} from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ProductForm } from "@/components/products/products-form";

function ProductDetailContent() {
    const params = useParams();
    const router = useRouter();
    const { accessToken } = useAuth();

    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const loadProductData = async () => {
        if (!accessToken) return;

        try {
            setLoading(true);
            const [productData, storesData] = await Promise.all([
                ProductAPI.getProduct(accessToken, productId),
                StoreAPI.getStores(accessToken),
            ]);

            setProduct(productData);
            setStores(storesData.stores || []);
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to load product data",
            });
            router.push("/products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            loadProductData();
        }
    }, [productId, accessToken]);

    const handleUpdateProduct = async (data: any) => {
        if (!accessToken || !product) return;

        try {
            await ProductAPI.updateProduct(accessToken, product.id, data);
            toast.success("Success", {
                description: "Product updated successfully",
            });
            setEditing(false);
            loadProductData();
        } catch (error: any) {
            throw error;
        }
    };

    const handleAssignToStores = async (data: any) => {
        if (!accessToken || !product) return;

        try {
            await ProductAPI.assignProductToStores(accessToken, product.id, data);
            toast.success("Success", {
                description: "Product assigned to stores successfully",
            });
            setAssigning(false);
            loadProductData();
        } catch (error: any) {
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Package className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    const totalInventory = ProductAPI.calculateTotalInventory(product);
    const stockStatus = ProductAPI.getStockStatusInfo(totalInventory);
    const typeInfo = ProductAPI.getProductTypeInfo(product.type);
    const gradeInfo = ProductAPI.getProductGradeInfo(product.grade);

    const inventoryByStore = product.inventories?.reduce((acc, inv) => {
        const store = stores.find(s => s.id === inv.storeId);
        return {
            ...acc,
            [store?.name || inv.storeId]: inv.quantity
        };
    }, {} as Record<string, number>) || {};

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/products")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={typeInfo.color}>
                                {typeInfo.label}
                            </Badge>
                            <Badge variant={gradeInfo.badgeVariant} className={gradeInfo.color}>
                                {gradeInfo.label}
                            </Badge>
                            <Badge className={stockStatus.color}>
                                {stockStatus.label} ({totalInventory})
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssigning(true)}
                    >
                        <StoreIcon className="h-4 w-4 mr-2" />
                        Assign to Stores
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(true)}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">
                        <Package className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="inventory">
                        <Warehouse className="h-4 w-4 mr-2" />
                        Inventory
                    </TabsTrigger>
                    <TabsTrigger value="pricing">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pricing
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="h-4 w-4 mr-2" />
                        History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Product Information</CardTitle>
                                <CardDescription>
                                    Detailed product specifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h4 className="text-sm font-medium mb-3">Basic Details</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Product ID</span>
                                                    <span className="font-medium">{product.id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Commodity</span>
                                                    <span className="font-medium">{product.commodity || "—"}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Base Price</span>
                                                    <span className="font-medium">
                                                        {ProductAPI.formatCurrency(product.basePrice)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium mb-3">Tire Details</h4>
                                            {product.type === "TIRE" && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Size</span>
                                                        <span className="font-medium">{product.tireSize}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Category</span>
                                                        <span className="font-medium">{product.tireCategory}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">Usage</span>
                                                        <span className="font-medium">{product.tireUsage}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="text-sm font-medium mb-3">Bale Details</h4>
                                        {product.type === "BALE" && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Weight</span>
                                                    <span className="font-medium">{product.baleWeight}kg</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Category</span>
                                                    <span className="font-medium">{product.baleCategory}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Origin</span>
                                                    <span className="font-medium">{product.originCountry}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                                <CardDescription>Product metrics at a glance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Total Inventory</span>
                                            <span className="font-bold">{totalInventory}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Across {Object.keys(inventoryByStore).length} stores</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Total Value</span>
                                            <span className="font-bold">
                                                {ProductAPI.formatCurrency(product.basePrice * totalInventory)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Based on base price and total inventory
                                        </p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm font-medium">Stores with Stock</span>
                                            <span className="font-bold">
                                                {Object.values(inventoryByStore).filter(qty => qty > 0).length}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Out of {stores.length} total stores
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory by Store</CardTitle>
                            <CardDescription>
                                Stock levels across all stores
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Store</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(inventoryByStore).map(([storeName, quantity]) => {
                                        const status = ProductAPI.getStockStatusInfo(quantity);
                                        const value = quantity * product.basePrice;

                                        return (
                                            <TableRow key={storeName}>
                                                <TableCell className="font-medium">{storeName}</TableCell>
                                                <TableCell>{quantity}</TableCell>
                                                <TableCell>
                                                    <Badge className={status.color}>
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {ProductAPI.formatCurrency(value)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing Information</CardTitle>
                            <CardDescription>
                                Price details and history
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Current Pricing</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Base Price</span>
                                                    <span className="font-medium">
                                                        {ProductAPI.formatCurrency(product.basePrice)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Tax Rate</span>
                                                    <span className="font-medium">0%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Markup</span>
                                                    <span className="font-medium">30%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Store Pricing</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Average Store Price</span>
                                                    <span className="font-medium">
                                                        {ProductAPI.formatCurrency(product.basePrice * 1.3)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">Price Range</span>
                                                    <span className="font-medium">$0 - $0</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={editing} onOpenChange={setEditing}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>
                            Update product information
                        </DialogDescription>
                    </DialogHeader>
                    <ProductForm
                        mode="edit"
                        product={product}
                        onSubmit={handleUpdateProduct}
                        onCancel={() => setEditing(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Assign Dialog */}
            <Dialog open={assigning} onOpenChange={setAssigning}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Assign Product to Stores</DialogTitle>
                        <DialogDescription>
                            Assign this product to additional stores
                        </DialogDescription>
                    </DialogHeader>
                    <ProductForm
                        mode="assign"
                        product={product}
                        stores={stores}
                        onSubmit={handleAssignToStores}
                        onCancel={() => setAssigning(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ProductDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Package className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Loading product details...</p>
                </div>
            </div>
        }>
            <ProductDetailContent />
        </Suspense>
    );
}