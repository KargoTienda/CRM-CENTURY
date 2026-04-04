import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const [{ data: propiedad, error }, { data: visitas }, { data: reservas }] = await Promise.all([
    supabase.from("propiedades_inventario").select("*, clientes!cliente_id(id, nombre, telefono)").eq("id", id).single(),
    supabase
      .from("visitas_inventario")
      .select("*, clientes!cliente_id(nombre)")
      .eq("propiedad_id", id)
      .order("fecha", { ascending: false }),
    supabase
      .from("reservas")
      .select("id, estado, fecha_reserva, nombre_cliente")
      .eq("propiedad_id", id),
  ]);

  if (error || !propiedad) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const { clientes, ...p } = propiedad as typeof propiedad & { clientes: unknown };
  const visitasMapped = (visitas ?? []).map(({ clientes: c, ...v }) => ({ ...v, cliente: c }));

  return NextResponse.json({ ...p, cliente: clientes, visitas: visitasMapped, reservas: reservas ?? [] });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  if (body.titulo !== undefined) updates.titulo = body.titulo;
  if (body.direccion !== undefined) updates.direccion = body.direccion;
  if (body.barrio !== undefined) updates.barrio = body.barrio;
  if (body.zona !== undefined) updates.zona = body.zona;
  if (body.tipo !== undefined) updates.tipo = body.tipo;
  if (body.ambientes != null) updates.ambientes = parseInt(body.ambientes);
  if (body.superficie != null) updates.superficie = parseFloat(body.superficie);
  if (body.cochera !== undefined) updates.cochera = body.cochera;
  if (body.precioPublicado != null) updates.precio_publicado = parseFloat(body.precioPublicado);
  if (body.precioNegociado != null) updates.precio_negociado = parseFloat(body.precioNegociado);
  if (body.moneda !== undefined) updates.moneda = body.moneda;
  if (body.tipoTransaccion !== undefined) updates.tipo_transaccion = body.tipoTransaccion;
  if (body.estado !== undefined) updates.estado = body.estado;
  if (body.clienteId != null) updates.cliente_id = parseInt(body.clienteId);
  if (body.linkPortal !== undefined) updates.link_portal = body.linkPortal;
  if (body.porcentajeComision != null) updates.porcentaje_comision = parseFloat(body.porcentajeComision);
  if (body.origen !== undefined) updates.origen = body.origen;

  const { data: propiedad, error } = await supabase
    .from("propiedades_inventario")
    .update(updates)
    .eq("id", parseInt(params.id))
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(propiedad);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase.from("propiedades_inventario").delete().eq("id", parseInt(params.id));
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
