'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTrendStore } from '@/lib/store';
import { fetchTrends, getCategoryColor, generateTrendsForLocation, TrendCategory } from '@/lib/api';
import { Hash, Users, ExternalLink, TrendingUp, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Leaflet setup (icons fix)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getCategoryIcon = (category: TrendCategory, tweetVolume: number) => {
    const size = Math.max(24, Math.min(48, 24 + Math.log10(tweetVolume || 100) * 4));
    const color = getCategoryColor(category);

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
      ">
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: ${color};
          border-radius: 50%;
          opacity: 0.3;
          animation: marker-pulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 4px 12px ${color}40;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            color: white;
            font-size: ${size * 0.35}px;
            font-weight: 700;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          ">${tweetVolume > 10000 ? 'K' : ''}</span>
        </div>
      </div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
};

// Component to handle map movement when location changes
function MapController() {
    const map = useMap();
    const { selectedLocation } = useTrendStore();

    useEffect(() => {
        map.flyTo(
            [selectedLocation.lat, selectedLocation.lng],
            12,
            { duration: 2.5, easeLinearity: 0.25 }
        );
    }, [selectedLocation, map]);

    return null;
}

export default function TrendMap() {
    const {
        trends,
        setTrends,
        selectedLocation,
        isLoading,
        setLoading,
        selectedCategory,
        dataMode,
        setDataMode,
    } = useTrendStore();

    const [mapReady, setMapReady] = useState(false);
    const [mountId] = useState(() => `map-${Date.now()}`);

    // Fetch trends when location changes
    useEffect(() => {
        const loadTrends = async () => {
            setLoading(true);
            try {
                const result = await fetchTrends(selectedLocation.woeid);
                setTrends(result.trends);
                setDataMode(result.meta.source === 'simulation' || result.meta.source === 'client_fallback' ? 'simulation' : 'live');
            } catch (error) {
                console.error("Failed to load trends", error);
                setTrends(generateTrendsForLocation(selectedLocation));
                setDataMode('simulation');
            } finally {
                setLoading(false);
            }
        };

        loadTrends();

        // Refresh every 30s
        const interval = setInterval(loadTrends, 30000);
        return () => clearInterval(interval);
    }, [selectedLocation, setTrends, setLoading, setDataMode]);

    // Filter trends
    const visibleTrends = useMemo(() => {
        if (selectedCategory === 'all') return trends;
        return trends.filter(t => t.category === selectedCategory);
    }, [trends, selectedCategory]);

    return (
        <div className="relative w-full h-full bg-background overflow-hidden rounded-xl border border-white/10 group">

            {isLoading && (
                <div className="absolute inset-0 z-[1000] bg-background/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <div className="text-sm font-medium animate-pulse text-muted-foreground">
                            Scanning social signals in {selectedLocation.name}...
                        </div>
                    </div>
                </div>
            )}

            <MapContainer
                key={mountId}
                center={[selectedLocation.lat, selectedLocation.lng]}
                zoom={12}
                className="w-full h-full z-0"
                zoomControl={false}
                whenReady={() => setMapReady(true)}
            >
                {/* Dark Theme Map Tiles (CartoDB Dark Matter) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    maxZoom={19}
                />

                <ZoomControl position="bottomright" />
                <MapController />

                {visibleTrends.map((trend) => (
                    <Marker
                        key={trend.id}
                        position={[trend.lat, trend.lng]}
                        icon={getCategoryIcon(trend.category, trend.tweetVolume)}
                    >
                        <Popup className="glass-popup" closeButton={false}>
                            <div className="w-[280px] p-1">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={trend.category}>{trend.category}</Badge>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Radio className="w-3 h-3 text-red-500 animate-pulse" /> Live
                                        </span>
                                    </div>
                                    {trend.change && (
                                        <span className={cn(
                                            "text-xs font-bold px-1.5 py-0.5 rounded",
                                            trend.change > 0 ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"
                                        )}>
                                            {trend.change > 0 ? '+' : ''}{trend.change}%
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-foreground mb-1 leading-tight flex items-center gap-2">
                                    <span className="text-primary">{trend.hashtag}</span>
                                </h3>

                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {trend.description}
                                </p>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-surface/50 rounded-lg p-2 text-center border border-white/5">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Volume</div>
                                        <div className="font-bold text-foreground">{trend.tweetVolume.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-surface/50 rounded-lg p-2 text-center border border-white/5">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Sentiment</div>
                                        <div className={cn(
                                            "font-bold capitalize",
                                            trend.sentiment === 'positive' ? 'text-green-400' :
                                                trend.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                                        )}>
                                            {trend.sentiment}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    className="w-full bg-white/10 hover:bg-white/20 text-foreground border-0 backdrop-blur-md"
                                    onClick={() => window.open(trend.url, '_blank')}
                                >
                                    View Discussion <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Data Source Badge */}
            <div className="absolute top-3 left-3 z-[500]">
                <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border flex items-center gap-2",
                    dataMode === 'live'
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                )}>
                    <Radio className={cn("w-3 h-3", dataMode === 'live' ? "text-green-400 animate-pulse" : "text-amber-400")} />
                    {dataMode === 'live' ? 'LIVE DATA' : 'SIMULATION'}
                </div>
            </div>

            {/* Map Overlay Gradients */}
            <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-50 z-[1]" />
        </div>
    );
}
