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
import { Store, Employee } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building } from 'lucide-react';

interface TransferEmployeeFormProps {
    control: Control<any>;
    employee?: Employee;
    stores?: Store[];
}

export function TransferEmployeeForm({ control, employee, stores = [] }: TransferEmployeeFormProps) {
    // Filter out current store from destination options
    const availableStores = stores.filter(s => s.id !== employee?.storeId);

    return (
        <div className="space-y-4">
            {/* Employee Summary */}
            {employee && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium">
                        Transferring: {employee.user?.firstName} {employee.user?.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>Current Store: {employee.store?.name}</span>
                    </div>
                    {employee.position && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Position: {employee.position}
                        </p>
                    )}
                </div>
            )}

            <FormField
                control={control}
                name="newStoreId"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Destination Store *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select destination store" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {availableStores.length > 0 ? (
                                    availableStores.map((store) => (
                                        <SelectItem key={store.id} value={store.id}>
                                            {store.name} {store.isMainStore ? '(Main Store)' : ''}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-stores" disabled>
                                        No other stores available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            Select the store to transfer the employee to
                        </FormDescription>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="reason"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reason for Transfer</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="e.g., Store reassignment, promotion, staffing needs"
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormDescription>
                            Optional reason for the transfer
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Warning if no stores available */}
            {availableStores.length === 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No other stores available for transfer. The employee is already assigned to the only available store.
                    </AlertDescription>
                </Alert>
            )}

            {/* Transfer impact notice */}
            {availableStores.length > 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-1">
                            <p className="font-medium">Transfer Impact:</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                <li>Employee's store assignment will be updated</li>
                                <li>A transfer record will be created for history</li>
                                <li>User account will be updated to reflect new store</li>
                                <li>All future sales will be associated with new store</li>
                            </ul>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}