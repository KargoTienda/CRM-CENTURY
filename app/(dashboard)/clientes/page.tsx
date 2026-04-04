import { supabase } from "@/lib/supabase";
import ClientesTable from "@/components/clientes/ClientesTable";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string; page?: string };
}) {
  const q = searchParams.q || "";
  const estado = searchParams.estado || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 50;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("clientes")
    .select("*", { count: "exact" })
    .order("proximo_contacto", { ascending: true, nullsFirst: false })
    .order("creado_en", { ascending: false })
    .range(from, to);

  if (q) query = query.or(`nombre.ilike.%${q}%,telefono.ilike.%${q}%,instagram.ilike.%${q}%`);
  if (estado) query = query.eq("estado_busqueda", estado);

  const { data: clientesRaw, count } = await query;
  const total = count ?? 0;

  // Map snake_case → camelCase for components
  const clientes = (clientesRaw ?? []).map((c) => ({
    ...c,
    fechaNacimiento: c.fecha_nacimiento,
    modoPago: c.modo_pago,
    tipoBuscado: c.tipo_buscado,
    valorPresupuesto: c.valor_presupuesto,
    estadoBusqueda: c.estado_busqueda,
    proximoContacto: c.proximo_contacto,
    importadoDeExcel: c.importado_de_excel,
    creadoEn: c.creado_en,
    actualizadoEn: c.actualizado_en,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#EDEAE3", letterSpacing: "-0.02em" }}>Clientes</h1>
          <p className="text-sm mt-1" style={{ color: "#8A8799" }}>{total} registros totales</p>
        </div>
      </div>
      <ClientesTable
        clientes={clientes}
        total={total}
        page={page}
        pages={Math.ceil(total / limit)}
        q={q}
        estado={estado}
      />
    </div>
  );
}
