'use client';

import { Product, ProductType, ProductGrade } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Package,
    DollarSign,
    BarChart3,
    Calendar,
    Store,
    TrendingDown,
    TrendingUp,
    MoreHorizontal,
    Eye,
    Edit,
    Archive,
    Layers
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProductAPI from '@/lib/api/products';

interface ProductCardProps {
    product: Product;
    onView?: (product: Product) => void;
    onEdit?: (product: Product) => void;
    onArchive?: (productId: string) => void;
    onManageInventory?: (productId: string) => void;
    showActions?: boolean;
    compact?: boolean;
}

export function ProductCard({
    product,
    onView,
    onEdit,
    onArchive,
    onManageInventory,
    showActions = true,
    compact = false
}: ProductCardProps) {
    const totalInventory = ProductAPI.calculateTotalInventory(product);
    const stockStatus = ProductAPI.getStockStatusInfo(totalInventory);
    const typeInfo = ProductAPI.getProductTypeInfo(product.type);
    const gradeInfo = ProductAPI.getProductGradeInfo(product.grade);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (compact) {
        return (
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className={typeInfo.color}>
                                    <Package className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium line-clamp-1">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {ProductAPI.formatCurrency(product.basePrice)}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className={typeInfo.color}>
                                {typeInfo.label}
                            </Badge>
                            <Badge variant="outline" className={gradeInfo.color}>
                                Grade {product.grade}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className={typeInfo.color}>
                                <Package className="h-6 w-6" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <DollarSign className="h-3 w-3" />
                                {ProductAPI.formatCurrency(product.basePrice)}
                            </CardDescription>
                        </div>
                    </div>
                    {showActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onView?.(product)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEdit?.(product)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Product
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onManageInventory?.(product.id)}>
                                    <Layers className="h-4 w-4 mr-2" />
                                    Manage Inventory
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onArchive?.(product.id)}
                                    className="text-red-600"
                                >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive Product
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="capitalize">{product.type.toLowerCase()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Store className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {product.storeProducts?.length || 0} store(s)
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className={typeInfo.color}>
                                {typeInfo.label}
                            </Badge>
                            <Badge variant="outline" className={gradeInfo.color}>
                                Grade {product.grade}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <span>Inventory: {totalInventory} units</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {stockStatus.status === 'OUT_OF_STOCK' ? (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                ) : stockStatus.status === 'LOW_STOCK' ? (
                                    <TrendingDown className="h-4 w-4 text-yellow-600" />
                                ) : (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                )}
                                <span className={stockStatus.color}>{stockStatus.label}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {product.commodity && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className="capitalize">{product.commodity}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Added {format(new Date(product.createdAt), 'MMM yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Type-specific details */}
                    {product.type === ProductType.TIRE && (
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                            <div className="space-y-1">
                                <p className="text-xs font-medium">Tire Details</p>
                                <div className="text-sm">
                                    {product.tireSize && <p>Size: {product.tireSize}</p>}
                                    {product.tireCategory && (
                                        <p>Category: {ProductAPI.getTireCategoryLabel(product.tireCategory)}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {product.type === ProductType.BALE && (
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                            <div className="space-y-1">
                                <p className="text-xs font-medium">Bale Details</p>
                                <div className="text-sm">
                                    {product.baleWeight && <p>Weight: {product.baleWeight}kg</p>}
                                    {product.baleCategory && <p>Category: {product.baleCategory}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {product._count && (
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                            <div className="text-center">
                                <div className="font-semibold">
                                    {product._count.saleItems || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">Sales</p>
                            </div>
                            <div className="text-center">
                                <div className="font-semibold">
                                    {product._count.transfers || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">Transfers</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Store className="h-4 w-4" />
                                    <span className="font-semibold">
                                        {product.storeProducts?.length || 0}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">Stores</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-3 border-t">
                <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                        {stockStatus.label} • {totalInventory} units in stock
                    </span>
                    <Link
                        href={`/catalogue/products/${product.id}`}
                        className="text-primary hover:underline"
                    >
                        View Details →
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}