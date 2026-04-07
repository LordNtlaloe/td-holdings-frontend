// app/checkout/success/confirmation/page.tsx
import ConfirmationContent from "@/components/client/confiramtion";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default function ConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#1b2358] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading order confirmation...</p>
                </div>
            </div>
        }>
            <ConfirmationContent />
        </Suspense>
    );
}