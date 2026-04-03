import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const busqueda = await prisma.busqueda.findUnique({
    where: { tokenPublico: params.token },
    include: {
      cliente: { select: { nombre: true } },
      propiedades: { orderBy: [{ scoreIA: "desc" }, { orden: "asc" }] },
    },
  });

  if (!busqueda) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(busqueda);
}
