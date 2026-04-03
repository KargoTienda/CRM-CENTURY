import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const visitas = await prisma.visitaInventario.findMany({
    where: { propiedadId: parseInt(params.id) },
    orderBy: { fecha: "desc" },
    include: { cliente: { select: { id: true, nombre: true } } },
  });

  return NextResponse.json(visitas);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const visita = await prisma.visitaInventario.create({
    data: {
      propiedadId: parseInt(params.id),
      clienteId: body.clienteId ? parseInt(body.clienteId) : null,
      fecha: body.fecha ? new Date(body.fecha) : new Date(),
      feedback: body.feedback || null,
      interes: body.interes || null,
    },
    include: { cliente: { select: { nombre: true } } },
  });

  return NextResponse.json(visita, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const visitaId = searchParams.get("visitaId");
  if (!visitaId) return NextResponse.json({ error: "visitaId requerido" }, { status: 400 });

  await prisma.visitaInventario.delete({ where: { id: parseInt(visitaId) } });
  return NextResponse.json({ ok: true });
}
