'use client';

import { Product, ProductGrade, TireCategory, TireUsage } from '@/types';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditProductFormProps {
    control: Control<any>;
    product: Product;
}

export function EditProductForm({ control, product }: EditProductFormProps) {
    return (
        <div className="space-y-6">
            <div className="p-3 bg-muted rounded-lg mb-4">
                <div className="font-medium">Editing Product</div>
                <div className="text-sm text-muted-foreground">
                    {product.name} • {product.type} • Grade {product.grade}
                </div>
            </div>

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
                                <FormLabel>Product Name</FormLabel>
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
                                    <FormLabel>Base Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
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
                            name="grade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Grade</FormLabel>
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
                    </div>

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
                </CardContent>
            </Card>

            {/* Type-specific Information */}
            {product.type === 'TIRE' && (
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

            {product.type === 'BALE' && (
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
        </div>
    );
}