import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clasificarLeads } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!process.env.CLAUDE_API_KEY) {
    return NextResponse.json({ error: "CLAUDE_API_KEY no configurado" }, { status: 400 });
  }

  const body = await req.json();
  const leadIds: number[] = body.leadIds || [];

  if (leadIds.length === 0) {
    return NextResponse.json({ error: "leadIds requerido" }, { status: 400 });
  }

  const [{ data: leadsRaw }, { data: proyectosRaw }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, nombre, telefono, propiedad_interes, notas, mensaje_inicial")
      .in("id", leadIds),
    supabase
      .from("proyectos")
      .select("id, nombre, descripcion, reglas_clasificacion")
      .eq("activo", true),
  ]);

  if (!proyectosRaw || proyectosRaw.length === 0) {
    return NextResponse.json({ error: "No hay proyectos activos" }, { status: 400 });
  }

  const leads = (leadsRaw ?? []).map((l) => ({
    id: l.id,
    nombre: l.nombre ?? undefined,
    telefono: l.telefono ?? undefined,
    propiedadInteres: l.propiedad_interes ?? undefined,
    notas: l.notas ?? undefined,
    mensajeInicial: l.mensaje_inicial ?? undefined,
  }));

  const proyectos = proyectosRaw.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion ?? undefined,
    reglasClasificacion: p.reglas_clasificacion ?? undefined,
  }));

  const resultados = await clasificarLeads(leads, proyectos);

  for (const r of resultados) {
    await supabase
      .from("leads")
      .update({ proyecto_sugerido_id: r.proyectoId, score_ia: r.confianza })
      .eq("id", r.leadId);
  }

  return NextResponse.json({ resultados, total: resultados.length });
}
