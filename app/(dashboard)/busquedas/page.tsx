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
          <h1 className="text-2xl font-semibold" style={{ color: "#EDEAE3", letterSpacing: "-0.02em" }}>Búsquedas</h1>
          <p className="text-sm mt-1" style={{ color: "#8A8799" }}>{busquedas.length} búsquedas activas</p>
        </div>
        <Link
          href="/busquedas/nueva"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
            color: "#07080D",
            boxShadow: "0 2px 8px rgba(201,168,76,0.2)",
          }}
        >
          <Plus className="w-4 h-4" />
          Nueva búsqueda
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {busquedas.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <Search className="w-6 h-6" style={{ color: "#47455A" }} />
            </div>
            <p className="text-sm" style={{ color: "#47455A" }}>No hay búsquedas todavía</p>
            <Link href="/busquedas/nueva" className="mt-3 inline-block text-sm transition-colors"
              style={{ color: "#C9A84C" }}>
              Crear la primera búsqueda
            </Link>
          </div>
        )}
        {busquedas.map((b) => {
          const zonas = JSON.parse(b.zonas || "[]") as string[];
          const total = b.propiedades.length;
          const descartadas = b.propiedades.filter((p: { estado_cliente: string }) => p.estado_cliente === "DESCARTADO").length;
          const llamar = b.propiedades.filter((p: { estado_cliente: string }) => p.estado_cliente === "LLAMAR").length;

          return (
            <Link
              key={b.id}
              href={`/busquedas/${b.id}`}
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
                  style={{ background: "rgba(96,165,250,0.1)" }}>
                  <Search className="w-5 h-5" style={{ color: "#60A5FA" }} />
                </div>
                <span className="badge" style={
                  b.estado === "activa"
                    ? { background: "rgba(52,211,153,0.12)", color: "#34D399" }
                    : { background: "rgba(255,255,255,0.06)", color: "#8A8799" }
                }>
                  {b.estado}
                </span>
              </div>

              <h3 className="font-semibold text-sm" style={{ color: "#EDEAE3" }}>{b.cliente?.nombre}</h3>
              <p className="text-xs mt-1" style={{ color: "#8A8799" }}>
                {zonas.join(", ")} {b.ambientesMin ? `· ${b.ambientesMin}+ amb` : ""}
              </p>
              {b.precioMax && (
                <p className="text-xs mt-0.5" style={{ color: "#8A8799" }}>Hasta {formatMoney(b.precioMax)}</p>
              )}

              <div className="flex gap-3 mt-3 pt-3 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "#47455A" }}>
                <span>{total} propiedades</span>
                {llamar > 0 && <span style={{ color: "#34D399", fontWeight: 500 }}>{llamar} a llamar</span>}
                {descartadas > 0 && <span>{descartadas} descartadas</span>}
              </div>
              <p className="text-xs mt-1" style={{ color: "#47455A" }}>{formatDate(b.creadoEn)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
