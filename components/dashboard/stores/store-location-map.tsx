// components/dashboard/stores/store-location-map.tsx
"use client";

import { Store } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Globe } from "lucide-react";

interface StoreLocationMapProps {
    stores: Store[];
}

export default function StoreLocationMap({ stores }: StoreLocationMapProps) {
    // Mock coordinates for demonstration
    const getMockCoordinates = (index: number) => {
        const coordinates = [
            { lat: 40.7128, lng: -74.0060 }, // New York
            { lat: 34.0522, lng: -118.2437 }, // Los Angeles
            { lat: 41.8781, lng: -87.6298 }, // Chicago
            { lat: 29.7604, lng: -95.3698 }, // Houston
            { lat: 33.4484, lng: -112.0740 }, // Phoenix
        ];
        return coordinates[index % coordinates.length];
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Store Locations</CardTitle>
                        <CardDescription>Geographic distribution of stores</CardDescription>
                    </div>
                    <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                {/* Simple SVG Map - In a real app, you'd use a proper map library like Leaflet or Google Maps */}
                <div className="relative h-96 bg-gray-50 rounded-lg border">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Interactive map would be displayed here</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Using a mapping library like Leaflet or Google Maps
                            </p>
                        </div>
                    </div>

                    {/* Mock store markers */}
                    {stores.map((store, index) => {
                        const coords = getMockCoordinates(index);
                        const left = `${50 + Math.sin(index) * 30}%`;
                        const top = `${50 + Math.cos(index) * 30}%`;

                        return (
                            <div
                                key={store.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left, top }}
                            >
                                <div className="relative group">
                                    <div className="h-8 w-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                                        <MapPin className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <div className="bg-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                                            <div className="font-medium">{store.name}</div>
                                            <div className="text-sm text-muted-foreground">{store.location}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {store._count?.employees || 0} employees
                                            </div>
                                        </div>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Store List */}
                <div className="mt-6 space-y-3">
                    <h3 className="font-semibold text-lg">Store Locations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {stores.map((store, index) => (
                            <div key={store.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{store.name}</div>
                                    <div className="text-sm text-muted-foreground">{store.location}</div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {store._count?.employees || 0} staff
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}