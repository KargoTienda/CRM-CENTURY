import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const propiedad = await prisma.propiedadInventario.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true } },
      visitas: {
        orderBy: { fecha: "desc" },
        include: { cliente: { select: { nombre: true } } },
      },
      reservas: { select: { id: true, estado: true, fechaReserva: true, nombreCliente: true } },
    },
  });

  if (!propiedad) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(propiedad);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const propiedad = await prisma.propiedadInventario.update({
    where: { id: parseInt(params.id) },
    data: {
      titulo: body.titulo ?? undefined,
      direccion: body.direccion ?? undefined,
      barrio: body.barrio ?? undefined,
      zona: body.zona ?? undefined,
      tipo: body.tipo ?? undefined,
      ambientes: body.ambientes != null ? parseInt(body.ambientes) : undefined,
      superficie: body.superficie != null ? parseFloat(body.superficie) : undefined,
      cochera: body.cochera ?? undefined,
      precioPublicado: body.precioPublicado != null ? parseFloat(body.precioPublicado) : undefined,
      precioNegociado: body.precioNegociado != null ? parseFloat(body.precioNegociado) : undefined,
      moneda: body.moneda ?? undefined,
      tipoTransaccion: body.tipoTransaccion ?? undefined,
      estado: body.estado ?? undefined,
      clienteId: body.clienteId != null ? parseInt(body.clienteId) : undefined,
      linkPortal: body.linkPortal ?? undefined,
      porcentajeComision: body.porcentajeComision != null ? parseFloat(body.porcentajeComision) : undefined,
      origen: body.origen ?? undefined,
    },
  });

  return NextResponse.json(propiedad);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.propiedadInventario.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ ok: true });
}
