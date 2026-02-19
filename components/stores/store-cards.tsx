import { Store, StoreType } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Building,
    MapPin,
    Phone,
    Mail,
    Users,
    Package,
    ShoppingCart,
    Store as StoreIcon,
    Clock,
    Warehouse,
    Home
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface StoreCardProps {
    store: Store;
    onSetMain?: (storeId: string) => void;
    onEdit?: (store: Store) => void;
    showActions?: boolean;
}

const storeTypeConfig = {
    MAIN: { label: 'Main Store', icon: Home, color: 'bg-blue-500' },
    BRANCH: { label: 'Branch', icon: Building, color: 'bg-green-500' },
    WAREHOUSE: { label: 'Warehouse', icon: Warehouse, color: 'bg-purple-500' },
    POPUP: { label: 'Pop-up', icon: StoreIcon, color: 'bg-orange-500' },
};

export function StoreCard({ store, onSetMain, onEdit, showActions = true }: StoreCardProps) {
    const typeConfig = storeTypeConfig[store.type] || storeTypeConfig.BRANCH;
    const TypeIcon = typeConfig.icon;

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            {store.name}
                            {store.isMainStore && (
                                <Badge variant="default" className="ml-2">
                                    <StoreIcon className="h-3 w-3 mr-1" />
                                    Main Store
                                </Badge>
                            )}
                            <Badge variant="outline" className="ml-2">
                                <TypeIcon className="h-3 w-3 mr-1" />
                                {typeConfig.label}
                            </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">{store.email}</CardDescription>
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
                    <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                            <div>{store.address}</div>
                            <div className="text-muted-foreground">{store.city}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{store.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{store.email}</span>
                    </div>

                    {/* Operating Hours */}
                    <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Operating Hours</span>
                        </div>
                        <div className="ml-6 space-y-1 text-xs text-muted-foreground">
                            <div>Weekdays: {store.weekdayHours}</div>
                            {store.saturdayHours && <div>Saturday: {store.saturdayHours}</div>}
                            {store.sundayHours && <div>Sunday: {store.sundayHours}</div>}
                        </div>
                    </div>

                    {/* Features & Services */}
                    {(store.features?.length > 0 || store.services?.length > 0) && (
                        <div className="pt-2 border-t">
                            {store.features?.length > 0 && (
                                <div className="mb-2">
                                    <span className="text-xs font-medium">Features:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {store.features.slice(0, 3).map((feature, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {feature}
                                            </Badge>
                                        ))}
                                        {store.features.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{store.features.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                            {store.services?.length > 0 && (
                                <div>
                                    <span className="text-xs font-medium">Services:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {store.services.slice(0, 3).map((service, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                                {service}
                                            </Badge>
                                        ))}
                                        {store.services.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{store.services.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Counts */}
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

                    {/* Distance Info */}
                    {store.distanceInfo && (
                        <div className="pt-2 border-t text-xs text-muted-foreground">
                            {store.distanceInfo}
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