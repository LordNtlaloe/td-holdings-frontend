import { Store, StoreType } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Building,
    Phone,
    Mail,
    MapPin,
    Store as StoreIcon,
    Edit,
    MoreHorizontal,
    Home,
    Warehouse
} from 'lucide-react';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StoreTableProps {
    stores: Store[];
    onSetMain?: (storeId: string) => void;
    onEdit?: (store: Store) => void;
    onView?: (storeId: string) => void;
}

const storeTypeIcons = {
    MAIN: Home,
    BRANCH: Building,
    WAREHOUSE: Warehouse,
    POPUP: StoreIcon,
};

const storeTypeColors = {
    MAIN: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    BRANCH: 'bg-green-500/10 text-green-700 dark:text-green-400',
    WAREHOUSE: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    POPUP: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
};

export function StoreTable({ stores, onSetMain, onEdit, onView }: StoreTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Store</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Inventory</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stores.map((store) => {
                        const TypeIcon = storeTypeIcons[store.type] || Building;
                        const typeColor = storeTypeColors[store.type] || storeTypeColors.BRANCH;

                        return (
                            <TableRow key={store.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Building className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">{store.name}</div>
                                            <div className="text-sm text-muted-foreground">{store.email}</div>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline" className={typeColor}>
                                        <TypeIcon className="h-3 w-3 mr-1" />
                                        {store.type}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5" />
                                            <div className="text-sm">
                                                <div>{store.address}</div>
                                                <div className="text-muted-foreground">{store.city}</div>
                                            </div>
                                        </div>
                                        {store.distanceInfo && (
                                            <div className="text-xs text-muted-foreground ml-6">
                                                {store.distanceInfo}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-3 w-3" />
                                            {store.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-3 w-3" />
                                            {store.email}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div className="text-xs space-y-0.5">
                                        <div><span className="font-medium">Mon-Fri:</span> {store.weekdayHours}</div>
                                        {store.saturdayHours && (
                                            <div><span className="font-medium">Sat:</span> {store.saturdayHours}</div>
                                        )}
                                        {store.sundayHours && (
                                            <div><span className="font-medium">Sun:</span> {store.sundayHours}</div>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline" className="font-normal">
                                        {store._count?.employees || 0}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="secondary" className="font-normal">
                                        {store._count?.inventories || 0}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="secondary" className="font-normal">
                                        {store._count?.sales || 0}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    {store.isMainStore ? (
                                        <Badge className="flex items-center gap-1 w-fit">
                                            <StoreIcon className="h-3 w-3" />
                                            Main Store
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Branch</Badge>
                                    )}
                                </TableCell>

                                <TableCell>
                                    <div className="text-sm">
                                        {format(new Date(store.createdAt), 'MMM d, yyyy')}
                                    </div>
                                </TableCell>

                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            {onView && (
                                                <DropdownMenuItem onClick={() => onView(store.id)}>
                                                    View Details
                                                </DropdownMenuItem>
                                            )}
                                            {onEdit && (
                                                <DropdownMenuItem onClick={() => onEdit(store)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Store
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            {!store.isMainStore && onSetMain && (
                                                <DropdownMenuItem onClick={() => onSetMain(store.id)}>
                                                    <StoreIcon className="h-4 w-4 mr-2" />
                                                    Set as Main Store
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}