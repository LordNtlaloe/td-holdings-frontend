'use client';

import { useState } from 'react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sale } from '@/types/sales';
import SalesAPI from '@/lib/api/sales';
import { toast } from 'sonner';

interface VoidSaleDialogProps {
    sale: Sale | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVoidSuccess: () => void;
    token: string;
}

export function VoidSaleDialog({
    sale,
    open,
    onOpenChange,
    onVoidSuccess,
    token,
}: VoidSaleDialogProps) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!sale) return null;

    const handleVoid = async () => {
        if (!reason.trim()) {
            setError('Please provide a reason for voiding this sale');
            return;
        }
        if (reason.trim().length < 5) {
            setError('Reason must be at least 5 characters');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await SalesAPI.voidSale(token, sale.id, { reason });
            toast.success('Sale voided successfully');
            onVoidSuccess();
            onOpenChange(false);
            setReason('');
        } catch (e: any) {
            const msg = e?.message ?? 'Failed to void sale';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-red-600">Void Sale</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. The sale will be marked as voided and inventory will be restored.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                            You are about to void sale #{sale.id.slice(-8).toUpperCase()} for{' '}
                            {sale.total.toLocaleString()} FCFA
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="void-reason">Reason for voiding</Label>
                        <Textarea
                            id="void-reason"
                            placeholder="Please provide a detailed reason..."
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setError(null);
                            }}
                            rows={4}
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                        <p>Sale details:</p>
                        <ul className="list-disc list-inside">
                            <li>Date: {new Date(sale.createdAt).toLocaleDateString()}</li>
                            <li>Items: {sale.saleItems?.length ?? 0}</li>
                            <li>Amount: {sale.total.toLocaleString()} FCFA</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleVoid} disabled={loading}>
                        {loading ? 'Voiding...' : 'Confirm Void'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}