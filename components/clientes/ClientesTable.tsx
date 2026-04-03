"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { formatDate, formatMoney, whatsappLink } from "@/lib/utils";
import { Search, Plus, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import ClienteModal from "./ClienteModal";

type Cliente = {
  id: number;
  nombre: string;
  telefono: string | null;
  instagram: string | null;
  zona: string | null;
  modoPago: string | null;
  valorPresupuesto: number | null;
  ambientes: number | null;
  estadoBusqueda: string;
  tarea: string | null;
  proximoContacto: Date | null;
  origen: string | null;
  notas: string | null;
  tipoBuscado: string | null;
  email: string | null;
  fechaNacimiento: Date | null;
  creadoEn: Date;
};

const ESTADO_COLORS: Record<string, string> = {
  activo: "bg-green-100 text-green-700",
  pausado: "bg-yellow-100 text-yellow-700",
  cerrado: "bg-gray-100 text-gray-600",
};

const ORIGEN_COLORS: Record<string, string> = {
  IG: "bg-pink-100 text-pink-700",
  instagram: "bg-pink-100 text-pink-700",
  c21: "bg-blue-100 text-blue-700",
  C21: "bg-blue-100 text-blue-700",
  referido: "bg-purple-100 text-purple-700",
  portal: "bg-orange-100 text-orange-700",
};

export default function ClientesTable({
  clientes,
  total,
  page,
  pages,
  q: initialQ,
  estado: initialEstado,
}: {
  clientes: Cliente[];
  total: number;
  page: number;
  pages: number;
  q: string;
  estado: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQ);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  function search(newQ: string) {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (initialEstado) params.set("estado", initialEstado);
    router.push(`${pathname}?${params}`);
  }

  function goPage(p: number) {
    const params = new URLSearchParams();
    if (initialQ) params.set("q", initialQ);
    if (initialEstado) params.set("estado", initialEstado);
    params.set("page", String(p));
    router.push(`${pathname}?${params}`);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(q)}
            placeholder="Buscar por nombre, teléfono..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <select
          defaultValue={initialEstado}
          onChange={(e) => {
            const params = new URLSearchParams();
            if (initialQ) params.set("q", initialQ);
            if (e.target.value) params.set("estado", e.target.value);
            router.push(`${pathname}?${params}`);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="pausado">Pausado</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <button
          onClick={() => { setEditingCliente(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Teléfono</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Zona</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Búsqueda</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Presupuesto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Origen</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Próx. contacto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    No hay clientes que coincidan con la búsqueda
                  </td>
                </tr>
              )}
              {clientes.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/clientes/${c.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{c.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.telefono ? (
                      <a
                        href={whatsappLink(c.telefono)}
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-green-600 hover:text-green-700"
                      >
                        <MessageCircle className="w-3 h-3" />
                        {c.telefono}
                      </a>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.zona || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.tipoBuscado ? c.tipoBuscado.slice(0, 30) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.valorPresupuesto ? formatMoney(c.valorPresupuesto) : "-"}
                    {c.ambientes ? ` · ${c.ambientes} amb` : ""}
                  </td>
                  <td className="px-4 py-3">
                    {c.origen ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ORIGEN_COLORS[c.origen] || "bg-gray-100 text-gray-600"}`}>
                        {c.origen}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[c.estadoBusqueda] || "bg-gray-100 text-gray-600"}`}>
                      {c.estadoBusqueda}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {c.proximoContacto ? (
                      <span className={new Date(c.proximoContacto) < new Date() ? "text-red-600 font-medium" : ""}>
                        {formatDate(c.proximoContacto)}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingCliente(c); setShowModal(true); }}
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

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Mostrando {clientes.length} de {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page === 1}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                {page} / {pages}
              </span>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page === pages}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <ClienteModal
          cliente={editingCliente}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); router.refresh(); }}
        />
      )}
    </div>
  );
}
