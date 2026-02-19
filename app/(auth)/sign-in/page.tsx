"use client";

import React, { useState, Suspense } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FormError from "@/components/general/form-error";
import FormSuccess from "@/components/general/form-success";
import TextLink from "@/components/general/text-link";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { LoginSchema } from "@/lib/auth-validations";
import { joiResolver } from "@hookform/resolvers/joi";

interface LoginFormData {
    email: string;
    password: string;
    remember: boolean;
}

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login, isLoading } = useAuth();

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fixed: Get the correct query parameters
    const registered = searchParams?.get("registered"); // This should be "true" or null
    const emailFromUrl = searchParams?.get("email"); // This is the actual email
    const verified = searchParams?.get("verified");
    const redirect = searchParams?.get("redirect");

    const form = useForm<LoginFormData>({
        resolver: joiResolver(LoginSchema),
        defaultValues: {
            email: emailFromUrl || "", // Use emailFromUrl instead of registered
            password: "",
            remember: false,
        },
    });

    // In your LoginPage component
    const onSubmit = async (values: LoginFormData) => {
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            await login(values.email, values.password);

            // Show success message based on query params
            if (registered === "true") {
                setSuccess("Account created successfully! Please log in.");
            } else if (verified === "true") {
                setSuccess("Account verified successfully! Please log in.");
            }

            // Redirect after successful login
            if (redirect) {
                router.push(redirect);
            }
        } catch (err: any) {
            // Specific error messages for common issues
            if (err.message.includes('HTML')) {
                setError("Server configuration error. Please contact support.");
            } else if (err.message.includes('Network')) {
                setError("Cannot connect to server. Please check your internet connection.");
            } else if (err.message.includes('JSON')) {
                setError("Server returned invalid response. Please try again later.");
            } else {
                setError(err?.message || "Failed to log in. Please check your credentials.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-[500px] max-w-md mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Sign in
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Enter your credentials to continue
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
                {/* Show success message at the top if user just registered */}
                {registered === "true" && (
                    <div className="mb-6">
                        <FormSuccess message="Registration successful! Please sign in with your credentials." />
                    </div>
                )}

                {verified === "true" && (
                    <div className="mb-6">
                        <FormSuccess message="Email verified successfully! You can now sign in." />
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email address</FormLabel>
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
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Password</FormLabel>
                                        <TextLink href="/forgot-password" className="text-sm">
                                            Forgot password?
                                        </TextLink>
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                disabled={isSubmitting || isLoading}
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                disabled={isSubmitting || isLoading}
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
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="remember"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting || isLoading}
                                        />
                                    </FormControl>
                                    <Label className="text-sm cursor-pointer">
                                        Remember me for 30 days
                                    </Label>
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="w-full"
                        >
                            {(isSubmitting || isLoading) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isSubmitting || isLoading ? "Signing in..." : "Sign in"}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <TextLink href="/sign-up">Create one</TextLink>
                        </div>
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
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="w-[500px] max-w-md mx-auto">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-2 text-gray-600">Loading login...</p>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}