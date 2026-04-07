'use client';

import { useState, useEffect } from 'react';
import { ProductType, ProductGrade, TireCategory, TireUsage } from '@/types';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    Form
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Package, Store as StoreIcon, Warehouse, CheckCircle } from 'lucide-react';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import { toast } from 'sonner';

// FIXED SCHEMA - All fields at top level
const productSchema = Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
        'string.empty': 'Product name is required',
        'string.min': 'Product name must be at least 1 character',
        'string.max': 'Product name cannot exceed 100 characters',
    }),

    description: Joi.string().max(500).allow('', null).optional(),

    basePrice: Joi.number().min(0).required().messages({
        'number.base': 'Base price must be a number',
        'number.min': 'Base price must be positive',
        'any.required': 'Base price is required',
    }),

    type: Joi.string().valid(...Object.values(ProductType)).required().messages({
        'any.only': 'Invalid product type',
        'any.required': 'Product type is required',
    }),

    grade: Joi.string().valid(...Object.values(ProductGrade)).required().messages({
        'any.only': 'Invalid product grade',
        'any.required': 'Product grade is required',
    }),

    commodity: Joi.string().allow('', null).max(100).optional(),

    // TIRE FIELDS - Direct, not nested
    tireCategory: Joi.when('type', {
        is: ProductType.TIRE,
        then: Joi.string().valid(...Object.values(TireCategory)).required(),
        otherwise: Joi.string().allow('', null).optional(),
    }).messages({
        'any.only': 'Invalid tire category',
        'any.required': 'Tire category is required for tires',
    }),

    tireUsage: Joi.when('type', {
        is: ProductType.TIRE,
        then: Joi.string().valid(...Object.values(TireUsage)).required(),
        otherwise: Joi.string().allow('', null).optional(),
    }).messages({
        'any.only': 'Invalid tire usage',
        'any.required': 'Tire usage is required for tires',
    }),

    tireSize: Joi.string().max(50).allow('', null).optional(),
    loadIndex: Joi.string().max(10).allow('', null).optional(),
    speedRating: Joi.string().max(5).allow('', null).optional(),
    warrantyPeriod: Joi.string().max(50).allow('', null).optional(),

    // BALE FIELDS - Direct, not nested
    baleWeight: Joi.when('type', {
        is: ProductType.BALE,
        then: Joi.number().min(0.1).required(),
        otherwise: Joi.number().allow('', null).optional(),
    }).messages({
        'number.base': 'Bale weight must be a number',
        'number.min': 'Bale weight must be at least 0.1 kg',
        'any.required': 'Bale weight is required for bales',
    }),

    baleCategory: Joi.string().max(100).allow('', null).optional(),
    originCountry: Joi.string().max(100).allow('', null).optional(),

    importDate: Joi.date().max('now').allow('', null).optional().messages({
        'date.base': 'Invalid date format',
        'date.max': 'Import date cannot be in the future',
    }),

    warehouseQuantity: Joi.number().integer().min(0).default(0).messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity cannot be negative',
    }),

    warehouseReorderLevel: Joi.number().integer().min(0).allow('', null).optional(),
    warehouseOptimalLevel: Joi.number().integer().min(0).allow('', null).optional(),

    storeAssignments: Joi.array().items(
        Joi.object({
            storeId: Joi.string().required(),
            storeName: Joi.string().required(),
            isMainStore: Joi.boolean().default(false),
            isAssigned: Joi.boolean().default(false),
            existingQuantity: Joi.number().integer().min(0).default(0),
            reorderLevel: Joi.number().integer().min(0).allow('', null).optional(),
            optimalLevel: Joi.number().integer().min(0).allow('', null).optional(),
            storePrice: Joi.number().min(0).allow('', null).optional(),
        })
    ).default([]),

    isActive: Joi.boolean().default(true),
});

// FIXED TYPE - All fields at top level
type ProductFormData = {
    name: string;
    description?: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;

    // TIRE fields - direct
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;

    // BALE fields - direct
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: string;

    warehouseQuantity: number;
    warehouseReorderLevel?: number;
    warehouseOptimalLevel?: number;
    storeAssignments: Array<{
        storeId: string;
        storeName: string;
        isMainStore: boolean;
        isAssigned: boolean;
        existingQuantity: number;
        reorderLevel?: number;
        optimalLevel?: number;
        storePrice?: number;
    }>;
    isActive: boolean;
};

