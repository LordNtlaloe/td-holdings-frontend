import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Search, Filter, User as UserIcon } from 'lucide-react';
import { EmployeeFilters, Store } from '@/types';

interface EmployeeFiltersProps {
    filters: EmployeeFilters;
    stores: Store[];
    onFilterChange: (filters: Partial<EmployeeFilters>) => void;
}

export function EmployeeFiltersComponent({ filters, stores, onFilterChange }: EmployeeFiltersProps) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search employees..."
                    className="pl-8 w-[200px] lg:w-[300px]"
                    value={filters.search || ''}
                    onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
                />
            </div>
            
            <Select
                value={filters.storeId || 'all'}
                onValueChange={(value) =>
                    onFilterChange({
                        storeId: value === 'all' ? undefined : value,
                        page: 1
                    })
                }
            >
                <SelectTrigger className="w-[150px]">
                    <Building className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Stores</SelectItem>
                    {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                            {store.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.role || 'all'}
                onValueChange={(value) =>
                    onFilterChange({
                        role: value === 'all' ? undefined : value as any,
                        page: 1
                    })
                }
            >
                <SelectTrigger className="w-[150px]">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="CASHIER">Cashier</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                    onFilterChange({
                        status: value === 'all' ? undefined : value as any,
                        page: 1
                    })
                }
            >
                <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}