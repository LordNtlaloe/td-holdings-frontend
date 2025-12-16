import { Store } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, MapPin, Phone, Mail, Users, Package, ShoppingCart, Store as StoreIcon } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface StoreCardProps {
    store: Store;
    onSetMain?: (storeId: string) => void;
    onEdit?: (store: Store) => void;
    showActions?: boolean;
}

export function StoreCard({ store, onSetMain, onEdit, showActions = true }: StoreCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            {store.name}
                            {store.isMainStore && (
                                <Badge variant="default" className="ml-2">
                                    <StoreIcon className="h-3 w-3 mr-1" />
                                    Main Store
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription>{store.email}</CardDescription>
                    </div>
                    {showActions && (
                        <div className="flex gap-2">
                            {!store.isMainStore && onSetMain && (
                                <Button variant="outline" size="sm" onClick={() => onSetMain(store.id)}>
                                    Set as Main
                                </Button>
                            )}
                            {onEdit && (
                                <Button variant="ghost" size="sm" onClick={() => onEdit(store)}>
                                    Edit
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{store.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{store.email}</span>
                    </div>

                    {store._count && (
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span className="font-semibold">{store._count.employees}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Employees</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Package className="h-4 w-4" />
                                    <span className="font-semibold">{store._count.inventories}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Products</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <ShoppingCart className="h-4 w-4" />
                                    <span className="font-semibold">{store._count.sales}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Sales</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-3 border-t text-xs text-muted-foreground">
                <div className="w-full flex justify-between">
                    <span>Created {format(new Date(store.createdAt), 'MMM d, yyyy')}</span>
                    <Link
                        href={`/branches/${store.id}`}
                        className="text-primary hover:underline"
                    >
                        View Details →
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}