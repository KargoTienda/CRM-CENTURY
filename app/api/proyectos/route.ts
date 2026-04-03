import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const proyectos = await prisma.proyecto.findMany({ where: { activo: true }, orderBy: { creadoEn: "asc" } });
  return NextResponse.json(proyectos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const proyecto = await prisma.proyecto.create({
    data: { nombre: body.nombre, descripcion: body.descripcion || null },
  });
  return NextResponse.json(proyecto, { status: 201 });
}
