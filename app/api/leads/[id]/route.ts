import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const lead = await prisma.lead.update({
    where: { id: parseInt(params.id) },
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

  return NextResponse.json(lead);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.lead.delete({ where: { id: parseInt(params.id) } });
  return NextResponse.json({ ok: true });
}
