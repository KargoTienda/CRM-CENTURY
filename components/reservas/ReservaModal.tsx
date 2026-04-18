"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { formatMoney } from "@/lib/utils";

type Reserva = {
  id?: number;
  nombreCliente?: string;
  tipoTransaccion?: string;
  zona?: string | null;
  valorReserva?: number | null;
  precioNegociado?: number | null;
  porcentajeParteCompradora?: number | null;
  porcentajeParteVendedora?: number | null;
  escribano?: boolean;
  bonusEscribano?: number | null;
  comisionBruta?: number | null;
  comisionMia?: number | null;
  estado?: string;
  origen?: string | null;
  notas?: string | null;
  telefono?: string | null;
  operacionCruzadaId?: number | null;
  clienteId?: number | null;
};

// C21: la agente se lleva 25% de la comisión bruta (configurable)
const SPLIT_AGENTE = 0.25;

function calcularComisiones(
  precio: number,
  pctCompradora: number,
  pctVendedora: number,
  escribano: boolean,
  bonusEscribano: number
) {
  const pctEscribano = escribano ? 0.5 : 0;
  const bruta = precio * ((pctCompradora + pctVendedora + pctEscribano) / 100);
  const mia = bruta * SPLIT_AGENTE + (escribano ? bonusEscribano : 0);
  return { bruta, mia };
}

