'use client';

import { Product } from '@/types';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Package,
    DollarSign,
    BarChart3,
    Store,
    MoreHorizontal,
    Eye,
    Edit,
    Archive,
    Layers
} from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProductAPI from '@/lib/api/products';

interface ProductTableProps {
    products: Product[];
    onEdit?: (product: Product) => void;
    onArchive?: (productId: string) => void;
    onManageInventory?: (productId: string) => void;
    onView?: (productId: string) => void;
}

export function ProductTable({
    products,
    onEdit,
    onArchive,
    onManageInventory,
    onView
}: ProductTableProps) {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'TIRE': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'BALE': return 'bg-green-100 text-green-800 hover:bg-green-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'B': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'C': return 'bg-red-100 text-red-800 hover:bg-red-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const getStockColor = (inventory: number) => {
        if (inventory === 0) return 'bg-red-100 text-red-800 hover:bg-red-100';
        if (inventory <= 10) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
        return 'bg-green-100 text-green-800 hover:bg-green-100';
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Type & Grade</TableHead>
                        <TableHead>Inventory</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Stores</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => {
                        const totalInventory = ProductAPI.calculateTotalInventory(product);
                        const stockStatus = ProductAPI.getStockStatusInfo(totalInventory);

                        return (
                            <TableRow key={product.id} className="hover:bg-muted/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className={ProductAPI.getProductTypeInfo(product.type).color}>
                                                <Package className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium line-clamp-1">{product.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                ID: {product.id.slice(0, 8)}...
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">
                                        {ProductAPI.formatCurrency(product.basePrice)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <Badge variant="secondary" className={getTypeColor(product.type)}>
                                            {product.type}
                                        </Badge>
                                        <Badge variant="outline" className={getGradeColor(product.grade)}>
                                            Grade {product.grade}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium">{totalInventory} units</div>
                                        <Badge variant="outline" className={getStockColor(totalInventory)}>
                                            {stockStatus.label}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        {product.commodity && (
                                            <div className="text-sm">{product.commodity}</div>
                                        )}
                                        {product._count && (
                                            <div className="text-xs text-muted-foreground">
                                                {product._count.saleItems} sales
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Store className="h-3 w-3" />
                                        <span>{product.storeProducts?.length || 0}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {format(new Date(product.createdAt), 'MMM d, yyyy')}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            {onView && (
                                                <DropdownMenuItem onClick={() => onView(product.id)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                            )}
                                            {onManageInventory && (
                                                <DropdownMenuItem onClick={() => onManageInventory(product.id)}>
                                                    <Layers className="h-4 w-4 mr-2" />
                                                    Manage Inventory
                                                </DropdownMenuItem>
                                            )}
                                            {onEdit && (
                                                <DropdownMenuItem onClick={() => onEdit(product)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Product
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            {onArchive && (
                                                <DropdownMenuItem
                                                    onClick={() => onArchive(product.id)}
                                                    className="text-red-600"
                                                >
                                                    <Archive className="h-4 w-4 mr-2" />
                                                    Archive Product
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}