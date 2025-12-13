"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import FormErrors from '@/components/general/form-error';
import FormSuccess from '@/components/general/form-success';
import TextLink from '@/components/general/text-link';
import { useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { AuthPageGuard } from '@/components/auth/auth-page-guard';
import CardWrapper from '@/components/general/card-wrapper';
import { LoginFormData, LoginSchema } from '@/schema';
import { useRouter } from 'next/navigation';

// TypeScript interface

export default function LoginForm() {
    const searchParams = useSearchParams();
    const { login, isLoading: authLoading, error: authError, clearError } = useAuth();
    const urlError = searchParams?.get("error") === "OAuthAccountNotLinked"
        ? "Email Already In Use With Different Provider"
        : "";
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter()

    // Initialize form with remembered email if exists
    const getDefaultValues = (): LoginFormData => {
        const rememberedEmail = typeof window !== 'undefined'
            ? localStorage.getItem('rememberedEmail')
            : null;

        return {
            email: rememberedEmail || "",
            password: "",
            remember: !!rememberedEmail
        };
    };

    const form = useForm<LoginFormData>({
        resolver: joiResolver(LoginSchema),
        defaultValues: getDefaultValues()
    });

    // Clear auth errors on mount
    useEffect(() => {
        clearError();
    }, [clearError]);

    // Update form error when authError changes
    useEffect(() => {
        if (authError) {
            setError(authError);
        }
    }, [authError]);

    const handleRememberMe = (email: string, remember: boolean) => {
        if (typeof window !== 'undefined') {
            if (remember && email) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
        }
    };

    const onSubmit = async (values: LoginFormData) => {
        setError("");
        setSuccess("");
        setIsSubmitting(true);
        clearError();

        try {
            // Handle remember me first
            handleRememberMe(values.email, values.remember);

            // Login with email and password
            await login({
                email: values.email,
                password: values.password
            });

            setSuccess("Login successful!");

            // Optional: If you want to extend token expiration based on remember me
            if (values.remember) {
                // Store remember me flag in localStorage for other components to use
                if (typeof window !== 'undefined') {
                    localStorage.setItem('extendSession', 'true');
                }
            }

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        // You can implement forgot password flow here
        console.log('Forgot password clicked');
        // Or navigate to forgot password page
        router.push('/forgot-password');
    };

    return (
        <AuthPageGuard>
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
                <CardWrapper
                    headerLabel="Welcome Back"
                    backButtonLabel=""
                    backButtonHref=""
                >
                    <div className="">
                        <p>Sign in to your account to continue</p>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="email">Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                disabled={isSubmitting || authLoading}
                                                className="h-11"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password Field */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel htmlFor="password">Password</FormLabel>
                                            <TextLink
                                                href="/forgot-password"
                                                className="text-sm font-medium"
                                                onClick={handleForgotPassword}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        </div>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                disabled={isSubmitting || authLoading}
                                                className="h-11"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Remember Me & Forgot Password Row */}
                            <div className="flex items-center justify-between">
                                <FormField
                                    control={form.control}
                                    name="remember"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    id="remember"
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => {
                                                        field.onChange(checked === true);
                                                    }}
                                                    disabled={isSubmitting || authLoading}
                                                />
                                            </FormControl>
                                            <Label
                                                htmlFor="remember"
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                Remember me
                                            </Label>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium"
                                disabled={isSubmitting || authLoading}
                                size="lg"
                            >
                                {isSubmitting || authLoading ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>

                            {/* Sign Up Link */}
                            <div className="text-center text-sm text-gray-600">
                                Don't have an account?{" "}
                                <TextLink
                                    href="/sign-up"
                                    className="font-medium text-primary hover:text-primary/90"
                                >
                                    Sign up
                                </TextLink>
                            </div>
                        </form>
                    </Form>

                    {/* Error and Success Messages */}
                    <div className="mt-6 space-y-4">
                        <FormErrors message={error || urlError || undefined} />
                        <FormSuccess message={success} />
                    </div>
                </CardWrapper>
            </div>
        </AuthPageGuard>
    );
}