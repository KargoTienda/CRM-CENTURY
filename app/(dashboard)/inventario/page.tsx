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
    activa:        { bg: "#D1FAE5", color: "#065F46" },
    en_negociacion:{ bg: "#FEF3C7", color: "#92400E" },
    reservada:     { bg: "#DBEAFE", color: "#1E40AF" },
    vendida:       { bg: "#F3F4F6", color: "#6B7280" },
    retirada:      { bg: "#FEE2E2", color: "#991B1B" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#023E8A", letterSpacing: "-0.02em" }}>Inventario</h1>
          <p className="text-sm mt-1" style={{ color: "#90AFCC" }}>Tus propiedades en captación y venta</p>
        </div>
        <Link href="/inventario/nueva" className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva propiedad
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {propiedades.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "#EEF6FF", border: "1px solid #D0E8F5" }}>
              <Building2 className="w-6 h-6" style={{ color: "#ADE8F4" }} />
            </div>
            <p className="text-sm" style={{ color: "#90AFCC" }}>Sin propiedades cargadas</p>
          </div>
        )}
        {propiedades.map((p) => {
          const badge = ESTADO_BADGE[p.estado] ?? { bg: "#F3F4F6", color: "#6B7280" };
          return (
            <Link
              key={p.id}
              href={`/inventario/${p.id}`}
              className="rounded-2xl p-5 block transition-all duration-200 hover:-translate-y-1"
              style={{
                background: "#FFFFFF",
                border: "1px solid #D0E8F5",
                boxShadow: "0 1px 4px rgba(0,119,182,0.06)",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.borderColor = "#00B4D8";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,119,182,0.12)";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.borderColor = "#D0E8F5";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,119,182,0.06)";
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#EEF6FF" }}>
                  <Building2 className="w-5 h-5" style={{ color: "#0077B6" }} />
                </div>
                <span className="badge" style={badge}>{p.estado.replace("_", " ")}</span>
              </div>
              <h3 className="font-bold text-sm" style={{ color: "#023E8A" }}>{p.titulo}</h3>
              <p className="text-xs mt-1" style={{ color: "#0096C7" }}>{p.direccion}</p>
              {p.barrio && <p className="text-xs mt-0.5" style={{ color: "#90AFCC" }}>{p.barrio}</p>}
              <div className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: "1px solid #EEF6FF" }}>
                <p className="text-sm font-bold" style={{ color: "#0077B6" }}>{formatMoney(p.precioPublicado)}</p>
                <div className="flex gap-2 text-xs" style={{ color: "#90AFCC" }}>
                  <span>{p.visitas.length} visitas</span>
                  <span>·</span>
                  <span>{formatDate(p.creadoEn)}</span>
                </div>
              </div>
              {p.cliente && (
                <p className="text-xs mt-1.5" style={{ color: "#90AFCC" }}>
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
