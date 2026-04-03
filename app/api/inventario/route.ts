import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: propiedadesRaw, error } = await supabase
    .from("propiedades_inventario")
    .select("*, clientes!cliente_id(id, nombre), visitas_inventario(id)")
    .order("creado_en", { ascending: false });

  if (error) throw error;

  const propiedades = propiedadesRaw?.map(({ clientes, visitas_inventario, ...p }) => ({
    ...p,
    cliente: clientes,
    visitas: visitas_inventario,
  })) ?? [];

  return NextResponse.json(propiedades);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const { data: propiedad, error } = await supabase
    .from("propiedades_inventario")
    .insert({
      titulo: body.titulo,
      direccion: body.direccion,
      barrio: body.barrio || null,
      zona: body.zona || null,
      tipo: body.tipo || "departamento",
      ambientes: body.ambientes ? parseInt(body.ambientes) : null,
      superficie: body.superficie ? parseFloat(body.superficie) : null,
      cochera: body.cochera || false,
      precio_publicado: body.precioPublicado ? parseFloat(body.precioPublicado) : null,
      precio_negociado: body.precioNegociado ? parseFloat(body.precioNegociado) : null,
      moneda: body.moneda || "USD",
      tipo_transaccion: body.tipoTransaccion || "venta",
      estado: body.estado || "activa",
      cliente_id: body.clienteId ? parseInt(body.clienteId) : null,
      link_portal: body.linkPortal || null,
      porcentaje_comision: body.porcentajeComision ? parseFloat(body.porcentajeComision) : null,
      origen: body.origen || null,
    })
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(propiedad, { status: 201 });
}
