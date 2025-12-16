'use client';

import { Employee, Store } from '@/types';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';

interface TransferEmployeeFormProps {
    control: Control<any>;
    employee?: Employee;
    stores?: Store[];
}

export function TransferEmployeeForm({ control, employee, stores }: TransferEmployeeFormProps) {
    return (
        <>
            {employee && (
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                    <div className="font-medium">Transferring Employee</div>
                    <div className="text-sm text-muted-foreground">
                        {employee.user.firstName} {employee.user.lastName} • {employee.position}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Current Store: {employee.store?.name || 'Unknown'}
                    </div>
                </div>
            )}

            <FormField
                control={control}
                name="newStoreId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>New Store *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new store" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {stores
                                    ?.filter((store) => store.id !== employee?.storeId)
                                    .map((store) => (
                                        <SelectItem key={store.id} value={store.id}>
                                            {store.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
                name="reason"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Transfer Reason *</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Explain the reason for this transfer..."
                                className="min-h-[100px]"
                                {...field}
                            />
                        </FormControl>
                        <FormDescription>
                            Provide detailed reason for the transfer (minimum 10 characters)
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
}