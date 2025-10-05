"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin } from "lucide-react";

// ------------------ Types ------------------
interface EarthquakeData {
  id: string;
  mag: number | null;
  time: number | null;
  place: string | null;
  depth_km: number | null;
  longitude: number | null;
  latitude: number | null;
  url: string | null;
}

interface EarthquakeResponse {
  region: {
    bbox: [number, number, number, number];
    polygon: any | null;
  };
  query: {
    hours: number;
    minmag: number;
    strictPolygon: boolean;
  };
  count: number;
  earthquakes: EarthquakeData[];
}

interface EarthquakeMapProps {
  onEarthquakeSelection?: (data: EarthquakeResponse) => void;
  className?: string;
}

// ------------------ Component ------------------
export function EarthquakeMap({
  onEarthquakeSelection,
  className = "",
}: EarthquakeMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);

  // Keep runtime objects in refs so we can mutate without rerenders
  const LRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const drawnGroupRef = useRef<any>(null);
  const quakeGroupRef = useRef<any>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [earthquakeData, setEarthquakeData] =
    useState<EarthquakeResponse | null>(null);

  // Controls
  const [hours, setHours] = useState(24);
  const [minMag, setMinMag] = useState(0);
  const [polyFilter, setPolyFilter] = useState(true);

  // Debug state initialization
  console.log("🔧 [DEBUG] Component initialized with state:", {
    isLoading,
    error,
    earthquakeData,
    hours,
    minMag,
    polyFilter
  });

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

  // --------------- Fetch Earthquakes ---------------
  const fetchEarthquakes = useCallback(async () => {
    const L = LRef.current;
    const map = mapRef.current;
    const drawnGroup = drawnGroupRef.current;
    const quakeGroup = quakeGroupRef.current;

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

      console.log("🔍 [DEBUG] Starting earthquake fetch with params:", {
        bbox,
        hours,
        minMag,
        polyFilter,
        polygonRing
      });

      const response = await fetch("/api/earthquakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bbox,
          hours,
          minmag: minMag,
          polygon, // send polygon if you want server-side point-in-polygon
          strictPolygon: polyFilter,
        }),
      });

      console.log("📡 [DEBUG] API Response status:", response.status, response.statusText);

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      console.log("📊 [DEBUG] Raw API response:", data);
      console.log("📊 [DEBUG] Response type:", typeof data);
      console.log("📊 [DEBUG] Response keys:", Object.keys(data));
      console.log("📊 [DEBUG] Earthquakes array:", data.earthquakes);
      console.log("📊 [DEBUG] Earthquakes type:", typeof data.earthquakes);
      console.log("📊 [DEBUG] Earthquakes length:", data.earthquakes?.length);
      console.log("📊 [DEBUG] Is earthquakes array?", Array.isArray(data.earthquakes));

      // Clear previous markers with debugging
      console.log("🗑️ [DEBUG] About to clear markers from quakeGroup:", quakeGroup);
      console.log("🗑️ [DEBUG] Current marker count before clear:", quakeGroup.getLayers().length);
      quakeGroup.clearLayers();
      console.log("🗑️ [DEBUG] Markers cleared. New count:", quakeGroup.getLayers().length);

      // Add new markers
      if (!data.earthquakes || !Array.isArray(data.earthquakes)) {
        console.error("❌ [ERROR] Earthquakes data is not an array:", data.earthquakes);
        throw new Error("Invalid earthquakes data format");
      }

      console.log("✅ [DEBUG] Processing", data.earthquakes.length, "earthquakes");
      data.earthquakes.forEach((quake: any, index: number) => {
        console.log(`🔍 [DEBUG] Processing earthquake ${index}:`, {
          id: quake.id,
          mag: quake.mag,
          latitude: quake.latitude,
          longitude: quake.longitude,
          place: quake.place,
          time: quake.time,
          depth_km: quake.depth_km
        });

        // Validate required properties
        if (quake.mag === null || quake.mag === undefined) {
          console.warn(`⚠️ [WARNING] Earthquake ${index} has null/undefined magnitude:`, quake);
        }
        if (quake.latitude === null || quake.latitude === undefined) {
          console.warn(`⚠️ [WARNING] Earthquake ${index} has null/undefined latitude:`, quake);
        }
        if (quake.longitude === null || quake.longitude === undefined) {
          console.warn(`⚠️ [WARNING] Earthquake ${index} has null/undefined longitude:`, quake);
        }

        const color = quake.mag >= 5 ? "#ef4444" : quake.mag >= 4 ? "#f59e0b" : "#10b981";
        const radius = Math.max(4, quake.mag * 2);

        console.log(`📍 [DEBUG] Creating marker ${index} at [${quake.latitude}, ${quake.longitude}]`);
        const marker = L.circleMarker([quake.latitude, quake.longitude], {
          radius,
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.6,
          color,
        })
          .bindPopup(
            `
          <div class="p-2">
            <strong>🌍 Magnitude ${quake.mag}</strong><br/>
            <strong>Location:</strong> ${quake.place}<br/>
            <strong>Time:</strong> ${new Date(quake.time).toLocaleString()}<br/>
            <strong>Depth:</strong> ${quake.depth_km} km<br/>
            <a href="${quake.url}" target="_blank" class="text-blue-600 hover:underline">View Details</a>
          </div>
        `
          )
          .addTo(quakeGroup);

        console.log(`✅ [DEBUG] Marker ${index} added. Total markers now:`, quakeGroup.getLayers().length);
      });

      console.log("✅ [DEBUG] Successfully processed all earthquakes");
      console.log("📊 [DEBUG] Final marker count:", quakeGroup.getLayers().length);
      console.log("📊 [DEBUG] Setting earthquake data:", data);
      setEarthquakeData(data);
      console.log("📊 [DEBUG] Calling onEarthquakeSelection with full response:", data);
      onEarthquakeSelection?.(data);

      // Track marker persistence over time
      setTimeout(() => {
        console.log("⏰ [DEBUG] 1 second after markers added. Count:", quakeGroup.getLayers().length);
      }, 1000);

      setTimeout(() => {
        console.log("⏰ [DEBUG] 3 seconds after markers added. Count:", quakeGroup.getLayers().length);
      }, 3000);

      setTimeout(() => {
        console.log("⏰ [DEBUG] 5 seconds after markers added. Count:", quakeGroup.getLayers().length);
      }, 5000);

    } catch (err) {
      console.error("❌ [ERROR] Earthquake fetch failed:", err);
      console.error("❌ [ERROR] Error type:", typeof err);
      console.error("❌ [ERROR] Error message:", err instanceof Error ? err.message : "Unknown error");
      console.error("❌ [ERROR] Error stack:", err instanceof Error ? err.stack : "No stack trace");
      
      setError(
        err instanceof Error ? err.message : "Failed to fetch earthquake data"
      );
    } finally {
      console.log("🏁 [DEBUG] Earthquake fetch completed (finally block)");
      setIsLoading(false);
    }
  }, [minMag, onEarthquakeSelection, hours, polyFilter]);

  // --------------- Init Map (StrictMode-safe) ---------------
  useEffect(() => {
    let canceled = false;

    const init = async () => {
      console.log("🗺️ [DEBUG] Map initialization started");
      if (!mapDivRef.current) return;
      if (mapRef.current) {
        console.log("🗺️ [DEBUG] Map already exists, skipping init");
        return; // guard against double init
      }

      const L = await ensureLeaflet();
      await initPlugins(L);

      console.log("🗺️ [DEBUG] Creating new map instance");
      const map = L.map(mapDivRef.current).setView([39, -98], 4);
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 14,
        attribution:
          '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const drawnGroup = L.featureGroup().addTo(map);
      const quakeGroup = L.layerGroup().addTo(map);
      drawnGroupRef.current = drawnGroup;
      quakeGroupRef.current = quakeGroup;

      console.log("🗺️ [DEBUG] Map initialized successfully");
      console.log("🗺️ [DEBUG] QuakeGroup created:", quakeGroup);

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
        console.log("🎨 [DEBUG] Draw event created");
        drawnGroup.clearLayers();
        drawnGroup.addLayer(e.layer);
        const bounds = e.layer.getBounds
          ? e.layer.getBounds()
          : L.geoJSON(e.layer.toGeoJSON()).getBounds();
        map.fitBounds(bounds.pad(0.1));
        setError(null);
      });

      map.on("draw:deleted" as any, () => {
        console.log("🗑️ [DEBUG] Draw event deleted - clearing earthquake markers");
        quakeGroup.clearLayers();
        setEarthquakeData(null);
        setError(null);
      });

      // Geocoder (top-left). Selecting result draws bbox + triggers fetch.
      const geocoder = (L as any).Control.geocoder({
        position: "topleft",
        defaultMarkGeocode: false,
        placeholder: "Search a US place/region…",
        geocoder: (L as any).Control.Geocoder.nominatim({
          geocodingQueryParams: { countrycodes: "us" },
        }),
      })
        .on("markgeocode", (e: any) => {
          console.log("🔍 [DEBUG] Geocoder result selected");
          const b = e.geocode.bbox; // LatLngBounds
          const rect = L.rectangle(b, { weight: 2 });
          drawnGroup.clearLayers();
          drawnGroup.addLayer(rect);
          map.fitBounds(b.pad(0.1));
          // auto-fetch after search
          void fetchEarthquakes();
        })
        .addTo(map);

      // Push top-left stack down so geocoder sits under draw tools
      // (Adjust value if your toolbar grows/tight UI)
      const tl = document.querySelector(
        ".leaflet-top.leaflet-left"
      ) as HTMLElement | null;
      if (tl) tl.style.marginTop = "60px";

      if (canceled) {
        // If unmounted during async init, clean up
        console.log("🗺️ [DEBUG] Map initialization canceled, cleaning up");
        try {
          map.remove();
        } catch {}
      }
    };

    init();

    return () => {
      console.log("🗺️ [DEBUG] Map cleanup started");
      canceled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [fetchEarthquakes]); // run once; internal guards prevent double init in StrictMode

  // --------------- Render ---------------
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Earthquake Region Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Lookback (hours)</label>
              <Input
                type="number"
                min={1}
                max={168}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Min magnitude</label>
              <Input
                type="number"
                step={0.1}
                value={minMag}
                onChange={(e) => setMinMag(Number(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchEarthquakes} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Fetch Earthquakes"
                )}
              </Button>
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

          {earthquakeData && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">{earthquakeData.count} earthquakes found</Badge>
              <Badge variant="secondary">Last {earthquakeData.query.hours} hours</Badge>
              {earthquakeData.query.minmag > 0 && (
                <Badge variant="secondary">Min M{earthquakeData.query.minmag}</Badge>
              )}
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
        <strong>Instructions:</strong> Use the drawing tools (top-left) to draw a rectangle or polygon.
        The search box sits <em>under</em> the tools. Then click "Fetch Earthquakes" to load data from USGS
        for that region.
      </div>
    </div>
  );
}