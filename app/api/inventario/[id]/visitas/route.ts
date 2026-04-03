import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: visitasRaw, error } = await supabase
    .from("visitas_inventario")
    .select("*, clientes!cliente_id(id, nombre)")
    .eq("propiedad_id", parseInt(params.id))
    .order("fecha", { ascending: false });

  if (error) throw error;

  const visitas = (visitasRaw ?? []).map(({ clientes, ...v }) => ({ ...v, cliente: clientes }));
  return NextResponse.json(visitas);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const { data: visitaRaw, error } = await supabase
    .from("visitas_inventario")
    .insert({
      propiedad_id: parseInt(params.id),
      cliente_id: body.clienteId ? parseInt(body.clienteId) : null,
      fecha: body.fecha ? new Date(body.fecha).toISOString() : new Date().toISOString(),
      feedback: body.feedback || null,
      interes: body.interes || null,
    })
    .select("*, clientes!cliente_id(nombre)")
    .single();

  if (error) throw error;

  const { clientes, ...visita } = visitaRaw as typeof visitaRaw & { clientes: unknown };
  return NextResponse.json({ ...visita, cliente: clientes }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const visitaId = searchParams.get("visitaId");
  if (!visitaId) return NextResponse.json({ error: "visitaId requerido" }, { status: 400 });

  const { error } = await supabase.from("visitas_inventario").delete().eq("id", parseInt(visitaId));
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
