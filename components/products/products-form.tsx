'use client';

import { useState, useEffect } from 'react';
import { Product, ProductType, ProductGrade } from '@/types';
import {
    createProductSchema,
    updateProductSchema,
    assignProductToStoresSchema
} from '@/lib/validations/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import {
    Loader2,
    Save,
    X,
    PackagePlus,
    Store,
    Archive,
    Package
} from 'lucide-react';
import { CreateProductForm } from './forms/product-create-form';
import { AssignProductToStoresForm } from './forms/product-assign-store-form';
import { EditProductForm } from './forms/product-edit-form';

interface BaseFormProps {
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
}

// Create Product Form
export interface CreateProductFormProps extends BaseFormProps {
    mode: 'create';
    stores?: { id: string; name: string }[];
}

// Update Product Form
export interface UpdateProductFormProps extends BaseFormProps {
    mode: 'edit';
    product: Product;
}

// Assign Product to Stores Form
export interface AssignProductToStoresFormProps extends BaseFormProps {
    mode: 'assign';
    product?: Product;
    stores?: { id: string; name: string }[];
}

// Archive Product Form
export interface ArchiveProductFormProps extends BaseFormProps {
    mode: 'archive';
    product?: Product;
}

export type ProductFormProps =
    | CreateProductFormProps
    | UpdateProductFormProps
    | AssignProductToStoresFormProps
    | ArchiveProductFormProps;

export function ProductForm(props: ProductFormProps) {
    const { mode, onSubmit, onCancel, isLoading = false } = props;

    const getSchema = () => {
        switch (mode) {
            case 'create': return createProductSchema;
            case 'edit': return updateProductSchema;
            case 'assign': return assignProductToStoresSchema;
            case 'archive': return createProductSchema; // Will handle separately
            default: return createProductSchema;
        }
    };

    const getDefaultValues = () => {
        switch (mode) {
            case 'edit':
                const product = (props as UpdateProductFormProps).product;
                return {
                    name: product.name,
                    basePrice: product.basePrice,
                    grade: product.grade,
                    commodity: product.commodity || '',
                    tireSpecific: {
                        tireCategory: product.tireCategory,
                        tireUsage: product.tireUsage,
                        tireSize: product.tireSize,
                        loadIndex: product.loadIndex,
                        speedRating: product.speedRating,
                        warrantyPeriod: product.warrantyPeriod
                    },
                    baleSpecific: {
                        baleWeight: product.baleWeight,
                        baleCategory: product.baleCategory,
                        originCountry: product.originCountry,
                        importDate: product.importDate
                    }
                };
            case 'assign':
                return {
                    storeIds: [],
                    initialQuantities: {}
                };
            case 'archive':
                return {
                    reason: ''
                };
            default:
                return {
                    name: '',
                    basePrice: 0,
                    type: ProductType.TIRE,
                    grade: ProductGrade.A,
                    commodity: '',
                    storeAssignments: [],
                };
        }
    };

    const form = useForm<any>({
        resolver: joiResolver(getSchema()),
        defaultValues: getDefaultValues(),
    });

    // Reset form when mode changes
    useEffect(() => {
        form.reset(getDefaultValues());
    }, [mode, props]);

    const handleSubmit = async (data: any) => {
        try {
            await onSubmit(data);
            if (mode !== 'archive') {
                form.reset(getDefaultValues());
            }
        } catch (error: any) {
            console.error('Form submission error:', error);
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Add New Product';
            case 'edit': return 'Edit Product';
            case 'assign': return 'Assign to Stores';
            case 'archive': return 'Archive Product';
            default: return 'Product Form';
        }
    };

    const getDescription = () => {
        switch (mode) {
            case 'create': return 'Add a new product to your catalog';
            case 'edit': return 'Update product information';
            case 'assign': return 'Assign product to additional stores';
            case 'archive': return 'Archive product from catalog';
            default: return '';
        }
    };

    const renderFormContent = () => {
        switch (mode) {
            case 'create':
                return (
                    <CreateProductForm
                        control={form.control}
                        stores={(props as CreateProductFormProps).stores}
                    />
                );
            case 'edit':
                return (
                    <EditProductForm
                        control={form.control}
                        product={(props as UpdateProductFormProps).product}
                    />
                );
            case 'assign':
                return (
                    <AssignProductToStoresForm
                        control={form.control}
                        product={(props as AssignProductToStoresFormProps).product}
                        stores={(props as AssignProductToStoresFormProps).stores}
                    />
                );
            case 'archive':
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to archive this product?
                            This action cannot be undone.
                        </p>
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm font-medium text-yellow-800">
                                Note: Products cannot be archived if they have inventory or recent sales.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getSubmitIcon = () => {
        switch (mode) {
            case 'create': return <PackagePlus className="h-4 w-4 mr-2" />;
            case 'edit': return <Save className="h-4 w-4 mr-2" />;
            case 'assign': return <Store className="h-4 w-4 mr-2" />;
            case 'archive': return <Archive className="h-4 w-4 mr-2" />;
            default: return <Save className="h-4 w-4 mr-2" />;
        }
    };

    const getSubmitText = () => {
        switch (mode) {
            case 'create': return 'Create Product';
            case 'edit': return 'Save Changes';
            case 'assign': return 'Assign to Stores';
            case 'archive': return 'Archive Product';
            default: return 'Submit';
        }
    };

    const getLoadingText = () => {
        switch (mode) {
            case 'create': return 'Creating...';
            case 'edit': return 'Saving...';
            case 'assign': return 'Assigning...';
            case 'archive': return 'Archiving...';
            default: return 'Submitting...';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{getTitle()}</CardTitle>
                <CardDescription>{getDescription()}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            {renderFormContent()}
                        </div>

                        <div className="flex justify-end gap-3">
                            {onCancel && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {getLoadingText()}
                                    </>
                                ) : (
                                    <>
                                        {getSubmitIcon()}
                                        {getSubmitText()}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}