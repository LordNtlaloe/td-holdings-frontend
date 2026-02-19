// components/client/store-locations.tsx
"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
    MapPin,
    Phone,
    Clock,
    Navigation,
    Filter,
    ChevronRight,
    Mail,
    Globe,
    Users,
    Package,
    Home,
    Building,
    Warehouse,
    Store as StoreIcon,
    Loader2,
    RefreshCw,
    AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import StoreAPI from '@/lib/api/stores'
import { Store, StoreType } from '@/types'
import MapComponent from './map-component'

// Dynamic import for MapComponent to avoid SSR issues
const DynamicMapComponent = dynamic(() => import('./map-component'), {
    ssr: false,
    loading: () => (
        <div className="h-100 w-full bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Loading map...</p>
            </div>
        </div>
    )
});

// Type for store location data
interface StoreLocation extends Store {
    coordinates: [number, number];
    hours: {
        weekdays: string;
        saturday: string;
        sunday: string;
    };
    distance: string;
}

// Map StoreType to display names
const storeTypeDisplay: Record<StoreType, string> = {
    [StoreType.MAIN]: 'Main Store',
    [StoreType.BRANCH]: 'Branch',
    [StoreType.WAREHOUSE]: 'Warehouse',
    [StoreType.POPUP]: 'Pop-up Store'
};

// Map StoreType to icons
const storeTypeIcons: Record<StoreType, any> = {
    [StoreType.MAIN]: Home,
    [StoreType.BRANCH]: Building,
    [StoreType.WAREHOUSE]: Warehouse,
    [StoreType.POPUP]: StoreIcon
};

// Map StoreType to colors
const storeTypeColors: Record<StoreType, string> = {
    [StoreType.MAIN]: 'bg-[#1b2358] hover:bg-[#151d4a]',
    [StoreType.BRANCH]: 'bg-[#FBB320] hover:bg-[#e6a21c] text-[#1b2358]',
    [StoreType.WAREHOUSE]: 'bg-purple-500 hover:bg-purple-600',
    [StoreType.POPUP]: 'bg-green-500 hover:bg-green-600'
};

// Default location for Lesotho (Maseru)
const DEFAULT_LOCATION: [number, number] = [-29.3100, 27.4786];

// Function to format store data for the component
const formatStoreData = (store: Store): StoreLocation => {
    return {
        ...store,
        coordinates: store.latitude && store.longitude
            ? [store.latitude, store.longitude]
            : DEFAULT_LOCATION,
        hours: {
            weekdays: store.weekdayHours || '8:00 AM - 6:00 PM',
            saturday: store.saturdayHours || '9:00 AM - 4:00 PM',
            sunday: store.sundayHours || 'Closed'
        },
        distance: store.distanceInfo || `${store.city} Center`
    };
};

