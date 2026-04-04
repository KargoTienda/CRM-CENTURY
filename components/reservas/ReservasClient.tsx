"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatMoney } from "@/lib/utils";
import { Plus } from "lucide-react";
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

const ESTADO_BADGE: Record<string, { bg: string; color: string }> = {
  reservada: { bg: "rgba(251,191,36,0.12)", color: "#FBBF24" },
  en_escritura: { bg: "rgba(96,165,250,0.12)", color: "#60A5FA" },
  escriturada: { bg: "rgba(52,211,153,0.12)", color: "#34D399" },
  caida: { bg: "rgba(248,113,113,0.12)", color: "#F87171" },
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
    {
      label: "Reservas activas",
      value: reservas.filter((r) => r.estado === "reservada" || r.estado === "en_escritura").length,
      accent: "#FBBF24",
      accentBg: "rgba(251,191,36,0.1)",
    },
    {
      label: "Escrituradas",
      value: reservas.filter((r) => r.estado === "escriturada").length,
      accent: "#34D399",
      accentBg: "rgba(52,211,153,0.1)",
    },
    {
      label: "Comisiones por cobrar",
      value: formatMoney(totalComisiones),
      accent: "#C9A84C",
      accentBg: "rgba(201,168,76,0.1)",
      gold: true,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: "#8A8799" }}>{s.label}</p>
            <p
              className="text-2xl font-bold tracking-tight"
              style={{ color: s.gold ? "#C9A84C" : "#EDEAE3" }}
            >
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
          className="px-3 py-2.5 rounded-lg text-sm transition-all"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--text-primary)",
          }}
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
            color: "#07080D",
            boxShadow: "0 2px 8px rgba(201,168,76,0.2)",
          }}
        >
          <Plus className="w-4 h-4" />
          Nueva reserva
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                {["Fecha","Cliente","Transacción","Zona","Valor","Comisión bruta","Mi comisión","Estado",""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#47455A" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm" style={{ color: "#47455A" }}>
                    No hay reservas
                  </td>
                </tr>
              )}
              {filtered.map((r, i) => {
                const badge = ESTADO_BADGE[r.estado] ?? { bg: "rgba(255,255,255,0.06)", color: "#8A8799" };
                return (
                  <tr
                    key={r.id}
                    className="transition-colors"
                    style={i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.04)" } : {}}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#8A8799" }}>{formatDate(r.fechaReserva)}</td>
                    <td className="px-4 py-3.5 font-medium text-sm" style={{ color: "#EDEAE3" }}>{r.nombreCliente}</td>
                    <td className="px-4 py-3.5 text-xs capitalize" style={{ color: "#8A8799" }}>{r.tipoTransaccion}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#8A8799" }}>{r.zona || "—"}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#8A8799" }}>{formatMoney(r.precioNegociado || r.valorReserva)}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#8A8799" }}>{formatMoney(r.comisionBruta)}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold" style={{ color: "#C9A84C" }}>{formatMoney(r.comisionMia)}</td>
                    <td className="px-4 py-3.5">
                      <span className="badge" style={{ background: badge.bg, color: badge.color }}>
                        {r.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => { setEditing(r); setShowModal(true); }}
                        className="text-xs px-2.5 py-1 rounded-md transition-all"
                        style={{ color: "#8A8799", background: "rgba(255,255,255,0.04)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#EDEAE3"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#8A8799"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
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
