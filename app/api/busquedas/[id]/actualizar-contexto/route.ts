import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { actualizarContextoCliente } from "@/lib/claude";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const busqueda = await prisma.busqueda.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      propiedades: {
        where: { estadoCliente: { not: "PENDIENTE" } },
      },
    },
  });

  if (!busqueda) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const propiedadesConFeedback = busqueda.propiedades.map((p) => ({
    titulo: p.titulo ?? undefined,
    direccion: p.direccion ?? undefined,
    barrio: p.barrio ?? undefined,
    precio: p.precio ?? undefined,
    ambientes: p.ambientes ?? undefined,
    estadoCliente: p.estadoCliente,
    comentarioCliente: p.comentarioCliente ?? undefined,
    scoreIA: p.scoreIA ?? undefined,
    razonIA: p.razonIA ?? undefined,
  }));

  const nuevoContexto = await actualizarContextoCliente(propiedadesConFeedback);

  await prisma.busqueda.update({
    where: { id: parseInt(params.id) },
    data: { contextoPrevioIA: nuevoContexto },
  });

  return NextResponse.json({ contextoPrevioIA: nuevoContexto });
}
