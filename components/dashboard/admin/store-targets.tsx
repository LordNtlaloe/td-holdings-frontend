'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, TrendingUp, Calendar, Save, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StoreTargetsProps {
    token: string;
    storeId?: string;
}

export function StoreTargets({ token, storeId }: StoreTargetsProps) {
    const [targets, setTargets] = useState({
        daily: 20000,
        weekly: 140000,
        monthly: 600000,
        quarterly: 1800000,
        yearly: 7200000
    });

    const [current, setCurrent] = useState({
        daily: 12450,
        weekly: 98750,
        monthly: 452300,
        quarterly: 1250000,
        yearly: 3200000
    });

    const [editing, setEditing] = useState(false);
    const [editedTargets, setEditedTargets] = useState(targets);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch actual targets from API
        const fetchTargets = async () => {
            try {
                // const data = await StoreAPI.getTargets(token, storeId);
                // setTargets(data);
                // setCurrent(data.current);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch targets:', error);
                setLoading(false);
            }
        };

        fetchTargets();
    }, [token, storeId]);

    const handleSave = async () => {
        try {
            // await StoreAPI.updateTargets(token, storeId, editedTargets);
            setTargets(editedTargets);
            setEditing(false);
        } catch (error) {
            console.error('Failed to save targets:', error);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const periods = [
        { key: 'daily', label: 'Daily' },
        { key: 'weekly', label: 'Weekly' },
        { key: 'monthly', label: 'Monthly' },
        { key: 'quarterly', label: 'Quarterly' },
        { key: 'yearly', label: 'Yearly' }
    ] as const;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Store Targets</CardTitle>
                {!editing ? (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                        Edit Targets
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                        <Button variant="outline" onClick={() => {
                            setEditedTargets(targets);
                            setEditing(false);
                        }}>
                            Cancel
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {periods.map(({ key, label }) => {
                        const target = editing ? editedTargets[key] : targets[key];
                        const currentValue = current[key];
                        const percentage = (currentValue / target) * 100;

                        return (
                            <div key={key} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {key === 'daily' && <Calendar className="h-4 w-4 text-muted-foreground" />}
                                        {key === 'weekly' && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                                        {key === 'monthly' && <Target className="h-4 w-4 text-muted-foreground" />}
                                        <span className="font-medium">{label} Target</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {editing ? (
                                            <Input
                                                type="number"
                                                value={editedTargets[key]}
                                                onChange={(e) => setEditedTargets({
                                                    ...editedTargets,
                                                    [key]: parseInt(e.target.value)
                                                })}
                                                className="w-32 text-right"
                                            />
                                        ) : (
                                            <span className="font-bold">{formatCurrency(target)}</span>
                                        )}
                                    </div>
                                </div>

                                {!editing && (
                                    <>
                                        <Progress value={percentage} className="h-2" />
                                        <div className="flex justify-between text-sm">
                                            <span>Current: {formatCurrency(currentValue)}</span>
                                            <span className={percentage >= 100 ? 'text-green-500' : 'text-yellow-500'}>
                                                {percentage.toFixed(1)}% complete
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}