// components/products/ProductTable.tsx
'use client';

import { useState } from 'react';
import { Product, ProductType, ProductGrade, Store } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Eye,
    Edit,
    Trash2,
    Archive,
    MoreVertical,
    Package,
    Store as StoreIcon,
    AlertTriangle,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import ProductAPI from '@/lib/api/products';
import { cn } from '@/lib/utils';

interface ProductTableProps {
    products: Product[];
    stores?: Store[];
    onView?: (product: Product) => void;
    onEdit?: (product: Product) => void;
    onDelete?: (product: Product) => void;
    onArchive?: (product: Product) => void;
    onSelect?: (selectedProducts: Product[]) => void;
    showActions?: boolean;
    showSelection?: boolean;
    showInventory?: boolean;
    showStoreDetails?: boolean;
    compact?: boolean;
}

export function ProductTable({
    products,
    stores = [],
    onView,
    onEdit,
    onDelete,
    onArchive,
    onSelect,
    showActions = true,
    showSelection = false,
    showInventory = true,
    showStoreDetails = false,
    compact = false,
}: ProductTableProps) {
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = products.map(p => p.id);
            setSelectedProducts(allIds);
            onSelect?.(products);
        } else {
            setSelectedProducts([]);
            onSelect?.([]);
        }
    };

    const handleSelectProduct = (productId: string, checked: boolean) => {
        const newSelected = checked
            ? [...selectedProducts, productId]
            : selectedProducts.filter(id => id !== productId);

        setSelectedProducts(newSelected);
        const selectedProductsData = products.filter(p => newSelected.includes(p.id));
        onSelect?.(selectedProductsData);
    };

    const getProductTypeBadge = (type: ProductType) => {
        const info = ProductAPI.getProductTypeInfo(type);
        return (
            <Badge variant="outline" className={cn("text-xs", info.color)}>
                {info.label}
            </Badge>
        );
    };

    const getProductGradeBadge = (grade: ProductGrade) => {
        const info = ProductAPI.getProductGradeInfo(grade);
        return (
            <Badge variant="outline" className={cn("text-xs", info.color)}>
                {info.label}
            </Badge>
        );
    };

    const getStockStatusBadge = (product: Product) => {
        const totalInventory = ProductAPI.calculateTotalInventory(product);
        const status = ProductAPI.getStockStatusInfo(totalInventory);

        return (
            <Badge variant="outline" className={cn("text-xs", status.color)}>
                <span className="flex items-center gap-1">
                    {status.status === 'OUT_OF_STOCK' && <XCircle className="h-3 w-3" />}
                    {status.status === 'LOW_STOCK' && <AlertTriangle className="h-3 w-3" />}
                    {status.status === 'IN_STOCK' && <CheckCircle className="h-3 w-3" />}
                    {compact ? '' : status.label}
                    {!compact && ` (${totalInventory})`}
                </span>
            </Badge>
        );
    };

    const getMainStoreInventory = (product: Product) => {
        return ProductAPI.getMainStoreInventory(product);
    };

    const getBranchInventory = (product: Product) => {
        return ProductAPI.getBranchInventory(product);
    };

    const getTireSizeDisplay = (product: Product) => {
        if (product.type === ProductType.TIRE && product.tireSize) {
            return product.tireSize;
        }
        return '-';
    };

    const getBaleWeightDisplay = (product: Product) => {
        if (product.type === ProductType.BALE && product.baleWeight) {
            return `${product.baleWeight}kg`;
        }
        return '-';
    };

    const getInventoryByStore = (product: Product) => {
        if (!product.inventories || product.inventories.length === 0) {
            return [];
        }

        // Group by store type
        const mainStore = product.inventories.find(inv => inv.store?.isMainStore);
        const branchStores = product.inventories.filter(inv => !inv.store?.isMainStore);

        const result = [];

        if (mainStore) {
            result.push({
                storeId: mainStore.store?.id,
                storeName: mainStore.store?.name || 'Main Store',
                isMainStore: true,
                quantity: mainStore.quantity,
                reorderLevel: mainStore.reorderLevel,
                optimalLevel: mainStore.optimalLevel,
                storePrice: mainStore.storePrice,
            });
        }

        branchStores.forEach(inv => {
            result.push({
                storeId: inv.store?.id,
                storeName: inv.store?.name || `Store ${inv.store?.id}`,
                isMainStore: false,
                quantity: inv.quantity,
                reorderLevel: inv.reorderLevel,
                optimalLevel: inv.optimalLevel,
                storePrice: inv.storePrice,
            });
        });

        return result;
    };

    // Simple store details display (no collapsible rows)
    const renderStoreDetails = (product: Product) => {
        const storeInventories = getInventoryByStore(product);

        if (storeInventories.length === 0) {
            return <span className="text-sm text-muted-foreground">No store inventory</span>;
        }

        return (
            <div className="flex flex-wrap gap-2">
                {storeInventories.map((storeInv, index) => {
                    const store = stores.find(s => s.id === storeInv.storeId);
                    const isMainStore = store?.isMainStore || storeInv.isMainStore;

                    return (
                        <div key={storeInv.storeId} className="flex items-center gap-1 border rounded px-2 py-1">
                            <StoreIcon className="h-3 w-3" />
                            <span className="text-xs font-medium">{storeInv.storeName}</span>
                            <span className="text-xs text-muted-foreground">({storeInv.quantity})</span>
                            {storeInv.quantity <= (storeInv.reorderLevel || 10) && (
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                <p className="text-muted-foreground mt-2">
                    No products match your criteria
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {showSelection && (
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedProducts.length === products.length && products.length > 0}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Select all"
                                />
                            </TableHead>
                        )}
                        <TableHead className={cn(compact ? "w-40" : "w-48")}>Product</TableHead>
                        <TableHead className="w-20">Type</TableHead>
                        <TableHead className="w-20">Grade</TableHead>
                        {!compact && (
                            <>
                                <TableHead className="w-24">Details</TableHead>
                                <TableHead className="w-24 text-right">Price</TableHead>
                                {showInventory && (
                                    <>
                                        <TableHead className="w-32">Stock Status</TableHead>
                                        <TableHead className="w-24 text-center">
                                            <StoreIcon className="h-4 w-4 mx-auto text-blue-600" />
                                        </TableHead>
                                        <TableHead className="w-24 text-center">
                                            <Package className="h-4 w-4 mx-auto text-green-600" />
                                        </TableHead>
                                    </>
                                )}
                            </>
                        )}
                        {showStoreDetails && !compact && (
                            <TableHead className="w-48">Store Inventory</TableHead>
                        )}
                        <TableHead className="w-20">Status</TableHead>
                        {showActions && <TableHead className="w-16">Actions</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id} className="hover:bg-muted/50">
                            {showSelection && (
                                <TableCell>
                                    <Checkbox
                                        checked={selectedProducts.includes(product.id)}
                                        onCheckedChange={(checked) =>
                                            handleSelectProduct(product.id, checked as boolean)
                                        }
                                        aria-label={`Select ${product.name}`}
                                    />
                                </TableCell>
                            )}
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-medium text-sm">
                                        {product.name}
                                    </div>
                                    {!compact && product.description && (
                                        <div className="text-xs text-muted-foreground line-clamp-1">
                                            {product.description}
                                        </div>
                                    )}
                                    {product.commodity && !compact && (
                                        <div className="text-xs text-muted-foreground">
                                            {product.commodity}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {getProductTypeBadge(product.type)}
                            </TableCell>
                            <TableCell>
                                {getProductGradeBadge(product.grade)}
                            </TableCell>
                            {!compact && (
                                <>
                                    <TableCell>
                                        {product.type === ProductType.TIRE ? (
                                            <div className="text-xs">
                                                {getTireSizeDisplay(product)}
                                                {product.tireCategory && (
                                                    <div className="text-muted-foreground">
                                                        {ProductAPI.getTireCategoryLabel(product.tireCategory)}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-xs">
                                                {getBaleWeightDisplay(product)}
                                                {product.baleCategory && (
                                                    <div className="text-muted-foreground">
                                                        {product.baleCategory}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {ProductAPI.formatCurrency(product.basePrice)}
                                    </TableCell>
                                    {showInventory && (
                                        <>
                                            <TableCell>
                                                {getStockStatusBadge(product)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="font-medium text-blue-600">
                                                        {getMainStoreInventory(product)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Warehouse
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="font-medium text-green-600">
                                                        {getBranchInventory(product)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Branches
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </>
                                    )}
                                </>
                            )}
                            {showStoreDetails && !compact && (
                                <TableCell>
                                    {renderStoreDetails(product)}
                                </TableCell>
                            )}
                            <TableCell>
                                <Badge
                                    variant={product.isActive ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    {product.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            {showActions && (
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {onView && (
                                                <DropdownMenuItem
                                                    onClick={() => onView(product)}
                                                    className="cursor-pointer"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                            )}
                                            {onEdit && (
                                                <DropdownMenuItem
                                                    onClick={() => onEdit(product)}
                                                    className="cursor-pointer"
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                            )}
                                            {onArchive && product.isActive && (
                                                <DropdownMenuItem
                                                    onClick={() => onArchive(product)}
                                                    className="cursor-pointer text-amber-600"
                                                >
                                                    <Archive className="h-4 w-4 mr-2" />
                                                    Archive
                                                </DropdownMenuItem>
                                            )}
                                            {onDelete && (
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(product)}
                                                    className="cursor-pointer text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}