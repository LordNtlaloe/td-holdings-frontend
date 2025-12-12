// app/(dashboard)/stores/page.tsx
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
import { Store } from "@/types";
import Link from "next/link";
import { CustomAlert } from "@/components/ui/custom-alert";
import { TableSkeleton } from "@/components/general/skeletons/table-skeleton";
import { useStoreColumns } from "./stores-columns";
import { deleteStore, getAllStores } from "@/lib/store-api";
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
import { LoaderCircle } from "lucide-react";

type StoresProps = {
    stores?: Store[];
};

export default function StoresTable({ stores: initialStores = [] }: StoresProps) {
    const [stores, setStores] = useState<Store[]>(initialStores);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(!initialStores.length);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [storeToDelete, setStoreToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns = useStoreColumns({
        onDelete: (id: string) => {
            setStoreToDelete(id);
            setDeleteDialogOpen(true);
        },
        isPending,
    });

    const table = useReactTable({
        data: stores,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            globalFilter: searchTerm,
        },
        onGlobalFilterChange: setSearchTerm,
    });

    const fetchStores = useCallback(async () => {
        try {
            setIsLoading(true);
            const fetchedStores = await getAllStores();
            setStores(fetchedStores || []);
        } catch (err) {
            setAlert({
                message: `Failed to load stores: ${err instanceof Error ? err.message : String(err)}`,
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialStores.length) {
            fetchStores();
        }
    }, [initialStores.length, fetchStores]);

    const handleConfirmDelete = async () => {
        if (!storeToDelete) return;

        startTransition(async () => {
            try {
                setIsDeleting(true);
                const result = await deleteStore(storeToDelete);

                if (result.success) {
                    setStores(stores.filter(store => store.id !== storeToDelete));
                    setAlert({ message: "Store deleted successfully.", type: "success" });
                    setDeleteDialogOpen(false);
                } else {
                    setAlert({ message: result.error || "Failed to delete store.", type: "error" });
                }
            } catch (err) {
                setAlert({
                    message: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`,
                    type: "error"
                });
            } finally {
                setIsDeleting(false);
                setStoreToDelete(null);
            }
        });
    };

    if (isLoading) {
        return <TableSkeleton rowCount={5} columnCount={7} showHeader={true} />;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Input
                    className="w-1/4"
                    placeholder="Search stores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Link href="/stores/create">
                    <Button variant="secondary">Add New Store</Button>
                </Link>
            </div>

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
                                    {searchTerm ? "No matching stores found" : "No stores available"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    Showing {table.getFilteredRowModel().rows.length} store(s)
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
                            this store and remove all associated data from our servers.
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
                                'Delete Store'
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