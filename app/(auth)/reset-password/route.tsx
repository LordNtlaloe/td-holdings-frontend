// app/(auth)/reset-password/page.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Eye, EyeOff, Key } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ResetPasswordSchema } from "@/lib/auth-validations";
import { joiResolver } from "@hookform/resolvers/joi";

interface ResetPasswordFormData {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { resetPassword, isLoading } = useAuth();

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const email = searchParams?.get("email");
    const token = searchParams?.get("token");

    const form = useForm<ResetPasswordFormData>({
        resolver: joiResolver(ResetPasswordSchema),
        defaultValues: {
            email: email || "",
            resetToken: token || "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Update form when params change
    useEffect(() => {
        if (email) {
            form.setValue("email", email);
        }
        if (token) {
            form.setValue("resetToken", token);
        }
    }, [email, token, form]);

    const onSubmit = async (values: ResetPasswordFormData) => {
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            await resetPassword(values.email, values.resetToken, values.newPassword);
            setSuccess("Password reset successfully! Redirecting to login...");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push(`/auth/login?reset=true`);
            }, 2000);
        } catch (err: any) {
            setError(err?.message || "Failed to reset password. The link may have expired.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateToken = async () => {
        const email = form.getValues("email");
        const token = form.getValues("resetToken");

        if (!email || !token) {
            setError("Invalid reset link. Please request a new password reset.");
            return;
        }
    };

    useEffect(() => {
        if (email && token) {
            validateToken();
        }
    }, [email, token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md">
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
                        <Key className="h-8 w-8 text-primary" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Set new password
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Enter your new password below
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
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
                                                disabled
                                                className="bg-gray-50 dark:bg-gray-800"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    disabled={isSubmitting || isLoading}
                                                    autoComplete="new-password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                >
                                                    {showNewPassword ? (
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
                                        <FormLabel>Confirm New Password</FormLabel>
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

                            <Button
                                type="submit"
                                disabled={isSubmitting || isLoading}
                                className="w-full"
                            >
                                {(isSubmitting || isLoading) && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isSubmitting || isLoading
                                    ? "Resetting..."
                                    : "Reset password"}
                            </Button>
                        </form>
                    </Form>

                    {error && (
                        <div className="mt-6">
                            <FormError message={error} />
                            <div className="mt-4 text-center">
                                <TextLink href="/auth/forgot-password" className="text-sm">
                                    Request new reset link
                                </TextLink>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mt-6">
                            <FormSuccess message={success} />
                        </div>
                    )}
                </div>

                <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                    Remember your password?{" "}
                    <TextLink href="/auth/login" className="text-primary">
                        Back to login
                    </TextLink>
                </div>
            </div>
        </div>
    );
}