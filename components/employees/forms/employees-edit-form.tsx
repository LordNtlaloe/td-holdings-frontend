'use client';

import { Control } from 'react-hook-form';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Role, EmployeeStatus } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EditEmployeeFormProps {
    control: Control<any>;
}

export function EditEmployeeForm({ control }: EditEmployeeFormProps) {
    // Watch the status field to conditionally show termination date
    const status = control._formValues.status;

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="position"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="e.g., Senior Sales Associate"
                                {...field}
                                value={field.value || ''}
                                className={fieldState.error ? 'border-destructive' : ''}
                            />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="role"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value={Role.ADMIN}>Administrator</SelectItem>
                                <SelectItem value={Role.MANAGER}>Manager</SelectItem>
                                <SelectItem value={Role.CASHIER}>Cashier</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="status"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value={EmployeeStatus.ACTIVE}>Active</SelectItem>
                                <SelectItem value={EmployeeStatus.INACTIVE}>Inactive</SelectItem>
                                <SelectItem value={EmployeeStatus.ON_LEAVE}>On Leave</SelectItem>
                                <SelectItem value={EmployeeStatus.TERMINATED}>Terminated</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />

            {status === EmployeeStatus.TERMINATED && (
                <FormField
                    control={control}
                    name="terminationDate"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Termination Date *</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    {...field}
                                    value={field.value || ''}
                                    className={fieldState.error ? 'border-destructive' : ''}
                                />
                            </FormControl>
                            <FormDescription>
                                Required when terminating an employee
                            </FormDescription>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />
            )}

            {/* Warning for termination */}
            {status === EmployeeStatus.TERMINATED && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Terminating an employee will deactivate their user account and prevent login.
                        This action can be reversed by reactivating the employee.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}