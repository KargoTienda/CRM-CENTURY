import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { actualizarContextoCliente } from "@/lib/claude";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const [{ data: busqueda, error }, { data: propiedades }] = await Promise.all([
    supabase.from("busquedas").select("*").eq("id", id).single(),
    supabase.from("propiedades_busqueda").select("*").eq("busqueda_id", id).neq("estado_cliente", "PENDIENTE"),
  ]);

  if (error || !busqueda) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const propiedadesConFeedback = (propiedades ?? []).map((p) => ({
    titulo: p.titulo ?? undefined,
    direccion: p.direccion ?? undefined,
    barrio: p.barrio ?? undefined,
    precio: p.precio ?? undefined,
    ambientes: p.ambientes ?? undefined,
    estadoCliente: p.estado_cliente,
    comentarioCliente: p.comentario_cliente ?? undefined,
    scoreIA: p.score_ia ?? undefined,
    razonIA: p.razon_ia ?? undefined,
  }));

  const nuevoContexto = await actualizarContextoCliente(propiedadesConFeedback);

  await supabase
    .from("busquedas")
    .update({ contexto_previo_ia: nuevoContexto })
    .eq("id", id);

  return NextResponse.json({ contextoPrevioIA: nuevoContexto });
}
