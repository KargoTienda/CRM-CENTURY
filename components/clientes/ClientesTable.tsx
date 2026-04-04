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
  activo: { bg: "rgba(52,211,153,0.12)", color: "#34D399" },
  pausado: { bg: "rgba(251,191,36,0.12)", color: "#FBBF24" },
  cerrado: { bg: "rgba(255,255,255,0.06)", color: "#8A8799" },
};

const ORIGEN_BADGE: Record<string, { bg: string; color: string }> = {
  IG: { bg: "rgba(236,72,153,0.12)", color: "#F472B6" },
  instagram: { bg: "rgba(236,72,153,0.12)", color: "#F472B6" },
  c21: { bg: "rgba(96,165,250,0.12)", color: "#60A5FA" },
  C21: { bg: "rgba(96,165,250,0.12)", color: "#60A5FA" },
  referido: { bg: "rgba(167,139,250,0.12)", color: "#A78BFA" },
  portal: { bg: "rgba(251,146,60,0.12)", color: "#FB923C" },
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

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "var(--text-primary)",
    borderRadius: "8px",
    fontSize: "13px",
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#47455A" }} />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(q)}
            placeholder="Buscar por nombre, teléfono..."
            className="w-full pl-9 pr-4 py-2.5 transition-all"
            style={inputStyle}
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
          className="px-3 py-2.5 transition-all"
          style={inputStyle}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="pausado">Pausado</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <button
          onClick={() => { setEditingCliente(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
            color: "#07080D",
            boxShadow: "0 2px 8px rgba(201,168,76,0.2)",
          }}
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
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
                {["Nombre","Teléfono","Zona","Búsqueda","Presupuesto","Origen","Estado","Próx. contacto",""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#47455A" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm" style={{ color: "#47455A" }}>
                    No hay clientes que coincidan con la búsqueda
                  </td>
                </tr>
              )}
              {clientes.map((c, i) => {
                const estadoBadge = ESTADO_BADGE[c.estadoBusqueda] ?? { bg: "rgba(255,255,255,0.06)", color: "#8A8799" };
                const origenBadge = c.origen ? ORIGEN_BADGE[c.origen] ?? { bg: "rgba(255,255,255,0.06)", color: "#8A8799" } : null;
                const vencido = c.proximoContacto && new Date(c.proximoContacto) < new Date();
                return (
                  <tr
                    key={c.id}
                    className="cursor-pointer transition-colors"
                    style={i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.04)" } : {}}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => router.push(`/clientes/${c.id}`)}
                  >
                    <td className="px-4 py-3.5 font-medium text-sm" style={{ color: "#EDEAE3" }}>{c.nombre}</td>
                    <td className="px-4 py-3.5">
                      {c.telefono ? (
                        <a
                          href={whatsappLink(c.telefono)}
                          target="_blank"
                          rel="noopener"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-xs transition-colors"
                          style={{ color: "#34D399" }}
                        >
                          <MessageCircle className="w-3 h-3" />
                          {c.telefono}
                        </a>
                      ) : <span style={{ color: "#47455A" }}>—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#8A8799" }}>{c.zona || "—"}</td>
                    <td className="px-4 py-3.5 text-xs max-w-[140px] truncate" style={{ color: "#8A8799" }}>
                      {c.tipoBuscado ? c.tipoBuscado.slice(0, 30) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#8A8799" }}>
                      {c.valorPresupuesto ? formatMoney(c.valorPresupuesto) : "—"}
                      {c.ambientes ? <span style={{ color: "#47455A" }}> · {c.ambientes} amb</span> : ""}
                    </td>
                    <td className="px-4 py-3.5">
                      {origenBadge ? (
                        <span className="badge" style={{ background: origenBadge.bg, color: origenBadge.color }}>
                          {c.origen}
                        </span>
                      ) : <span style={{ color: "#47455A" }}>—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge" style={{ background: estadoBadge.bg, color: estadoBadge.color }}>
                        {c.estadoBusqueda}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {c.proximoContacto ? (
                        <span style={{ color: vencido ? "#F87171" : "#8A8799", fontWeight: vencido ? 500 : 400 }}>
                          {formatDate(c.proximoContacto)}
                        </span>
                      ) : <span style={{ color: "#47455A" }}>—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingCliente(c); setShowModal(true); }}
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

        {/* Pagination */}
        {pages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}
          >
            <p className="text-xs" style={{ color: "#47455A" }}>
              Mostrando {clientes.length} de {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-md transition-all disabled:opacity-30"
                style={{ color: "#8A8799", background: "rgba(255,255,255,0.04)" }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs" style={{ color: "#8A8799" }}>{page} / {pages}</span>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page === pages}
                className="p-1.5 rounded-md transition-all disabled:opacity-30"
                style={{ color: "#8A8799", background: "rgba(255,255,255,0.04)" }}
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
