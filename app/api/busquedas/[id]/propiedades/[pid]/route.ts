import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; pid: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const prop = await prisma.propiedadBusqueda.update({
    where: { id: parseInt(params.pid) },
    data: {
      estadoCliente: body.estadoCliente,
      comentarioCliente: body.comentarioCliente ?? undefined,
    },
  });

  return NextResponse.json(prop);
}
