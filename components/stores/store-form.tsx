import { useState } from 'react';
import { Store, CreateStoreData, UpdateStoreData, StoreType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, X, Plus, Trash2 } from 'lucide-react';

interface StoreFormProps {
    store?: Store;
    onSubmit: (data: CreateStoreData | UpdateStoreData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: 'create' | 'edit';
}

export function StoreForm({ store, onSubmit, onCancel, isLoading = false, mode = 'create' }: StoreFormProps) {
    const [formData, setFormData] = useState<CreateStoreData>({
        name: store?.name || '',
        city: store?.city || '',
        type: store?.type || StoreType.BRANCH,
        address: store?.address || '',
        phone: store?.phone || '',
        email: store?.email || '',
        isMainStore: store?.isMainStore || false,
        latitude: store?.latitude,
        longitude: store?.longitude,
        weekdayHours: store?.weekdayHours || '8:00 AM - 6:00 PM',
        saturdayHours: store?.saturdayHours || '9:00 AM - 4:00 PM',
        sundayHours: store?.sundayHours || '10:00 AM - 2:00 PM',
        services: store?.services || [],
        features: store?.features || [],
        distanceInfo: store?.distanceInfo || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newService, setNewService] = useState('');
    const [newFeature, setNewFeature] = useState('');

    const handleChange = (field: keyof CreateStoreData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const addService = () => {
        if (newService.trim()) {
            setFormData((prev) => ({
                ...prev,
                services: [...(prev.services || []), newService.trim()],
            }));
            setNewService('');
        }
    };

    const removeService = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            services: prev.services?.filter((_, i) => i !== index) || [],
        }));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData((prev) => ({
                ...prev,
                features: [...(prev.features || []), newFeature.trim()],
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features?.filter((_, i) => i !== index) || [],
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) newErrors.name = 'Store name is required';
        if (!formData.city?.trim()) newErrors.city = 'City is required';
        if (!formData.address?.trim()) newErrors.address = 'Address is required';
        if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error: any) {
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
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>

                        <div className="grid grid-cols-2 gap-4">
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
                                <Label htmlFor="type">Store Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => handleChange('type', value as StoreType)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select store type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={StoreType.MAIN}>Main Store</SelectItem>
                                        <SelectItem value={StoreType.BRANCH}>Branch</SelectItem>
                                        <SelectItem value={StoreType.WAREHOUSE}>Warehouse</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Enter full address"
                                className={errors.address ? 'border-destructive' : ''}
                                rows={2}
                            />
                            {errors.address && (
                                <p className="text-sm text-destructive">{errors.address}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    placeholder="Enter city"
                                    className={errors.city ? 'border-destructive' : ''}
                                />
                                {errors.city && (
                                    <p className="text-sm text-destructive">{errors.city}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    value={formData.latitude || ''}
                                    onChange={(e) => handleChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    placeholder="0.0000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    value={formData.longitude || ''}
                                    onChange={(e) => handleChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    placeholder="0.0000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Contact Information</h3>

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
                    </div>

                    {/* Operating Hours */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Operating Hours</h3>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weekdayHours">Weekday Hours</Label>
                                <Input
                                    id="weekdayHours"
                                    value={formData.weekdayHours}
                                    onChange={(e) => handleChange('weekdayHours', e.target.value)}
                                    placeholder="8:00 AM - 6:00 PM"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="saturdayHours">Saturday Hours</Label>
                                <Input
                                    id="saturdayHours"
                                    value={formData.saturdayHours || ''}
                                    onChange={(e) => handleChange('saturdayHours', e.target.value)}
                                    placeholder="9:00 AM - 4:00 PM"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sundayHours">Sunday Hours</Label>
                                <Input
                                    id="sundayHours"
                                    value={formData.sundayHours || ''}
                                    onChange={(e) => handleChange('sundayHours', e.target.value)}
                                    placeholder="10:00 AM - 2:00 PM"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Features</h3>

                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Add feature (e.g., Parking, WiFi)"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                />
                                <Button type="button" onClick={addFeature} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.features?.map((feature, index) => (
                                    <Badge key={index} variant="secondary" className="gap-1">
                                        {feature}
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Services</h3>

                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    value={newService}
                                    onChange={(e) => setNewService(e.target.value)}
                                    placeholder="Add service (e.g., Delivery, Installation)"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                                />
                                <Button type="button" onClick={addService} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.services?.map((service, index) => (
                                    <Badge key={index} variant="outline" className="gap-1">
                                        {service}
                                        <button
                                            type="button"
                                            onClick={() => removeService(index)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Additional Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="distanceInfo">Distance/Location Info</Label>
                            <Input
                                id="distanceInfo"
                                value={formData.distanceInfo || ''}
                                onChange={(e) => handleChange('distanceInfo', e.target.value)}
                                placeholder="e.g., 5 miles from downtown"
                            />
                        </div>

                        <div className="flex items-center justify-between">
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

                    <div className="flex justify-end gap-3 pt-4">
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