import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
  const { error } = await supabase.from("leads").delete().eq("id", parseInt(params.id));
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