interface ProductFormProduct {
    id?: string;
    name: string;
    description?: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: string;
    inventories?: Array<{
        id: string;
        storeId: string;
        store?: { id: string; name: string; isMainStore: boolean };
        quantity: number;
        reorderLevel?: number;
        optimalLevel?: number;
        storePrice?: number;
    }>;
    isActive?: boolean;
}

interface ProductFormProps {
    product?: ProductFormProduct;
    stores?: Array<{ id: string; name: string; isMainStore: boolean }>;
    onSubmit: (data: ProductFormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    mode: 'create' | 'edit' | 'assign';
}

export function ProductForm({
    product,
    stores = [],
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create'
}: ProductFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submissionStep, setSubmissionStep] = useState<'idle' | 'validating' | 'submitting' | 'complete'>('idle');

    const form = useForm<ProductFormData>({
        resolver: joiResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            basePrice: 0,
            type: ProductType.TIRE,
            grade: ProductGrade.A,
            commodity: '',
            // TIRE fields
            tireCategory: undefined,
            tireUsage: undefined,
            tireSize: '',
            loadIndex: '',
            speedRating: '',
            warrantyPeriod: '',
            // BALE fields
            baleWeight: 0,
            baleCategory: '',
            originCountry: '',
            importDate: '',
            // Inventory
            warehouseQuantity: 0,
            warehouseReorderLevel: undefined,
            warehouseOptimalLevel: undefined,
            storeAssignments: stores.map(store => ({
                storeId: store.id,
                storeName: store.name,
                isMainStore: store.isMainStore,
                isAssigned: false,
                existingQuantity: 0,
                reorderLevel: undefined,
                optimalLevel: undefined,
                storePrice: undefined,
            })),
            isActive: true,
        },
        mode: 'onChange',
    });

    const productType = useWatch({ control: form.control, name: 'type' });
    const currentStoreAssignments = form.watch('storeAssignments');
    const warehouseQuantity = form.watch('warehouseQuantity');
    const baleWeight = form.watch('baleWeight');

    const totalExistingBranchStock = currentStoreAssignments
        ?.filter(s => !s.isMainStore && s.isAssigned)
        .reduce((sum, s) => sum + (s.existingQuantity || 0), 0) || 0;

    const totalSystemStock = warehouseQuantity + totalExistingBranchStock;

    // Load existing product data
    useEffect(() => {
        if (mode === 'edit' && product) {
            const assignedStores = product.inventories?.map(inv => ({
                storeId: inv.storeId,
                storeName: inv.store?.name || `Store ${inv.storeId}`,
                isMainStore: inv.store?.isMainStore || false,
                isAssigned: true,
                existingQuantity: inv.quantity,
                reorderLevel: inv.reorderLevel || undefined,
                optimalLevel: inv.optimalLevel || undefined,
                storePrice: inv.storePrice || undefined,
            })) || [];

            const storeAssignments = stores.map(store => {
                const assignedStore = assignedStores.find(s => s.storeId === store.id);
                return assignedStore || {
                    storeId: store.id,
                    storeName: store.name,
                    isMainStore: store.isMainStore,
                    isAssigned: false,
                    existingQuantity: 0,
                    reorderLevel: undefined,
                    optimalLevel: undefined,
                    storePrice: undefined,
                };
            });

            const mainStore = stores.find(s => s.isMainStore);
            const mainStoreInventory = product.inventories?.find(inv =>
                mainStore && inv.storeId === mainStore.id
            );

            const importDate = product.importDate
                ? new Date(product.importDate).toISOString().split('T')[0]
                : '';

            form.reset({
                name: product.name,
                description: product.description || '',
                basePrice: product.basePrice,
                type: product.type as ProductType,
                grade: product.grade as ProductGrade,
                commodity: product.commodity || '',
                // TIRE fields - direct
                tireCategory: product.tireCategory as TireCategory || undefined,
                tireUsage: product.tireUsage as TireUsage || undefined,
                tireSize: product.tireSize || '',
                loadIndex: product.loadIndex || '',
                speedRating: product.speedRating || '',
                warrantyPeriod: product.warrantyPeriod || '',
                // BALE fields - direct
                baleWeight: product.baleWeight || undefined,
                baleCategory: product.baleCategory || '',
                originCountry: product.originCountry || '',
                importDate: importDate,
                // Inventory
                warehouseQuantity: mainStoreInventory?.quantity || 0,
                warehouseReorderLevel: mainStoreInventory?.reorderLevel || undefined,
                warehouseOptimalLevel: mainStoreInventory?.optimalLevel || undefined,
                storeAssignments,
                isActive: product.isActive ?? true,
            });
        }
    }, [product, mode, stores, form]);

    // FIXED SUBMIT HANDLER
    const handleFormSubmit = async (data: ProductFormData) => {
        console.log('🟦 ========================================');
        console.log('🟦 FORM SUBMISSION STARTED');
        console.log('🟦 ========================================');
        console.log('🟦 Raw form data:', JSON.stringify(data, null, 2));

        setSubmissionStep('validating');
        setIsSubmitting(true);

        // Validate form
        const isValid = await form.trigger();

        if (!isValid) {
            console.log('🟨 Form validation failed');
            const errors = form.formState.errors;
            console.log('🟨 Validation errors:', errors);

            const errorMessages = Object.values(errors).map(error => error?.message).filter(Boolean);
            if (errorMessages.length > 0) {
                toast.error('Validation Error', {
                    description: errorMessages.join(', ')
                });
            }

            setSubmissionStep('idle');
            setIsSubmitting(false);
            return;
        }

        // Type-specific validation
        if (data.type === ProductType.BALE) {
            console.log('🟦 Validating BALE product...');
            console.log('🟦 baleWeight from form data:', data.baleWeight);

            if (!data.baleWeight || data.baleWeight <= 0) {
                console.error('🔴 BALE WEIGHT VALIDATION FAILED');
                console.error('🔴 data.baleWeight:', data.baleWeight);

                toast.error('Validation Error', {
                    description: 'Bale weight is required and must be greater than 0 for bale products'
                });

                setSubmissionStep('idle');
                setIsSubmitting(false);
                return;
            }

            console.log('✅ Bale weight validation passed:', data.baleWeight);
        }

        if (data.type === ProductType.TIRE) {
            console.log('🟦 Validating TIRE product...');
            console.log('🟦 tireCategory:', data.tireCategory);
            console.log('🟦 tireUsage:', data.tireUsage);

            if (!data.tireCategory || !data.tireUsage) {
                console.error('🔴 TIRE FIELDS VALIDATION FAILED');

                toast.error('Validation Error', {
                    description: 'Tire category and tire usage are required for tire products'
                });

                setSubmissionStep('idle');
                setIsSubmitting(false);
                return;
            }

            console.log('✅ Tire fields validation passed');
        }

        setSubmissionStep('submitting');

        // NO TRANSFORMATION NEEDED - data is already flat!
        console.log('🟦 Data is already in correct format (flat structure)');
        console.log('🟦 Submitting data:', JSON.stringify(data, null, 2));

        try {
            await onSubmit(data);

            setSubmissionStep('complete');
            setShowSuccess(true);

            toast.success(mode === 'create' ? 'Product Created' : 'Product Updated', {
                description: mode === 'create'
                    ? 'Product has been successfully created with inventory'
                    : 'Product has been successfully updated',
                icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            });

            if (mode === 'create') {
                setTimeout(() => {
                    form.reset({
                        name: '',
                        description: '',
                        basePrice: 0,
                        type: ProductType.TIRE,
                        grade: ProductGrade.A,
                        commodity: '',
                        tireCategory: undefined,
                        tireUsage: undefined,
                        tireSize: '',
                        loadIndex: '',
                        speedRating: '',
                        warrantyPeriod: '',
                        baleWeight: undefined,
                        baleCategory: '',
                        originCountry: '',
                        importDate: '',
                        warehouseQuantity: 0,
                        warehouseReorderLevel: undefined,
                        warehouseOptimalLevel: undefined,
                        storeAssignments: stores.map(store => ({
                            storeId: store.id,
                            storeName: store.name,
                            isMainStore: store.isMainStore,
                            isAssigned: false,
                            existingQuantity: 0,
                            reorderLevel: undefined,
                            optimalLevel: undefined,
                            storePrice: undefined,
                        })),
                        isActive: true,
                    });
                    setSubmissionStep('idle');
                    setShowSuccess(false);
                }, 2000);
            } else {
                setSubmissionStep('idle');
            }

        } catch (error: any) {
            console.error('🔴 Form submission error:', error);

            toast.error('Submission Failed', {
                description: error.message || 'Failed to submit form. Please try again.',
            });

            setSubmissionStep('idle');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSubmissionStatusText = () => {
        switch (submissionStep) {
            case 'validating':
                return 'Validating form...';
            case 'submitting':
                return 'Saving product...';
            case 'complete':
                return mode === 'create' ? 'Product Created!' : 'Product Updated!';
            default:
                return mode === 'create' ? 'Create Product' : 'Update Product';
        }
    };

    return (
        <FormProvider {...form}>
            <Form {...form}>
                <div className="space-y-6">
                    {/* Status Banner */}
                    {submissionStep !== 'idle' && (
                        <div className={`p-4 rounded-lg border ${submissionStep === 'complete' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                            <div className="flex items-center gap-3">
                                {submissionStep === 'validating' && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                                {submissionStep === 'submitting' && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                                {submissionStep === 'complete' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                <div className="flex-1">
                                    <p className={`font-medium ${submissionStep === 'complete' ? 'text-green-800' : 'text-blue-800'}`}>
                                        {getSubmissionStatusText()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product Status - Edit Mode Only */}
                    {mode === 'edit' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Product Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel>Product Active</FormLabel>
                                                <FormDescription>
                                                    Deactivate to hide product from sales
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel>Product Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter product name"
                                                {...field}
                                                value={field.value || ''}
                                                className={fieldState.error ? 'border-destructive' : ''}
                                            />
                                        </FormControl>
                                        <FormMessage>{fieldState.error?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter product description"
                                                className="resize-none"
                                                rows={3}
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Brief description of the product (optional, max 500 characters)
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="basePrice"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel>Base Price *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={field.value || ''}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value);
                                                        field.onChange(isNaN(value) ? 0 : value);
                                                    }}
                                                    className={fieldState.error ? 'border-destructive' : ''}
                                                />
                                            </FormControl>
                                            <FormMessage>{fieldState.error?.message}</FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Type *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={mode === 'edit'}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={ProductType.TIRE}>Tire</SelectItem>
                                                    <SelectItem value={ProductType.BALE}>Bale</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {mode === 'edit' && (
                                                <FormDescription>Product type cannot be changed</FormDescription>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="grade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Grade *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select grade" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={ProductGrade.A}>Grade A</SelectItem>
                                                    <SelectItem value={ProductGrade.B}>Grade B</SelectItem>
                                                    <SelectItem value={ProductGrade.C}>Grade C</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                                    placeholder="e.g., Rubber, Textile"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* TIRE Information - Shows only when type is TIRE */}
                    {productType === ProductType.TIRE && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Tire Information</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Required for tire products
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="tireCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tire Category *</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || ''}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={TireCategory.NEW}>New</SelectItem>
                                                        <SelectItem value={TireCategory.SECOND_HAND}>Second Hand</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
                                                    value={field.value || ''}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select usage" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={TireUsage.FOUR_BY_FOUR}>4x4</SelectItem>
                                                        <SelectItem value={TireUsage.REGULAR}>Regular</SelectItem>
                                                        <SelectItem value={TireUsage.TRUCK}>Truck</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="tireSize"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tire Size</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., 205/55R16"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
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
                                                        placeholder="e.g., 91"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
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
                                                        placeholder="e.g., V"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="warrantyPeriod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Warranty Period</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., 2 years/40,000 km"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* BALE Information - Shows only when type is BALE */}
                    {productType === ProductType.BALE && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Bale Information</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Required for bale products
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 
  REPLACE YOUR ENTIRE BALE WEIGHT FIELD WITH THIS EXACT CODE
  This is the minimal version that MUST work
*/}

                                    <FormField
                                        control={form.control}
                                        name="baleWeight"
                                        render={({ field, fieldState }) => {
                                            console.log('🟦 Bale Weight Field Render:', {
                                                name: 'baleWeight',
                                                value: field.value,
                                                fieldStateError: fieldState.error,
                                                allFormValues: form.getValues()
                                            });

                                            return (
                                                <FormItem>
                                                    <FormLabel>Bale Weight (kg) *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Enter weight (e.g., 45)"
                                                            value={field.value ?? ''}
                                                            onChange={(e) => {
                                                                const rawValue = e.target.value;
                                                                console.log('🟦 Input onChange fired:', rawValue);

                                                                if (rawValue === '') {
                                                                    console.log('🟦 Setting baleWeight to undefined (empty string)');
                                                                    field.onChange(undefined);
                                                                } else {
                                                                    const numValue = parseFloat(rawValue);
                                                                    console.log('🟦 Parsed number value:', numValue);

                                                                    if (isNaN(numValue)) {
                                                                        console.log('🟨 Invalid number, setting undefined');
                                                                        field.onChange(undefined);
                                                                    } else {
                                                                        console.log('✅ Setting baleWeight to:', numValue);
                                                                        field.onChange(numValue);

                                                                        // VERIFY it was set
                                                                        setTimeout(() => {
                                                                            const currentValue = form.getValues('baleWeight');
                                                                            console.log('🟦 VERIFICATION: baleWeight in form is now:', currentValue);
                                                                        }, 100);
                                                                    }
                                                                }
                                                            }}
                                                            onBlur={field.onBlur}
                                                            ref={field.ref}
                                                            className={fieldState.error ? 'border-destructive' : ''}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Required for bale products (must be greater than 0)
                                                    </FormDescription>
                                                    {fieldState.error && (
                                                        <FormMessage>{fieldState.error.message}</FormMessage>
                                                    )}

                                                    {/* REAL-TIME DEBUG INFO */}
                                                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs font-mono">
                                                        <div>Field value: {field.value ?? 'undefined'}</div>
                                                        <div>Form value: {form.watch('baleWeight') ?? 'undefined'}</div>
                                                    </div>
                                                </FormItem>
                                            );
                                        }}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="baleCategory"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bale Category</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Premium, Standard"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="originCountry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Origin Country</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Malaysia, Indonesia"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
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
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Real-time validation warning */}
                                {productType === ProductType.BALE && (!baleWeight || baleWeight <= 0) && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Bale weight is required and must be greater than 0
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Warehouse/Main Store Inventory */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Warehouse className="h-5 w-5 text-primary" />
                                Warehouse/Main Store Inventory
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {mode === 'create'
                                    ? 'Set initial stock in your main warehouse/store.'
                                    : 'Current stock in main warehouse/store'
                                }
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="warehouseQuantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Warehouse Stock</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        field.onChange(isNaN(value) ? 0 : value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Stock available in main store/warehouse
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="warehouseReorderLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reorder Level</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="10"
                                                    value={field.value || ''}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        field.onChange(isNaN(value) ? undefined : value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Alert when warehouse stock is low
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="warehouseOptimalLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Optimal Level</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="50"
                                                    value={field.value || ''}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        field.onChange(isNaN(value) ? undefined : value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Target warehouse stock level
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {mode === 'create' && (
                                <Alert>
                                    <Package className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="space-y-2">
                                            <div className="font-medium">System Inventory Summary:</div>
                                            <div className="text-sm space-y-1">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="font-medium">Warehouse Stock:</div>
                                                    <div>{warehouseQuantity} units</div>
                                                    <div className="font-medium">Existing Branch Stock:</div>
                                                    <div>{totalExistingBranchStock} units</div>
                                                    <div className="font-medium text-primary pt-1 col-span-2">
                                                        Total System Inventory: {totalSystemStock} units
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Branch Store Assignment */}
                    {stores.filter(s => !s.isMainStore).length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <StoreIcon className="h-5 w-5 text-blue-600" />
                                    Branch Store Assignment
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {mode === 'create' && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Assign product to branch stores and record existing stock
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="grid gap-3">
                                    {currentStoreAssignments
                                        ?.filter(assignment => !assignment.isMainStore)
                                        .map((assignment, index) => {
                                            const actualIndex = currentStoreAssignments.findIndex(
                                                a => a.storeId === assignment.storeId
                                            );

                                            return (
                                                <div key={assignment.storeId} className="space-y-3 p-4 border rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <FormField
                                                                control={form.control}
                                                                name={`storeAssignments.${actualIndex}.isAssigned`}
                                                                render={({ field }) => (
                                                                    <Checkbox
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                        disabled={mode === 'edit' && assignment.isAssigned}
                                                                    />
                                                                )}
                                                            />
                                                            <div>
                                                                <Label className="font-medium">{assignment.storeName}</Label>
                                                                <Badge variant="outline" className="ml-2 text-xs">
                                                                    Branch Store
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        {assignment.isAssigned && (
                                                            <Badge variant="secondary">Assigned</Badge>
                                                        )}
                                                    </div>

                                                    {assignment.isAssigned && (
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pl-10">
                                                            <FormField
                                                                control={form.control}
                                                                name={`storeAssignments.${actualIndex}.existingQuantity`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-xs">
                                                                            Existing Quantity
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                min="0"
                                                                                placeholder="0"
                                                                                value={field.value || ''}
                                                                                onChange={(e) => {
                                                                                    const value = parseInt(e.target.value);
                                                                                    field.onChange(isNaN(value) ? 0 : value);
                                                                                }}
                                                                                className="h-8 text-xs"
                                                                                disabled={mode === 'edit'}
                                                                            />
                                                                        </FormControl>
                                                                        <FormDescription className="text-xs">
                                                                            {mode === 'create' ? 'Pre-system stock' : 'Use transfers'}
                                                                        </FormDescription>
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name={`storeAssignments.${actualIndex}.reorderLevel`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-xs">Reorder Level</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                min="0"
                                                                                placeholder="10"
                                                                                value={field.value || ''}
                                                                                onChange={(e) => {
                                                                                    const value = parseInt(e.target.value);
                                                                                    field.onChange(isNaN(value) ? undefined : value);
                                                                                }}
                                                                                className="h-8 text-xs"
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name={`storeAssignments.${actualIndex}.optimalLevel`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-xs">Optimal Level</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                min="0"
                                                                                placeholder="50"
                                                                                value={field.value || ''}
                                                                                onChange={(e) => {
                                                                                    const value = parseInt(e.target.value);
                                                                                    field.onChange(isNaN(value) ? undefined : value);
                                                                                }}
                                                                                className="h-8 text-xs"
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <FormField
                                                                control={form.control}
                                                                name={`storeAssignments.${actualIndex}.storePrice`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-xs">Store Price</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                step="0.01"
                                                                                placeholder="Optional"
                                                                                value={field.value || ''}
                                                                                onChange={(e) => {
                                                                                    const value = parseFloat(e.target.value);
                                                                                    field.onChange(isNaN(value) ? undefined : value);
                                                                                }}
                                                                                className="h-8 text-xs"
                                                                            />
                                                                        </FormControl>
                                                                        <FormDescription className="text-xs">
                                                                            Branch-specific price
                                                                        </FormDescription>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-6">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isSubmitting || submissionStep !== 'idle'}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={form.handleSubmit(handleFormSubmit)}
                            disabled={isSubmitting || submissionStep !== 'idle'}
                            className="min-w-30"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {getSubmissionStatusText()}
                                </>
                            ) : submissionStep === 'complete' ? (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {getSubmissionStatusText()}
                                </>
                            ) : (
                                <>{mode === 'create' ? 'Create Product' : 'Update Product'}</>
                            )}
                        </Button>
                    </div>
                </div>
            </Form>
        </FormProvider>
    );
}