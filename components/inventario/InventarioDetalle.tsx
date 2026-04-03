"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  ExternalLink,
  MessageCircle,
  Plus,
  Star,
  Trash2,
  User,
} from "lucide-react";
import { formatMoney, formatDate, whatsappLink } from "@/lib/utils";

type Visita = {
  id: number;
  fecha: string | Date;
  feedback?: string | null;
  interes?: string | null;
  cliente?: { nombre: string } | null;
};

type Reserva = {
  id: number;
  estado: string;
  fechaReserva: string | Date;
  nombreCliente: string;
};

type Propiedad = {
  id: number;
  titulo: string;
  direccion: string;
  barrio?: string | null;
  zona?: string | null;
  tipo: string;
  ambientes?: number | null;
  superficie?: number | null;
  cochera: boolean;
  precioPublicado?: number | null;
  precioNegociado?: number | null;
  moneda: string;
  tipoTransaccion: string;
  estado: string;
  linkPortal?: string | null;
  porcentajeComision?: number | null;
  origen?: string | null;
  cliente?: { id: number; nombre: string; telefono?: string | null } | null;
  visitas: Visita[];
  reservas: Reserva[];
  creadoEn: string | Date;
};

const ESTADO_COLORS: Record<string, string> = {
  activa: "bg-green-100 text-green-700",
  en_negociacion: "bg-yellow-100 text-yellow-700",
  reservada: "bg-blue-100 text-blue-700",
  vendida: "bg-gray-100 text-gray-600",
  retirada: "bg-red-100 text-red-600",
};

const INTERES_COLORS: Record<string, string> = {
  alto: "text-green-600 bg-green-50",
  medio: "text-yellow-600 bg-yellow-50",
  bajo: "text-red-600 bg-red-50",
};

