'use client';

import { Store } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StoreSelectorProps {
    stores: Store[];
    onViewStore: (store: Store) => void;
}

export const StoreSelector = ({ stores, onViewStore }: StoreSelectorProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
                <Card key={store.id} className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">{store.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {store.isMainStore ? 'Main Store/Warehouse' : 'Branch Store'}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewStore(store)}
                        >
                            View Details
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};