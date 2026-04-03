import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const { data: lead, error } = await supabase
    .from("leads")
    .update({
      nombre: body.nombre || null,
      telefono: body.telefono || null,
      instagram: body.instagram || null,
      email: body.email || null,
      origen: body.origen || "MANUAL",
      estado: body.estado || "NUEVO",
      propiedad_interes: body.propiedadInteres || null,
      notas: body.notas || null,
      proyecto_id: body.proyectoId ? parseInt(body.proyectoId) : null,
    })
    .eq("id", parseInt(params.id))
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(lead);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { error } = await supabase.from("leads").delete().eq("id", parseInt(params.id));
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
