// components/dashboard/stores/store-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { LoaderCircle, ArrowLeft } from "lucide-react";
import { StoreSchema, type StoreFormValues } from "@/schema";
import { createStore, updateStore, deleteStore, getStoreById } from "@/lib/store-api";
import { CustomAlert } from "@/components/ui/custom-alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const lesothoDistricts = [
    "Berea", "Butha-Buthe", "Leribe", "Mafeteng", "Maseru",
    "Mohale's Hoek", "Mokhotlong", "Qacha's Nek", "Quthing", "Thaba-Tseka"
];

interface StoreFormProps {
    storeId?: string;
    mode?: 'create' | 'edit';
}

export default function StoreForm({ storeId, mode = 'create' }: StoreFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!storeId); // Only fetch if we have a storeId
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const form = useForm<StoreFormValues>({
        resolver: zodResolver(StoreSchema),
        defaultValues: {
            name: "",
            location: "",
        },
    });

    // Fetch store data if in edit mode
    useEffect(() => {
        const fetchStoreData = async () => {
            if (!storeId) {
                setFetching(false);
                return;
            }

            try {
                setFetching(true);
                const result = await getStoreById(storeId);

                if (result.success && result.data) {
                    form.reset({
                        name: result.data.name || "",
                        location: result.data.location || "",
                    });
                } else {
                    setAlert({
                        type: "error",
                        message: result.error || "Failed to load store data"
                    });
                    // Redirect if store not found
                    setTimeout(() => router.push('/stores'), 3000);
                }
            } catch (err) {
                setAlert({
                    type: "error",
                    message: `Failed to load store data: ${err instanceof Error ? err.message : String(err)}`
                });
                setTimeout(() => router.push('/stores'), 3000);
            } finally {
                setFetching(false);
            }
        };

        if (storeId && mode === 'edit') {
            fetchStoreData();
        } else {
            setFetching(false);
        }
    }, [storeId, mode, form, router]);

    const onSubmit = async (data: StoreFormValues) => {
        try {
            setLoading(true);
            setAlert(null);

            let result;

            if (storeId && mode === 'edit') {
                result = await updateStore(storeId, data);
            } else {
                result = await createStore(data);
            }

            if (result.success) {
                const successMessage = storeId
                    ? "Store updated successfully!"
                    : "Store created successfully!";

                setAlert({ type: "success", message: successMessage });

                // Redirect after success
                setTimeout(() => {
                    router.push('/stores');
                    router.refresh(); // Refresh the page data
                }, 1500);
            } else {
                setAlert({
                    type: "error",
                    message: result.error || "An error occurred"
                });
            }
        } catch (err) {
            setAlert({
                type: "error",
                message: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!storeId) return;

        try {
            setLoading(true);
            const result = await deleteStore(storeId);

            if (result.success) {
                setAlert({ type: "success", message: "Store deleted successfully!" });
                setTimeout(() => {
                    router.push("/stores");
                    router.refresh();
                }, 1500);
            } else {
                setAlert({ type: "error", message: result.error || "Delete failed" });
                setShowDeleteDialog(false);
            }
        } catch (err) {
            setAlert({
                type: "error",
                message: `Delete failed: ${err instanceof Error ? err.message : String(err)}`
            });
            setShowDeleteDialog(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    // Loading skeleton
    if (fetching) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>

                <div className="border rounded-lg p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full max-w-md" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full max-w-md" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {storeId ? 'Edit Store' : 'Create New Store'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {storeId
                            ? 'Update store information'
                            : 'Add a new store to your system'
                        }
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Store Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={loading}
                                                placeholder="Enter store name"
                                                {...field}
                                                className="max-w-md"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location *</FormLabel>
                                        <Select
                                            disabled={loading}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="max-w-md">
                                                    <SelectValue placeholder="Select a district" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {lesothoDistricts.map((district) => (
                                                    <SelectItem key={district} value={district}>
                                                        {district}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="min-w-32"
                            >
                                {loading && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                {storeId ? "Update Store" : "Create Store"}
                            </Button>

                            {storeId && mode === 'edit' && (
                                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={loading}
                                            className="min-w-32"
                                        >
                                            Delete Store
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete
                                                this store and remove all associated data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel disabled={loading}>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                disabled={loading}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {loading ? (
                                                    <>
                                                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    'Delete Store'
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>

            {alert && (
                <CustomAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                    autoClose={true}
                    autoCloseDuration={5000}
                />
            )}
        </div>
    );
}