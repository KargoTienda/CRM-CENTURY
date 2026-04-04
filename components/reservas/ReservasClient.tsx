"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatMoney } from "@/lib/utils";
import { Plus } from "lucide-react";
import ReservaModal from "./ReservaModal";

type Reserva = {
  id: number; nombreCliente: string; tipoTransaccion: string; zona: string | null;
  valorReserva: number | null; precioNegociado: number | null;
  porcentajeParteCompradora: number | null; porcentajeParteVendedora: number | null;
  escribano: boolean; comisionBruta: number | null; comisionMia: number | null;
  estado: string; fechaReserva: Date; origen: string | null; notas: string | null;
  telefono: string | null; clienteId: number | null;
  cliente: { id: number; nombre: string } | null;
};

const ESTADO_BADGE: Record<string, { bg: string; color: string }> = {
  reservada:   { bg: "#FEF3C7", color: "#92400E" },
  en_escritura: { bg: "#DBEAFE", color: "#1E40AF" },
  escriturada: { bg: "#D1FAE5", color: "#065F46" },
  caida:       { bg: "#FEE2E2", color: "#991B1B" },
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

  const statCards = [
    { label: "Reservas activas", value: reservas.filter((r) => ["reservada","en_escritura"].includes(r.estado)).length, color: "#0077B6", bg: "#DBEAFE" },
    { label: "Escrituradas", value: reservas.filter((r) => r.estado === "escriturada").length, color: "#065F46", bg: "#D1FAE5" },
    { label: "Comisiones por cobrar", value: formatMoney(totalComisiones), color: "#0077B6", bg: "#EEF6FF", highlight: true },
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5"
            style={{ background: "#FFFFFF", border: "1px solid #D0E8F5", boxShadow: "0 1px 4px rgba(0,119,182,0.06)" }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: "#90AFCC" }}>{s.label}</p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: s.highlight ? "#0077B6" : "#023E8A" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 items-center">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="input-field"
          style={{ width: "auto", paddingRight: "32px" }}
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
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nueva reserva
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#FFFFFF", border: "1px solid #D0E8F5", boxShadow: "0 1px 4px rgba(0,119,182,0.06)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F0F8FF", borderBottom: "1px solid #D0E8F5" }}>
                {["Fecha","Cliente","Transacción","Zona","Valor","Comisión bruta","Mi comisión","Estado",""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#90AFCC" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm" style={{ color: "#90AFCC" }}>
                    No hay reservas
                  </td>
                </tr>
              )}
              {filtered.map((r, i) => {
                const badge = ESTADO_BADGE[r.estado] ?? { bg: "#F3F4F6", color: "#6B7280" };
                return (
                  <tr
                    key={r.id}
                    className="transition-colors hover:bg-[#F0F8FF]"
                    style={i > 0 ? { borderTop: "1px solid #EEF6FF" } : {}}
                  >
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#90AFCC" }}>{formatDate(r.fechaReserva)}</td>
                    <td className="px-4 py-3.5 font-bold text-sm" style={{ color: "#023E8A" }}>{r.nombreCliente}</td>
                    <td className="px-4 py-3.5 text-xs capitalize" style={{ color: "#0096C7" }}>{r.tipoTransaccion}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#0096C7" }}>{r.zona || "—"}</td>
                    <td className="px-4 py-3.5 text-xs font-medium" style={{ color: "#0077B6" }}>{formatMoney(r.precioNegociado || r.valorReserva)}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#90AFCC" }}>{formatMoney(r.comisionBruta)}</td>
                    <td className="px-4 py-3.5 text-sm font-bold" style={{ color: "#0077B6" }}>{formatMoney(r.comisionMia)}</td>
                    <td className="px-4 py-3.5">
                      <span className="badge" style={badge}>{r.estado.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => { setEditing(r); setShowModal(true); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{ color: "#0077B6", background: "#EEF6FF", border: "1px solid #D0E8F5" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#DBEAFE"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#EEF6FF"; }}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
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
