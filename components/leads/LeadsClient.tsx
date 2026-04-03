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

const ESTADO_COLORS: Record<string, string> = {
  NUEVO: "bg-blue-100 text-blue-700",
  CONTACTADO: "bg-yellow-100 text-yellow-700",
  CALIFICADO: "bg-purple-100 text-purple-700",
  CONVERTIDO: "bg-green-100 text-green-700",
  DESCARTADO: "bg-gray-100 text-gray-500",
};

const ESTADOS = ["NUEVO", "CONTACTADO", "CALIFICADO", "CONVERTIDO", "DESCARTADO"];

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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-3 items-center">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo lead
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-4 py-12 text-center text-gray-400">
            No hay leads cargados
          </div>
        )}
        {filtered.map((lead) => (
          <div
            key={lead.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => { setEditing(lead); setShowModal(true); }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                {(lead.nombre || "?").charAt(0).toUpperCase()}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[lead.estado] || "bg-gray-100 text-gray-600"}`}>
                {lead.estado}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 text-sm">{lead.nombre || "Sin nombre"}</h3>

            {lead.propiedadInteres && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{lead.propiedadInteres}</p>
            )}

            {lead.notas && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2 italic">{lead.notas}</p>
            )}

            {lead.proyecto && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                {lead.proyecto.nombre}
              </span>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">{formatDate(lead.creadoEn)}</span>
              {lead.telefono && (
                <a
                  href={whatsappLink(lead.telefono)}
                  target="_blank"
                  rel="noopener"
                  onClick={(e) => e.stopPropagation()}
                  className="text-green-600 hover:text-green-700"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
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
