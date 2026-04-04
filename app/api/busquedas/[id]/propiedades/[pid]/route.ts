import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; pid: string } }
) {
  const body = await req.json();

  const updates: Record<string, unknown> = { estado_cliente: body.estadoCliente };
  if (body.comentarioCliente !== undefined) updates.comentario_cliente = body.comentarioCliente;

  const { data: prop, error } = await supabase
    .from("propiedades_busqueda")
    .update(updates)
    .eq("id", parseInt(params.pid))
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(prop);
}
