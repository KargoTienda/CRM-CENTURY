import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { formatDate, formatMoney } from "@/lib/utils";
import { Search, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BusquedasPage() {
  const { data: busquedasRaw } = await supabase
    .from("busquedas")
    .select("*, clientes!cliente_id(id, nombre), propiedades_busqueda(id, estado_cliente)")
    .order("creado_en", { ascending: false });

  const busquedas = (busquedasRaw ?? []).map(({ clientes, propiedades_busqueda, ...b }) => ({
    ...b,
    precioMax: b.precio_max,
    ambientesMin: b.ambientes_min,
    creadoEn: b.creado_en,
    cliente: clientes,
    propiedades: propiedades_busqueda ?? [],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#023E8A", letterSpacing: "-0.02em" }}>Búsquedas</h1>
          <p className="text-sm mt-1" style={{ color: "#90AFCC" }}>{busquedas.length} búsquedas activas</p>
        </div>
        <Link href="/busquedas/nueva" className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva búsqueda
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {busquedas.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "#EEF6FF", border: "1px solid #D0E8F5" }}>
              <Search className="w-6 h-6" style={{ color: "#ADE8F4" }} />
            </div>
            <p className="text-sm" style={{ color: "#90AFCC" }}>No hay búsquedas todavía</p>
            <Link href="/busquedas/nueva" className="mt-3 inline-block text-sm font-medium"
              style={{ color: "#0096C7" }}>
              Crear la primera búsqueda
            </Link>
          </div>
        )}
        {busquedas.map((b) => {
          const zonas = JSON.parse(b.zonas || "[]") as string[];
          const total = b.propiedades.length;
          const llamar = b.propiedades.filter((p: { estado_cliente: string }) => p.estado_cliente === "LLAMAR").length;
          const descartadas = b.propiedades.filter((p: { estado_cliente: string }) => p.estado_cliente === "DESCARTADO").length;

          return (
            <Link
              key={b.id}
              href={`/busquedas/${b.id}`}
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
                  <Search className="w-5 h-5" style={{ color: "#0096C7" }} />
                </div>
                <span className="badge" style={
                  b.estado === "activa"
                    ? { bg: "#D1FAE5", color: "#065F46", background: "#D1FAE5" } as React.CSSProperties
                    : { background: "#F3F4F6", color: "#6B7280" }
                }>
                  {b.estado}
                </span>
              </div>
              <h3 className="font-bold text-sm" style={{ color: "#023E8A" }}>{b.cliente?.nombre}</h3>
              <p className="text-xs mt-1" style={{ color: "#0096C7" }}>
                {zonas.join(", ")} {b.ambientesMin ? `· ${b.ambientesMin}+ amb` : ""}
              </p>
              {b.precioMax && (
                <p className="text-xs mt-0.5" style={{ color: "#90AFCC" }}>Hasta {formatMoney(b.precioMax)}</p>
              )}
              <div className="flex gap-3 mt-3 pt-3 text-xs"
                style={{ borderTop: "1px solid #EEF6FF", color: "#90AFCC" }}>
                <span>{total} propiedades</span>
                {llamar > 0 && <span style={{ color: "#0CB87E", fontWeight: 600 }}>{llamar} a llamar</span>}
                {descartadas > 0 && <span>{descartadas} descartadas</span>}
              </div>
              <p className="text-xs mt-1" style={{ color: "#90AFCC" }}>{formatDate(b.creadoEn)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