export default function ReservaModal({
  reserva,
  todasLasReservas,
  onClose,
  onSaved,
}: {
  reserva: Reserva | null;
  todasLasReservas: Reserva[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!reserva?.id;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombreCliente: reserva?.nombreCliente || "",
    tipoTransaccion: reserva?.tipoTransaccion || "compra",
    zona: reserva?.zona || "",
    valorReserva: reserva?.valorReserva?.toString() || "",
    precioNegociado: reserva?.precioNegociado?.toString() || "",
    pctCompradora: reserva?.porcentajeParteCompradora?.toString() || "3.5",
    pctVendedora: reserva?.porcentajeParteVendedora?.toString() || "3",
    escribano: reserva?.escribano || false,
    bonusEscribano: reserva?.bonusEscribano?.toString() || "0",
    estado: reserva?.estado || "reservada",
    origen: reserva?.origen || "",
    notas: reserva?.notas || "",
    telefono: reserva?.telefono || "",
    operacionCruzadaId: reserva?.operacionCruzadaId?.toString() || "",
  });

  // Reservas del mismo cliente disponibles para vincular (excluye la actual)
  const reservasVinculables = todasLasReservas.filter(
    (r) => r.id !== reserva?.id && r.nombreCliente === form.nombreCliente
  );

  // Calculated
  const precio = parseFloat(form.precioNegociado || form.valorReserva || "0") || 0;
  const pctC = parseFloat(form.pctCompradora) || 0;
  const pctV = parseFloat(form.pctVendedora) || 0;
  const bonus = parseFloat(form.bonusEscribano) || 0;
  const { bruta, mia } = calcularComisiones(precio, pctC, pctV, form.escribano, bonus);

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.nombreCliente.trim()) { toast.error("El nombre es obligatorio"); return; }
    setLoading(true);
    try {
      const url = isEdit ? `/api/reservas/${reserva!.id}` : "/api/reservas";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          porcentajeParteCompradora: parseFloat(form.pctCompradora) || null,
          porcentajeParteVendedora: parseFloat(form.pctVendedora) || null,
          valorReserva: parseFloat(form.valorReserva) || null,
          precioNegociado: parseFloat(form.precioNegociado) || null,
          bonusEscribano: parseFloat(form.bonusEscribano) || 0,
          comisionBruta: bruta || null,
          comisionMia: mia || null,
          operacionCruzadaId: form.operacionCruzadaId ? parseInt(form.operacionCruzadaId) : null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Reserva actualizada" : "Reserva creada");
      onSaved();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{isEdit ? "Editar reserva" : "Nueva reserva"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Partes */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Partes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Nombre del cliente *</label>
                <input className={inputClass} value={form.nombreCliente} onChange={(e) => update("nombreCliente", e.target.value)} placeholder="Juan García" />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input className={inputClass} value={form.telefono} onChange={(e) => update("telefono", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Transacción</label>
                <select className={inputClass} value={form.tipoTransaccion} onChange={(e) => update("tipoTransaccion", e.target.value)}>
                  <option value="compra">Compra</option>
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Zona</label>
                <input className={inputClass} value={form.zona} onChange={(e) => update("zona", e.target.value)} placeholder="Caballito" />
              </div>
              <div>
                <label className={labelClass}>Origen</label>
                <input className={inputClass} value={form.origen} onChange={(e) => update("origen", e.target.value)} placeholder="Instagram, referido..." />
              </div>
            </div>
          </div>

          {/* Financiero */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Financiero</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Valor publicado (USD)</label>
                <input className={inputClass} type="number" value={form.valorReserva} onChange={(e) => update("valorReserva", e.target.value)} placeholder="150000" />
              </div>
              <div>
                <label className={labelClass}>Precio negociado (USD)</label>
                <input className={inputClass} type="number" value={form.precioNegociado} onChange={(e) => update("precioNegociado", e.target.value)} placeholder="145000" />
              </div>
              <div>
                <label className={labelClass}>% Parte compradora</label>
                <input className={inputClass} type="number" step="0.5" value={form.pctCompradora} onChange={(e) => update("pctCompradora", e.target.value)} placeholder="3.5" />
              </div>
              <div>
                <label className={labelClass}>% Parte vendedora</label>
                <input className={inputClass} type="number" step="0.5" value={form.pctVendedora} onChange={(e) => update("pctVendedora", e.target.value)} placeholder="3" />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.escribano}
                    onChange={(e) => update("escribano", e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Puse el escribano (+0.5%)</span>
                </label>
              </div>
              {form.escribano && (
                <div className="col-span-2">
                  <label className={labelClass}>Bonus escribano (USD fijo)</label>
                  <input
                    className={inputClass}
                    type="number"
                    step="100"
                    value={form.bonusEscribano}
                    onChange={(e) => update("bonusEscribano", e.target.value)}
                    placeholder="Ej: 500"
                  />
                </div>
              )}
            </div>

            {/* Calculadora */}
            {precio > 0 && (
              <div className="mt-4 bg-blue-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-800 mb-2">Calculadora de comisiones</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio negociado</span>
                    <span className="font-medium">{formatMoney(precio)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">% Total ({pctC + pctV + (form.escribano ? 0.5 : 0)}%)</span>
                    <span className="font-medium">{formatMoney(bruta)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mi parte (25% de bruta)</span>
                    <span className="font-medium">{formatMoney(bruta * SPLIT_AGENTE)}</span>
                  </div>
                  {form.escribano && bonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bonus escribano</span>
                      <span className="font-medium text-green-600">+ {formatMoney(bonus)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-blue-200 pt-1">
                    <span className="text-gray-700 font-medium">Mi comisión total</span>
                    <span className="font-bold text-green-700">{formatMoney(mia)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Operación cruzada */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Operación cruzada</h3>
            <div>
              <label className={labelClass}>Vincular con otra operación del mismo cliente</label>
              <select
                className={inputClass}
                value={form.operacionCruzadaId}
                onChange={(e) => update("operacionCruzadaId", e.target.value)}
              >
                <option value="">Sin vincular</option>
                {reservasVinculables.map((r) => (
                  <option key={r.id} value={r.id}>
                    #{r.id} — {r.tipoTransaccion} {r.zona ? `en ${r.zona}` : ""} ({r.estado})
                  </option>
                ))}
              </select>
              {reservasVinculables.length === 0 && form.nombreCliente && (
                <p className="text-xs text-gray-400 mt-1">No hay otras reservas para {form.nombreCliente}</p>
              )}
            </div>
          </div>

          {/* Estado */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Estado</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Estado</label>
                <select className={inputClass} value={form.estado} onChange={(e) => update("estado", e.target.value)}>
                  <option value="reservada">Reservada</option>
                  <option value="en_escritura">En escritura</option>
                  <option value="escriturada">Escriturada</option>
                  <option value="caida">Caída</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Notas</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={form.notas} onChange={(e) => update("notas", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear reserva"}
          </button>
        </div>
      </div>
    </div>
  );
}
