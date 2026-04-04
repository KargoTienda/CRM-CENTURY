import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rankearPropiedades } from "@/lib/claude";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!process.env.CLAUDE_API_KEY) {
    return NextResponse.json({ error: "CLAUDE_API_KEY no configurado" }, { status: 400 });
  }

  const id = parseInt(params.id);

  const [{ data: busqueda, error }, { data: propiedades }] = await Promise.all([
    supabase.from("busquedas").select("*").eq("id", id).single(),
    supabase.from("propiedades_busqueda").select("*").eq("busqueda_id", id).eq("estado_cliente", "PENDIENTE"),
  ]);

  if (error || !busqueda) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const perfil = {
    zonas: Array.isArray(busqueda.zonas) ? busqueda.zonas : JSON.parse(busqueda.zonas || "[]"),
    tipoPropiedad: busqueda.tipo_propiedad ?? undefined,
    ambientesMin: busqueda.ambientes_min ?? undefined,
    ambientesMax: busqueda.ambientes_max ?? undefined,
    precioMin: busqueda.precio_min ?? undefined,
    precioMax: busqueda.precio_max ?? undefined,
    modoPago: busqueda.modo_pago ?? undefined,
    cochera: busqueda.cochera ?? undefined,
    aptoCredito: busqueda.apto_credito ?? undefined,
    requisitosExtra: busqueda.requisitos_extra ?? undefined,
  };

  const propiedadesRaw = (propiedades ?? []).map((p) => ({
    titulo: p.titulo ?? undefined,
    direccion: p.direccion ?? undefined,
    barrio: p.barrio ?? undefined,
    precio: p.precio ?? undefined,
    expensas: p.expensas ?? undefined,
    ambientes: p.ambientes ?? undefined,
    superficie: p.superficie ?? undefined,
    cochera: p.cochera ?? undefined,
    aptoCredito: p.apto_credito ?? undefined,
    descripcion: p.descripcion ?? undefined,
    linkOriginal: p.link_original,
    portal: p.portal,
    idExterno: p.id_externo ?? undefined,
  }));

  if (propiedadesRaw.length === 0) {
    return NextResponse.json({ mensaje: "No hay propiedades pendientes para rankear", total: 0 });
  }

  const rankings = await rankearPropiedades(perfil, busqueda.contexto_previo_ia, propiedadesRaw);

  for (const r of rankings) {
    await supabase
      .from("propiedades_busqueda")
      .update({ score_ia: r.score, razon_ia: r.razon })
      .eq("busqueda_id", id)
      .eq("link_original", r.linkOriginal);
  }

  return NextResponse.json({ mensaje: `${rankings.length} propiedades rankeadas`, rankings });
}
