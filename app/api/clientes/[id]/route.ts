import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const cliente = await prisma.cliente.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      interacciones: { orderBy: { fecha: "desc" }, take: 20 },
      busquedas: { orderBy: { creadoEn: "desc" } },
      reservas: { orderBy: { fechaReserva: "desc" } },
    },
  });

  if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const cliente = await prisma.cliente.update({
    where: { id: parseInt(params.id) },
    data: {
      nombre: body.nombre,
      telefono: body.telefono || null,
      instagram: body.instagram || null,
      email: body.email || null,
      fechaNacimiento: body.fechaNacimiento ? new Date(body.fechaNacimiento) : null,
      zona: body.zona || null,
      modoPago: body.modoPago || null,
      tipoBuscado: body.tipoBuscado || null,
      valorPresupuesto: body.valorPresupuesto ? parseFloat(body.valorPresupuesto) : null,
      ambientes: body.ambientes ? parseInt(body.ambientes) : null,
      origen: body.origen || null,
      estadoBusqueda: body.estadoBusqueda || "activo",
      tarea: body.tarea || null,
      proximoContacto: body.proximoContacto ? new Date(body.proximoContacto) : null,
      notas: body.notas || null,
    },
  });

  return NextResponse.json(cliente);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.cliente.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ ok: true });
}
