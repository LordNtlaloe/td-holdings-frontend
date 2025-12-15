"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
import FormError from "@/components/general/form-error";
import FormSuccess from "@/components/general/form-success";
import TextLink from "@/components/general/text-link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Eye, EyeOff, UserPlus, Building2, Phone } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { RegisterSchema } from "@/lib/auth-validations";
import { joiResolver } from "@hookform/resolvers/joi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role } from "@/types";


interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: Role;
    storeId?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading } = useAuth();

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [stores, setStores] = useState<Array<{ id: string; name: string }>>([]);


    const form = useForm<RegisterFormData>({
        resolver: joiResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            phone: "",
            role: Role.CASHIER,
            storeId: "",
        },
    });

    // Fetch stores when component mounts
    React.useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await fetch("/api/stores");
                if (response.ok) {
                    const data = await response.json();
                    setStores(data);
                }
            } catch (error) {
                console.error("Failed to fetch stores:", error);
            }
        };
        fetchStores();
    }, []);

    const onSubmit = async (values: RegisterFormData) => {
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            await register({
                email: values.email,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                role: values.role,
                storeId: values.storeId,
            });

            setSuccess("Account created successfully! Redirecting...");

            // Redirect based on role
            setTimeout(() => {
                if (values.role === "CASHIER") {
                    router.push(`/auth/verify?email=${encodeURIComponent(values.email)}`);
                } else {
                    router.push(`/auth/login?registered=true&email=${encodeURIComponent(values.email)}`);
                }
            }, 2000);
        } catch (err: any) {
            setError(err?.message || "Failed to create account. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const role = form.watch("role");

    return (
        <div className="w-[500px] max-w-md mx-auto">
            <Button
                variant="ghost"
                onClick={() => router.push("/auth/login")}
                className="mb-6 -ml-2"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
            </Button>

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <UserPlus className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Create an account
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Fill in your details to get started
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="John"
                                                disabled={isSubmitting || isLoading}
                                                autoComplete="given-name"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Doe"
                                                disabled={isSubmitting || isLoading}
                                                autoComplete="family-name"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="you@example.com"
                                            disabled={isSubmitting || isLoading}
                                            autoComplete="email"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                {...field}
                                                type="tel"
                                                placeholder="+1 (555) 123-4567"
                                                disabled={isSubmitting || isLoading}
                                                autoComplete="tel"
                                                className="pl-10"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isSubmitting || isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ADMIN">Administrator</SelectItem>
                                                <SelectItem value="MANAGER">Manager</SelectItem>
                                                <SelectItem value="CASHIER">Cashier</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {(role === "CASHIER" || role === "MANAGER") && (
                                <FormField
                                    control={form.control}
                                    name="storeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Store</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={isSubmitting || isLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select store" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {stores.map((store) => (
                                                        <SelectItem key={store.id} value={store.id}>
                                                            {store.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                disabled={isSubmitting || isLoading}
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Password must be at least 8 characters long
                                    </p>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                disabled={isSubmitting || isLoading}
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Note:</strong> Cashier accounts require email verification before login.
                                Admin and Manager accounts are activated immediately.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="w-full"
                        >
                            {(isSubmitting || isLoading) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isSubmitting || isLoading ? "Creating account..." : "Create account"}
                        </Button>
                    </form>
                </Form>

                {error && (
                    <div className="mt-6">
                        <FormError message={error} />
                    </div>
                )}

                {success && (
                    <div className="mt-6">
                        <FormSuccess message={success} />
                    </div>
                )}
            </div>

            <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <TextLink href="/auth/login" className="text-primary">
                    Sign in
                </TextLink>
            </div>
        </div>
    );
}