import { supabase } from "@/lib/supabase";
import { formatMoney, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const { data: propiedadesRaw } = await supabase
    .from("propiedades_inventario")
    .select("*, clientes!cliente_id(nombre), visitas_inventario(id)")
    .order("creado_en", { ascending: false });

  const propiedades = (propiedadesRaw ?? []).map(({ clientes, visitas_inventario, ...p }) => ({
    ...p,
    precioPublicado: p.precio_publicado,
    creadoEn: p.creado_en,
    cliente: clientes,
    visitas: visitas_inventario ?? [],
  }));

  const ESTADO_BADGE: Record<string, { bg: string; color: string }> = {
    activa: { bg: "rgba(52,211,153,0.12)", color: "#34D399" },
    en_negociacion: { bg: "rgba(251,191,36,0.12)", color: "#FBBF24" },
    reservada: { bg: "rgba(96,165,250,0.12)", color: "#60A5FA" },
    vendida: { bg: "rgba(255,255,255,0.06)", color: "#8A8799" },
    retirada: { bg: "rgba(248,113,113,0.12)", color: "#F87171" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#EDEAE3", letterSpacing: "-0.02em" }}>Inventario</h1>
          <p className="text-sm mt-1" style={{ color: "#8A8799" }}>Tus propiedades en captación y venta</p>
        </div>
        <Link
          href="/inventario/nueva"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
            color: "#07080D",
            boxShadow: "0 2px 8px rgba(201,168,76,0.2)",
          }}
        >
          <Plus className="w-4 h-4" />
          Nueva propiedad
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {propiedades.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <Building2 className="w-6 h-6" style={{ color: "#47455A" }} />
            </div>
            <p className="text-sm" style={{ color: "#47455A" }}>Sin propiedades cargadas</p>
          </div>
        )}
        {propiedades.map((p) => {
          const badge = ESTADO_BADGE[p.estado] ?? { bg: "rgba(255,255,255,0.06)", color: "#8A8799" };
          return (
            <Link
              key={p.id}
              href={`/inventario/${p.id}`}
              className="rounded-xl p-5 block transition-all duration-200"
              style={{
                background: "var(--bg-card)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.border = "1px solid rgba(201,168,76,0.2)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.1)" }}>
                  <Building2 className="w-5 h-5" style={{ color: "#C9A84C" }} />
                </div>
                <span className="badge" style={{ background: badge.bg, color: badge.color }}>
                  {p.estado.replace("_", " ")}
                </span>
              </div>
              <h3 className="font-semibold text-sm" style={{ color: "#EDEAE3" }}>{p.titulo}</h3>
              <p className="text-xs mt-1" style={{ color: "#8A8799" }}>{p.direccion}</p>
              {p.barrio && <p className="text-xs mt-0.5" style={{ color: "#47455A" }}>{p.barrio}</p>}
              <div className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-sm font-semibold" style={{ color: "#C9A84C" }}>{formatMoney(p.precioPublicado)}</p>
                <div className="flex gap-2 text-xs" style={{ color: "#47455A" }}>
                  <span>{p.visitas.length} visitas</span>
                  <span>·</span>
                  <span>{formatDate(p.creadoEn)}</span>
                </div>
              </div>
              {p.cliente && (
                <p className="text-xs mt-1.5" style={{ color: "#47455A" }}>
                  Propietario: {(p.cliente as { nombre: string }).nombre}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
