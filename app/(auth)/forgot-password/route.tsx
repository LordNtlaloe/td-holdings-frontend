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
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { RequestPasswordResetSchema } from "@/lib/auth-validations";
import { joiResolver } from "@hookform/resolvers/joi";

interface ForgotPasswordFormData {
    email: string;
}

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { requestPasswordReset, isLoading } = useAuth();

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ForgotPasswordFormData>({
        resolver: joiResolver(RequestPasswordResetSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: ForgotPasswordFormData) => {
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            await requestPasswordReset(values.email);
            setSuccess(
                "If an account exists with this email, you will receive password reset instructions shortly."
            );
        } catch (err: any) {
            // For security, we show the same message regardless of error
            setSuccess(
                "If an account exists with this email, you will receive password reset instructions shortly."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <Mail className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Reset your password
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Enter your email address and we'll send you a link to reset your password
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
                                            disabled={isSubmitting || isLoading}
                                            autoComplete="email"
                                        />
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
                            {isSubmitting || isLoading ? "Sending..." : "Send reset link"}
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
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Note:</strong> Check your spam folder if you don't see the email in your inbox.
                                The reset link will expire in 1 hour.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <TextLink href="/auth/sign-in" className="text-primary">
                    Back to login
                </TextLink>
            </div>
        </div>
    );
}