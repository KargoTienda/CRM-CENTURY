import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const busquedas = await prisma.busqueda.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true } },
      propiedades: { select: { id: true, estadoCliente: true } },
    },
  });

  return NextResponse.json(busquedas);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const tokenPublico = randomBytes(16).toString("hex");

  const busqueda = await prisma.busqueda.create({
    data: {
      clienteId: parseInt(body.clienteId),
      zonas: JSON.stringify(body.zonas || []),
      tipoPropiedad: body.tipoPropiedad || null,
      ambientesMin: body.ambientesMin ? parseInt(body.ambientesMin) : null,
      ambientesMax: body.ambientesMax ? parseInt(body.ambientesMax) : null,
      precioMin: body.precioMin ? parseFloat(body.precioMin) : null,
      precioMax: body.precioMax ? parseFloat(body.precioMax) : null,
      modoPago: body.modoPago || null,
      cochera: body.cochera ?? null,
      aptoCredito: body.aptoCredito ?? null,
      requisitosExtra: body.requisitosExtra || null,
      tokenPublico,
    },
    include: {
      cliente: { select: { id: true, nombre: true } },
    },
  });

  return NextResponse.json(busqueda, { status: 201 });
}
