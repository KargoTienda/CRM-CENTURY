import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const origen = searchParams.get("origen") || "";
  const estado = searchParams.get("estado") || "";

  const where: Record<string, unknown> = {};
  if (origen) where.origen = origen;
  if (estado) where.estado = estado;

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { creadoEn: "desc" },
    include: { proyecto: { select: { id: true, nombre: true } } },
  });

  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const lead = await prisma.lead.create({
    data: {
      nombre: body.nombre || null,
      telefono: body.telefono || null,
      instagram: body.instagram || null,
      email: body.email || null,
      origen: body.origen || "MANUAL",
      estado: body.estado || "NUEVO",
      propiedadInteres: body.propiedadInteres || null,
      notas: body.notas || null,
      proyectoId: body.proyectoId ? parseInt(body.proyectoId) : null,
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
