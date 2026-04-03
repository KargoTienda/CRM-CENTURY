import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const origen = searchParams.get("origen") || "";
  const estado = searchParams.get("estado") || "";

  let query = supabase
    .from("leads")
    .select("*, proyectos!proyecto_id(id, nombre)")
    .order("creado_en", { ascending: false });

  if (origen) query = query.eq("origen", origen);
  if (estado) query = query.eq("estado", estado);

  const { data: leadsRaw, error } = await query;
  if (error) throw error;

  const leads = leadsRaw?.map(({ proyectos, ...l }) => ({ ...l, proyecto: proyectos })) ?? [];
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
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
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(lead, { status: 201 });
}
