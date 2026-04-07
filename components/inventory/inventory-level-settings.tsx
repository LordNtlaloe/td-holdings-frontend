// components/inventory/InventoryLevelsSettings.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import InventoryAPI from '@/lib/api/inventory';
import { useAuth } from '@/contexts/auth-context';
import { Inventory } from '@/types';

interface InventoryLevelsSettingsProps {
    inventory: Inventory;
    onSuccess?: () => void;
}

const InventoryLevelsSettings = ({ inventory, onSuccess }: InventoryLevelsSettingsProps) => {
    const { accessToken: token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        reorderLevel: inventory.reorderLevel || '',
        optimalLevel: inventory.optimalLevel || '',
        storePrice: inventory.storePrice || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validation
        const validation = InventoryAPI.validateLevelsData({
            productId: inventory.productId,
            storeId: inventory.store?.id as string,
            reorderLevel: formData.reorderLevel ? Number(formData.reorderLevel) : undefined,
            optimalLevel: formData.optimalLevel ? Number(formData.optimalLevel) : undefined,
            storePrice: formData.storePrice ? Number(formData.storePrice) : undefined
        });

        if (!validation.isValid) {
            setError(validation.errors.join(', '));
            return;
        }

        try {
            setLoading(true);

            await InventoryAPI.setInventoryLevels(token!, {
                productId: inventory.productId,
                storeId: inventory.store?.id as string,
                reorderLevel: formData.reorderLevel ? Number(formData.reorderLevel) : undefined,
                optimalLevel: formData.optimalLevel ? Number(formData.optimalLevel) : undefined,
                storePrice: formData.storePrice ? Number(formData.storePrice) : undefined
            });

            setSuccess(true);
            if (onSuccess) onSuccess();

            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update inventory levels');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory Settings</CardTitle>
                <CardDescription>
                    Configure reorder levels and pricing for this inventory item
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current Status */}
                    <div className="space-y-2">
                        <Label>Current Status</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-accent rounded-lg">
                                <div className="text-sm text-muted-foreground">Current Stock</div>
                                <div className="text-2xl font-bold">{inventory.quantity}</div>
                            </div>
                            <div className="text-center p-3 bg-accent rounded-lg">
                                <div className="text-sm text-muted-foreground">Base Price</div>
                                <div className="text-xl font-semibold">
                                    {InventoryAPI.formatCurrency(inventory.product?.basePrice || 0)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settings Form */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="reorderLevel">Reorder Level</Label>
                                <Input
                                    id="reorderLevel"
                                    type="number"
                                    min="0"
                                    value={formData.reorderLevel}
                                    onChange={(e) => setFormData(prev => ({ ...prev, reorderLevel: e.target.value }))}
                                    placeholder="e.g., 10"
                                />
                                <p className="text-xs text-muted-foreground">
                                    When stock reaches this level, system will alert for reorder
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="optimalLevel">Optimal Level</Label>
                                <Input
                                    id="optimalLevel"
                                    type="number"
                                    min="0"
                                    value={formData.optimalLevel}
                                    onChange={(e) => setFormData(prev => ({ ...prev, optimalLevel: e.target.value }))}
                                    placeholder="e.g., 50"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Target stock level after reorder
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="storePrice">Store Price</Label>
                                <Input
                                    id="storePrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.storePrice}
                                    onChange={(e) => setFormData(prev => ({ ...prev, storePrice: e.target.value }))}
                                    placeholder="e.g., 99.99"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Store-specific price (overrides base price)
                                </p>
                            </div>
                        </div>

                        {/* Recommendations */}
                        {inventory.quantity > 0 && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="space-y-1">
                                        <div>Current stock: {inventory.quantity} units</div>
                                        {formData.reorderLevel && (
                                            <div>
                                                At current levels, you have{' '}
                                                {Math.floor(inventory.quantity / Number(formData.reorderLevel))}x
                                                the reorder quantity
                                            </div>
                                        )}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Validation Warnings */}
                        {formData.reorderLevel && formData.optimalLevel &&
                            Number(formData.reorderLevel) >= Number(formData.optimalLevel) && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        Reorder level should be lower than optimal level for effective inventory management.
                                    </AlertDescription>
                                </Alert>
                            )}

                        {/* Success/Error Messages */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert>
                                <AlertDescription>
                                    Inventory settings updated successfully!
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setFormData({
                                    reorderLevel: inventory.reorderLevel || '',
                                    optimalLevel: inventory.optimalLevel || '',
                                    storePrice: inventory.storePrice || ''
                                });
                                setError(null);
                                setSuccess(false);
                            }}
                            disabled={loading}
                        >
                            Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Save Settings
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default InventoryLevelsSettings;