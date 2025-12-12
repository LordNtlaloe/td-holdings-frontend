// components/ui/custom-alert.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useEffect } from "react";

interface CustomAlertProps {
    message: string;
    type: "success" | "error";
    onClose?: () => void;
    autoClose?: boolean;
    autoCloseDuration?: number;
}

export function CustomAlert({
    message,
    type,
    onClose,
    autoClose = true,
    autoCloseDuration = 5000,
}: CustomAlertProps) {
    useEffect(() => {
        if (autoClose && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDuration);
            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseDuration, onClose]);

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in">
            <Alert
                className={`w-96 shadow-lg ${type === "success"
                    ? "bg-green-100 border-green-500"
                    : "bg-red-100 border-red-500"
                    }`}
            >
                <InfoIcon
                    className={`h-4 w-4 ${type === "success" ? "text-green-600" : "text-red-600"}`}
                />
                <AlertTitle
                    className={`${type === "success" ? "text-green-800" : "text-red-800"}`}
                >
                    {type === "success" ? "Success" : "Error"}
                </AlertTitle>
                <AlertDescription
                    className={`${type === "success" ? "text-green-700" : "text-red-700"}`}
                >
                    {message}
                </AlertDescription>
            </Alert>
        </div>
    );
}