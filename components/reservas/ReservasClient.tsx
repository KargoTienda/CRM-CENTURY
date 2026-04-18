"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatMoney } from "@/lib/utils";
import { Plus, Link2, PenLine } from "lucide-react";
import ReservaModal from "./ReservaModal";

type Reserva = {
  id: number; nombreCliente: string; tipoTransaccion: string; zona: string | null;
  valorReserva: number | null; precioNegociado: number | null;
  porcentajeParteCompradora: number | null; porcentajeParteVendedora: number | null;
  escribano: boolean; bonusEscribano: number | null; comisionBruta: number | null; comisionMia: number | null;
  estado: string; fechaReserva: Date; origen: string | null; notas: string | null;
  telefono: string | null; clienteId: number | null; operacionCruzadaId: number | null;
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
    { label: "Reservas activas", value: reservas.filter((r) => ["reservada","en_escritura"].includes(r.estado)).length, color: "#3C3A3C", bg: "#F2F1EF" },
    { label: "Escrituradas", value: reservas.filter((r) => r.estado === "escriturada").length, color: "#4A7C59", bg: "#EDFAF2" },
    { label: "Comisiones por cobrar", value: formatMoney(totalComisiones), color: "#BEAF87", bg: "#FAF8F3", highlight: true },
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5"
            style={{ background: "#FFFFFF", border: "1px solid #DDD9D0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: "#808285" }}>{s.label}</p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: s.highlight ? "#BEAF87" : "#3C3A3C" }}>
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
        style={{ background: "#FFFFFF", border: "1px solid #DDD9D0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F8F7F5", borderBottom: "1px solid #DDD9D0" }}>
                {["Fecha","Cliente","Transacción","Zona","Valor","Comisión bruta","Mi comisión","Estado",""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#808285" }}>
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
                    className="transition-colors hover:bg-[#FAF8F3]"
                    style={i > 0 ? { borderTop: "1px solid #F2F1EF" } : {}}
                  >
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#808285" }}>{formatDate(r.fechaReserva)}</td>
                    <td className="px-4 py-3.5 font-bold text-sm" style={{ color: "#1A1A1A" }}>
                      <div className="flex items-center gap-1.5">
                        {r.nombreCliente}
                        {r.escribano && <PenLine className="w-3.5 h-3.5 text-amber-600" title="Aportó escribano" />}
                        {r.operacionCruzadaId && <Link2 className="w-3.5 h-3.5" style={{ color: "#BEAF87" }} title={`Operación cruzada #${r.operacionCruzadaId}`} />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs capitalize" style={{ color: "#5A585A" }}>{r.tipoTransaccion}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#5A585A" }}>{r.zona || "—"}</td>
                    <td className="px-4 py-3.5 text-xs font-medium" style={{ color: "#3C3A3C" }}>{formatMoney(r.precioNegociado || r.valorReserva)}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#808285" }}>{formatMoney(r.comisionBruta)}</td>
                    <td className="px-4 py-3.5 text-sm font-bold" style={{ color: "#BEAF87" }}>{formatMoney(r.comisionMia)}</td>
                    <td className="px-4 py-3.5">
                      <span className="badge" style={badge}>{r.estado.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => { setEditing(r); setShowModal(true); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
                        style={{ color: "#BEAF87", background: "rgba(190,175,135,0.12)", border: "1px solid rgba(190,175,135,0.3)" }}
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
          todasLasReservas={reservas}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
