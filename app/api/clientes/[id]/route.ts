import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const id = parseInt(params.id);

  const [
    { data: cliente, error },
    { data: interacciones },
    { data: busquedas },
    { data: reservas },
  ] = await Promise.all([
    supabase.from("clientes").select("*").eq("id", id).single(),
    supabase.from("interacciones").select("*").eq("cliente_id", id).order("fecha", { ascending: false }).limit(20),
    supabase.from("busquedas").select("*").eq("cliente_id", id).order("creado_en", { ascending: false }),
    supabase.from("reservas").select("*").eq("cliente_id", id).order("fecha_reserva", { ascending: false }),
  ]);

  if (error || !cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json({ ...cliente, interacciones: interacciones ?? [], busquedas: busquedas ?? [], reservas: reservas ?? [] });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const { data: cliente, error } = await supabase
    .from("clientes")
    .update({
      nombre: body.nombre,
      telefono: body.telefono || null,
      instagram: body.instagram || null,
      email: body.email || null,
      fecha_nacimiento: body.fechaNacimiento ? new Date(body.fechaNacimiento).toISOString() : null,
      zona: body.zona || null,
      modo_pago: body.modoPago || null,
      tipo_buscado: body.tipoBuscado || null,
      valor_presupuesto: body.valorPresupuesto ? parseFloat(body.valorPresupuesto) : null,
      ambientes: body.ambientes ? parseInt(body.ambientes) : null,
      origen: body.origen || null,
      estado_busqueda: body.estadoBusqueda || "activo",
      tarea: body.tarea || null,
      proximo_contacto: body.proximoContacto ? new Date(body.proximoContacto).toISOString() : null,
      notas: body.notas || null,
    })
    .eq("id", parseInt(params.id))
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(cliente);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { error } = await supabase.from("clientes").delete().eq("id", parseInt(params.id));
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
