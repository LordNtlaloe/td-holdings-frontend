import { RefreshCw } from 'lucide-react';

interface EmployeeLoadingProps {
    message?: string;
}

export function EmployeeLoading({ message = "Loading employees..." }: EmployeeLoadingProps) {
    return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}

export function AuthLoading({ message = "Initializing..." }: EmployeeLoadingProps) {
    return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}