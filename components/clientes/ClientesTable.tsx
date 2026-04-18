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

const ESTADO_BADGE: Record<string, { bg: string; color: string }> = {
  activo:  { bg: "#D1FAE5", color: "#065F46" },
  pausado: { bg: "#FEF3C7", color: "#92400E" },
  cerrado: { bg: "#F3F4F6", color: "#6B7280" },
};

const ORIGEN_BADGE: Record<string, { bg: string; color: string }> = {
  IG:        { bg: "#FCE7F3", color: "#9D174D" },
  instagram: { bg: "#FCE7F3", color: "#9D174D" },
  c21:       { bg: "#DBEAFE", color: "#1E40AF" },
  C21:       { bg: "#DBEAFE", color: "#1E40AF" },
  referido:  { bg: "#EDE9FE", color: "#5B21B6" },
  portal:    { bg: "#FEF3C7", color: "#92400E" },
};

export default function ClientesTable({
  clientes, total, page, pages, q: initialQ, estado: initialEstado,
}: {
  clientes: Cliente[]; total: number; page: number; pages: number; q: string; estado: string;
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#ADE8F4" }} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(q)}
            placeholder="Buscar por nombre, teléfono..."
            className="input-field pl-9"
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
          className="input-field"
          style={{ width: "auto", paddingRight: "32px" }}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="pausado">Pausado</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <button
          onClick={() => { setEditingCliente(null); setShowModal(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
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
                {["Nombre","Teléfono","Zona","Búsqueda","Presupuesto","Origen","Estado","Próx. contacto",""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#90AFCC" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm" style={{ color: "#90AFCC" }}>
                    No hay clientes que coincidan con la búsqueda
                  </td>
                </tr>
              )}
              {clientes.map((c, i) => {
                const estadoBadge = ESTADO_BADGE[c.estadoBusqueda] ?? { bg: "#F3F4F6", color: "#6B7280" };
                const origenBadge = c.origen ? ORIGEN_BADGE[c.origen] ?? { bg: "#F3F4F6", color: "#6B7280" } : null;
                const vencido = c.proximoContacto && new Date(c.proximoContacto) < new Date();
                return (
                  <tr
                    key={c.id}
                    className="cursor-pointer transition-colors hover:bg-[#F0F8FF]"
                    style={i > 0 ? { borderTop: "1px solid #EEF6FF" } : {}}
                    onClick={() => router.push(`/clientes/${c.id}`)}
                  >
                    <td className="px-4 py-3.5 font-semibold text-sm" style={{ color: "#023E8A" }}>{c.nombre}</td>
                    <td className="px-4 py-3.5">
                      {c.telefono ? (
                        <a
                          href={whatsappLink(c.telefono)}
                          target="_blank"
                          rel="noopener"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: "#0CB87E" }}
                        >
                          <MessageCircle className="w-3 h-3" />
                          {c.telefono}
                        </a>
                      ) : <span style={{ color: "#D0E8F5" }}>—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#0077B6" }}>{c.zona || "—"}</td>
                    <td className="px-4 py-3.5 text-xs max-w-[140px] truncate" style={{ color: "#0096C7" }}>
                      {c.tipoBuscado ? c.tipoBuscado.slice(0, 30) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium" style={{ color: "#0077B6" }}>
                      {c.valorPresupuesto ? formatMoney(c.valorPresupuesto) : "—"}
                      {c.ambientes ? <span style={{ color: "#90AFCC" }}> · {c.ambientes} amb</span> : ""}
                    </td>
                    <td className="px-4 py-3.5">
                      {origenBadge ? (
                        <span className="badge" style={origenBadge}>{c.origen}</span>
                      ) : <span style={{ color: "#D0E8F5" }}>—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge" style={estadoBadge}>{c.estadoBusqueda}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium">
                      {c.proximoContacto ? (
                        <span style={{ color: vencido ? "#EF4444" : "#0096C7" }}>
                          {formatDate(c.proximoContacto)}
                        </span>
                      ) : <span style={{ color: "#D0E8F5" }}>—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingCliente(c); setShowModal(true); }}
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

        {pages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: "1px solid #EEF6FF", background: "#F0F8FF" }}
          >
            <p className="text-xs" style={{ color: "#90AFCC" }}>
              Mostrando {clientes.length} de {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg transition-all disabled:opacity-30"
                style={{ color: "#0077B6", background: "#FFFFFF", border: "1px solid #D0E8F5" }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-medium" style={{ color: "#0077B6" }}>{page} / {pages}</span>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page === pages}
                className="p-1.5 rounded-lg transition-all disabled:opacity-30"
                style={{ color: "#0077B6", background: "#FFFFFF", border: "1px solid #D0E8F5" }}
              >
                <ChevronRight className="w-3.5 h-3.5" />
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
