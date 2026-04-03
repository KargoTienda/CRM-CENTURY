import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

  const [leadsRaw, proyectos] = await Promise.all([
    prisma.lead.findMany({
      where: { id: { in: leadIds } },
      select: {
        id: true,
        nombre: true,
        telefono: true,
        propiedadInteres: true,
        notas: true,
        mensajeInicial: true,
      },
    }),
    prisma.proyecto.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, descripcion: true, reglasClasificacion: true },
    }),
  ]);

  if (proyectos.length === 0) {
    return NextResponse.json({ error: "No hay proyectos activos" }, { status: 400 });
  }

  const leads = leadsRaw.map((l) => ({
    id: l.id,
    nombre: l.nombre ?? undefined,
    telefono: l.telefono ?? undefined,
    propiedadInteres: l.propiedadInteres ?? undefined,
    notas: l.notas ?? undefined,
    mensajeInicial: l.mensajeInicial ?? undefined,
  }));

  const proyectosNorm = proyectos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion ?? undefined,
    reglasClasificacion: p.reglasClasificacion ?? undefined,
  }));

  const resultados = await clasificarLeads(leads, proyectosNorm);

  // Aplicar clasificaciones
  for (const r of resultados) {
    await prisma.lead.update({
      where: { id: r.leadId },
      data: {
        proyectoSugeridoId: r.proyectoId,
        scoreIA: r.confianza,
      },
    });
  }

  return NextResponse.json({ resultados, total: resultados.length });
}
