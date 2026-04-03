import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const estado = searchParams.get("estado") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: "insensitive" } },
      { telefono: { contains: q } },
      { instagram: { contains: q } },
    ];
  }
  if (estado) where.estadoBusqueda = estado;

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: [{ proximoContacto: "asc" }, { creadoEn: "desc" }],
      skip,
      take: limit,
    }),
    prisma.cliente.count({ where }),
  ]);

  return NextResponse.json({ clientes, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const cliente = await prisma.cliente.create({
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

  return NextResponse.json(cliente, { status: 201 });
}
