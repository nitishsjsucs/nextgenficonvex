"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Cloud, CloudRain, Sun } from "lucide-react";

// ------------------ Types ------------------
interface WeatherData {
  id: string;
  eventType: string;
  severity: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  startTime: string;
  endTime: string | null;
  description: string | null;
  rainfall: number | null;
  windSpeed: number | null;
  temperature: number | null;
  humidity: number | null;
  source: string | null;
  sourceUrl: string | null;
}

interface WeatherResponse {
  region: {
    bbox: [number, number, number, number];
    polygon: any | null;
  };
  query: {
    days: number;
    eventTypes: string[];
    minSeverity: string;
    strictPolygon: boolean;
  };
  count: number;
  weatherEvents: WeatherData[];
}

interface WeatherMapProps {
  onWeatherSelection?: (data: WeatherResponse) => void;
  className?: string;
  centerZipCode?: string; // New prop for zip code centering
}

// ------------------ Component ------------------
export function WeatherMap({
  onWeatherSelection,
  className = "",
  centerZipCode,
}: WeatherMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);

  // Keep runtime objects in refs so we can mutate without rerenders
  const LRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const drawnGroupRef = useRef<any>(null);
  const weatherGroupRef = useRef<any>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);

  // Controls
  const [days, setDays] = useState(7);
  const [eventTypes, setEventTypes] = useState<string[]>(['rain', 'storm', 'flood']);
  const [minSeverity, setMinSeverity] = useState('moderate');
  const [polyFilter, setPolyFilter] = useState(true);
  const [zipCode, setZipCode] = useState(centerZipCode || '');

  // --------------- Helpers ---------------
  const ensureLeaflet = async () => {
    if (LRef.current) return LRef.current;
    const L = (await import("leaflet")).default;

    // Marker icon URLs (fix for bundlers)
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    LRef.current = L;
    return L;
  };

  const initPlugins = async (L: any) => {
    // Side-effect imports attach to L
    await import("leaflet-draw");
    await import("leaflet-control-geocoder");
  };

  // Convert shape to polygon ring coords [[lon,lat]...]
  const shapeToPolygonRing = (L: any, layer: any): [number, number][] | null => {
    if (!layer) return null;
    if (layer instanceof L.Rectangle) {
      const b = layer.getBounds();
      const sw = b.getSouthWest(),
        ne = b.getNorthEast();
      const nw = L.latLng(ne.lat, sw.lng),
        se = L.latLng(sw.lat, ne.lng);
      return [sw, se, ne, nw, sw].map((ll: any) => [ll.lng, ll.lat]);
    } else if (layer instanceof L.Polygon) {
      const latlngs = layer.getLatLngs?.()[0] ?? [];
      const ring = latlngs.map((ll: any) => [ll.lng, ll.lat]);
      const first = ring[0],
        last = ring[ring.length - 1];
      if (!first || !last) return null;
      if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first);
      return ring;
    }
    return null;
  };

  // Get coordinates for zip code (Bangladesh specific)
  const getZipCodeCoordinates = async (zipCode: string) => {
    try {
      // For Bangladesh zip codes, we'll use a simple mapping
      // In production, you'd use a geocoding service
      const bangladeshZipCodes: { [key: string]: [number, number] } = {
        '1000': [23.8103, 90.4125], // Dhaka
        '1001': [23.8103, 90.4125], // Dhaka
        '4000': [22.3569, 91.7832], // Chittagong
        '3100': [24.8949, 91.8687], // Sylhet
        '6000': [24.3636, 88.6241], // Rajshahi
        '9000': [22.7010, 90.3535], // Barisal
        '8000': [25.7439, 89.2752], // Rangpur
        '4700': [21.4272, 92.0058], // Cox's Bazar
      };

      const coords = bangladeshZipCodes[zipCode];
      if (coords) {
        return { lat: coords[0], lng: coords[1] };
      }

      // If not in our mapping, try to geocode
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${zipCode}+Bangladesh&format=json&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding zip code:', error);
      return null;
    }
  };

  // --------------- Fetch Weather Data ---------------
  const fetchWeatherData = useCallback(async () => {
    const L = LRef.current;
    const map = mapRef.current;
    const drawnGroup = drawnGroupRef.current;
    const weatherGroup = weatherGroupRef.current;

    if (!L || !map || !drawnGroup) return;

    if (drawnGroup.getLayers().length === 0) {
      setError("Please draw a rectangle or polygon on the map first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bounds = drawnGroup.getBounds();
      const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];

      // Get the drawn shape for polygon filtering
      const shape = drawnGroup.getLayers()[0];
      if (!shape) throw new Error("No shape found");

      // Optional polygon payload (for strict server-side filtering if you want)
      const polygonRing = shapeToPolygonRing(L, shape);
      const polygon =
        polygonRing && polygonRing.length >= 4
          ? { type: "Polygon", coordinates: [polygonRing] }
          : null;

      const response = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bbox,
          days,
          eventTypes,
          minSeverity,
          polygon, // send polygon if you want server-side point-in-polygon
          strictPolygon: polyFilter,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      // Clear previous markers
      weatherGroup.clearLayers();

      // Add new markers
      data.forEach((event: any) => {
        let color = "#10b981";
        let icon = "🌦️";
        
        switch (event.eventType) {
          case 'rain':
            color = "#3b82f6";
            icon = "🌧️";
            break;
          case 'storm':
            color = "#f59e0b";
            icon = "⛈️";
            break;
          case 'flood':
            color = "#ef4444";
            icon = "🌊";
            break;
          case 'cyclone':
            color = "#dc2626";
            icon = "🌀";
            break;
          case 'heatwave':
            color = "#f97316";
            icon = "☀️";
            break;
        }

        // Size based on severity
        let radius = 8;
        switch (event.severity) {
          case 'severe': radius = 12; break;
          case 'heavy': radius = 10; break;
          case 'moderate': radius = 8; break;
          case 'light': radius = 6; break;
        }

        L.circleMarker([event.latitude, event.longitude], {
          radius,
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.6,
          color,
        })
          .bindPopup(
            `
          <div class="p-2">
            <strong>${icon} ${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} (${event.severity})</strong><br/>
            <strong>Location:</strong> ${event.location}<br/>
            <strong>Start:</strong> ${new Date(event.startTime).toLocaleString()}<br/>
            ${event.endTime ? `<strong>End:</strong> ${new Date(event.endTime).toLocaleString()}<br/>` : ''}
            <strong>Description:</strong> ${event.description || 'No description available'}
          </div>
        `
          )
          .addTo(weatherGroup);
      });

      setWeatherData(data);
      onWeatherSelection?.(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch weather data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [days, eventTypes, minSeverity, polyFilter, onWeatherSelection]);

  // --------------- Init Map (StrictMode-safe) ---------------
  useEffect(() => {
    let canceled = false;

    const init = async () => {
      if (!mapDivRef.current) return;
      if (mapRef.current) return; // guard against double init

      const L = await ensureLeaflet();
      await initPlugins(L);

      // Default to Bangladesh center, or use zip code if provided
      let initialCenter: [number, number] = [23.6850, 90.3563]; // Bangladesh center
      let initialZoom = 7;

      // If zip code is provided, try to center on it
      if (centerZipCode) {
        const coords = await getZipCodeCoordinates(centerZipCode);
        if (coords) {
          initialCenter = [coords.lat, coords.lng];
          initialZoom = 10; // Zoom in more for specific zip code
        }
      }

      const map = L.map(mapDivRef.current).setView(initialCenter, initialZoom);
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 14,
        attribution:
          '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const drawnGroup = L.featureGroup().addTo(map);
      const weatherGroup = L.layerGroup().addTo(map);
      drawnGroupRef.current = drawnGroup;
      weatherGroupRef.current = weatherGroup;

      // Draw controls
      const drawControl = new L.Control.Draw({
        draw: {
          polygon: { allowIntersection: false, showArea: true, shapeOptions: { weight: 2 } },
          rectangle: { shapeOptions: { weight: 2 } },
          polyline: false,
          circle: false,
          circlemarker: false,
          marker: false,
        },
        edit: { featureGroup: drawnGroup, remove: true },
      });
      map.addControl(drawControl);

      // Handle draw events
      map.on(L.Draw.Event.CREATED as any, (e: any) => {
        drawnGroup.clearLayers();
        drawnGroup.addLayer(e.layer);
        const bounds = e.layer.getBounds
          ? e.layer.getBounds()
          : L.geoJSON(e.layer.toGeoJSON()).getBounds();
        map.fitBounds(bounds.pad(0.1));
        setError(null);
      });

      map.on("draw:deleted" as any, () => {
        weatherGroup.clearLayers();
        setWeatherData(null);
        setError(null);
      });

      // Geocoder (top-left). Selecting result draws bbox + triggers fetch.
      const geocoder = (L as any).Control.geocoder({
        position: "topleft",
        defaultMarkGeocode: false,
        placeholder: "Search Bangladesh location…",
        geocoder: (L as any).Control.Geocoder.nominatim({
          geocodingQueryParams: { countrycodes: "bd" }, // Bangladesh country code
        }),
      })
        .on("markgeocode", (e: any) => {
          const b = e.geocode.bbox; // LatLngBounds
          const rect = L.rectangle(b, { weight: 2 });
          drawnGroup.clearLayers();
          drawnGroup.addLayer(rect);
          map.fitBounds(b.pad(0.1));
          // auto-fetch after search
          void fetchWeatherData();
        })
        .addTo(map);

      // Push top-left stack down so geocoder sits under draw tools
      const tl = document.querySelector(
        ".leaflet-top.leaflet-left"
      ) as HTMLElement | null;
      if (tl) tl.style.marginTop = "60px";

      if (canceled) {
        // If unmounted during async init, clean up
        try {
          map.remove();
        } catch {}
      }
    };

    init();

    return () => {
      canceled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [centerZipCode, fetchWeatherData]); // Re-init if centerZipCode changes

  // --------------- Center on Zip Code ---------------
  const centerOnZipCode = async () => {
    if (!zipCode || !mapRef.current) return;
    
    setIsLoading(true);
    try {
      const coords = await getZipCodeCoordinates(zipCode);
      if (coords) {
        const L = LRef.current;
        mapRef.current.setView([coords.lat, coords.lng], 10);
        
        // Draw a small rectangle around the zip code area
        const drawnGroup = drawnGroupRef.current;
        if (drawnGroup) {
          drawnGroup.clearLayers();
          const bounds = L.latLngBounds(
            [coords.lat - 0.05, coords.lng - 0.05],
            [coords.lat + 0.05, coords.lng + 0.05]
          );
          const rect = L.rectangle(bounds, { weight: 2 });
          drawnGroup.addLayer(rect);
        }
        setError(null);
      } else {
        setError('Could not find coordinates for zip code: ' + zipCode);
      }
    } catch (error) {
      setError('Error centering on zip code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };


  const getWeatherIcon = (eventType: string) => {
    switch (eventType) {
      case 'rain': return <CloudRain className="h-4 w-4" />;
      case 'storm': return <Cloud className="h-4 w-4" />;
      case 'heatwave': return <Sun className="h-4 w-4" />;
      default: return <Cloud className="h-4 w-4" />;
    }
  };

  // --------------- Render ---------------
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Bangladesh Weather Insurance Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Zip Code Centering */}
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Bank/Branch Zip Code</label>
              <Input
                type="text"
                placeholder="e.g. 1000"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={centerOnZipCode} 
                disabled={isLoading || !zipCode} 
                variant="outline"
                className="w-full"
              >
                Center Map
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Forecast days</label>
              <Input
                type="number"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Min severity</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={minSeverity}
                onChange={(e) => setMinSeverity(e.target.value)}
              >
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="heavy">Heavy</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchWeatherData} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Fetch Weather"
                )}
              </Button>
            </div>
          </div>

          {/* Event Types */}
          <div>
            <label className="text-sm font-medium">Event Types</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['rain', 'storm', 'flood', 'cyclone', 'heatwave'].map((type) => (
                <Button
                  key={type}
                  variant={eventTypes.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (eventTypes.includes(type)) {
                      setEventTypes(eventTypes.filter(t => t !== type));
                    } else {
                      setEventTypes([...eventTypes, type]);
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  {getWeatherIcon(type)}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="polyFilter"
              checked={polyFilter}
              onChange={(e) => setPolyFilter(e.target.checked)}
            />
            <label htmlFor="polyFilter" className="text-sm">
              Strictly inside polygon (if polygon drawn)
            </label>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {weatherData && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{weatherData.count} weather events found</Badge>
              <Badge variant="secondary">Next {weatherData.query.days} days</Badge>
              <Badge variant="secondary">Min {weatherData.query.minSeverity}</Badge>
              {weatherData.query.eventTypes.map(type => (
                <Badge key={type} variant="outline" className="flex items-center gap-1">
                  {getWeatherIcon(type)}
                  {type}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div ref={mapDivRef} className="w-full h-96 rounded-lg" style={{ minHeight: "400px" }} />
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
        <strong>Instructions:</strong> Enter a zip code to center the map on a specific area, or use the drawing tools (top-left) to draw a rectangle or polygon.
        The search box sits <em>under</em> the tools. Select weather event types and then click "Fetch Weather" to load Bangladesh weather data for that region.
      </div>
    </div>
  );
}
