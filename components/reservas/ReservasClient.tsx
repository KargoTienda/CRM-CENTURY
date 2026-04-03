"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatMoney } from "@/lib/utils";
import { Plus, Calculator } from "lucide-react";
import ReservaModal from "./ReservaModal";

type Reserva = {
  id: number;
  nombreCliente: string;
  tipoTransaccion: string;
  zona: string | null;
  valorReserva: number | null;
  precioNegociado: number | null;
  porcentajeParteCompradora: number | null;
  porcentajeParteVendedora: number | null;
  escribano: boolean;
  comisionBruta: number | null;
  comisionMia: number | null;
  estado: string;
  fechaReserva: Date;
  origen: string | null;
  notas: string | null;
  telefono: string | null;
  clienteId: number | null;
  cliente: { id: number; nombre: string } | null;
};

const ESTADO_COLORS: Record<string, string> = {
  reservada: "bg-amber-100 text-amber-700",
  en_escritura: "bg-blue-100 text-blue-700",
  escriturada: "bg-green-100 text-green-700",
  caida: "bg-red-100 text-red-700",
};

export default function ReservasClient({ reservas }: { reservas: Reserva[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Reserva | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("");

  const filtered = filtroEstado ? reservas.filter((r) => r.estado === filtroEstado) : reservas;

  const totalComisiones = reservas
    .filter((r) => r.estado === "reservada" || r.estado === "en_escritura")
    .reduce((acc, r) => acc + (r.comisionMia || 0), 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Reservas activas</p>
          <p className="text-2xl font-bold text-gray-900">
            {reservas.filter((r) => r.estado === "reservada" || r.estado === "en_escritura").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Escrituradas</p>
          <p className="text-2xl font-bold text-gray-900">
            {reservas.filter((r) => r.estado === "escriturada").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500">Comisiones por cobrar</p>
          <p className="text-2xl font-bold text-green-700">{formatMoney(totalComisiones)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 items-center">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="reservada">Reservadas</option>
          <option value="en_escritura">En escritura</option>
          <option value="escriturada">Escrituradas</option>
          <option value="caida">Caídas</option>
        </select>
        <div className="flex-1" />
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Nueva reserva
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Transacción</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Zona</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Valor</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Comisión bruta</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Mi comisión</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    No hay reservas
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(r.fechaReserva)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.nombreCliente}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{r.tipoTransaccion}</td>
                  <td className="px-4 py-3 text-gray-600">{r.zona || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{formatMoney(r.precioNegociado || r.valorReserva)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatMoney(r.comisionBruta)}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{formatMoney(r.comisionMia)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[r.estado] || "bg-gray-100 text-gray-600"}`}>
                      {r.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setEditing(r); setShowModal(true); }}
                      className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-100"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ReservaModal
          reserva={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
