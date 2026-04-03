import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const busqueda = await prisma.busqueda.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true } },
      propiedades: { orderBy: [{ scoreIA: "desc" }, { orden: "asc" }] },
    },
  });

  if (!busqueda) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(busqueda);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const busqueda = await prisma.busqueda.update({
    where: { id: parseInt(params.id) },
    data: {
      zonas: body.zonas ? JSON.stringify(body.zonas) : undefined,
      tipoPropiedad: body.tipoPropiedad ?? undefined,
      ambientesMin: body.ambientesMin != null ? parseInt(body.ambientesMin) : undefined,
      ambientesMax: body.ambientesMax != null ? parseInt(body.ambientesMax) : undefined,
      precioMin: body.precioMin != null ? parseFloat(body.precioMin) : undefined,
      precioMax: body.precioMax != null ? parseFloat(body.precioMax) : undefined,
      modoPago: body.modoPago ?? undefined,
      cochera: body.cochera ?? undefined,
      aptoCredito: body.aptoCredito ?? undefined,
      requisitosExtra: body.requisitosExtra ?? undefined,
      estado: body.estado ?? undefined,
      contextoPrevioIA: body.contextoPrevioIA ?? undefined,
    },
  });

  return NextResponse.json(busqueda);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.busqueda.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ ok: true });
}
