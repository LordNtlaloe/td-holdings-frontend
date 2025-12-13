// components/dashboard/employees/employee-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Employee } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Edit,
    Trash2,
    Eye,
    User,
    Phone,
    Store,
    Mail,
    TrendingUp,
    Shield,
    UserCheck,
    UserX
} from "lucide-react";
import Link from "next/link";

interface UseEmployeeColumnsProps {
    onDelete: (id: string) => void;
    onDeactivate?: (id: string, name: string) => void;
    isPending: boolean;
}

export function useEmployeeColumns({
    onDelete,
    onDeactivate,
    isPending
}: UseEmployeeColumnsProps): ColumnDef<Employee>[] {
    return [
        {
            accessorKey: "fullName",
            header: "Employee",
            cell: ({ row }) => {
                const employee = row.original;
                return (
                    <Link
                        href={`/employees/${employee.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                    >
                        <User className="h-4 w-4" />
                        {employee.firstName} {employee.lastName}
                    </Link>
                );
            },
        },
        {
            accessorKey: "position",
            header: "Position",
            cell: ({ row }) => {
                const position = row.getValue("position") as string;
                return (
                    <Badge
                        variant="outline"
                        className="text-xs capitalize"
                    >
                        {position.toLowerCase()}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "user.role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.original.user?.role;
                return (
                    <Badge
                        variant={
                            role === 'ADMIN' ? 'default' :
                                role === 'MANAGER' ? 'secondary' :
                                    role === 'CASHIER' ? 'outline' : 'secondary'
                        }
                        className={`text-xs ${role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                                    role === 'CASHIER' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                            }`}
                    >
                        <Shield className="h-3 w-3 mr-1" />
                        {role}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "phone",
            header: "Contact",
            cell: ({ row }) => {
                const employee = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span>{employee.phoneNumber}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "user.email",
            header: "Email",
            cell: ({ row }) => {
                const email = row.original.user?.email;
                return (
                    <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span className="truncate">{email || 'N/A'}</span>
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
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                    >
                        <Store className="h-3 w-3" />
                        {store.name}
                    </Link>
                );
            },
        },
        {
            accessorKey: "salesCount",
            header: "Sales",
            cell: ({ row }) => {
                const salesCount = row.getValue("salesCount") as number;
                return (
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{salesCount.toLocaleString()}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "user.isActive",
            header: "Status",
            cell: ({ row }) => {
                const isActive = row.original.user?.isActive;
                return (
                    <Badge
                        variant={isActive ? 'default' : 'destructive'}
                        className="text-xs"
                    >
                        {isActive ? (
                            <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Active
                            </>
                        ) : (
                            <>
                                <UserX className="h-3 w-3 mr-1" />
                                Inactive
                            </>
                        )}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const employee = row.original;
                const isActive = employee.user?.isActive;

                return (
                    <div className="flex space-x-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            asChild
                        >
                            <Link href={`/employees/${employee.id}`}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            asChild
                        >
                            <Link href={`/employees/${employee.id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        {isActive && onDeactivate && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDeactivate(employee.id, `${employee.firstName} ${employee.lastName}`)}
                                disabled={isPending}
                            >
                                <UserX className="h-4 w-4 text-orange-500" />
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(employee.id)}
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