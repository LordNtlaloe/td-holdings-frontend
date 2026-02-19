'use client';

import { useState, useEffect } from 'react';
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
import { Store, Role } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import StoreAPI from '@/lib/api/stores';

// Define proper types for the API response
interface StoresApiResponse {
    data?: Store[];
    stores?: Store[];
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

interface NestedApiResponse {
    data: {
        data: Store[];
        meta?: any;
    };
}

interface CreateEmployeeFormProps {
    control: Control<any>;
    stores?: Store[];
}

export function CreateEmployeeForm({ control, stores: propStores }: CreateEmployeeFormProps) {
    const { accessToken } = useAuth();
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Debug logs
    useEffect(() => {
        console.log('🔍 CreateEmployeeForm - Props:', {
            propStores,
            hasPropStores: !!propStores,
            propStoresLength: propStores?.length,
            accessToken: !!accessToken
        });
    }, [propStores, accessToken]);

    useEffect(() => {
        console.log('📊 CreateEmployeeForm - State:', {
            stores: stores,
            storesLength: stores.length,
            loading,
            error
        });
    }, [stores, loading, error]);

    useEffect(() => {
        const fetchStores = async () => {
            // If stores are provided as props, use them
            if (propStores && propStores.length > 0) {
                console.log('✅ Using provided stores from props:', propStores);
                setStores(propStores);
                setLoading(false);
                return;
            }

            // Check authentication
            if (!accessToken) {
                console.log('❌ No access token available');
                setError('Authentication required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log('🔄 Fetching stores from API...');
                const response = await StoreAPI.getStores(accessToken, {
                    limit: 100,
                    isActive: true,
                });

                console.log('📦 API Response:', response);

                // Handle different response structures with proper typing
                let storesData: Store[] = [];
                
                if (response && typeof response === 'object') {
                    // Check if response is directly an array
                    if (Array.isArray(response)) {
                        storesData = response;
                    }
                    // Check for { data: [...] } format
                    else if ('data' in response && Array.isArray(response.data)) {
                        storesData = response.data;
                    }
                    // Check for { stores: [...] } format
                    else if ('stores' in response && Array.isArray(response.stores)) {
                        storesData = response.stores;
                    }
                    // Check for nested { data: { data: [...] } } format
                    else if ('data' in response && 
                             response.data && 
                             typeof response.data === 'object' &&
                             'data' in response.data && 
                             Array.isArray(response.data.data)) {
                        // Safe type assertion with fallback
                        const nestedResponse = response as any;
                        storesData = nestedResponse.data.data || [];
                    }
                }

                console.log('✅ Processed stores data:', storesData);
                setStores(storesData);
            } catch (err: any) {
                console.error('❌ Error fetching stores:', err);
                setError(err.message || 'Failed to load stores');
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, [accessToken, propStores]);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">User Account Information</h3>
                <p className="text-sm text-muted-foreground">
                    Create a new user account for the employee
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="John"
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
                    name="lastName"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Doe"
                                    {...field}
                                    value={field.value || ''}
                                    className={fieldState.error ? 'border-destructive' : ''}
                                />
                            </FormControl>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                            <Input
                                type="email"
                                placeholder="john.doe@example.com"
                                {...field}
                                value={field.value || ''}
                                className={fieldState.error ? 'border-destructive' : ''}
                            />
                        </FormControl>
                        <FormDescription>
                            This will be used as the login email
                        </FormDescription>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="+266 1234 5678"
                                    {...field}
                                    value={field.value || ''}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="password"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    value={field.value || ''}
                                    className={fieldState.error ? 'border-destructive' : ''}
                                />
                            </FormControl>
                            <FormDescription>
                                Minimum 6 characters
                            </FormDescription>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-2 pt-4">
                <h3 className="text-lg font-medium">Employee Information</h3>
                <p className="text-sm text-muted-foreground">
                    Set up the employee's work details
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Store Select Field */}
                <FormField
                    control={control}
                    name="storeId"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Store *</FormLabel>

                            <Select
                                onValueChange={(value) => {
                                    console.log('Selected store:', value);
                                    field.onChange(value);
                                }}
                                value={field.value || ''}
                                disabled={loading}
                            >
                                <FormControl>
                                    <SelectTrigger 
                                        className={fieldState.error ? 'border-destructive' : ''}
                                    >
                                        <SelectValue 
                                            placeholder={
                                                loading 
                                                    ? 'Loading stores...' 
                                                    : error 
                                                        ? 'Error loading stores' 
                                                        : stores.length === 0 
                                                            ? 'No stores available'
                                                            : 'Select a store'
                                            }
                                        />
                                    </SelectTrigger>
                                </FormControl>

                                <SelectContent>
                                    {loading ? (
                                        <div className="flex items-center justify-center p-4 min-w-50">
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            <span>Loading stores...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="p-4 text-center text-destructive min-w-50">
                                            <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                                            <p className="text-sm">{error}</p>
                                        </div>
                                    ) : stores.length > 0 ? (
                                        stores.map((store) => (
                                            <SelectItem 
                                                key={store.id} 
                                                value={store.id}
                                                className="cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{store.name}</span>
                                                    {store.isMainStore && (
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                            Main
                                                        </span>
                                                    )}
                                                    {store.city && (
                                                        <span className="text-xs text-muted-foreground">
                                                            ({store.city})
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-muted-foreground min-w-50">
                                            <p>No stores available</p>
                                            <p className="text-xs mt-1">
                                                {accessToken 
                                                    ? 'Check your connection or try again' 
                                                    : 'Please log in to view stores'}
                                            </p>
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>

                            {field.value && (
                                <FormDescription>
                                    Selected store: {stores.find(s => s.id === field.value)?.name || field.value}
                                </FormDescription>
                            )}

                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="position"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Position *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g., Sales Associate"
                                    {...field}
                                    value={field.value || ''}
                                    className={fieldState.error ? 'border-destructive' : ''}
                                />
                            </FormControl>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="role"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Role *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
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
                    name="hireDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hire Date</FormLabel>
                            <FormControl>
                                <Input 
                                    type="date" 
                                    {...field} 
                                    value={field.value || ''} 
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            {Object.keys(control._formState.errors).length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please fix the errors above before submitting
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}