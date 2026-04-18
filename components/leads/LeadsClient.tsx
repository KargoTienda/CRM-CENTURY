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
  NUEVO:      { bg: "#DBEAFE", color: "#1E40AF" },
  CONTACTADO: { bg: "#FEF3C7", color: "#92400E" },
  CALIFICADO: { bg: "#EDE9FE", color: "#5B21B6" },
  CONVERTIDO: { bg: "#D1FAE5", color: "#065F46" },
  DESCARTADO: { bg: "#F3F4F6", color: "#6B7280" },
};

const ESTADOS = ["NUEVO", "CONTACTADO", "CALIFICADO", "CONVERTIDO", "DESCARTADO"];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #023E8A, #0096C7)",
  "linear-gradient(135deg, #0096C7, #48CAE4)",
  "linear-gradient(135deg, #00B4D8, #ADE8F4)",
  "linear-gradient(135deg, #0077B6, #00B4D8)",
  "linear-gradient(135deg, #48CAE4, #ADE8F4)",
];

export default function LeadsClient({ leads, origen }: { leads: Lead[]; origen: string }) {
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
          className="input-field"
          style={{ width: "auto", paddingRight: "32px" }}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <div className="flex-1" />
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo lead
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-4 py-16 text-center text-sm" style={{ color: "#90AFCC" }}>
            No hay leads cargados
          </div>
        )}
        {filtered.map((lead, i) => {
          const badge = ESTADO_BADGE[lead.estado] ?? { bg: "#F3F4F6", color: "#6B7280" };
          return (
            <div
              key={lead.id}
              className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1"
              style={{
                background: "#FFFFFF",
                border: "1px solid #DDD9D0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
              onClick={() => { setEditing(lead); setShowModal(true); }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                >
                  {(lead.nombre || "?").charAt(0).toUpperCase()}
                </div>
                <span className="badge" style={badge}>{lead.estado}</span>
              </div>

              <h3 className="font-bold text-sm" style={{ color: "#023E8A" }}>
                {lead.nombre || "Sin nombre"}
              </h3>

              {lead.propiedadInteres && (
                <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "#0096C7" }}>
                  {lead.propiedadInteres}
                </p>
              )}

              {lead.notas && (
                <p className="text-xs mt-1 line-clamp-2 italic" style={{ color: "#90AFCC" }}>
                  {lead.notas}
                </p>
              )}

              {lead.proyecto && (
                <span
                  className="inline-block mt-2 badge"
                  style={{ background: "#EDE9FE", color: "#5B21B6" }}
                >
                  {lead.proyecto.nombre}
                </span>
              )}

              <div
                className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: "1px solid #EEF6FF" }}
              >
                <span className="text-xs" style={{ color: "#90AFCC" }}>{formatDate(lead.creadoEn)}</span>
                {lead.telefono && (
                  <a
                    href={whatsappLink(lead.telefono)}
                    target="_blank"
                    rel="noopener"
                    onClick={(e) => e.stopPropagation()}
                    className="transition-opacity hover:opacity-70"
                    style={{ color: "#0CB87E" }}
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
