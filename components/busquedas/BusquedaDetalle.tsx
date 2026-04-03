"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/utils";
import { ExternalLink, ChevronDown, ChevronUp, Sparkles, Search, Brain, RefreshCw, Link2, Settings, X } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const ZonaMapSelector = dynamic(() => import("@/components/busquedas/ZonaMapSelector"), {
  ssr: false,
  loading: () => <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />,
});

type Propiedad = {
  id: number;
  titulo: string | null;
  direccion: string | null;
  barrio: string | null;
  precio: number | null;
  expensas: number | null;
  ambientes: number | null;
  superficie: number | null;
  linkOriginal: string;
  linkMarcado: string | null;
  portal: string;
  estadoCliente: string;
  comentarioCliente: string | null;
  scoreIA: number | null;
  razonIA: string | null;
  fotos: string | null;
};

type Busqueda = {
  id: number;
  zonas: string;
  tipoPropiedad: string | null;
  ambientesMin: number | null;
  ambientesMax: number | null;
  precioMin: number | null;
  precioMax: number | null;
  modoPago: string | null;
  cochera: boolean | null;
  aptoCredito: boolean | null;
  requisitosExtra: string | null;
  estado: string;
  tokenPublico: string | null;
  propiedades: Propiedad[];
  cliente: { id: number; nombre: string; telefono: string | null };
};

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "bg-gray-100 text-gray-600",
  LLAMAR: "bg-green-100 text-green-700",
  CONTACTADO: "bg-blue-100 text-blue-700",
  VISITA_AGENDADA: "bg-purple-100 text-purple-700",
  VISITADO: "bg-indigo-100 text-indigo-700",
  DESCARTADO: "bg-red-100 text-red-600",
  RESERVADO: "bg-amber-100 text-amber-700",
};

const ESTADOS_CLIENTE = ["PENDIENTE", "LLAMAR", "CONTACTADO", "VISITA_AGENDADA", "VISITADO", "DESCARTADO"];
const TIPOS = ["departamento", "casa", "ph", "local", "oficina", "terreno"];

