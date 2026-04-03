import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: busquedasRaw, error } = await supabase
    .from("busquedas")
    .select("*, clientes!cliente_id(id, nombre, telefono), propiedades_busqueda(id, estado_cliente)")
    .order("creado_en", { ascending: false });

  if (error) throw error;

  const busquedas = busquedasRaw?.map(({ clientes, propiedades_busqueda, ...b }) => ({
    ...b,
    cliente: clientes,
    propiedades: propiedades_busqueda,
  })) ?? [];

  return NextResponse.json(busquedas);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const tokenPublico = randomBytes(16).toString("hex");

  const { data: busquedaRaw, error } = await supabase
    .from("busquedas")
    .insert({
      cliente_id: parseInt(body.clienteId),
      zonas: JSON.stringify(body.zonas || []),
      tipo_propiedad: body.tipoPropiedad || null,
      ambientes_min: body.ambientesMin ? parseInt(body.ambientesMin) : null,
      ambientes_max: body.ambientesMax ? parseInt(body.ambientesMax) : null,
      precio_min: body.precioMin ? parseFloat(body.precioMin) : null,
      precio_max: body.precioMax ? parseFloat(body.precioMax) : null,
      modo_pago: body.modoPago || null,
      cochera: body.cochera ?? null,
      apto_credito: body.aptoCredito ?? null,
      requisitos_extra: body.requisitosExtra || null,
      token_publico: tokenPublico,
    })
    .select("*, clientes!cliente_id(id, nombre)")
    .single();

  if (error) throw error;

  const { clientes, ...busqueda } = busquedaRaw as typeof busquedaRaw & { clientes: unknown };
  return NextResponse.json({ ...busqueda, cliente: clientes }, { status: 201 });
}