export default function StoreLocator() {
    const { accessToken, isAuthenticated } = useAuth();
    const [stores, setStores] = useState<StoreLocation[]>([]);
    const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [searchCity, setSearchCity] = useState('');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_LOCATION);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch stores from API
    const fetchStores = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🟦 Fetching stores...');

          
            // Fetch from your API
            const response = await StoreAPI.getStores('', { limit: 100 });
            console.log('🟦 API Response:', response);

            const storeData = response.data || [];

            if (storeData.length === 0) {
                throw new Error('No stores found in the database');
            }

            // Format stores for the component
            const formattedStores: StoreLocation[] = storeData.map(formatStoreData);

            console.log('🟦 Formatted stores:', formattedStores.length);

            setStores(formattedStores);

            // Set first store as selected
            if (formattedStores.length > 0) {
                setSelectedStore(formattedStores[0]);
                setMapCenter(formattedStores[0].coordinates);
            }

            toast.success('Stores loaded', {
                description: `Loaded ${formattedStores.length} stores from database`,
            });

        } catch (error: any) {
            console.error('❌ Error fetching stores:', error);
            setError(error.message || 'Failed to load stores');

            toast.error('Failed to load stores', {
                description: error.message || 'Please try again later',
            });

            // Clear stores on error
            setStores([]);
            setSelectedStore(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchStores();
    }, [isAuthenticated, accessToken]);

    // Request user location
    const getUserLocation = () => {
        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setMapCenter([latitude, longitude]);

                    toast.success('Location updated', {
                        description: 'Using your current location',
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    toast.error("Location Error", {
                        description: "Unable to get your location. Please check your browser settings.",
                    });
                }
            );
        } else {
            toast.error("Geolocation Not Supported", {
                description: "Your browser does not support geolocation.",
            });
        }
    };

    // Filter stores
    const filteredStores = stores.filter(store => {
        if (filterType !== 'all' && store.type !== filterType) return false;
        if (searchCity && !store.city.toLowerCase().includes(searchCity.toLowerCase())) return false;
        return true;
    });

    const handleStoreSelect = (store: StoreLocation) => {
        setSelectedStore(store);
        setMapCenter([store.coordinates[0], store.coordinates[1]]);
    };

    const getDirections = (store: StoreLocation) => {
        if (typeof window !== 'undefined') {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${store.coordinates[0]},${store.coordinates[1]}`;
            window.open(url, '_blank');
        }
    };

    const getCityEmoji = (city: string) => {
        const cityLower = city.toLowerCase();

        if (cityLower.includes('maseru')) return '🏙️';
        if (cityLower.includes('leribe') || cityLower.includes('hlotse')) return '🏔️';
        if (cityLower.includes('mafeteng')) return '🌾';
        if (cityLower.includes('qacha')) return '⛰️';
        if (cityLower.includes('mohale')) return '🏞️';
        if (cityLower.includes('bere')) return '🏞️';
        if (cityLower.includes('buthe')) return '🏔️';
        if (cityLower.includes('quthing')) return '🌄';

        return '📍';
    };

    // Get icon for store type
    const getStoreIcon = (type: StoreType) => {
        const Icon = storeTypeIcons[type] || Building;
        return <Icon className="w-4 h-4" />;
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 className="h-12 w-12 animate-spin text-[#1b2358]" />
                    <p className="mt-4 text-lg text-gray-600">Loading stores from database...</p>
                    <p className="text-sm text-gray-500">Fetching store locations and information</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center h-96">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-900">Failed to Load Stores</h3>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <div className="mt-6 flex gap-3">
                        <Button
                            onClick={fetchStores}
                            className="bg-[#1b2358] hover:bg-[#151d4a]"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        {!isAuthenticated && (
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/sign-in'}
                            >
                                Log In
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // No stores state
    if (stores.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center h-96">
                    <StoreIcon className="h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-900">No Stores Found</h3>
                    <p className="mt-2 text-gray-600">No stores are currently available in the database.</p>
                    <Button
                        onClick={fetchStores}
                        className="mt-6 bg-[#1b2358] hover:bg-[#151d4a]"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#1b2358] mb-2">Store Locator</h1>
                    <p className="text-gray-600">
                        Find {stores.length} store{stores.length !== 1 ? 's' : ''} across Lesotho.
                        Visit us for quality tires and farm supplies.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchStores}
                    className="border-[#1b2358]/20 text-[#1b2358] hover:bg-[#1b2358]/5"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Stores
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Store List */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Filter className="w-5 h-5 text-[#1b2358]" />
                                <h3 className="font-bold text-[#1b2358]">Find a Store</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search by City
                                    </label>
                                    <Input
                                        placeholder="e.g., Maseru, Leribe..."
                                        value={searchCity}
                                        onChange={(e) => setSearchCity(e.target.value)}
                                        className="border-[#1b2358]/20 focus:border-[#1b2358]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Store Type
                                    </label>
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="border-[#1b2358]/20">
                                            <SelectValue placeholder="All Store Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Stores ({stores.length})</SelectItem>
                                            {Object.values(StoreType).map(type => {
                                                const count = stores.filter(s => s.type === type).length;
                                                return (
                                                    <SelectItem key={type} value={type}>
                                                        {storeTypeDisplay[type]} ({count})
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full border-[#1b2358]/20 text-[#1b2358] hover:bg-[#1b2358]/5"
                                    onClick={getUserLocation}
                                >
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Use My Location
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Store List */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-[#1b2358]">
                            {filteredStores.length} Store{filteredStores.length !== 1 ? 's' : ''} Found
                        </h3>

                        <div className="space-y-4 max-h-150 overflow-y-auto pr-2">
                            {filteredStores.map(store => (
                                <Card
                                    key={store.id}
                                    className={`cursor-pointer transition-all hover:shadow-lg border-[#1b2358]/10 ${selectedStore?.id === store.id
                                            ? 'border-2 border-[#1b2358]'
                                            : 'hover:border-[#1b2358]/50'
                                        }`}
                                    onClick={() => handleStoreSelect(store)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-bold text-[#1b2358]">{store.name}</h4>
                                                    <Badge className={storeTypeColors[store.type]}>
                                                        <span className="flex items-center gap-1">
                                                            {getStoreIcon(store.type)}
                                                            {storeTypeDisplay[store.type]}
                                                        </span>
                                                    </Badge>
                                                    {store.isMainStore && (
                                                        <Badge className="bg-red-500 hover:bg-red-600">
                                                            Main Store
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{store.address}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{store.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{store.distance}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <ChevronRight className={`w-5 h-5 ${selectedStore?.id === store.id
                                                    ? 'text-[#1b2358]'
                                                    : 'text-gray-400'
                                                }`} />
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-[#1b2358] hover:bg-[#151d4a]"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStoreSelect(store);
                                                }}
                                            >
                                                Select
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 border-[#1b2358]/20 text-[#1b2358] hover:bg-[#1b2358]/5"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    getDirections(store);
                                                }}
                                            >
                                                Directions
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Map & Store Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Map Container */}
                    <Card className="overflow-hidden border-[#1b2358]/10">
                        <CardContent className="p-0">
                            <div className="h-100">
                                <DynamicMapComponent
                                    center={mapCenter}
                                    selectedStore={selectedStore}
                                    userLocation={userLocation}
                                    stores={stores}
                                    onStoreSelect={handleStoreSelect}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected Store Details */}
                    {selectedStore && (
                        <Card className="border-[#1b2358]/10">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-bold text-[#1b2358]">{selectedStore.name}</h3>
                                            <Badge className={storeTypeColors[selectedStore.type]}>
                                                <span className="flex items-center gap-1">
                                                    {getStoreIcon(selectedStore.type)}
                                                    {storeTypeDisplay[selectedStore.type]}
                                                </span>
                                            </Badge>
                                            {selectedStore.isMainStore && (
                                                <Badge className="bg-red-500 hover:bg-red-600">
                                                    Main Store
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-gray-600">{selectedStore.city} • {selectedStore.distance}</p>
                                    </div>
                                    <Button
                                        className="bg-[#FBB320] text-[#1b2358] hover:bg-[#e6a21c]"
                                        onClick={() => getDirections(selectedStore)}
                                    >
                                        <Navigation className="w-4 h-4 mr-2" />
                                        Get Directions
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Contact Info */}
                                    <div>
                                        <h4 className="font-bold text-[#1b2358] mb-4 flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Contact Information
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Address</p>
                                                    <p className="text-gray-600">{selectedStore.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">Phone</p>
                                                    <p className="text-gray-600">{selectedStore.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">Email</p>
                                                    <p className="text-gray-600">{selectedStore.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Hours */}
                                    <div>
                                        <h4 className="font-bold text-[#1b2358] mb-4 flex items-center gap-2">
                                            <Clock className="w-5 h-5" />
                                            Business Hours
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Monday - Friday</span>
                                                <span className="font-medium">{selectedStore.hours.weekdays}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Saturday</span>
                                                <span className="font-medium">{selectedStore.hours.saturday}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Sunday</span>
                                                <span className="font-medium">{selectedStore.hours.sunday}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                {/* Services & Features */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-bold text-[#1b2358] mb-3 flex items-center gap-2">
                                            <Package className="w-5 h-5" />
                                            Services Offered
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedStore.services && selectedStore.services.length > 0 ? (
                                                selectedStore.services.map((service, idx) => (
                                                    <Badge key={idx} variant="outline" className="border-[#1b2358]/20 text-[#1b2358]">
                                                        {service}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm">No services listed</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-[#1b2358] mb-3 flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            Store Features
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedStore.features && selectedStore.features.length > 0 ? (
                                                selectedStore.features.map((feature, idx) => (
                                                    <Badge key={idx} variant="outline" className="border-green-500/30 text-green-700">
                                                        {feature}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-sm">No features listed</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Store Stats */}
                                {selectedStore._count && (
                                    <>
                                        <Separator className="my-6" />
                                        <div>
                                            <h4 className="font-bold text-[#1b2358] mb-3">Store Statistics</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-center p-3 border border-gray-200 rounded-lg">
                                                    <div className="text-2xl font-bold text-[#1b2358]">
                                                        {selectedStore._count.employees || 0}
                                                    </div>
                                                    <p className="text-sm text-gray-600">Employees</p>
                                                </div>
                                                <div className="text-center p-3 border border-gray-200 rounded-lg">
                                                    <div className="text-2xl font-bold text-[#1b2358]">
                                                        {selectedStore._count.inventories || 0}
                                                    </div>
                                                    <p className="text-sm text-gray-600">Products</p>
                                                </div>
                                                <div className="text-center p-3 border border-gray-200 rounded-lg">
                                                    <div className="text-2xl font-bold text-[#1b2358]">
                                                        {selectedStore._count.sales || 0}
                                                    </div>
                                                    <p className="text-sm text-gray-600">Sales</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Quick Actions */}
                                <div className="mt-6 pt-6 border-t">
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-[#1b2358]/20 text-[#1b2358] hover:bg-[#1b2358]/5"
                                            onClick={() => window.location.href = `tel:${selectedStore.phone}`}
                                        >
                                            <Phone className="w-4 h-4" />
                                            Call Store
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-[#1b2358]/20 text-[#1b2358] hover:bg-[#1b2358]/5"
                                            onClick={() => window.location.href = `mailto:${selectedStore.email}`}
                                        >
                                            <Mail className="w-4 h-4" />
                                            Email Store
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-[#1b2358]/20 text-[#1b2358] hover:bg-[#1b2358]/5"
                                            onClick={() => window.open('https://www.tdholdingslesotho.com', '_blank')}
                                        >
                                            <Globe className="w-4 h-4" />
                                            Visit Website
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Coverage Area */}
                    <Card className="border-[#1b2358]/10">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-[#1b2358] mb-4">Lesotho Coverage Map</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {stores.slice(0, 5).map(store => (
                                    <div
                                        key={store.id}
                                        className={`text-center p-3 border rounded-lg transition-colors cursor-pointer ${selectedStore?.id === store.id
                                                ? 'border-[#1b2358] bg-[#1b2358]/5'
                                                : 'border-gray-200 hover:border-[#1b2358]/50 hover:bg-[#1b2358]/5'
                                            }`}
                                        onClick={() => handleStoreSelect(store)}
                                    >
                                        <div className="text-2xl mb-2">{getCityEmoji(store.city)}</div>
                                        <h4 className="font-medium text-[#1b2358]">{store.city}</h4>
                                        <p className="text-sm text-gray-600">{storeTypeDisplay[store.type]}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}