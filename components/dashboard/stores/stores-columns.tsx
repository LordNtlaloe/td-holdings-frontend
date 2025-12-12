// components/stores/stores-columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Store } from "@/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface UseStoreColumnsProps {
    onDelete: (id: string) => void;
    isPending: boolean;
}

export function useStoreColumns({ onDelete, isPending }: UseStoreColumnsProps): ColumnDef<Store>[] {
    return [
        {
            accessorKey: "name",
            header: "Store Name",
            cell: ({ row }) => {
                return (
                    <Link
                        href={`/stores/${row.original.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        {row.getValue("name")}
                    </Link>
                );
            },
        },
        {
            accessorKey: "location",
            header: "Location",
        },
        {
            accessorKey: "_count.employees",
            header: "Employees",
            cell: ({ row }) => {
                const count = row.original._count?.employees || 0;
                return (
                    <Link
                        href={`/stores/${row.original.id}/employees`}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        {count}
                    </Link>
                );
            },
        },
        {
            accessorKey: "_count.products",
            header: "Products",
            cell: ({ row }) => {
                const count = row.original._count?.products || 0;
                return (
                    <Link
                        href={`/stores/${row.original.id}/products`}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        {count}
                    </Link>
                );
            },
        },
        {
            accessorKey: "_count.sales",
            header: "Total Sales",
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"));
                return date.toLocaleDateString();
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const store = row.original;

                return (
                    <div className="flex space-x-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            asChild
                        >
                            <Link href={`/stores/${store.id}`}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            asChild
                        >
                            <Link href={`/stores/${store.id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(store.id)}
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