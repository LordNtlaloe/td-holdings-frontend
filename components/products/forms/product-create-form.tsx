'use client';

import { ProductType, ProductGrade, TireCategory, TireUsage } from '@/types';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CreateProductFormProps {
    control: Control<any>;
    stores?: { id: string; name: string }[];
}

export function CreateProductForm({ control, stores }: CreateProductFormProps) {
    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter product name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="basePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Base Price *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Type *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={ProductType.TIRE}>Tire</SelectItem>
                                            <SelectItem value={ProductType.BALE}>Bale</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="grade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Grade *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={ProductGrade.A}>Grade A</SelectItem>
                                            <SelectItem value={ProductGrade.B}>Grade B</SelectItem>
                                            <SelectItem value={ProductGrade.C}>Grade C</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="commodity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Commodity</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Rubber, Textile" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Type-specific Information (conditional) */}
            <FormField
                control={control}
                name="type"
                render={({ field }) => (
                    <>
                        {field.value === ProductType.TIRE && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Tire Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={control}
                                            name="tireSpecific.tireCategory"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tire Category</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value={TireCategory.NEW}>New</SelectItem>
                                                            <SelectItem value={TireCategory.SECOND_HAND}>Second Hand</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name="tireSpecific.tireUsage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tire Usage</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select usage" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value={TireUsage.FOUR_BY_FOUR}>4x4</SelectItem>
                                                            <SelectItem value={TireUsage.REGULAR}>Regular</SelectItem>
                                                            <SelectItem value={TireUsage.TRUCK}>Truck</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={control}
                                            name="tireSpecific.tireSize"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tire Size</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 205/55 R16" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name="tireSpecific.loadIndex"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Load Index</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 91" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={control}
                                            name="tireSpecific.speedRating"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Speed Rating</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., H" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name="tireSpecific.warrantyPeriod"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Warranty Period</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 1 year" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {field.value === ProductType.BALE && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Bale Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={control}
                                            name="baleSpecific.baleWeight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bale Weight (kg)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="e.g., 55"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name="baleSpecific.baleCategory"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bale Category</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Winter Jackets" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={control}
                                            name="baleSpecific.originCountry"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Origin Country</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., UK, USA" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={control}
                                            name="baleSpecific.importDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Import Date</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="date"
                                                            {...field}
                                                            value={field.value || ''}
                                                            onChange={(e) => field.onChange(e.target.value || undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            />

            {/* Store Assignment */}
            {stores && stores.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Store Assignment</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Select stores where this product will be available
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {stores.map((store) => (
                                <FormField
                                    key={store.id}
                                    control={control}
                                    name="storeAssignments"
                                    render={({ field }) => {
                                        const currentAssignments = field.value || [];
                                        const assignmentIndex = currentAssignments.findIndex(
                                            (assignment: any) => assignment.storeId === store.id
                                        );
                                        const isChecked = assignmentIndex !== -1;

                                        return (
                                            <div className="flex items-center space-x-2 p-3 border rounded-md">
                                                <Checkbox
                                                    id={`store-${store.id}`}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => {
                                                        const newAssignments = [...currentAssignments];
                                                        if (checked) {
                                                            newAssignments.push({ storeId: store.id });
                                                        } else {
                                                            newAssignments.splice(assignmentIndex, 1);
                                                        }
                                                        field.onChange(newAssignments);
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`store-${store.id}`}
                                                    className="flex-1 cursor-pointer text-sm"
                                                >
                                                    {store.name}
                                                </Label>
                                            </div>
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}