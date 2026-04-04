"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, whatsappLink } from "@/lib/utils";
import { Plus, MessageCircle } from "lucide-react";
import LeadModal from "./LeadModal";

type Lead = {
  id: number;
  nombre: string | null;
  telefono: string | null;
  instagram: string | null;
  email: string | null;
  origen: string;
  estado: string;
  propiedadInteres: string | null;
  notas: string | null;
  creadoEn: Date;
  proyecto: { id: number; nombre: string } | null;
};

const ESTADO_BADGE: Record<string, { bg: string; color: string }> = {
  NUEVO: { bg: "rgba(96,165,250,0.12)", color: "#60A5FA" },
  CONTACTADO: { bg: "rgba(251,191,36,0.12)", color: "#FBBF24" },
  CALIFICADO: { bg: "rgba(167,139,250,0.12)", color: "#A78BFA" },
  CONVERTIDO: { bg: "rgba(52,211,153,0.12)", color: "#34D399" },
  DESCARTADO: { bg: "rgba(255,255,255,0.06)", color: "#47455A" },
};

const ESTADOS = ["NUEVO", "CONTACTADO", "CALIFICADO", "CONVERTIDO", "DESCARTADO"];

const AVATAR_COLORS = [
  "linear-gradient(135deg, #C9A84C, #E8C97A)",
  "linear-gradient(135deg, #60A5FA, #818CF8)",
  "linear-gradient(135deg, #F472B6, #A78BFA)",
  "linear-gradient(135deg, #34D399, #60A5FA)",
  "linear-gradient(135deg, #FB923C, #F472B6)",
];

export default function LeadsClient({
  leads,
  origen,
}: {
  leads: Lead[];
  origen: string;
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("");

  const filtered = filtroEstado ? leads.filter((l) => l.estado === filtroEstado) : leads;

  return (
    <div className="space-y-5">
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
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
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
          Nuevo lead
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-4 py-16 text-center text-sm" style={{ color: "#47455A" }}>
            No hay leads cargados
          </div>
        )}
        {filtered.map((lead, i) => {
          const badge = ESTADO_BADGE[lead.estado] ?? { bg: "rgba(255,255,255,0.06)", color: "#8A8799" };
          const avatarGradient = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <div
              key={lead.id}
              className="rounded-xl p-4 cursor-pointer transition-all duration-200"
              style={{
                background: "var(--bg-card)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(201,168,76,0.2)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onClick={() => { setEditing(lead); setShowModal(true); }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{ background: avatarGradient, color: "#07080D" }}
                >
                  {(lead.nombre || "?").charAt(0).toUpperCase()}
                </div>
                <span className="badge" style={{ background: badge.bg, color: badge.color }}>
                  {lead.estado}
                </span>
              </div>

              <h3 className="font-semibold text-sm" style={{ color: "#EDEAE3" }}>
                {lead.nombre || "Sin nombre"}
              </h3>

              {lead.propiedadInteres && (
                <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "#8A8799" }}>
                  {lead.propiedadInteres}
                </p>
              )}

              {lead.notas && (
                <p className="text-xs mt-1 line-clamp-2 italic" style={{ color: "#47455A" }}>
                  {lead.notas}
                </p>
              )}

              {lead.proyecto && (
                <span
                  className="inline-block mt-2 badge"
                  style={{ background: "rgba(167,139,250,0.1)", color: "#A78BFA" }}
                >
                  {lead.proyecto.nombre}
                </span>
              )}

              <div
                className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-xs" style={{ color: "#47455A" }}>{formatDate(lead.creadoEn)}</span>
                {lead.telefono && (
                  <a
                    href={whatsappLink(lead.telefono)}
                    target="_blank"
                    rel="noopener"
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: "#34D399" }}
                    className="transition-opacity hover:opacity-70"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <LeadModal
          lead={editing}
          defaultOrigen={origen}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
