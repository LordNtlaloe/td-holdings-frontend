// components/dashboard/products/products-table.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product } from "@/types";
import Link from "next/link";
import { CustomAlert } from "@/components/ui/custom-alert";
import { TableSkeleton } from "@/components/general/skeletons/table-skeleton";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoaderCircle, Search, Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getAllProducts, deleteProduct } from "@/lib/products-api";
import { useProductColumns } from "./product-columns";

interface ProductsTableProps {
    products?: Product[];
}

export default function ProductsTable({ products: initialProducts = [] }: ProductsTableProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(!initialProducts.length);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [gradeFilter, setGradeFilter] = useState<string>("all");
    const [stockFilter, setStockFilter] = useState<string>("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns = useProductColumns({
        onDelete: (id: string) => {
            setProductToDelete(id);
            setDeleteDialogOpen(true);
        },
        isPending,
    });

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            globalFilter: searchTerm,
        },
        onGlobalFilterChange: setSearchTerm,
    });

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            const fetchedProducts = await getAllProducts();
            setProducts(fetchedProducts || []);
        } catch (err) {
            setAlert({
                message: `Failed to load products: ${err instanceof Error ? err.message : String(err)}`,
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialProducts.length) {
            fetchProducts();
        }
    }, [initialProducts.length, fetchProducts]);

    // Apply filters
    useEffect(() => {
        let filtered = initialProducts.length ? initialProducts : products;

        if (typeFilter !== "all") {
            filtered = filtered.filter(product => product.type === typeFilter);
        }

        if (gradeFilter !== "all") {
            filtered = filtered.filter(product => product.grade === gradeFilter);
        }

        if (stockFilter !== "all") {
            if (stockFilter === "low") {
                filtered = filtered.filter(product => product.quantity <= 10 && product.quantity > 0);
            } else if (stockFilter === "out") {
                filtered = filtered.filter(product => product.quantity === 0);
            } else if (stockFilter === "healthy") {
                filtered = filtered.filter(product => product.quantity > 10);
            }
        }

        setProducts(filtered);
    }, [initialProducts, products, typeFilter, gradeFilter, stockFilter]);

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;

        startTransition(async () => {
            try {
                setIsDeleting(true);
                const result = await deleteProduct(productToDelete);

                if (result.success) {
                    setProducts(products.filter(product => product.id !== productToDelete));
                    setAlert({ message: "Product deleted successfully.", type: "success" });
                    setDeleteDialogOpen(false);
                } else {
                    setAlert({ message: result.error || "Failed to delete product.", type: "error" });
                }
            } catch (err) {
                setAlert({
                    message: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`,
                    type: "error"
                });
            } finally {
                setIsDeleting(false);
                setProductToDelete(null);
            }
        });
    };

    const clearFilters = () => {
        setTypeFilter("all");
        setGradeFilter("all");
        setStockFilter("all");
        setSearchTerm("");
    };

    const hasActiveFilters = typeFilter !== "all" || gradeFilter !== "all" || stockFilter !== "all" || searchTerm;

    if (isLoading) {
        return <TableSkeleton rowCount={5} columnCount={9} showHeader={true} />;
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
                <div className="flex flex-1 items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search products by name, commodity, category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Filters:</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="TIRE">TIRE</SelectItem>
                            <SelectItem value="BALE">BALE</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Grades</SelectItem>
                            <SelectItem value="A">Grade A</SelectItem>
                            <SelectItem value="B">Grade B</SelectItem>
                            <SelectItem value="C">Grade C</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={stockFilter} onValueChange={setStockFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Stock" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Stock</SelectItem>
                            <SelectItem value="healthy">Healthy</SelectItem>
                            <SelectItem value="low">Low Stock</SelectItem>
                            <SelectItem value="out">Out of Stock</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    {typeFilter !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                            Type: {typeFilter}
                        </Badge>
                    )}
                    {gradeFilter !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                            Grade: {gradeFilter}
                        </Badge>
                    )}
                    {stockFilter !== "all" && (
                        <Badge variant={
                            stockFilter === "low" ? "destructive" :
                                stockFilter === "out" ? "destructive" :
                                    "default"
                        } className="text-xs">
                            Stock: {stockFilter === "low" ? "Low" : stockFilter === "out" ? "Out" : "Healthy"}
                        </Badge>
                    )}
                    {searchTerm && (
                        <Badge variant="outline" className="text-xs">
                            Search: "{searchTerm}"
                        </Badge>
                    )}
                </div>
            )}

            {/* Products Table */}
            <div className="rounded-md border w-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {searchTerm || typeFilter !== "all" || gradeFilter !== "all" || stockFilter !== "all"
                                        ? "No products match your filters"
                                        : "No products available"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    Showing {table.getFilteredRowModel().rows.length} product(s)
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete
                            this product and remove all associated data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
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

            {alert && (
                <CustomAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}
        </div>
    );
}