"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";
import { RegisterSchema } from '@/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FormErrors from '@/components/general/form-error';
import FormSuccess from '@/components/general/form-success';
import TextLink from '@/components/general/text-link';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import CardWrapper from '@/components/general/card-wrapper';
import { useAuth } from '@/contexts/auth-context';
import { AuthPageGuard } from '@/components/auth/auth-page-guard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading: authLoading, error: authError, clearError } = useAuth();
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            phone: "",
            role: "USER",
            storeId: ""
        }
    });

    const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
        setError("");
        setSuccess("");
        setIsSubmitting(true);
        clearError();

        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registrationData } = values;

            await register(registrationData);

            setSuccess("Registration successful! Please check your email for verification.");

        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthPageGuard>
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
                <CardWrapper
                    headerLabel={'Create Account'}
                    backButtonLabel={'Already have an account?'}
                    backButtonHref={'/login'}
                >
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                            <div className="grid gap-6">
                                {/* Personal Information */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name='firstName'
                                        render={({ field }) => (
                                            <FormItem className="grid gap-2">
                                                <FormLabel htmlFor="firstName">First Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        id="firstName"
                                                        type="text"
                                                        required
                                                        autoFocus
                                                        tabIndex={1}
                                                        autoComplete="given-name"
                                                        placeholder="John"
                                                        disabled={isSubmitting || authLoading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='lastName'
                                        render={({ field }) => (
                                            <FormItem className="grid gap-2">
                                                <FormLabel htmlFor="lastName">Last Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        id="lastName"
                                                        type="text"
                                                        required
                                                        tabIndex={2}
                                                        autoComplete="family-name"
                                                        placeholder="Doe"
                                                        disabled={isSubmitting || authLoading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name='email'
                                    render={({ field }) => (
                                        <FormItem className="grid gap-2">
                                            <FormLabel htmlFor="email">Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    id="email"
                                                    type="email"
                                                    required
                                                    tabIndex={3}
                                                    autoComplete="email"
                                                    placeholder="email@example.com"
                                                    disabled={isSubmitting || authLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='phone'
                                    render={({ field }) => (
                                        <FormItem className="grid gap-2">
                                            <FormLabel htmlFor="phone">Phone Number (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    id="phone"
                                                    type="tel"
                                                    tabIndex={4}
                                                    autoComplete="tel"
                                                    placeholder="+266 1234 5678"
                                                    disabled={isSubmitting || authLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password Fields */}
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name='password'
                                        render={({ field }) => (
                                            <FormItem className="grid gap-2">
                                                <FormLabel htmlFor="password">Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        id="password"
                                                        type="password"
                                                        required
                                                        tabIndex={5}
                                                        autoComplete="new-password"
                                                        placeholder="Create a password"
                                                        disabled={isSubmitting || authLoading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='confirmPassword'
                                        render={({ field }) => (
                                            <FormItem className="grid gap-2">
                                                <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        id="confirmPassword"
                                                        type="password"
                                                        required
                                                        tabIndex={6}
                                                        autoComplete="new-password"
                                                        placeholder="Confirm your password"
                                                        disabled={isSubmitting || authLoading}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Role Selection (for admin/managed registration) */}
                                <FormField
                                    control={form.control}
                                    name='role'
                                    render={({ field }) => (
                                        <FormItem className="grid gap-2">
                                            <FormLabel htmlFor="role">Account Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={isSubmitting || authLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select account type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="USER">User</SelectItem>
                                                    <SelectItem value="CASHIER">Cashier</SelectItem>
                                                    <SelectItem value="MANAGER">Manager</SelectItem>
                                                    <SelectItem value="ADMIN">Administrator</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Store ID (optional, for employees) */}
                                <FormField
                                    control={form.control}
                                    name='storeId'
                                    render={({ field }) => (
                                        <FormItem className="grid gap-2">
                                            <FormLabel htmlFor="storeId">Store ID (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    id="storeId"
                                                    type="text"
                                                    tabIndex={8}
                                                    placeholder="Store identifier"
                                                    disabled={isSubmitting || authLoading}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="mt-4 w-full"
                                    tabIndex={9}
                                    disabled={isSubmitting || authLoading}
                                >
                                    {isSubmitting || authLoading ? (
                                        <>
                                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </div>

                            <div className="text-muted-foreground text-center text-sm">
                                By creating an account, you agree to our{' '}
                                <TextLink href="/terms" tabIndex={10}>
                                    Terms of Service
                                </TextLink>{' '}
                                and{' '}
                                <TextLink href="/privacy" tabIndex={11}>
                                    Privacy Policy
                                </TextLink>
                            </div>
                        </form>
                    </Form>

                    {/* Error and Success Messages */}
                    <FormErrors message={error || authError} />
                    <FormSuccess message={success} />
                </CardWrapper>
            </div>
        </AuthPageGuard>
    );
}