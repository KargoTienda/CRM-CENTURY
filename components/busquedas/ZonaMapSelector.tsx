"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, MapPin } from "lucide-react";

const BARRIOS_CABA = [
  "Agronomía","Almagro","Balvanera","Barracas","Belgrano","Boedo","Caballito",
  "Chacarita","Coghlan","Colegiales","Constitución","Floresta","Flores",
  "La Boca","La Paternal","Liniers","Mataderos","Monte Castro","Monserrat",
  "Nueva Pompeya","Núñez","Palermo","Parque Avellaneda","Parque Chacabuco",
  "Parque Chas","Parque Patricios","Puerto Madero","Recoleta","Retiro",
  "Saavedra","San Cristóbal","San Nicolás","San Telmo","Soldati","Tribunales",
  "Vélez Sársfield","Versalles","Villa Crespo","Villa del Parque","Villa Devoto",
  "Villa General Mitre","Villa Lugano","Villa Luro","Villa Ortúzar",
  "Villa Pueyrredón","Villa Real","Villa Riachuelo","Villa Santa Rita",
  "Villa Soldati","Villa Urquiza",
];

const ZONAS_GBA = [
  "San Isidro","Vicente López","Tigre","Pilar","San Fernando","Escobar",
  "Campana","Zárate","La Matanza","Morón","Tres de Febrero","Ituzaingó",
  "Merlo","Moreno","Hurlingham","Lanús","Lomas de Zamora","Quilmes",
  "Avellaneda","Almirante Brown","Berazategui","Florencio Varela","Esteban Echeverría",
];

interface Props {
  value: string[];
  onChange: (zonas: string[]) => void;
}

