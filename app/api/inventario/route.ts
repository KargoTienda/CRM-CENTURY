import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const propiedades = await prisma.propiedadInventario.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      cliente: { select: { id: true, nombre: true } },
      visitas: { select: { id: true } },
    },
  });

  return NextResponse.json(propiedades);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const propiedad = await prisma.propiedadInventario.create({
    data: {
      titulo: body.titulo,
      direccion: body.direccion,
      barrio: body.barrio || null,
      zona: body.zona || null,
      tipo: body.tipo || "departamento",
      ambientes: body.ambientes ? parseInt(body.ambientes) : null,
      superficie: body.superficie ? parseFloat(body.superficie) : null,
      cochera: body.cochera || false,
      precioPublicado: body.precioPublicado ? parseFloat(body.precioPublicado) : null,
      precioNegociado: body.precioNegociado ? parseFloat(body.precioNegociado) : null,
      moneda: body.moneda || "USD",
      tipoTransaccion: body.tipoTransaccion || "venta",
      estado: body.estado || "activa",
      clienteId: body.clienteId ? parseInt(body.clienteId) : null,
      linkPortal: body.linkPortal || null,
      porcentajeComision: body.porcentajeComision ? parseFloat(body.porcentajeComision) : null,
      origen: body.origen || null,
    },
  });

  return NextResponse.json(propiedad, { status: 201 });
}
