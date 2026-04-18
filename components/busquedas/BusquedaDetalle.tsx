"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/utils";
import {
  ExternalLink, ChevronDown, ChevronUp, Sparkles, Search,
  Brain, RefreshCw, Link2, Settings, X, Check, MapPin,
  Building2, Eye,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const DownloadBusquedaPDF = dynamic(
  () => import("./BusquedaPDF"),
  { ssr: false, loading: () => <button className="px-3 py-2 rounded-xl text-xs font-semibold opacity-50" style={{ background: "#BEAF87", color: "#3C3A3C" }}>Cargando PDF...</button> }
);

const ZonaMapSelector = dynamic(() => import("@/components/busquedas/ZonaMapSelector"), {
  ssr: false,
  loading: () => <div className="h-80 rounded-2xl skeleton" />,
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
  PENDIENTE: "bg-gray-100 text-gray-500",
  LLAMAR: "bg-green-100 text-green-700",
  CONTACTADO: "bg-blue-100 text-blue-700",
  VISITA_AGENDADA: "bg-purple-100 text-purple-700",
  VISITADO: "bg-indigo-100 text-indigo-700",
  DESCARTADO: "bg-red-100 text-red-500",
  RESERVADO: "bg-amber-100 text-amber-700",
};

const ESTADOS_CLIENTE = ["PENDIENTE", "LLAMAR", "CONTACTADO", "VISITA_AGENDADA", "VISITADO", "DESCARTADO"];
const TIPOS = ["departamento", "casa", "ph", "local", "oficina", "terreno"];

const PORTALES = [
  { id: "zonaprop", label: "ZonaProp", emoji: "🏠", active: true },
  { id: "argenprop", label: "ArgenProp", emoji: "🏢", active: false },
  { id: "mercadolibre", label: "Mercado Libre", emoji: "🛒", active: false },
  { id: "navent", label: "Navent", emoji: "🔍", active: false },
];

function ScoreBadge({ score }: { score: number }) {
  const rounded = Math.round(score);
  const cls = rounded >= 70 ? "high" : rounded >= 40 ? "mid" : "low";
  return (
    <div className={`score-ring ${cls}`}>
      {rounded}
    </div>
  );
}

export default function BusquedaDetalle({ busqueda }: { busqueda: Busqueda }) {
  const router = useRouter();
  const [expandida, setExpandida] = useState<number | null>(null);
  const [scraping, setScraping] = useState(false);
  const [ranking, setRanking] = useState(false);
  const [actualizandoCtx, setActualizandoCtx] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showPortalSelector, setShowPortalSelector] = useState(false);
  const [portalesSeleccionados, setPortalesSeleccionados] = useState(["zonaprop"]);

  const zonas = (Array.isArray(busqueda.zonas) ? busqueda.zonas : JSON.parse(busqueda.zonas || "[]")) as string[];

  const [editForm, setEditForm] = useState({
    zonas,
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
    setShowPortalSelector(false);
    setScraping(true);
    try {
      const res = await fetch(`/api/busquedas/${busqueda.id}/scrape`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        if (data.total > 0) {
          toast.success(`✨ ${data.total} propiedades nuevas encontradas`);
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
        toast.success(`🤖 ${data.rankings?.length || data.total || 0} propiedades rankeadas`);
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
        toast.success("Contexto actualizado con el feedback del cliente");
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
      toast.success("Link copiado 🔗");
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

  const totalProps = busqueda.propiedades.length;
  const conScore = busqueda.propiedades.filter((p) => p.scoreIA != null).length;
  const topProps = busqueda.propiedades.filter(
    (p) => p.estadoCliente === "LLAMAR" || p.estadoCliente === "VISITA_AGENDADA"
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--ocean)] to-[var(--turquoise)] flex items-center justify-center text-white font-bold text-sm">
                {busqueda.cliente?.nombre?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">{busqueda.cliente?.nombre ?? "Sin cliente"}</h1>
                <p className="text-xs text-[var(--text-muted)]">Búsqueda activa</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--text-muted)]">
              {zonas.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {zonas.join(", ")}
                </span>
              )}
              {busqueda.tipoPropiedad && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {busqueda.tipoPropiedad}
                </span>
              )}
              {(busqueda.ambientesMin || busqueda.ambientesMax) && (
                <span>
                  {busqueda.ambientesMin && busqueda.ambientesMax
                    ? `${busqueda.ambientesMin}–${busqueda.ambientesMax} amb`
                    : busqueda.ambientesMin
                    ? `${busqueda.ambientesMin}+ amb`
                    : `hasta ${busqueda.ambientesMax} amb`}
                </span>
              )}
              {busqueda.precioMin && <span>Desde {formatMoney(busqueda.precioMin)}</span>}
              {busqueda.precioMax && <span>Hasta {formatMoney(busqueda.precioMax)}</span>}
              {busqueda.cochera && <span>· Cochera</span>}
              {busqueda.aptoCredito && <span>· Apto crédito</span>}
            </div>
            {busqueda.requisitosExtra && (
              <p className="text-xs text-[var(--text-muted)] italic">"{busqueda.requisitosExtra}"</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <DownloadBusquedaPDF busqueda={busqueda} propiedades={busqueda.propiedades} />
            <button
              onClick={() => setShowEdit(true)}
              className="btn-secondary text-xs px-3 py-2 rounded-xl"
            >
              <Settings className="w-3.5 h-3.5" />
              Configurar
            </button>
            <button
              onClick={() => setShowPortalSelector(true)}
              disabled={scraping}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #F97316, #FB923C)", boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}
            >
              <Search className="w-3.5 h-3.5" />
              {scraping ? "Buscando..." : "Buscar props"}
            </button>
            <button
              onClick={handleRank}
              disabled={ranking}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)", boxShadow: "0 4px 12px rgba(124,58,237,0.35)" }}
            >
              <Brain className="w-3.5 h-3.5" />
              {ranking ? "Rankeando..." : "Rankear IA"}
            </button>
            <button
              onClick={handleActualizarContexto}
              disabled={actualizandoCtx}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #0891B2, #06B6D4)", boxShadow: "0 4px 12px rgba(8,145,178,0.35)" }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actualizandoCtx ? "animate-spin" : ""}`} />
              {actualizandoCtx ? "Aprendiendo..." : "Aprender feedback"}
            </button>
            {busqueda.tokenPublico && (
              <>
                <button
                  onClick={copyLinkCliente}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)", boxShadow: "0 4px 12px rgba(22,163,74,0.35)" }}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Copiar link
                </button>
                <a
                  href={`/busqueda/publica/${busqueda.tokenPublico}`}
                  target="_blank"
                  className="btn-secondary text-xs px-3 py-2 rounded-xl"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vista cliente
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center animate-fade-in-up delay-75">
          <p className="text-2xl font-bold text-gradient">{totalProps}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Propiedades</p>
        </div>
        <div className="card p-4 text-center animate-fade-in-up delay-150">
          <p className="text-2xl font-bold" style={{ color: "#7C3AED" }}>{conScore}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Con score IA</p>
        </div>
        <div className="card p-4 text-center animate-fade-in-up delay-200">
          <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>{topProps}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Interesantes</p>
        </div>
      </div>

      {/* Estado chips */}
      {totalProps > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in-up delay-100">
          {Object.entries(
            busqueda.propiedades.reduce((acc, p) => {
              acc[p.estadoCliente] = (acc[p.estadoCliente] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([estado, count]) => (
            <span key={estado} className={`px-3 py-1 rounded-full text-xs font-semibold ${ESTADO_COLORS[estado]}`}>
              {count} {estado.replace(/_/g, " ").toLowerCase()}
            </span>
          ))}
        </div>
      )}

      {/* Empty state */}
      {totalProps === 0 && (
        <div className="card p-16 text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--ocean-mid)] to-[var(--turquoise)] flex items-center justify-center mx-auto mb-4 animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="font-semibold text-[var(--text-primary)]">No hay propiedades aún</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Hacé click en "Buscar props" para encontrar propiedades en los portales
          </p>
        </div>
      )}

      {/* Propiedades */}
      <div className="space-y-3">
        {busqueda.propiedades.map((prop, idx) => {
          const fotos = prop.fotos ? (JSON.parse(prop.fotos) as string[]) : [];
          const isExpanded = expandida === prop.id;

          return (
            <div
              key={prop.id}
              className="card overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="flex items-center p-4 gap-4">
                {/* Foto */}
                {fotos[0] ? (
                  <img
                    src={fotos[0]}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-20 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-20 h-16 rounded-xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--foam)] flex-shrink-0 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-[var(--text-muted)]" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                    {prop.titulo || prop.direccion || "Sin título"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {[prop.barrio, prop.ambientes ? `${prop.ambientes} amb` : null, prop.superficie ? `${prop.superficie}m²` : null]
                      .filter(Boolean).join(" · ")}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{formatMoney(prop.precio)}</p>
                    {prop.expensas && (
                      <p className="text-xs text-[var(--text-muted)]">+ exp ${prop.expensas?.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {/* Score IA */}
                {prop.scoreIA != null && <ScoreBadge score={prop.scoreIA} />}

                {/* Estado + acciones */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <select
                    value={prop.estadoCliente}
                    onChange={(e) => actualizarEstado(prop.id, e.target.value)}
                    className={`text-xs px-2.5 py-1.5 rounded-full font-semibold border-0 cursor-pointer ${ESTADO_COLORS[prop.estadoCliente]}`}
                  >
                    {ESTADOS_CLIENTE.map((e) => (
                      <option key={e} value={e} className="bg-white text-gray-800">
                        {e.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-1">
                    <a
                      href={prop.linkMarcado || prop.linkOriginal}
                      target="_blank"
                      rel="noopener"
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--ocean)] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setExpandida(isExpanded ? null : prop.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t border-[var(--border)] px-4 py-4 bg-[var(--bg-elevated)] space-y-3 animate-fade-in-down">
                  {prop.razonIA && (
                    <div className="flex gap-2 text-xs text-purple-700 bg-purple-50 rounded-xl p-3 border border-purple-100">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <p>{prop.razonIA}</p>
                    </div>
                  )}
                  {fotos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {fotos.slice(1).map((f, i) => (
                        <img
                          key={i}
                          src={f}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ))}
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">Comentario</label>
                    <textarea
                      rows={2}
                      defaultValue={prop.comentarioCliente || ""}
                      onBlur={(e) => actualizarEstado(prop.id, prop.estadoCliente, e.target.value)}
                      placeholder="Agregar nota sobre esta propiedad..."
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl text-xs resize-none focus:ring-2 focus:ring-[var(--turquoise)] outline-none bg-white"
                    />
                  </div>
                  <div className="flex gap-3 text-xs">
                    <a href={prop.linkOriginal} target="_blank" rel="noopener"
                      className="text-[var(--text-muted)] hover:text-[var(--ocean)] transition-colors">
                      Ver en {prop.portal}
                    </a>
                    {prop.linkMarcado && (
                      <a href={prop.linkMarcado} target="_blank" rel="noopener"
                        className="text-[var(--ocean)] hover:text-[var(--ocean-deep)] font-medium transition-colors">
                        Link con mi branding →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Portal selector modal */}
      {showPortalSelector && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl w-full max-w-sm p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[var(--text-primary)]">¿Dónde buscar?</h3>
              <button onClick={() => setShowPortalSelector(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-[var(--text-muted)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PORTALES.map((p) => {
                const selected = portalesSeleccionados.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={!p.active}
                    onClick={() => {
                      if (!p.active) return;
                      setPortalesSeleccionados((prev) =>
                        prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]
                      );
                    }}
                    className={`portal-chip justify-between ${p.active ? (selected ? "active" : "inactive opacity-100") : "inactive"}`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{p.emoji}</span>
                      <span>{p.label}</span>
                    </span>
                    {!p.active ? (
                      <span className="text-[10px] text-gray-400">Pronto</span>
                    ) : selected ? (
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleScrape}
              disabled={portalesSeleccionados.length === 0}
              className="btn-primary w-full justify-center py-3 disabled:opacity-40"
            >
              <Search className="w-4 h-4" />
              Buscar en {portalesSeleccionados.join(" y ")}
            </button>
          </div>
        </div>
      )}

      {/* Modal edición */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Configurar búsqueda</h2>
              <button onClick={() => setShowEdit(false)}
                className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Barrios / Zonas{" "}
                  {editForm.zonas.length > 0 && (
                    <span className="text-[var(--ocean)] font-normal">({editForm.zonas.length} seleccionados)</span>
                  )}
                </label>
                <ZonaMapSelector
                  value={editForm.zonas}
                  onChange={(z) => setEditForm({ ...editForm, zonas: z })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Tipo</label>
                  <select value={editForm.tipoPropiedad}
                    onChange={(e) => setEditForm({ ...editForm, tipoPropiedad: e.target.value })}
                    className="input-field text-sm">
                    {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Amb. mín.</label>
                  <input type="number" value={editForm.ambientesMin} min={1} max={10}
                    onChange={(e) => setEditForm({ ...editForm, ambientesMin: e.target.value })}
                    className="input-field text-sm" placeholder="1" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Amb. máx.</label>
                  <input type="number" value={editForm.ambientesMax} min={1} max={10}
                    onChange={(e) => setEditForm({ ...editForm, ambientesMax: e.target.value })}
                    className="input-field text-sm" placeholder="5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Precio mín. (USD)</label>
                  <input type="number" value={editForm.precioMin}
                    onChange={(e) => setEditForm({ ...editForm, precioMin: e.target.value })}
                    className="input-field text-sm" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Precio máx. (USD)</label>
                  <input type="number" value={editForm.precioMax}
                    onChange={(e) => setEditForm({ ...editForm, precioMax: e.target.value })}
                    className="input-field text-sm" placeholder="150000" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Modo pago</label>
                  <select value={editForm.modoPago}
                    onChange={(e) => setEditForm({ ...editForm, modoPago: e.target.value })}
                    className="input-field text-sm">
                    <option value="efectivo">Efectivo</option>
                    <option value="credito">Crédito</option>
                    <option value="permuta">Permuta</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.cochera}
                      onChange={(e) => setEditForm({ ...editForm, cochera: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--ocean)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Cochera</span>
                  </label>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.aptoCredito}
                      onChange={(e) => setEditForm({ ...editForm, aptoCredito: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--ocean)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Apto crédito</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Requisitos adicionales</label>
                <textarea value={editForm.requisitosExtra} rows={3}
                  onChange={(e) => setEditForm({ ...editForm, requisitosExtra: e.target.value })}
                  placeholder="Luminoso, piso alto, cerca de subte..."
                  className="input-field text-sm resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={savingEdit}
                  className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-40">
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
                <button type="button" onClick={() => setShowEdit(false)}
                  className="btn-secondary px-4 py-2.5">
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
