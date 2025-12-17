'use client';

import { Product } from '@/types';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AssignProductToStoresFormProps {
    control: Control<any>;
    product?: Product;
    stores?: { id: string; name: string }[];
}

export function AssignProductToStoresForm({ control, product, stores }: AssignProductToStoresFormProps) {
    const assignedStoreIds = product?.storeProducts?.map(sp => sp.storeId) || [];

    return (
        <div className="space-y-6">
            {product && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Product Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                                Currently assigned to {assignedStoreIds.length} store(s)
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Select Stores</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Choose stores to assign this product to. You can also set initial quantities.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={control}
                        name="storeIds"
                        render={({ field }) => (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {stores?.map((store) => {
                                        const isCurrentlyAssigned = assignedStoreIds.includes(store.id);
                                        const isChecked = field.value?.includes(store.id) || isCurrentlyAssigned;

                                        return (
                                            <div key={store.id} className="space-y-2">
                                                <div className="flex items-center space-x-2 p-3 border rounded-md">
                                                    <Checkbox
                                                        id={`store-${store.id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            const currentIds = field.value || [];
                                                            if (checked) {
                                                                field.onChange([...currentIds, store.id]);
                                                            } else {
                                                                field.onChange(currentIds.filter((id: string) => id !== store.id));
                                                            }
                                                        }}
                                                        disabled={isCurrentlyAssigned}
                                                    />
                                                    <Label
                                                        htmlFor={`store-${store.id}`}
                                                        className="flex-1 cursor-pointer text-sm"
                                                    >
                                                        {store.name}
                                                        {isCurrentlyAssigned && (
                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                (Already assigned)
                                                            </span>
                                                        )}
                                                    </Label>
                                                </div>

                                                {/* Initial quantity for selected stores */}
                                                <FormField
                                                    control={control}
                                                    name={`initialQuantities.${store.id}`}
                                                    render={({ field: quantityField }) => (
                                                        <div className="pl-7">
                                                            <Input
                                                                type="number"
                                                                placeholder="Initial quantity"
                                                                className="h-8 text-sm"
                                                                {...quantityField}
                                                                value={quantityField.value || ''}
                                                                onChange={(e) => quantityField.onChange(parseInt(e.target.value) || 0)}
                                                            />
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                <FormMessage />
                            </div>
                        )}
                    />

                    <div className="text-sm text-muted-foreground">
                        <p>• Leave quantity blank to assign without initial stock</p>
                        <p>• Products assigned to stores will be available for sale</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}