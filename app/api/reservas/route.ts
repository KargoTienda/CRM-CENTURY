import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const reservas = await prisma.reserva.findMany({
    orderBy: { fechaReserva: "desc" },
    include: { cliente: { select: { id: true, nombre: true } } },
  });

  return NextResponse.json(reservas);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const reserva = await prisma.reserva.create({
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
      fechaReserva: body.fechaReserva ? new Date(body.fechaReserva) : new Date(),
    },
  });

  return NextResponse.json(reserva, { status: 201 });
}
