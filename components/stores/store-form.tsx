import { useState } from 'react';
import { Store, CreateStoreData, UpdateStoreData } from '@/types';
import { storeSchema, storeUpdateSchema } from '@/lib/validations/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';

interface StoreFormProps {
    store?: Store;
    onSubmit: (data: CreateStoreData | UpdateStoreData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function StoreForm({ store, onSubmit, onCancel, isLoading = false, mode = 'create' }: StoreFormProps) {
    const [formData, setFormData] = useState<CreateStoreData | UpdateStoreData>({
        name: store?.name || '',
        location: store?.location || '',
        phone: store?.phone || '',
        email: store?.email || '',
        isMainStore: store?.isMainStore || false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: keyof CreateStoreData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const schema = mode === 'create' ? storeSchema : storeUpdateSchema;
        const { error } = schema.validate(formData, { abortEarly: false });

        if (error) {
            const newErrors: Record<string, string> = {};
            error.details.forEach((detail) => {
                const field = detail.path[0] as string;
                newErrors[field] = detail.message;
            });
            setErrors(newErrors);
            return false;
        }

        setErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error: any) {
            // Handle API validation errors
            if (error.message.includes('STORE_EXISTS')) {
                setErrors({ email: 'A store with this email already exists' });
            } else if (error.message.includes('MAIN_STORE_EXISTS')) {
                setErrors({ isMainStore: 'A main store already exists' });
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{mode === 'create' ? 'Create New Store' : 'Edit Store'}</CardTitle>
                <CardDescription>
                    {mode === 'create'
                        ? 'Add a new store to your system'
                        : 'Update store information'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Store Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter store name"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                placeholder="Enter store location"
                                className={errors.location ? 'border-destructive' : ''}
                            />
                            {errors.location && (
                                <p className="text-sm text-destructive">{errors.location}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="(123) 456-7890"
                                    className={errors.phone ? 'border-destructive' : ''}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive">{errors.phone}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="store@example.com"
                                    className={errors.email ? 'border-destructive' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between space-y-2">
                            <div className="space-y-0.5">
                                <Label htmlFor="isMainStore">Main Store</Label>
                                <p className="text-sm text-muted-foreground">
                                    Set this store as the main store
                                </p>
                            </div>
                            <Switch
                                id="isMainStore"
                                checked={formData.isMainStore}
                                onCheckedChange={(checked) => handleChange('isMainStore', checked)}
                                disabled={store?.isMainStore && mode === 'edit'}
                            />
                        </div>
                        {errors.isMainStore && (
                            <p className="text-sm text-destructive">{errors.isMainStore}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {mode === 'create' ? 'Creating...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {mode === 'create' ? 'Create Store' : 'Save Changes'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}