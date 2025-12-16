
import { Store } from '@/types';
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
import { Building, Phone, Mail, MapPin, Store as StoreIcon, Edit, MoreHorizontal } from 'lucide-react';
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

export function StoreTable({ stores, onSetMain, onEdit, onView }: StoreTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Store</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Inventory</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {stores.map((store) => (
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
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {store.location}
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
                                <Badge variant="outline" className="font-normal">
                                    {store._count?.employees || 0} employees
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="font-normal">
                                    {store._count?.inventories || 0} items
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="font-normal">
                                    {store._count?.sales || 0} sales
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {store.isMainStore ? (
                                    <Badge className="flex items-center gap-1">
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
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}