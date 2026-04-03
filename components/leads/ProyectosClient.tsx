"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

type Lead = {
  id: number;
  nombre: string | null;
  telefono: string | null;
  notas: string | null;
  estado: string;
  creadoEn: Date;
  proyecto: { id: number; nombre: string } | null;
};

type Proyecto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  leadsAsignados: Lead[];
};

export default function ProyectosClient({
  proyectos,
  sinAsignar,
}: {
  proyectos: Proyecto[];
  sinAsignar: Lead[];
}) {
  const router = useRouter();
  const [creandoProyecto, setCreandoProyecto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");

  async function crearProyecto() {
    if (!nuevoNombre.trim()) return;
    try {
      const res = await fetch("/api/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoNombre }),
      });
      if (!res.ok) throw new Error();
      toast.success("Proyecto creado");
      setCreandoProyecto(false);
      setNuevoNombre("");
      router.refresh();
    } catch {
      toast.error("Error al crear proyecto");
    }
  }

  async function asignarLead(leadId: number, proyectoId: number) {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyectoId }),
      });
      router.refresh();
    } catch {
      toast.error("Error al asignar");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {creandoProyecto ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && crearProyecto()}
              placeholder="Nombre del proyecto"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button onClick={crearProyecto} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">Crear</button>
            <button onClick={() => setCreandoProyecto(false)} className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
          </div>
        ) : (
          <button
            onClick={() => setCreandoProyecto(true)}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Nuevo proyecto
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sin asignar */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
            Sin clasificar
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{sinAsignar.length}</span>
          </h3>
          <div className="space-y-2">
            {sinAsignar.map((lead) => (
              <div key={lead.id} className="bg-white rounded-lg p-3 shadow-sm">
                <p className="font-medium text-sm text-gray-900">{lead.nombre || "Sin nombre"}</p>
                {lead.notas && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{lead.notas}</p>}
                {proyectos.length > 0 && (
                  <div className="mt-2">
                    <select
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1"
                      defaultValue=""
                      onChange={(e) => e.target.value && asignarLead(lead.id, parseInt(e.target.value))}
                    >
                      <option value="">Mover a proyecto...</option>
                      {proyectos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
            {sinAsignar.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Sin leads pendientes</p>
            )}
          </div>
        </div>

        {/* Proyectos */}
        {proyectos.map((proyecto) => (
          <div key={proyecto.id} className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center justify-between">
              {proyecto.nombre}
              <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">
                {proyecto.leadsAsignados.length}
              </span>
            </h3>
            <div className="space-y-2">
              {proyecto.leadsAsignados.map((lead) => (
                <div key={lead.id} className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="font-medium text-sm text-gray-900">{lead.nombre || "Sin nombre"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{lead.telefono}</p>
                  {lead.notas && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{lead.notas}</p>}
                  <p className="text-xs text-gray-300 mt-1">{formatDate(lead.creadoEn)}</p>
                </div>
              ))}
              {proyecto.leadsAsignados.length === 0 && (
                <p className="text-xs text-blue-400 text-center py-4">Sin leads</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
