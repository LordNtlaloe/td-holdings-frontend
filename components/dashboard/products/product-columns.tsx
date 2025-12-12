// components/dashboard/products/products-columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Package, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface UseProductColumnsProps {
    onDelete: (id: string) => void;
    isPending: boolean;
}

export function useProductColumns({ onDelete, isPending }: UseProductColumnsProps): ColumnDef<Product>[] {
    return [
        {
            accessorKey: "name",
            header: "Product Name",
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                    >
                        <Package className="h-4 w-4" />
                        {product.name}
                    </Link>
                );
            },
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue("type") as string;
                return (
                    <Badge variant={type === 'TIRE' ? 'default' : 'secondary'} className="text-xs">
                        {type}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "grade",
            header: "Grade",
            cell: ({ row }) => {
                const grade = row.getValue("grade") as string;
                return (
                    <Badge
                        variant="outline"
                        className={`text-xs ${grade === 'A' ? 'border-green-500 text-green-700' :
                                grade === 'B' ? 'border-yellow-500 text-yellow-700' :
                                    'border-red-500 text-red-700'
                            }`}
                    >
                        Grade {grade}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "commodity",
            header: "Commodity",
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => {
                const price = row.getValue("price") as number;
                return <span className="font-medium">M{price.toFixed(2)}</span>;
            },
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
            cell: ({ row }) => {
                const quantity = row.getValue("quantity") as number;
                const isLowStock = quantity <= 10;
                const isOutOfStock = quantity === 0;

                return (
                    <div className="flex items-center gap-2">
                        <span className={`font-medium ${isOutOfStock ? 'text-red-600' :
                                isLowStock ? 'text-orange-600' :
                                    'text-green-600'
                            }`}>
                            {quantity}
                        </span>
                        {isLowStock && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                    </div>
                );
            },
        },
        {
            accessorKey: "store.name",
            header: "Store",
            cell: ({ row }) => {
                const store = row.original.store;
                if (!store) return <span className="text-muted-foreground">N/A</span>;

                return (
                    <Link
                        href={`/stores/${store.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        {store.name}
                    </Link>
                );
            },
        },
        {
            id: "totalValue",
            header: "Total Value",
            cell: ({ row }) => {
                const product = row.original;
                const totalValue = product.price * product.quantity;
                return <span className="font-bold text-green-600">M{totalValue.toFixed(2)}</span>;
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const product = row.original;

                return (
                    <div className="flex space-x-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            asChild
                        >
                            <Link href={`/products/${product.id}`}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            asChild
                        >
                            <Link href={`/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(product.id)}
                            disabled={isPending}
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                );
            },
        },
    ];
}