// components/dashboard/employees/employees-table.tsx
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
import { Employee } from "@/types";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Filter,
    UserPlus,
    LoaderCircle,
    Download,
    Upload,
    RefreshCw
} from "lucide-react";
import { getAllEmployeesWithParams, deleteEmployee, deactivateEmployee, exportEmployees, bulkImportEmployees } from "@/lib/employee-api";
import { useEmployeeColumns } from "./employee-table-columns";


interface EmployeesTableProps {
    initialEmployees?: Employee[];
    total?: number;
}

export default function EmployeesTable({
    initialEmployees = [],
    total = 0
}: EmployeesTableProps) {
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(!initialEmployees.length);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [positionFilter, setPositionFilter] = useState<string>("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
    const [employeeToDeactivate, setEmployeeToDeactivate] = useState<{ id: string, name: string } | null>(null);
    const [deactivateReason, setDeactivateReason] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const columns = useEmployeeColumns({
        onDelete: (id: string) => {
            setEmployeeToDelete(id);
            setDeleteDialogOpen(true);
        },
        onDeactivate: (id: string, name: string) => {
            setEmployeeToDeactivate({ id, name });
            setDeactivateDialogOpen(true);
        },
        isPending,
    });

    const table = useReactTable({
        data: employees,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            globalFilter: searchTerm,
        },
        onGlobalFilterChange: setSearchTerm,
    });

    const fetchEmployees = useCallback(async () => {
        try {
            setIsLoading(true);
            const filters: any = {};

            if (roleFilter !== "all") filters.role = roleFilter;
            if (statusFilter !== "all") filters.status = statusFilter;
            if (positionFilter !== "all") filters.position = positionFilter;
            if (searchTerm) filters.search = searchTerm;

            const result = await getAllEmployeesWithParams({
                ...filters,
                page: 1,
                limit: 50,
            });
            setEmployees(result.employees || []);
        } catch (err) {
            setAlert({
                message: `Failed to load employees: ${err instanceof Error ? err.message : String(err)}`,
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    }, [roleFilter, statusFilter, positionFilter, searchTerm]);

    useEffect(() => {
        if (!initialEmployees.length) {
            fetchEmployees();
        }
    }, [initialEmployees.length, fetchEmployees]);

    const handleConfirmDelete = async () => {
        if (!employeeToDelete) return;

        startTransition(async () => {
            try {
                setIsDeleting(true);
                const result = await deleteEmployee(employeeToDelete);

                if (result.success) {
                    setEmployees(employees.filter(employee => employee.id !== employeeToDelete));
                    setAlert({ message: "Employee deleted successfully.", type: "success" });
                    setDeleteDialogOpen(false);
                } else {
                    setAlert({ message: result.error || "Failed to delete employee.", type: "error" });
                }
            } catch (err) {
                setAlert({
                    message: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`,
                    type: "error"
                });
            } finally {
                setIsDeleting(false);
                setEmployeeToDelete(null);
            }
        });
    };

    const handleConfirmDeactivate = async () => {
        if (!employeeToDeactivate || !deactivateReason.trim()) return;

        startTransition(async () => {
            try {
                setIsDeactivating(true);
                const result = await deactivateEmployee(employeeToDeactivate.id, deactivateReason);

                if (result.success) {
                    // Update employee status in local state
                    setEmployees(employees.map(emp =>
                        emp.id === employeeToDeactivate.id
                            ? {
                                ...emp,
                                user: emp.user ? { ...emp.user, isActive: false } : undefined
                            }
                            : emp
                    ));
                    setAlert({ message: "Employee deactivated successfully.", type: "success" });
                    setDeactivateDialogOpen(false);
                    setDeactivateReason("");
                } else {
                    setAlert({ message: result.error || "Failed to deactivate employee.", type: "error" });
                }
            } catch (err) {
                setAlert({
                    message: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`,
                    type: "error"
                });
            } finally {
                setIsDeactivating(false);
                setEmployeeToDeactivate(null);
            }
        });
    };

    const handleExport = async (format: 'csv' | 'json' = 'csv') => {
        try {
            const result = await exportEmployees(format);

            if (result.success && result.data) {
                if (format === 'csv') {
                    // Create and download CSV file
                    const blob = new Blob([result.data], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }
                setAlert({ message: `Employees exported successfully as ${format.toUpperCase()}`, type: "success" });
            } else {
                setAlert({ message: result.error || "Failed to export employees", type: "error" });
            }
        } catch (err) {
            setAlert({
                message: `Export failed: ${err instanceof Error ? err.message : String(err)}`,
                type: "error"
            });
        }
    };

    const handleImport = async () => {
        if (!importFile) {
            setAlert({ message: "Please select a file to import", type: "error" });
            return;
        }

        try {
            setIsImporting(true);
            const result = await bulkImportEmployees(importFile);

            if (result.success) {
                setAlert({
                    message: `Successfully imported ${result.data?.imported || 0} employees`,
                    type: "success"
                });
                setImportDialogOpen(false);
                setImportFile(null);
                fetchEmployees(); // Refresh the list
            } else {
                setAlert({ message: result.error || "Failed to import employees", type: "error" });
            }
        } catch (err) {
            setAlert({
                message: `Import failed: ${err instanceof Error ? err.message : String(err)}`,
                type: "error"
            });
        } finally {
            setIsImporting(false);
        }
    };

    const clearFilters = () => {
        setRoleFilter("all");
        setStatusFilter("all");
        setPositionFilter("all");
        setSearchTerm("");
    };

    const hasActiveFilters = roleFilter !== "all" || statusFilter !== "all" || positionFilter !== "all" || searchTerm;

    if (isLoading) {
        return <TableSkeleton rowCount={5} columnCount={9} showHeader={true} />;
    }

    return (
        <div className="space-y-4">
            {/* Header with Actions */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search employees by name, email, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500 whitespace-nowrap">Filters:</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                            <SelectItem value="STAFF">Staff</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Position" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Positions</SelectItem>
                            <SelectItem value="Sales Associate">Sales</SelectItem>
                            <SelectItem value="Store Manager">Store Manager</SelectItem>
                            <SelectItem value="Inventory Manager">Inventory</SelectItem>
                            <SelectItem value="Cashier">Cashier</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex flex-wrap gap-2">
                    <Link href="/employees/create">
                        <Button size="sm">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Employee
                        </Button>
                    </Link>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setImportDialogOpen(true)}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport('csv')}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchEmployees}
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    {roleFilter !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                            Role: {roleFilter}
                        </Badge>
                    )}
                    {statusFilter !== "all" && (
                        <Badge variant={statusFilter === "active" ? "default" : "destructive"} className="text-xs">
                            Status: {statusFilter}
                        </Badge>
                    )}
                    {positionFilter !== "all" && (
                        <Badge variant="outline" className="text-xs">
                            Position: {positionFilter}
                        </Badge>
                    )}
                    {searchTerm && (
                        <Badge variant="outline" className="text-xs">
                            Search: "{searchTerm}"
                        </Badge>
                    )}
                </div>
            )}

            {/* Employees Table */}
            <div className="rounded-md border overflow-auto">
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
                                    {hasActiveFilters
                                        ? "No employees match your filters"
                                        : "No employees found. Add your first employee to get started."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Table Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="text-sm text-muted-foreground">
                    Showing {table.getFilteredRowModel().rows.length} employee(s) of {total}
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
                            This action cannot be undone. This will permanently delete this employee
                            and remove all associated data from our servers.
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
                                'Delete Employee'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Deactivate Confirmation Dialog */}
            <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate Employee</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to deactivate {employeeToDeactivate?.name}?
                            They will lose access to the system until reactivated.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <label htmlFor="deactivate-reason" className="block text-sm font-medium mb-2">
                            Reason for deactivation (required):
                        </label>
                        <Input
                            id="deactivate-reason"
                            placeholder="Enter reason for deactivation"
                            value={deactivateReason}
                            onChange={(e) => setDeactivateReason(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeactivating}
                            onClick={() => {
                                setDeactivateReason("");
                                setDeactivateDialogOpen(false);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDeactivate}
                            disabled={isDeactivating || !deactivateReason.trim()}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {isDeactivating ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                    Deactivating...
                                </>
                            ) : (
                                'Deactivate Employee'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Import Dialog */}
            <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Import Employees</AlertDialogTitle>
                        <AlertDialogDescription>
                            Upload a CSV file with employee data. Ensure the file includes the required columns.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <Input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                className="cursor-pointer"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Supports CSV files with columns: firstName, lastName, email, phone, position, role
                            </p>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isImporting}
                            onClick={() => {
                                setImportFile(null);
                                setImportDialogOpen(false);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleImport}
                            disabled={isImporting || !importFile}
                        >
                            {isImporting ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                    Importing...
                                </>
                            ) : (
                                'Import Employees'
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
                    autoClose={true}
                />
            )}
        </div>
    );
}