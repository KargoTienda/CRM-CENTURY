import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const reserva = await prisma.reserva.update({
    where: { id: parseInt(params.id) },
    data: {
      nombreCliente: body.nombreCliente,
      telefono: body.telefono || null,
      tipoTransaccion: body.tipoTransaccion || "compra",
      zona: body.zona || null,
      valorReserva: body.valorReserva ? parseFloat(body.valorReserva) : null,
      precioNegociado: body.precioNegociado ? parseFloat(body.precioNegociado) : null,
      porcentajeParteCompradora: body.porcentajeParteCompradora ? parseFloat(body.porcentajeParteCompradora) : null,
      porcentajeParteVendedora: body.porcentajeParteVendedora ? parseFloat(body.porcentajeParteVendedora) : null,
      escribano: body.escribano || false,
      comisionBruta: body.comisionBruta ? parseFloat(body.comisionBruta) : null,
      comisionMia: body.comisionMia ? parseFloat(body.comisionMia) : null,
      estado: body.estado || "reservada",
      origen: body.origen || null,
      notas: body.notas || null,
    },
  });

  return NextResponse.json(reserva);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.reserva.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ ok: true });
}
