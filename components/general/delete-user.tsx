// components/DeleteUser.tsx
'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HeadingSmall from '@/components/general/heading-small';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';

interface DeleteUserProps {
    userId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function DeleteUser({ userId, onSuccess, onCancel }: DeleteUserProps) {
    const router = useRouter();
    const { logout, user } = useAuth();
    const passwordInput = useRef<HTMLInputElement>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDeleteUser = async (e: FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);

        try {
            // Direct API call
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to delete account');
            }

            // Account deleted successfully
            closeModal();
            
            // Call success callback if provided
            if (onSuccess) {
                onSuccess();
            }
            
            // If deleting current user, logout and redirect
            if (user?.id === userId) {
                await logout();
                router.push('/');
            }
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            passwordInput.current?.focus();
        } finally {
            setIsProcessing(false);
        }
    };

    const closeModal = () => {
        setError(null);
        setPassword('');
        setIsDialogOpen(false);
        
        // Call cancel callback if provided
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="space-y-6">
            <HeadingSmall 
                title="Delete account" 
                description="Delete your account and all of its resources" 
            />
            
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Warning</p>
                    <p className="text-sm">Please proceed with caution, this cannot be undone.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Delete account</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                        <DialogDescription>
                            Once your account is deleted, all of its resources and data will also be permanently deleted. 
                            Please enter your password to confirm you would like to permanently delete your account.
                        </DialogDescription>
                        
                        <form className="space-y-6" onSubmit={handleDeleteUser}>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">
                                    Password
                                </Label>

                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    required
                                    disabled={isProcessing}
                                />

                                {error && (
                                    <p className="text-sm font-medium text-destructive">
                                        {error}
                                    </p>
                                )}
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button 
                                        variant="secondary" 
                                        type="button"
                                        onClick={closeModal}
                                        disabled={isProcessing}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button 
                                    variant="destructive" 
                                    type="submit"
                                    disabled={isProcessing || !password}
                                >
                                    {isProcessing ? 'Deleting...' : 'Delete account'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}