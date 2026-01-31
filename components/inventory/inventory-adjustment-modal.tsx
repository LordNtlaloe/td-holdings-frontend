// components/inventory/InventoryAdjustmentModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Package, Building } from 'lucide-react';
import { Inventory, InventoryChangeType, Product, Store } from '@/types';
import InventoryAPI from '@/lib/api/inventory';
import ProductAPI from '@/lib/api/products';
import StoreAPI from '@/lib/api/stores';
import { useAuth } from '@/contexts/auth-context';

interface InventoryAdjustmentModalProps {
    inventory?: Inventory | null;
    onClose: () => void;
    onSuccess: () => void;
}

const InventoryAdjustmentModal = ({
    inventory,
    onClose,
    onSuccess
}: InventoryAdjustmentModalProps) => {
    const { accessToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [formData, setFormData] = useState({
        productId: inventory?.productId || '',
        storeId: inventory?.storeId || '',
        quantity: 0,
        changeType: 'PURCHASE' as InventoryChangeType,
        notes: '',
        referenceId: '',
        referenceType: ''
    });

    useEffect(() => {
        if (accessToken && !inventory) {
            loadProductsAndStores();
        }
    }, [accessToken, inventory]);

    useEffect(() => {
        if (inventory) {
            setFormData({
                productId: inventory.productId,
                storeId: inventory.storeId,
                quantity: 0,
                changeType: InventoryAPI.getSuggestedChangeType(0),
                notes: '',
                referenceId: '',
                referenceType: ''
            });
        }
    }, [inventory]);

    const loadProductsAndStores = async () => {
        if (!accessToken) return;

        try {
            setLoadingData(true);
            console.log('🟦 Loading products and stores...');

            // Load products
            try {
                const productsResponse = await ProductAPI.getProducts(accessToken, {
                    limit: 100,
                    page: 1
                });

                console.log('🟦 Products response:', productsResponse);

                // Check different possible structures
                let productsList: Product[] = [];

                if (Array.isArray(productsResponse)) {
                    // Response is already an array
                    productsList = productsResponse;
                } else if (productsResponse && typeof productsResponse === 'object') {
                    // Try different property names
                    productsList =
                        productsResponse.data ||
                        Object.values(productsResponse).find(val => Array.isArray(val)) ||
                        [];
                }

                console.log('🟦 Extracted products list:', productsList);
                setProducts(productsList);

                if (productsList.length === 0) {
                    console.warn('⚠️ No products found in response');
                }

            } catch (productError: any) {
                console.error('🔴 Failed to load products:', productError);
                setError(`Failed to load products: ${productError.message}`);
            }

            // Load stores
            try {
                const storesResponse = await StoreAPI.getStores(accessToken, {
                    limit: 50,
                    page: 1
                });

                console.log('🟦 Stores response:', storesResponse);

                let storesList: Store[] = [];

                if (Array.isArray(storesResponse)) {
                    storesList = storesResponse;
                } else if (storesResponse && typeof storesResponse === 'object') {
                    storesList = storesResponse.stores ||
                        storesResponse.data ||
                        Object.values(storesResponse).find(val => Array.isArray(val)) ||
                        [];
                }

                console.log('🟦 Extracted stores list:', storesList);
                setStores(storesList);

            } catch (storeError: any) {
                console.error('🔴 Failed to load stores:', storeError);
                setError(prev => prev ? `${prev}; Also failed to load stores: ${storeError.message}` :
                    `Failed to load stores: ${storeError.message}`);
            }

        } catch (err: any) {
            console.error('🔴 Failed to load data:', err);
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setLoadingData(false);
        }
    };

    const changeTypes = Object.values(InventoryChangeType).map(type => ({
        value: type,
        label: InventoryAPI.getChangeTypeInfo(type).label,
        icon: InventoryAPI.getChangeTypeInfo(type).icon
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        const validation = InventoryAPI.validateAdjustmentData(formData);
        if (!validation.isValid) {
            setError(validation.errors.join(', '));
            return;
        }

        // Additional validation for empty selections
        if (!formData.productId) {
            setError('Please select a product');
            return;
        }

        if (!formData.storeId) {
            setError('Please select a store');
            return;
        }

        try {
            setLoading(true);

            await InventoryAPI.adjustInventory(accessToken!, {
                productId: formData.productId,
                storeId: formData.storeId,
                quantity: formData.quantity,
                changeType: formData.changeType,
                notes: formData.notes,
                referenceId: formData.referenceId || undefined,
                referenceType: formData.referenceType || undefined
            });

            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to adjust inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (value: string) => {
        const numValue = parseInt(value) || 0;
        setFormData(prev => ({
            ...prev,
            quantity: numValue,
            changeType: InventoryAPI.getSuggestedChangeType(numValue)
        }));
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {inventory ? 'Adjust Inventory' : 'Add Inventory'}
                    </DialogTitle>
                    <DialogDescription>
                        {inventory
                            ? `Adjust stock for ${inventory.product?.name || 'selected product'} at ${inventory.store?.name || 'selected store'}`
                            : 'Add new inventory entry for a product and store'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {/* Debug Info */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="text-xs bg-gray-100 p-2 rounded">
                                <div>Products: {products.length} items</div>
                                <div>Stores: {stores.length} items</div>
                                <div>Selected Product: {formData.productId}</div>
                                <div>Selected Store: {formData.storeId}</div>
                            </div>
                        )}

                        {/* Product and Store Selection (only show if not editing existing) */}
                        {!inventory && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="product">
                                        <div className="flex items-center space-x-2">
                                            <Package className="h-4 w-4" />
                                            <span>Product</span>
                                        </div>
                                    </Label>
                                    {loadingData ? (
                                        <div className="space-y-2">
                                            <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                                            <div className="text-xs text-muted-foreground">Loading products...</div>
                                        </div>
                                    ) : (
                                        <Select
                                            value={formData.productId}
                                            onValueChange={(value) => {
                                                console.log('Selected product:', value);
                                                setFormData(prev => ({ ...prev, productId: value }))
                                            }}
                                            required
                                            disabled={products.length === 0}
                                        >
                                            <SelectTrigger className={products.length === 0 ? 'bg-gray-100' : ''}>
                                                <SelectValue
                                                    placeholder={products.length === 0 ? "No products available" : "Select product"}
                                                />
                                            </SelectTrigger>
                                            {products.length > 0 && (
                                                <SelectContent className="max-h-[200px]">
                                                    {products.map(product => (
                                                        <SelectItem
                                                            key={product.id}
                                                            value={product.id}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{product.name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {product.type} • {ProductAPI.formatCurrency(product.basePrice || 0)}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            )}
                                        </Select>
                                    )}
                                    {products.length === 0 && !loadingData && (
                                        <Alert className="mt-2 py-2">
                                            <AlertDescription className="text-xs">
                                                No products found. Please create products first.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="store">
                                        <div className="flex items-center space-x-2">
                                            <Building className="h-4 w-4" />
                                            <span>Store</span>
                                        </div>
                                    </Label>
                                    {loadingData ? (
                                        <div className="space-y-2">
                                            <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                                            <div className="text-xs text-muted-foreground">Loading stores...</div>
                                        </div>
                                    ) : (
                                        <Select
                                            value={formData.storeId}
                                            onValueChange={(value) => {
                                                console.log('Selected store:', value);
                                                setFormData(prev => ({ ...prev, storeId: value }))
                                            }}
                                            required
                                            disabled={stores.length === 0}
                                        >
                                            <SelectTrigger className={stores.length === 0 ? 'bg-gray-100' : ''}>
                                                <SelectValue
                                                    placeholder={stores.length === 0 ? "No stores available" : "Select store"}
                                                />
                                            </SelectTrigger>
                                            {stores.length > 0 && (
                                                <SelectContent className="max-h-[200px]">
                                                    {stores.map(store => (
                                                        <SelectItem
                                                            key={store.id}
                                                            value={store.id}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{store.name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {store.location}
                                                                    {store.isMainStore && ' • Main Store'}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            )}
                                        </Select>
                                    )}
                                    {stores.length === 0 && !loadingData && (
                                        <Alert className="mt-2 py-2">
                                            <AlertDescription className="text-xs">
                                                No stores found. Please create stores first.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Current Stock Display (if editing) */}
                        {inventory && (
                            <Alert>
                                <AlertDescription>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium">Current Stock</div>
                                            <div className="text-2xl font-bold">{inventory.quantity}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Reorder Level</div>
                                            <div className="text-lg">
                                                {inventory.reorderLevel || 'Not set'}
                                            </div>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Quantity and Change Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                    placeholder="Enter quantity"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Positive for additions, negative for reductions
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="changeType">Change Type</Label>
                                <Select
                                    value={formData.changeType}
                                    onValueChange={(value: InventoryChangeType) =>
                                        setFormData(prev => ({ ...prev, changeType: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {changeTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center space-x-2">
                                                    <span>{type.icon}</span>
                                                    <span>{type.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Reference Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="referenceId">Reference ID</Label>
                                <Input
                                    id="referenceId"
                                    value={formData.referenceId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, referenceId: e.target.value }))}
                                    placeholder="e.g., PO-12345"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="referenceType">Reference Type</Label>
                                <Select
                                    value={formData.referenceType}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, referenceType: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PURCHASE_ORDER">Purchase Order</SelectItem>
                                        <SelectItem value="TRANSFER">Transfer</SelectItem>
                                        <SelectItem value="RETURN">Return</SelectItem>
                                        <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Add notes about this adjustment..."
                                rows={3}
                            />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Warnings */}
                        {formData.quantity < 0 && formData.changeType !== 'SALE' && formData.changeType !== 'TRANSFER_OUT' && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    You're reducing stock with a non-sale/transfer operation. Make sure this is intentional.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Preview of New Quantity */}
                        {inventory && formData.quantity !== 0 && (
                            <Alert>
                                <AlertDescription>
                                    <div className="flex items-center justify-between">
                                        <span>New stock level will be:</span>
                                        <span className="font-bold text-lg">
                                            {inventory.quantity + formData.quantity}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm">
                                        {inventory.quantity} + {formData.quantity} = {inventory.quantity + formData.quantity}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || loadingData || (!inventory && (products.length === 0 || stores.length === 0))}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {formData.quantity === 0 ? 'Update Notes Only' : 'Adjust Inventory'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InventoryAdjustmentModal;