export default function InventarioDetalle({
  propiedad,
  clientes,
}: {
  propiedad: Propiedad;
  clientes: { id: number; nombre: string }[];
}) {
  const [visitas, setVisitas] = useState<Visita[]>(propiedad.visitas);
  const [showVisitaForm, setShowVisitaForm] = useState(false);
  const [loadingVisita, setLoadingVisita] = useState(false);
  const [visitaForm, setVisitaForm] = useState({
    clienteId: "",
    fecha: new Date().toISOString().slice(0, 10),
    feedback: "",
    interes: "medio",
  });

  const [estado, setEstado] = useState(propiedad.estado);
  const [updatingEstado, setUpdatingEstado] = useState(false);

  async function handleEstadoChange(nuevoEstado: string) {
    setUpdatingEstado(true);
    await fetch(`/api/inventario/${propiedad.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    setEstado(nuevoEstado);
    setUpdatingEstado(false);
  }

  async function handleAgregarVisita(e: React.FormEvent) {
    e.preventDefault();
    setLoadingVisita(true);

    const res = await fetch(`/api/inventario/${propiedad.id}/visitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitaForm),
    });

    if (res.ok) {
      const nueva = await res.json();
      setVisitas([nueva, ...visitas]);
      setShowVisitaForm(false);
      setVisitaForm({ clienteId: "", fecha: new Date().toISOString().slice(0, 10), feedback: "", interes: "medio" });
    }
    setLoadingVisita(false);
  }

  async function handleEliminarVisita(visitaId: number) {
    if (!confirm("¿Eliminar esta visita?")) return;
    await fetch(`/api/inventario/${propiedad.id}/visitas?visitaId=${visitaId}`, { method: "DELETE" });
    setVisitas(visitas.filter((v) => v.id !== visitaId));
  }

  // Calcular comisión estimada
  const comisionEstimada = propiedad.precioPublicado && propiedad.porcentajeComision
    ? propiedad.precioPublicado * (propiedad.porcentajeComision / 100)
    : null;
  const comisionMia = comisionEstimada ? comisionEstimada * 0.25 : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/inventario" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{propiedad.titulo}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[estado] || "bg-gray-100 text-gray-600"}`}>
                {estado.replace("_", " ")}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{propiedad.direccion}{propiedad.barrio ? `, ${propiedad.barrio}` : ""}</p>
          </div>
        </div>
        {propiedad.linkPortal && (
          <a
            href={propiedad.linkPortal}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="w-4 h-4" />
            Ver en portal
          </a>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Info principal */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Datos de la propiedad</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Tipo:</span> <span className="font-medium ml-1">{propiedad.tipo}</span></div>
              {propiedad.ambientes && <div><span className="text-gray-500">Ambientes:</span> <span className="font-medium ml-1">{propiedad.ambientes}</span></div>}
              {propiedad.superficie && <div><span className="text-gray-500">Superficie:</span> <span className="font-medium ml-1">{propiedad.superficie} m²</span></div>}
              <div><span className="text-gray-500">Cochera:</span> <span className="font-medium ml-1">{propiedad.cochera ? "Sí" : "No"}</span></div>
              <div><span className="text-gray-500">Operación:</span> <span className="font-medium ml-1 capitalize">{propiedad.tipoTransaccion}</span></div>
              {propiedad.zona && <div><span className="text-gray-500">Zona:</span> <span className="font-medium ml-1">{propiedad.zona}</span></div>}
              {propiedad.origen && <div><span className="text-gray-500">Origen:</span> <span className="font-medium ml-1">{propiedad.origen}</span></div>}
              <div><span className="text-gray-500">Captada el:</span> <span className="font-medium ml-1">{formatDate(propiedad.creadoEn)}</span></div>
            </div>
          </div>

          {/* Cambiar estado */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Estado</h2>
            <div className="flex flex-wrap gap-2">
              {["activa", "en_negociacion", "reservada", "vendida", "retirada"].map((e) => (
                <button
                  key={e}
                  onClick={() => handleEstadoChange(e)}
                  disabled={updatingEstado || e === estado}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    e === estado
                      ? `${ESTADO_COLORS[e]} ring-2 ring-offset-1 ring-current`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {e.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Visitas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                Visitas <span className="text-gray-400 font-normal text-sm">({visitas.length})</span>
              </h2>
              <button
                onClick={() => setShowVisitaForm(!showVisitaForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar visita
              </button>
            </div>

            {showVisitaForm && (
              <form onSubmit={handleAgregarVisita} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
                    <select
                      value={visitaForm.clienteId}
                      onChange={(e) => setVisitaForm({ ...visitaForm, clienteId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                    >
                      <option value="">Sin cliente...</option>
                      {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={visitaForm.fecha}
                      onChange={(e) => setVisitaForm({ ...visitaForm, fecha: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Interés del visitante</label>
                  <select
                    value={visitaForm.interes}
                    onChange={(e) => setVisitaForm({ ...visitaForm, interes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                  >
                    <option value="alto">Alto</option>
                    <option value="medio">Medio</option>
                    <option value="bajo">Bajo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Feedback</label>
                  <textarea
                    value={visitaForm.feedback}
                    onChange={(e) => setVisitaForm({ ...visitaForm, feedback: e.target.value })}
                    rows={2}
                    placeholder="Le gustó la luminosidad, pero le pareció caro..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={loadingVisita} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                    {loadingVisita ? "Guardando..." : "Guardar"}
                  </button>
                  <button type="button" onClick={() => setShowVisitaForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {visitas.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">Sin visitas registradas</p>
              )}
              {visitas.map((v) => (
                <div key={v.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {v.cliente?.nombre || "Visitante sin cliente"}
                      </span>
                      {v.interes && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${INTERES_COLORS[v.interes] || ""}`}>
                          Interés {v.interes}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(v.fecha)}</p>
                    {v.feedback && <p className="text-sm text-gray-600 mt-1">{v.feedback}</p>}
                  </div>
                  <button onClick={() => handleEliminarVisita(v.id)} className="text-gray-300 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Precios */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Precios</h2>
            <div className="space-y-2">
              {propiedad.precioPublicado && (
                <div>
                  <p className="text-xs text-gray-500">Precio publicado</p>
                  <p className="text-xl font-bold text-gray-900">{formatMoney(propiedad.precioPublicado, propiedad.moneda)}</p>
                </div>
              )}
              {propiedad.precioNegociado && (
                <div>
                  <p className="text-xs text-gray-500">Precio negociado</p>
                  <p className="text-lg font-semibold text-green-700">{formatMoney(propiedad.precioNegociado, propiedad.moneda)}</p>
                </div>
              )}
              {propiedad.porcentajeComision && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Comisión ({propiedad.porcentajeComision}%)</p>
                  {comisionEstimada && (
                    <p className="text-sm font-medium text-gray-700">{formatMoney(comisionEstimada, propiedad.moneda)} bruta</p>
                  )}
                  {comisionMia && (
                    <p className="text-sm font-bold text-blue-700">{formatMoney(comisionMia, propiedad.moneda)} mía (25%)</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Propietario */}
          {propiedad.cliente && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Propietario</h2>
              <div className="space-y-2">
                <Link
                  href={`/clientes/${propiedad.cliente.id}`}
                  className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  {propiedad.cliente.nombre}
                </Link>
                {propiedad.cliente.telefono && (
                  <a
                    href={whatsappLink(propiedad.cliente.telefono)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:underline text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Reservas */}
          {propiedad.reservas.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Reservas</h2>
              <div className="space-y-2">
                {propiedad.reservas.map((r) => (
                  <div key={r.id} className="text-sm">
                    <p className="font-medium text-gray-900">{r.nombreCliente}</p>
                    <p className="text-gray-500 text-xs">{formatDate(r.fechaReserva)} · {r.estado}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estadísticas de visitas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Resumen visitas</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total visitas</span>
                <span className="font-medium">{visitas.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Interés alto</span>
                <span className="font-medium text-green-600">{visitas.filter(v => v.interes === "alto").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Interés medio</span>
                <span className="font-medium text-yellow-600">{visitas.filter(v => v.interes === "medio").length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Interés bajo</span>
                <span className="font-medium text-red-600">{visitas.filter(v => v.interes === "bajo").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