export default function ZonaMapSelector({ value, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);
  const geojsonLayerRef = useRef<import("leaflet").GeoJSON | null>(null);
  const valueRef = useRef<string[]>(value);
  const onChangeRef = useRef(onChange);
  const [tab, setTab] = useState<"caba" | "gba">("caba");
  const [search, setSearch] = useState("");
  const [mapReady, setMapReady] = useState(false);

  // Keep refs in sync
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const getStyle = useCallback((barrio: string) => {
    const selected = valueRef.current.some(v => v.toLowerCase() === barrio.toLowerCase());
    return {
      fillColor: selected ? "#2563eb" : "#94a3b8",
      fillOpacity: selected ? 0.55 : 0.12,
      color: selected ? "#1d4ed8" : "#64748b",
      weight: selected ? 2 : 1,
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstance.current) return;

    let L: typeof import("leaflet");

    const init = async () => {
      L = (await import("leaflet")).default as typeof import("leaflet");

      // Fix Leaflet default icons in Next.js
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [-34.615, -58.443],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
      setMapReady(true);

      // Load CABA barrios GeoJSON
      try {
        const res = await fetch(
          "https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-educacion/barrios/barrios.geojson"
        );
        const geojson = await res.json();

        const geoLayer = L.geoJSON(geojson, {
          style: (feature) => {
            const name = (feature?.properties?.BARRIO || feature?.properties?.nombre || "") as string;
            return getStyle(name);
          },
          onEachFeature: (feature, layer) => {
            const rawName = (feature?.properties?.BARRIO || feature?.properties?.nombre || "") as string;
            if (!rawName) return;

            // Normalize to title case
            const barrio = rawName
              .toLowerCase()
              .replace(/\b\w/g, (c) => c.toUpperCase());

            layer.bindTooltip(`<strong>${barrio}</strong>`, {
              permanent: false,
              sticky: true,
              className: "leaflet-tooltip-barrio",
            });

            layer.on("click", () => {
              const current = valueRef.current;
              const exists = current.some(v => v.toLowerCase() === barrio.toLowerCase());
              const next = exists
                ? current.filter(v => v.toLowerCase() !== barrio.toLowerCase())
                : [...current, barrio];
              onChangeRef.current(next);

              // Update style immediately on this layer
              const pathLayer = layer as import("leaflet").Path;
              const isNowSelected = !exists;
              pathLayer.setStyle({
                fillColor: isNowSelected ? "#2563eb" : "#94a3b8",
                fillOpacity: isNowSelected ? 0.55 : 0.12,
                color: isNowSelected ? "#1d4ed8" : "#64748b",
                weight: isNowSelected ? 2 : 1,
              });
            });

            layer.on("mouseover", () => {
              const pathLayer = layer as import("leaflet").Path;
              const isSelected = valueRef.current.some(v => v.toLowerCase() === barrio.toLowerCase());
              pathLayer.setStyle({
                fillOpacity: isSelected ? 0.7 : 0.3,
                weight: isSelected ? 2.5 : 1.5,
              });
            });

            layer.on("mouseout", () => {
              const pathLayer = layer as import("leaflet").Path;
              const isSelected = valueRef.current.some(v => v.toLowerCase() === barrio.toLowerCase());
              pathLayer.setStyle({
                fillOpacity: isSelected ? 0.55 : 0.12,
                weight: isSelected ? 2 : 1,
              });
            });
          },
        }).addTo(map);

        geojsonLayerRef.current = geoLayer;
      } catch (err) {
        console.warn("GeoJSON CABA no disponible:", err);
      }
    };

    init();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        geojsonLayerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. from chip removal) to map styles
  useEffect(() => {
    if (!geojsonLayerRef.current) return;
    geojsonLayerRef.current.eachLayer((layer) => {
      const feature = (layer as { feature?: { properties?: { BARRIO?: string; nombre?: string } } }).feature;
      if (!feature?.properties) return;
      const rawName = feature.properties.BARRIO || feature.properties.nombre || "";
      const barrio = rawName.toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
      const selected = value.some(v => v.toLowerCase() === barrio.toLowerCase());
      (layer as import("leaflet").Path).setStyle({
        fillColor: selected ? "#2563eb" : "#94a3b8",
        fillOpacity: selected ? 0.55 : 0.12,
        color: selected ? "#1d4ed8" : "#64748b",
        weight: selected ? 2 : 1,
      });
    });
  }, [value]);

  function toggleZona(zona: string) {
    const exists = value.some(v => v.toLowerCase() === zona.toLowerCase());
    onChange(exists ? value.filter(v => v.toLowerCase() !== zona.toLowerCase()) : [...value, zona]);
  }

  const cabaFiltered = BARRIOS_CABA.filter(b => b.toLowerCase().includes(search.toLowerCase()));
  const gbaFiltered = ZONAS_GBA.filter(b => b.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-3">
      {/* Chips seleccionados */}
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-3 bg-blue-50 rounded-xl border border-blue-100">
          {value.map((z) => (
            <span key={z} className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
              <MapPin className="w-3 h-3" />
              {z}
              <button type="button" onClick={() => toggleZona(z)} className="hover:opacity-70 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button type="button" onClick={() => onChange([])} className="text-xs text-blue-400 hover:text-red-500 transition ml-1">
            Limpiar todo
          </button>
        </div>
      ) : (
        <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-sm text-gray-400">
          Ningún barrio seleccionado — hacé click en el mapa o usá la lista
        </div>
      )}

      {/* Mapa */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 340 }}>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <div ref={mapRef} className="w-full h-full" />
        {!mapReady && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Cargando mapa...</p>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-gray-600 shadow pointer-events-none">
          Click en un barrio para seleccionarlo
        </div>
      </div>

      {/* Lista rápida CABA / GBA */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button type="button" onClick={() => setTab("caba")}
            className={`flex-1 py-2 text-sm font-medium transition ${tab === "caba" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
            CABA (48 barrios)
          </button>
          <button type="button" onClick={() => setTab("gba")}
            className={`flex-1 py-2 text-sm font-medium transition ${tab === "gba" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}>
            GBA
          </button>
        </div>
        <div className="p-3">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar en ${tab === "caba" ? "CABA" : "GBA"}...`}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {(tab === "caba" ? cabaFiltered : gbaFiltered).map((barrio) => {
              const selected = value.some(v => v.toLowerCase() === barrio.toLowerCase());
              return (
                <button key={barrio} type="button" onClick={() => toggleZona(barrio)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    selected ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  {barrio}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
