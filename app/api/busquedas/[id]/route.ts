import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const [{ data: busqueda, error }, { data: propiedades }] = await Promise.all([
    supabase.from("busquedas").select("*, clientes!cliente_id(id, nombre, telefono)").eq("id", id).single(),
    supabase
      .from("propiedades_busqueda")
      .select("*")
      .eq("busqueda_id", id)
      .order("score_ia", { ascending: false, nullsFirst: false })
      .order("orden", { ascending: true }),
  ]);

  if (error || !busqueda) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const { clientes, ...b } = busqueda as typeof busqueda & { clientes: unknown };
  return NextResponse.json({ ...b, cliente: clientes, propiedades: propiedades ?? [] });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  if (body.zonas !== undefined) updates.zonas = JSON.stringify(body.zonas);
  if (body.tipoPropiedad !== undefined) updates.tipo_propiedad = body.tipoPropiedad;
  if (body.ambientesMin != null) updates.ambientes_min = parseInt(body.ambientesMin);
  if (body.ambientesMax != null) updates.ambientes_max = parseInt(body.ambientesMax);
  if (body.precioMin != null) updates.precio_min = parseFloat(body.precioMin);
  if (body.precioMax != null) updates.precio_max = parseFloat(body.precioMax);
  if (body.modoPago !== undefined) updates.modo_pago = body.modoPago;
  if (body.cochera !== undefined) updates.cochera = body.cochera;
  if (body.aptoCredito !== undefined) updates.apto_credito = body.aptoCredito;
  if (body.requisitosExtra !== undefined) updates.requisitos_extra = body.requisitosExtra;
  if (body.estado !== undefined) updates.estado = body.estado;
  if (body.contextoPrevioIA !== undefined) updates.contexto_previo_ia = body.contextoPrevioIA;

  const { data: busqueda, error } = await supabase
    .from("busquedas")
    .update(updates)
    .eq("id", parseInt(params.id))
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(busqueda);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase.from("busquedas").delete().eq("id", parseInt(params.id));
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
