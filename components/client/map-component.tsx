// components/client/map-component.tsx
"use client"

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'

// Fix for default icons in Leaflet
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
})

// Custom marker icons
const createCustomIcon = (type: 'main' | 'branch' | 'outlet') => {
    const color = type === 'main' ? '#1b2358' : type === 'branch' ? '#FBB320' : '#10B981'
    return new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
        `)}`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    })
}

interface MapComponentProps {
    center: [number, number]
    selectedStore: any
    userLocation: [number, number] | null
    stores: any[]
    onStoreSelect: (store: any) => void
}

export default function MapComponent({
    center,
    selectedStore,
    userLocation,
    stores,
    onStoreSelect
}: MapComponentProps) {
    const getDirections = (store: any) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${store.coordinates[0]},${store.coordinates[1]}`
        window.open(url, '_blank')
    }

    return (
        <MapContainer
            center={center}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Store Markers */}
            {stores.map(store => (
                <Marker
                    key={store.id}
                    position={[store.coordinates[0], store.coordinates[1]]}
                    icon={createCustomIcon(store.type)}
                    eventHandlers={{
                        click: () => onStoreSelect(store),
                    }}
                >
                    <Popup>
                        <div className="p-2 min-w-50">
                            <h4 className="font-bold text-[#1b2358] mb-1">{store.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                            <Button
                                size="sm"
                                className="w-full bg-[#1b2358] hover:bg-[#151d4a]"
                                onClick={() => getDirections(store)}
                            >
                                Get Directions
                            </Button>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* User Location Marker */}
            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={new Icon({
                        iconUrl: `data:image/svg+xml;base64,${btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF4444" width="24" height="24">
                                <circle cx="12" cy="12" r="10"/>
                                <circle cx="12" cy="12" r="3" fill="white"/>
                            </svg>
                        `)}`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    })}
                >
                    <Popup>Your Location</Popup>
                </Marker>
            )}
        </MapContainer>
    )
}