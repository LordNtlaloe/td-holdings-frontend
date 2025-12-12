// app/(dashboard)/products/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomAlert } from "@/components/ui/custom-alert";
import {
    ArrowLeft,
    Edit,
    Package,
    ShoppingCart,
    TrendingUp,
    MapPin,
    Calendar,
    DollarSign,
    BarChart3,
    Activity,
    AlertTriangle,
    Truck,
    Weight,
    Globe,
    Layers
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getProductById, getProductSalesHistory } from "@/lib/products-api";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [salesHistory, setSalesHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    const productId = params.id as string;

    useEffect(() => {
        fetchProductData();
    }, [productId]);

    const fetchProductData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch product details
            const productResult = await getProductById(productId);

            if (!productResult.success || !productResult.data) {
                throw new Error(productResult.error || "Failed to fetch product");
            }

            setProduct(productResult.data);

            // Fetch sales history
            const salesResult = await getProductSalesHistory(productId);
            if (salesResult.success) {
                setSalesHistory(salesResult.data || []);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load product data");
            console.error("Error fetching product data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchProductData();
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                {/* Header Skeleton */}
                <div className="mb-6">
                    <Skeleton className="h-10 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>

                {/* Quick Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="pt-6">
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs Skeleton */}
                <div className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
                            <p className="text-gray-500 mb-6">{error || "The requested product could not be found"}</p>
                            <div className="flex justify-center gap-4">
                                <Button onClick={() => router.push("/products")}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Products
                                </Button>
                                <Button variant="outline" onClick={handleRefresh}>
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalValue = product.price * product.quantity;
    const isLowStock = product.quantity <= 10;
    const isOutOfStock = product.quantity === 0;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                            <div className="flex items-center gap-2">
                                <Badge variant={product.type === 'TIRE' ? 'default' : 'secondary'}>
                                    {product.type}
                                </Badge>
                                <Badge 
                                    variant="outline" 
                                    className={`${
                                        product.grade === 'A' ? 'border-green-500 text-green-700 bg-green-50' :
                                        product.grade === 'B' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                                        'border-red-500 text-red-700 bg-red-50'
                                    }`}
                                >
                                    Grade {product.grade}
                                </Badge>
                                <Badge 
                                    variant={
                                        isOutOfStock ? 'destructive' :
                                        isLowStock ? 'destructive' :
                                        'default'
                                    }
                                >
                                    {isOutOfStock ? 'Out of Stock' :
                                     isLowStock ? 'Low Stock' :
                                     'In Stock'}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{product.store?.name || 'No store assigned'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Added: {format(new Date(product.createdAt), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                <span>Price: M{product.price.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/products")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            All Products
                        </Button>
                        <Link href={`/products/${productId}/edit`}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quantity</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${
                            isOutOfStock ? 'text-red-600' :
                            isLowStock ? 'text-orange-600' :
                            'text-green-600'
                        }`}>
                            {product.quantity}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Units in stock
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            M{totalValue.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Inventory value
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commodity</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {product.commodity}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Product category
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {format(new Date(product.updatedAt), 'MMM dd')}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {format(new Date(product.updatedAt), 'hh:mm a')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-2 lg:grid-cols-5">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Details
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Sales
                    </TabsTrigger>
                    <TabsTrigger value="movement" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Movement
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Alerts
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Product Summary */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Product Summary</CardTitle>
                                <CardDescription>Complete product information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Basic Information</h4>
                                            <dl className="space-y-2">
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Product ID</dt>
                                                    <dd className="text-sm font-medium">{product.id.slice(0, 8)}...</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Type</dt>
                                                    <dd className="text-sm font-medium">{product.type}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Grade</dt>
                                                    <dd className="text-sm font-medium">Grade {product.grade}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Commodity</dt>
                                                    <dd className="text-sm font-medium">{product.commodity}</dd>
                                                </div>
                                            </dl>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Pricing</h4>
                                            <dl className="space-y-2">
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Unit Price</dt>
                                                    <dd className="text-sm font-medium">M{product.price.toFixed(2)}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Quantity</dt>
                                                    <dd className={`text-sm font-medium ${
                                                        isLowStock ? 'text-orange-600' : 'text-green-600'
                                                    }`}>
                                                        {product.quantity} units
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm">Total Value</dt>
                                                    <dd className="text-sm font-bold text-green-600">
                                                        M{totalValue.toFixed(2)}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>
                                    
                                    {/* Store Information */}
                                    {product.store && (
                                        <div className="pt-4 border-t">
                                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Store Information</h4>
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{product.store.name}</p>
                                                    <p className="text-sm text-muted-foreground">{product.store.location}</p>
                                                </div>
                                                <Link href={`/stores/${product.store.id}`}>
                                                    <Button size="sm" variant="outline">
                                                        View Store
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Stock Status</CardTitle>
                                <CardDescription>Current inventory status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-lg ${
                                        isOutOfStock ? 'bg-red-50 border border-red-200' :
                                        isLowStock ? 'bg-orange-50 border border-orange-200' :
                                        'bg-green-50 border border-green-200'
                                    }`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-full ${
                                                isOutOfStock ? 'bg-red-100' :
                                                isLowStock ? 'bg-orange-100' :
                                                'bg-green-100'
                                            }`}>
                                                <AlertTriangle className={`h-5 w-5 ${
                                                    isOutOfStock ? 'text-red-600' :
                                                    isLowStock ? 'text-orange-600' :
                                                    'text-green-600'
                                                }`} />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">
                                                    {isOutOfStock ? 'Out of Stock' :
                                                     isLowStock ? 'Low Stock Alert' :
                                                     'Stock Healthy'}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {isOutOfStock ? 'No units available' :
                                                     isLowStock ? `${product.quantity} units remaining` :
                                                     `${product.quantity} units in stock`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reorder Recommendation */}
                                    {isLowStock && !isOutOfStock && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h4 className="font-semibold text-blue-800 mb-2">Reorder Recommended</h4>
                                            <p className="text-sm text-blue-700 mb-3">
                                                Consider restocking to maintain inventory levels.
                                            </p>
                                            <Button size="sm" variant="outline" className="w-full border-blue-300 text-blue-700">
                                                Create Restock Order
                                            </Button>
                                        </div>
                                    )}

                                    {/* Stock Level Indicator */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Stock Level</span>
                                            <span className="font-medium">{product.quantity} units</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${
                                                    isOutOfStock ? 'bg-red-500' :
                                                    isLowStock ? 'bg-orange-500' :
                                                    'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min((product.quantity / 100) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>0</span>
                                            <span>Low (10)</span>
                                            <span>Healthy (100)</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Specifications</CardTitle>
                            <CardDescription>Detailed product specifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {product.type === 'TIRE' ? (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Tire Specifications
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Category:</span>
                                                    <span className="font-medium">{product.tireCategory || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Usage:</span>
                                                    <span className="font-medium">{product.tireUsage || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Size:</span>
                                                    <span className="font-medium">{product.tireSize || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Load Index:</span>
                                                    <span className="font-medium">{product.loadIndex || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Speed Rating:</span>
                                                    <span className="font-medium">{product.speedRating || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Warranty:</span>
                                                    <span className="font-medium">{product.warrantyPeriod || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Bale Specifications
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground flex items-center gap-2">
                                                        <Weight className="h-4 w-4" />
                                                        Weight:
                                                    </span>
                                                    <span className="font-medium">
                                                        {product.baleWeight ? `${product.baleWeight} kg` : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Category:</span>
                                                    <span className="font-medium">{product.baleCategory || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Count:</span>
                                                    <span className="font-medium">{product.baleCount || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground flex items-center gap-2">
                                                        <Globe className="h-4 w-4" />
                                                        Origin:
                                                    </span>
                                                    <span className="font-medium">{product.originCountry || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Import Date:</span>
                                                    <span className="font-medium">
                                                        {product.importDate 
                                                            ? format(new Date(product.importDate), 'MMM dd, yyyy')
                                                            : 'N/A'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timestamps */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                            <CardDescription>Product history and timestamps</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created</span>
                                    <span className="font-medium">
                                        {format(new Date(product.createdAt), 'MMM dd, yyyy hh:mm a')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Updated</span>
                                    <span className="font-medium">
                                        {format(new Date(product.updatedAt), 'MMM dd, yyyy hh:mm a')}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sales Tab */}
                <TabsContent value="sales" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales History</CardTitle>
                            <CardDescription>Recent sales transactions for this product</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {salesHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {salesHistory.map((sale, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <ShoppingCart className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">Sale #{sale.saleId?.slice(-8)}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Quantity: {sale.quantity} • Price: M{sale.price?.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">M{(sale.quantity * sale.price)?.toFixed(2)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {sale.createdAt ? format(new Date(sale.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Sales History</h3>
                                    <p className="text-gray-500 mb-6">
                                        This product hasn't been sold yet.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">
                                View Full Sales Report
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Movement Tab */}
                <TabsContent value="movement">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Movement</CardTitle>
                            <CardDescription>Stock level changes over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Movement Tracking</h3>
                                <p className="text-gray-500 mb-6">
                                    Track inventory changes, transfers, and adjustments.
                                </p>
                                <Button>View Movement History</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Alerts</CardTitle>
                            <CardDescription>Notifications and warnings for this product</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {isOutOfStock && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-red-800 mb-1">Out of Stock</h4>
                                                <p className="text-sm text-red-700">
                                                    This product has 0 units in stock. Consider restocking or marking as unavailable.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isLowStock && !isOutOfStock && (
                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-orange-800 mb-1">Low Stock Warning</h4>
                                                <p className="text-sm text-orange-700">
                                                    Only {product.quantity} units remaining. Consider reordering soon.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!isLowStock && !isOutOfStock && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-green-800 mb-1">Stock Healthy</h4>
                                                <p className="text-sm text-green-700">
                                                    {product.quantity} units in stock. No immediate action needed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Price Alert */}
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-blue-800 mb-1">Price Information</h4>
                                            <p className="text-sm text-blue-700">
                                                Current price: M{product.price.toFixed(2)} per unit.
                                                Total inventory value: M{totalValue.toFixed(2)}.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {error && (
                <CustomAlert
                    message={error}
                    type="error"
                    onClose={() => setError(null)}
                />
            )}
        </div>
    );
}