export default function BusquedaDetalle({ busqueda }: { busqueda: Busqueda }) {
  const router = useRouter();
  const [expandida, setExpandida] = useState<number | null>(null);
  const [scraping, setScraping] = useState(false);
  const [ranking, setRanking] = useState(false);
  const [actualizandoCtx, setActualizandoCtx] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const zonas = JSON.parse(busqueda.zonas || "[]") as string[];

  const [editForm, setEditForm] = useState({
    zonas: zonas,
    tipoPropiedad: busqueda.tipoPropiedad || "departamento",
    ambientesMin: busqueda.ambientesMin?.toString() || "",
    ambientesMax: busqueda.ambientesMax?.toString() || "",
    precioMin: busqueda.precioMin?.toString() || "",
    precioMax: busqueda.precioMax?.toString() || "",
    modoPago: busqueda.modoPago || "efectivo",
    cochera: busqueda.cochera || false,
    aptoCredito: busqueda.aptoCredito || false,
    requisitosExtra: busqueda.requisitosExtra || "",
  });

  async function actualizarEstado(propId: number, estadoCliente: string, comentario?: string) {
    await fetch(`/api/busquedas/${busqueda.id}/propiedades/${propId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estadoCliente, comentarioCliente: comentario }),
    });
    router.refresh();
  }

  async function handleScrape() {
    setScraping(true);
    try {
      const res = await fetch(`/api/busquedas/${busqueda.id}/scrape`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        if (data.total > 0) {
          toast.success(`${data.total} propiedades nuevas (de ${data.totalScrapeado ?? "?"} en ZonaProp, ${data.filtradas ?? data.total} que coinciden)`);
        } else {
          toast.warning(data.mensaje || "No se encontraron propiedades");
        }
        router.refresh();
      } else {
        toast.error(data.error || "Error en scraping");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setScraping(false);
  }

  async function handleRank() {
    setRanking(true);
    try {
      const res = await fetch(`/api/busquedas/${busqueda.id}/ai-rank`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${data.total} propiedades rankeadas con IA`);
        router.refresh();
      } else {
        toast.error(data.error || "Error al rankear");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setRanking(false);
  }

  async function handleActualizarContexto() {
    setActualizandoCtx(true);
    try {
      const res = await fetch(`/api/busquedas/${busqueda.id}/actualizar-contexto`, { method: "POST" });
      if (res.ok) {
        toast.success("Contexto del cliente actualizado con el feedback");
      } else {
        toast.error("Error al actualizar contexto");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setActualizandoCtx(false);
  }

  function copyLinkCliente() {
    if (busqueda.tokenPublico) {
      const url = `${window.location.origin}/busqueda/publica/${busqueda.tokenPublico}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copiado al portapapeles");
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setSavingEdit(true);
    const res = await fetch(`/api/busquedas/${busqueda.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zonas: editForm.zonas,
        tipoPropiedad: editForm.tipoPropiedad,
        ambientesMin: editForm.ambientesMin || null,
        ambientesMax: editForm.ambientesMax || null,
        precioMin: editForm.precioMin || null,
        precioMax: editForm.precioMax || null,
        modoPago: editForm.modoPago,
        cochera: editForm.cochera,
        aptoCredito: editForm.aptoCredito,
        requisitosExtra: editForm.requisitosExtra || null,
      }),
    });
    if (res.ok) {
      toast.success("Búsqueda actualizada");
      setShowEdit(false);
      router.refresh();
    } else {
      toast.error("Error al guardar");
    }
    setSavingEdit(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Búsqueda — {busqueda.cliente.nombre}</h1>
          <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500">
            <span>{zonas.join(", ")}</span>
            {busqueda.tipoPropiedad && <span>· {busqueda.tipoPropiedad}</span>}
            {busqueda.ambientesMin && <span>· {busqueda.ambientesMin}+ amb</span>}
            {busqueda.precioMin && <span>· Desde {formatMoney(busqueda.precioMin)}</span>}
            {busqueda.precioMax && <span>· Hasta {formatMoney(busqueda.precioMax)}</span>}
            {busqueda.modoPago && <span>· {busqueda.modoPago}</span>}
            {busqueda.cochera && <span>· cochera</span>}
            {busqueda.aptoCredito && <span>· apto crédito</span>}
          </div>
          {busqueda.requisitosExtra && (
            <p className="text-xs text-gray-400 mt-1 italic">"{busqueda.requisitosExtra}"</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
          >
            <Settings className="w-4 h-4" />
            Configurar
          </button>
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
          >
            <Search className="w-4 h-4" />
            {scraping ? "Buscando..." : "Buscar props"}
          </button>
          <button
            onClick={handleRank}
            disabled={ranking}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
          >
            <Brain className="w-4 h-4" />
            {ranking ? "Rankeando..." : "Rankear IA"}
          </button>
          <button
            onClick={handleActualizarContexto}
            disabled={actualizandoCtx}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            {actualizandoCtx ? "Actualizando..." : "Aprender feedback"}
          </button>
          {busqueda.tokenPublico && (
            <button
              onClick={copyLinkCliente}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
            >
              <Link2 className="w-4 h-4" />
              Copiar link
            </button>
          )}
          {busqueda.tokenPublico && (
            <a
              href={`/busqueda/publica/${busqueda.tokenPublico}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
            >
              <ExternalLink className="w-4 h-4" />
              Vista cliente
            </a>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 text-sm">
        {Object.entries(
          busqueda.propiedades.reduce((acc, p) => {
            acc[p.estadoCliente] = (acc[p.estadoCliente] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([estado, count]) => (
          <span key={estado} className={`px-3 py-1 rounded-full font-medium ${ESTADO_COLORS[estado]}`}>
            {count} {estado.replace(/_/g, " ").toLowerCase()}
          </span>
        ))}
      </div>

      {/* Propiedades */}
      {busqueda.propiedades.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay propiedades en esta búsqueda</p>
          <p className="text-gray-400 text-sm mt-1">Configurá el perfil y usá "Buscar props"</p>
        </div>
      )}

      <div className="space-y-3">
        {busqueda.propiedades.map((prop) => {
          const fotos = prop.fotos ? JSON.parse(prop.fotos) as string[] : [];
          const isExpanded = expandida === prop.id;

          return (
            <div
              key={prop.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-center p-4 gap-4">
                {/* Foto */}
                {fotos[0] ? (
                  <img
                    src={fotos[0]}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-20 h-14 rounded-lg bg-gray-100 flex-shrink-0" />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {prop.titulo || prop.direccion || "Sin título"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {prop.barrio}{prop.ambientes ? ` · ${prop.ambientes} amb` : ""}{prop.superficie ? ` · ${prop.superficie}m²` : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-semibold text-gray-900">{formatMoney(prop.precio)}</p>
                    {prop.expensas && (
                      <p className="text-xs text-gray-400">+ exp ${prop.expensas?.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {/* Score IA */}
                {prop.scoreIA != null && (
                  <div className="text-center flex-shrink-0">
                    <div className={`text-lg font-bold ${prop.scoreIA >= 70 ? "text-green-600" : prop.scoreIA >= 40 ? "text-yellow-600" : "text-red-500"}`}>
                      {Math.round(prop.scoreIA)}
                    </div>
                    <p className="text-xs text-gray-400">score</p>
                  </div>
                )}

                {/* Estado */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <select
                    value={prop.estadoCliente}
                    onChange={(e) => actualizarEstado(prop.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${ESTADO_COLORS[prop.estadoCliente]}`}
                  >
                    {ESTADOS_CLIENTE.map((e) => (
                      <option key={e} value={e} className="bg-white text-gray-800">{e.replace(/_/g, " ")}</option>
                    ))}
                  </select>

                  <div className="flex gap-1">
                    <a
                      href={prop.linkMarcado || prop.linkOriginal}
                      target="_blank"
                      rel="noopener"
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setExpandida(isExpanded ? null : prop.id)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-3">
                  {prop.razonIA && (
                    <div className="flex gap-2 text-xs text-purple-700 bg-purple-50 rounded-lg p-2">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <p>{prop.razonIA}</p>
                    </div>
                  )}
                  {/* More photos */}
                  {fotos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {fotos.slice(1).map((f, i) => (
                        <img key={i} src={f} alt="" referrerPolicy="no-referrer"
                          className="w-24 h-16 rounded object-cover flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ))}
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Comentario</label>
                    <textarea
                      rows={2}
                      defaultValue={prop.comentarioCliente || ""}
                      onBlur={(e) => actualizarEstado(prop.id, prop.estadoCliente, e.target.value)}
                      placeholder="Agregar nota sobre esta propiedad..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2 text-xs">
                    <a href={prop.linkOriginal} target="_blank" rel="noopener" className="text-gray-500 hover:text-blue-600">
                      Ver en {prop.portal}
                    </a>
                    {prop.linkMarcado && (
                      <a href={prop.linkMarcado} target="_blank" rel="noopener" className="text-blue-600 hover:text-blue-800">
                        · Link con mi branding
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal edición */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Configurar búsqueda</h2>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barrios / Zonas{" "}
                  {editForm.zonas.length > 0 && (
                    <span className="text-blue-600 font-normal">({editForm.zonas.length} seleccionados)</span>
                  )}
                </label>
                <ZonaMapSelector
                  value={editForm.zonas}
                  onChange={(zonas) => setEditForm({ ...editForm, zonas })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={editForm.tipoPropiedad}
                    onChange={(e) => setEditForm({ ...editForm, tipoPropiedad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                  >
                    {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amb. mín.</label>
                  <input type="number" value={editForm.ambientesMin} min={1} max={10}
                    onChange={(e) => setEditForm({ ...editForm, ambientesMin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amb. máx.</label>
                  <input type="number" value={editForm.ambientesMax} min={1} max={10}
                    onChange={(e) => setEditForm({ ...editForm, ambientesMax: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio mín. (USD)</label>
                  <input type="number" value={editForm.precioMin}
                    onChange={(e) => setEditForm({ ...editForm, precioMin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio máx. (USD)</label>
                  <input type="number" value={editForm.precioMax}
                    onChange={(e) => setEditForm({ ...editForm, precioMax: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" placeholder="150000" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modo pago</label>
                  <select value={editForm.modoPago}
                    onChange={(e) => setEditForm({ ...editForm, modoPago: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                    <option value="efectivo">Efectivo</option>
                    <option value="credito">Crédito</option>
                    <option value="permuta">Permuta</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.cochera}
                      onChange={(e) => setEditForm({ ...editForm, cochera: e.target.checked })}
                      className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-700">Cochera</span>
                  </label>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.aptoCredito}
                      onChange={(e) => setEditForm({ ...editForm, aptoCredito: e.target.checked })}
                      className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-700">Apto crédito</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos adicionales</label>
                <textarea value={editForm.requisitosExtra} rows={3}
                  onChange={(e) => setEditForm({ ...editForm, requisitosExtra: e.target.value })}
                  placeholder="Luminoso, piso alto, cerca de subte..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={savingEdit}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition">
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
                <button type="button" onClick={() => setShowEdit(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
