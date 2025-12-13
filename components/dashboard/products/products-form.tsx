// app/components/dashboard/products/product-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { LoaderCircle, ArrowLeft } from 'lucide-react';
import { ProductFormValues, ProductSchema, } from '@/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getProductById, updateProduct, createProduct, deleteProduct } from '@/lib/products-api';
import { getAllStores } from '@/lib/store-api';
import { CustomAlert } from '@/components/ui/custom-alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductFormProps {
    productId?: string;
    mode?: 'create' | 'edit';
}

export default function ProductForm({ productId, mode = 'create' }: ProductFormProps) {
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!productId);
    const [fetchingStores, setFetchingStores] = useState(true);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const router = useRouter();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            name: '',
            price: 0,
            quantity: 0,
            type: 'TIRE',
            grade: 'A',
            commodity: '',
            storeId: '',
            tireCategory: 'NEW',
            tireUsage: 'REGULAR',
            tireSize: '',
            loadIndex: '',
            speedRating: '',
            warrantyPeriod: '',
            baleWeight: 0,
            baleCategory: '',
            originCountry: '',
            importDate: undefined,
            baleCount: undefined,
        },
    });

    // Watch product type for conditional rendering
    const productType = form.watch('type');

    // Fetch stores
    useEffect(() => {
        const fetchStores = async () => {
            try {
                setFetchingStores(true);
                const storesData = await getAllStores();
                setStores(storesData);
            } catch (error) {
                console.error('Failed to load stores:', error);
                setAlert({
                    type: "error",
                    message: "Failed to load stores. Please refresh the page."
                });
            } finally {
                setFetchingStores(false);
            }
        };

        fetchStores();
    }, []);

    // Fetch product data if in edit mode
    useEffect(() => {
        const fetchProductData = async () => {
            if (!productId || mode !== 'edit') {
                setFetching(false);
                return;
            }

            try {
                setFetching(true);
                const result = await getProductById(productId);

                if (result.success && result.data) {
                    const product = result.data;
                    form.reset({
                        name: product.name,
                        price: product.price,
                        quantity: product.quantity,
                        type: product.type,
                        grade: product.grade,
                        commodity: product.commodity || '',
                        storeId: product.storeId,
                        tireCategory: product.tireCategory || 'NEW',
                        tireUsage: product.tireUsage || 'REGULAR',
                        tireSize: product.tireSize || '',
                        loadIndex: product.loadIndex || '',
                        speedRating: product.speedRating || '',
                        warrantyPeriod: product.warrantyPeriod || '',
                        baleWeight: product.baleWeight || 0,
                        baleCategory: product.baleCategory || '',
                        originCountry: product.originCountry || '',
                        importDate: product.importDate ? new Date(product.importDate) : undefined,
                        baleCount: product.baleCount || undefined,
                    });
                } else {
                    setAlert({
                        type: "error",
                        message: result.error || "Failed to load product data"
                    });
                    // Redirect if product not found
                    setTimeout(() => router.push('/products'), 3000);
                }
            } catch (err) {
                setAlert({
                    type: "error",
                    message: `Failed to load product data: ${err instanceof Error ? err.message : String(err)}`
                });
                setTimeout(() => router.push('/products'), 3000);
            } finally {
                setFetching(false);
            }
        };

        if (productId && mode === 'edit') {
            fetchProductData();
        } else {
            setFetching(false);
        }
    }, [productId, mode, form, router]);

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setLoading(true);
            setAlert(null);

            let result;

            if (productId && mode === 'edit') {
                result = await updateProduct(productId, data);
            } else {
                result = await createProduct(data);
            }

            if (result.success) {
                const successMessage = productId
                    ? "Product updated successfully!"
                    : "Product created successfully!";

                setAlert({ type: "success", message: successMessage });

                // Redirect after success
                setTimeout(() => {
                    router.push('/products');
                    router.refresh();
                }, 1500);
            } else {
                setAlert({
                    type: "error",
                    message: result.error || "An error occurred"
                });
            }
        } catch (err) {
            setAlert({
                type: "error",
                message: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!productId) return;

        try {
            setLoading(true);
            const result = await deleteProduct(productId);

            if (result.success) {
                setAlert({ type: "success", message: "Product deleted successfully!" });
                setTimeout(() => {
                    router.push("/products");
                    router.refresh();
                }, 1500);
            } else {
                setAlert({ type: "error", message: result.error || "Delete failed" });
                setShowDeleteDialog(false);
            }
        } catch (err) {
            setAlert({
                type: "error",
                message: `Delete failed: ${err instanceof Error ? err.message : String(err)}`
            });
            setShowDeleteDialog(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    // Loading skeleton
    if (fetching || fetchingStores) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>

                <div className="border rounded-lg p-6 space-y-6">
                    {/* Basic Information Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Conditional Section Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {productId ? 'Edit Product' : 'Create New Product'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {productId
                            ? 'Update product information'
                            : 'Add a new product to your inventory'
                        }
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="border rounded-lg p-6 bg-white shadow-sm space-y-8">
                        {/* Basic Information Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Basic Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Product Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter product name"
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Product Type */}
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Type *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                defaultValue={field.value}
                                                disabled={loading || (mode === 'edit')}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select product type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="TIRE">Tire</SelectItem>
                                                    <SelectItem value="BALE">Bale</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Store */}
                                <FormField
                                    control={form.control}
                                    name="storeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Store *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                defaultValue={field.value}
                                                disabled={loading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select store" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {stores.map((store) => (
                                                        <SelectItem key={store.id} value={store.id}>
                                                            {store.name} ({store.location})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Grade */}
                                <FormField
                                    control={form.control}
                                    name="grade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Grade *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                defaultValue={field.value}
                                                disabled={loading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select grade" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="A">A (Excellent)</SelectItem>
                                                    <SelectItem value="B">B (Good)</SelectItem>
                                                    <SelectItem value="C">C (Average)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Price */}
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    placeholder="0.00"
                                                    min={0}
                                                    disabled={loading}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Quantity */}
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    placeholder="0"
                                                    min={0}
                                                    disabled={loading}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="commodity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Commodity</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter commodity (optional)"
                                                    disabled={loading}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Optional product category or description
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Tire-Specific Fields */}
                        {productType === 'TIRE' && (
                            <div className="space-y-4 pt-6 border-t">
                                <h3 className="text-lg font-semibold">Tire Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="tireCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tire Category *</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    defaultValue={field.value}
                                                    disabled={loading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select tire category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="NEW">New</SelectItem>
                                                        <SelectItem value="SECOND_HAND">Second Hand</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="tireUsage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tire Usage *</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    defaultValue={field.value}
                                                    disabled={loading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select tire usage" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="FOUR_BY_FOUR">4x4</SelectItem>
                                                        <SelectItem value="REGULAR">Regular</SelectItem>
                                                        <SelectItem value="TRUCK">Truck</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="tireSize"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tire Size *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g., 205/55 R16"
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="loadIndex"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Load Index</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g., 91"
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Optional - indicates maximum load capacity
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="speedRating"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Speed Rating</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g., H"
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Optional - indicates maximum speed rating
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="warrantyPeriod"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Warranty Period</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g., 1 year, 6 months"
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Optional - warranty duration if applicable
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Bale-Specific Fields */}
                        {productType === 'BALE' && (
                            <div className="space-y-4 pt-6 border-t">
                                <h3 className="text-lg font-semibold">Bale Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="baleWeight"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bale Weight (kg) *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        {...field}
                                                        placeholder="e.g., 55"
                                                        min={0}
                                                        disabled={loading}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="baleCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bale Category *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g., Winter Jackets, Children's Clothes"
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="originCountry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Origin Country *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g., UK, USA, Germany"
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="importDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Import Date</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        value={field.value ? field.value.toISOString().split('T')[0] : ''}
                                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                                                        disabled={loading}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Optional - date when bale was imported
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="baleCount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bale Count (pieces)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        placeholder="e.g., 50"
                                                        min={1}
                                                        disabled={loading}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Optional - number of pieces in the bale
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-4 pt-6 border-t">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="min-w-32"
                            >
                                {loading && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                {productId ? "Update Product" : "Create Product"}
                            </Button>

                            {productId && mode === 'edit' && (
                                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={loading}
                                            className="min-w-32"
                                        >
                                            Delete Product
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete
                                                this product and remove all associated data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel disabled={loading}>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                disabled={loading}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {loading ? (
                                                    <>
                                                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    'Delete Product'
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>

            {alert && (
                <CustomAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                    autoClose={true}
                    autoCloseDuration={5000}
                />
            )}
        </div>
    );
}