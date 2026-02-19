'use client';

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
    error: string;
    onRetry: () => void;
    onDashboard: () => void;
}

export const ErrorState = ({ error, onRetry, onDashboard }: ErrorStateProps) => {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="text-center max-w-md p-8 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading POS</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <div className="space-y-2">
                    <Button onClick={onRetry} variant="default" className="w-full">
                        Retry
                    </Button>
                    <Button onClick={onDashboard} variant="outline" className="w-full">
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const NoStoreError = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="text-center max-w-md p-8 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">No Store Assigned</h2>
                <p className="text-muted-foreground mb-6">
                    Your employee profile is not assigned to any store. Please contact an administrator.
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Retry
                </Button>
            </div>
        </div>
    );
};