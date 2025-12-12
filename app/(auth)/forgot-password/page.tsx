// app/forgot-password/page.tsx
import ResetPasswordForm from "@/components/auth/forgot-password-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Forgot Password - TD Holdings Inventory System",
    description: "Reset your account password",
}

export default function ForgotPasswordPage() {
    return (
        <div className="w-full max-w-lg">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">TD Holdings Inventory Management</h1>
                <p className="text-muted-foreground mt-2">
                    Reset your password to access your account
                </p>
            </div>

            <ResetPasswordForm />

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>
                    By continuing, you agree to our{" "}
                    <a href="/terms" className="text-primary hover:underline">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                    </a>
                </p>
            </div>
        </div>
    )
}