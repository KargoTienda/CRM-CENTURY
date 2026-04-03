"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Home, Phone, ThumbsDown, ThumbsUp, ExternalLink } from "lucide-react";

interface PropiedadBusqueda {
  id: number;
  titulo?: string;
  direccion?: string;
  barrio?: string;
  precio?: number;
  expensas?: number;
  ambientes?: number;
  superficie?: number;
  cochera?: boolean;
  fotos?: string;
  linkOriginal: string;
  linkMarcado?: string;
  portal: string;
  estadoCliente: string;
  comentarioCliente?: string;
  scoreIA?: number;
  razonIA?: string;
}

interface Busqueda {
  id: number;
  cliente: { nombre: string };
  zonas: string;
  tipoPropiedad?: string;
  ambientesMin?: number;
  ambientesMax?: number;
  precioMin?: number;
  precioMax?: number;
  propiedades: PropiedadBusqueda[];
}

function formatMoney(val?: number | null) {
  if (!val) return "—";
  return "USD " + val.toLocaleString("es-AR");
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-gray-100 text-gray-600" },
  LLAMAR: { label: "Quiero verla", color: "bg-green-100 text-green-700" },
  DESCARTADO: { label: "No me interesa", color: "bg-red-100 text-red-600" },
  CONTACTADO: { label: "Contactado", color: "bg-blue-100 text-blue-700" },
  VISITA_AGENDADA: { label: "Visita agendada", color: "bg-purple-100 text-purple-700" },
  VISITADO: { label: "Visitado", color: "bg-indigo-100 text-indigo-700" },
  RESERVADO: { label: "Reservado", color: "bg-orange-100 text-orange-700" },
};

export default function BusquedaPublicaPage({ params }: { params: { token: string } }) {
  const [busqueda, setBusqueda] = useState<Busqueda | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/busquedas/publica/${params.token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setBusqueda(data);
        setLoading(false);
      });
  }, [params.token]);

  async function marcarEstado(propId: number, estadoCliente: string, comentario?: string) {
    setUpdating(propId);
    const res = await fetch(`/api/busquedas/${busqueda!.id}/propiedades/${propId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estadoCliente, comentarioCliente: comentario }),
    });
    if (res.ok && busqueda) {
      setBusqueda({
        ...busqueda,
        propiedades: busqueda.propiedades.map((p) =>
          p.id === propId ? { ...p, estadoCliente, comentarioCliente: comentario } : p
        ),
      });
    }
    setUpdating(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  if (notFound || !busqueda) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-gray-700">Búsqueda no encontrada</h1>
          <p className="text-gray-400 mt-1">El link puede haber expirado o ser incorrecto.</p>
        </div>
      </div>
    );
  }

  const zonas = JSON.parse(busqueda.zonas || "[]");
  const pendientes = busqueda.propiedades.filter((p) => p.estadoCliente === "PENDIENTE").length;
  const interesadas = busqueda.propiedades.filter((p) => p.estadoCliente === "LLAMAR").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-gray-900">Propiedades para {busqueda.cliente.nombre}</h1>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {zonas.join(", ")}
              {busqueda.tipoPropiedad && ` · ${busqueda.tipoPropiedad}`}
              {busqueda.precioMax && ` · hasta ${formatMoney(busqueda.precioMax)}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{busqueda.propiedades.length} propiedades</p>
            <p className="text-xs text-gray-400">{interesadas} me interesa · {pendientes} sin revisar</p>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <strong>¿Cómo funciona?</strong> Revisá cada propiedad y tocá{" "}
          <span className="font-semibold">Quiero verla</span> si te interesa o{" "}
          <span className="font-semibold">No me interesa</span> para descartarla.
          Tu agente verá tus elecciones en tiempo real.
        </div>
      </div>

      {/* Grid de propiedades */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {busqueda.propiedades.length === 0 && (
          <div className="text-center py-16">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aún no hay propiedades en esta búsqueda.</p>
          </div>
        )}

        {busqueda.propiedades.map((prop) => {
          const fotos: string[] = prop.fotos ? JSON.parse(prop.fotos) : [];
          const estadoInfo = ESTADO_LABELS[prop.estadoCliente] || ESTADO_LABELS.PENDIENTE;
          const isUpdating = updating === prop.id;

          return (
            <div
              key={prop.id}
              className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                prop.estadoCliente === "LLAMAR"
                  ? "border-green-300 shadow-md"
                  : prop.estadoCliente === "DESCARTADO"
                  ? "border-gray-200 opacity-60"
                  : "border-gray-200"
              }`}
            >
              {/* Foto principal */}
              {fotos.length > 0 && (
                <div className="h-48 overflow-hidden">
                  <img src={fotos[0]} alt={prop.titulo || ""} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {prop.titulo || prop.direccion || "Propiedad"}
                    </h3>
                    {prop.direccion && prop.titulo && (
                      <p className="text-xs text-gray-500 mt-0.5">{prop.direccion}</p>
                    )}
                    {prop.barrio && <p className="text-xs text-gray-400">{prop.barrio}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0 ${estadoInfo.color}`}>
                    {estadoInfo.label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-sm my-3">
                  {prop.precio && (
                    <span className="font-bold text-gray-900">{formatMoney(prop.precio)}</span>
                  )}
                  {prop.expensas && (
                    <span className="text-gray-400 text-xs">+ exp. ${prop.expensas.toLocaleString()}</span>
                  )}
                  {prop.ambientes && (
                    <span className="text-gray-600 text-xs">{prop.ambientes} amb.</span>
                  )}
                  {prop.superficie && (
                    <span className="text-gray-600 text-xs">{prop.superficie} m²</span>
                  )}
                  {prop.cochera && (
                    <span className="text-gray-600 text-xs">🚗 Cochera</span>
                  )}
                </div>

                {prop.razonIA && (
                  <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg mb-3">
                    ✨ {prop.razonIA}
                  </p>
                )}

                {prop.comentarioCliente && (
                  <p className="text-xs text-gray-500 italic mb-3">"{prop.comentarioCliente}"</p>
                )}

                <div className="flex gap-2">
                  <a
                    href={prop.linkMarcado || prop.linkOriginal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs flex-1 justify-center hover:bg-gray-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver en {prop.portal}
                  </a>
                  <button
                    onClick={() => marcarEstado(prop.id, "LLAMAR")}
                    disabled={isUpdating || prop.estadoCliente === "LLAMAR"}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium flex-1 justify-center transition ${
                      prop.estadoCliente === "LLAMAR"
                        ? "bg-green-600 text-white"
                        : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {prop.estadoCliente === "LLAMAR" ? "¡Anotada!" : "Quiero verla"}
                  </button>
                  <button
                    onClick={() => marcarEstado(prop.id, "DESCARTADO")}
                    disabled={isUpdating || prop.estadoCliente === "DESCARTADO"}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium flex-1 justify-center transition ${
                      prop.estadoCliente === "DESCARTADO"
                        ? "bg-gray-600 text-white"
                        : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    No me interesa
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8 text-center">
        <p className="text-xs text-gray-400">
          Búsqueda preparada especialmente para vos · CRM Inmobiliario
        </p>
      </div>
    </div>
  );
}
