// app/reset-password/page.tsx
import ResetPasswordConfirmForm from "@/components/auth/reset-password"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Reset Password - TD Holdings Inventory System",
    description: "Create a new password for your account",
}

export default function ResetPasswordPage() {
    return (
        <div className="w-full max-w-lg">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">TD Holdings Inventory Management</h1>
                <p className="text-muted-foreground mt-2">
                    Create a new password for your account
                </p>
            </div>

            <ResetPasswordConfirmForm />

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