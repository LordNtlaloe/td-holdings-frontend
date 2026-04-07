'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RotateCcw, Vault, CheckCircle2, AlertCircle } from 'lucide-react';

interface CashDrawerCardProps {
    revenue: number;
}

const OPENING_BALANCE = 1000;

export function CashDrawerCard({ revenue }: CashDrawerCardProps) {
    const [isReconciling, setIsReconciling] = useState(false);
    const [counted, setCounted] = useState('');
    const [reconciled, setReconciled] = useState(false);

    const expectedCash = OPENING_BALANCE + revenue;
    const countedNum = parseFloat(counted) || 0;
    const variance = countedNum - expectedCash;
    const hasVariance = counted !== '' && Math.abs(variance) > 0.01;

    const handleReconcile = () => {
        if (!isReconciling) {
            setIsReconciling(true);
            setReconciled(false);
            setCounted('');
            return;
        }
        // Submit reconciliation
        console.log('Reconciliation submitted:', { expected: expectedCash, counted: countedNum, variance });
        setIsReconciling(false);
        setReconciled(true);
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Vault className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">Cash Drawer</CardTitle>
                    </div>
                    {reconciled && (
                        <Badge variant="default" className="gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            Reconciled
                        </Badge>
                    )}
                </div>
                <CardDescription>Current drawer balance and reconciliation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2 rounded-md border p-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Opening balance</span>
                        <span className="font-mono font-medium">
                            LSL {OPENING_BALANCE.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Cash sales today</span>
                        <span className="font-mono font-medium text-emerald-600">
                            + LSL {revenue.toLocaleString()}
                        </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="font-medium">Expected total</span>
                        <span className="font-mono font-bold">
                            LSL {expectedCash.toLocaleString()}
                        </span>
                    </div>
                </div>

                {isReconciling && (
                    <div className="space-y-2">
                        <Label htmlFor="counted" className="text-sm">
                            Counted cash amount (LSL)
                        </Label>
                        <Input
                            id="counted"
                            type="number"
                            placeholder="0.00"
                            value={counted}
                            onChange={e => setCounted(e.target.value)}
                            className="font-mono"
                        />
                        {counted !== '' && (
                            <div className={`flex items-center gap-1.5 text-sm rounded-md px-3 py-2 ${hasVariance
                                    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                }`}>
                                {hasVariance
                                    ? <AlertCircle className="h-4 w-4 shrink-0" />
                                    : <CheckCircle2 className="h-4 w-4 shrink-0" />
                                }
                                {hasVariance
                                    ? `Variance: ${variance > 0 ? '+' : ''}LSL ${variance.toFixed(2)}`
                                    : 'Drawer balances ✓'
                                }
                            </div>
                        )}
                    </div>
                )}

                <Button
                    variant={isReconciling ? 'default' : 'outline'}
                    className="w-full"
                    onClick={handleReconcile}
                    disabled={isReconciling && counted === ''}
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {isReconciling ? 'Confirm Reconciliation' : 'Reconcile Drawer'}
                </Button>

                {isReconciling && (
                    <Button
                        variant="ghost"
                        className="w-full text-xs text-muted-foreground"
                        onClick={() => setIsReconciling(false)}
                    >
                        Cancel
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}