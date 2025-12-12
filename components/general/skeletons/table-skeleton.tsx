// components/ui/table-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
    rowCount?: number;
    columnCount?: number;
    showHeader?: boolean;
}

export function TableSkeleton({
    rowCount = 5,
    columnCount = 6,
    showHeader = true,
}: TableSkeletonProps) {
    return (
        <div className="space-y-4">
            {showHeader && (
                <div className="flex justify-between">
                    <Skeleton className="w-1/4 h-10" />
                    <Skeleton className="w-32 h-10" />
                </div>
            )}

            <div className="space-y-2">
                {[...Array(rowCount)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                        {[...Array(columnCount)].map((_, j) => (
                            <Skeleton key={j} className="flex-1 h-12" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}