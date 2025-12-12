// components/dashboard/stores/store-employees.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus, Mail, Phone } from "lucide-react";
import { getStoreEmployees } from "@/lib/store-api";

interface StoreEmployeesProps {
    storeId: string;
}

export default function StoreEmployees({ storeId }: StoreEmployeesProps) {
    const [employees, setEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, [storeId]);

    const fetchEmployees = async () => {
        try {
            setIsLoading(true);
            const result = await getStoreEmployees(storeId);

            if (result.success) {
                setEmployees(result.data || []);
            }
        } catch (err) {
            console.error("Error fetching employees:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        Store Employees
                    </h2>
                    <p className="text-muted-foreground">
                        {employees.length} employee{employees.length !== 1 ? 's' : ''} working at this store
                    </p>
                </div>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                </Button>
            </div>

            {employees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employees.map((employee) => (
                        <Card key={employee.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start space-x-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">
                                            {employee.user?.firstName} {employee.user?.lastName}
                                        </h3>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {employee.position || "Employee"}
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-3 w-3" />
                                                <span>{employee.user?.email}</span>
                                            </div>
                                            {employee.phone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{employee.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Employees</h3>
                            <p className="text-gray-500 mb-6">
                                No employees are currently assigned to this store.
                            </p>
                            <Button>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add First Employee
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}