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
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { VerifyAccountSchema } from "@/lib/auth-validations";
import { joiResolver } from "@hookform/resolvers/joi";

interface VerifyFormData {
    email: string;
    code: string;
}

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { verifyAccount, isLoading } = useAuth();

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const email = searchParams?.get("email");

    const form = useForm<VerifyFormData>({
        resolver: joiResolver(VerifyAccountSchema),
        defaultValues: {
            email: email || "",
            code: "",
        },
    });

    // Update form when email param changes
    useEffect(() => {
        if (email) {
            form.setValue("email", email);
        }
    }, [email, form]);

    const onSubmit = async (values: VerifyFormData) => {
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            await verifyAccount(values.email, values.code);
            setSuccess("Account verified successfully! Redirecting to login...");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push(`/auth/login?verified=true&email=${encodeURIComponent(values.email)}`);
            }, 2000);
        } catch (err: any) {
            setError(err?.message || "Failed to verify account. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        const email = form.getValues("email");

        if (!email) {
            setError("Please enter your email address first");
            return;
        }

        try {
            // Call your resend verification API
            const response = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setSuccess("Verification code resent to your email");
                setResendCooldown(60); // 60 seconds cooldown

                // Start countdown
                const interval = setInterval(() => {
                    setResendCooldown((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                const data = await response.json();
                setError(data.error || "Failed to resend verification code");
            }
        } catch (err) {
            setError("Failed to resend verification code. Please try again.");
        }
    };

    return (
        <div className="w-[500px] max-w-md mx-auto">
            <Button
                variant="ghost"
                onClick={() => router.push("/auth/sign-in")}
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
                    Verify your account
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Enter the verification code sent to your email
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
                                            disabled={isSubmitting || isLoading || !!email}
                                            autoComplete="email"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="123456"
                                            maxLength={6}
                                            disabled={isSubmitting || isLoading}
                                            autoComplete="one-time-code"
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, "");
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Enter the 6-digit code sent to your email
                                    </p>
                                </FormItem>
                            )}
                        />

                        <div className="text-center">
                            <Button
                                type="submit"
                                disabled={isSubmitting || isLoading}
                                className="w-full"
                            >
                                {(isSubmitting || isLoading) && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isSubmitting || isLoading ? "Verifying..." : "Verify Account"}
                            </Button>

                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                Didn't receive the code?{" "}
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={resendCooldown > 0 || isSubmitting}
                                    className="text-primary hover:text-primary/80 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    {resendCooldown > 0
                                        ? `Resend in ${resendCooldown}s`
                                        : "Resend code"}
                                </button>
                            </div>
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

            <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                Need help?{" "}
                <TextLink href="/contact" className="text-primary">
                    Contact support
                </TextLink>
            </div>
        </div>
    );
}