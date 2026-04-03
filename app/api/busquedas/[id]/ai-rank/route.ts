import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rankearPropiedades, actualizarContextoCliente } from "@/lib/claude";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!process.env.CLAUDE_API_KEY) {
    return NextResponse.json({ error: "CLAUDE_API_KEY no configurado" }, { status: 400 });
  }

  const busqueda = await prisma.busqueda.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      propiedades: { where: { estadoCliente: "PENDIENTE" } },
    },
  });

  if (!busqueda) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const perfil = {
    zonas: JSON.parse(busqueda.zonas || "[]"),
    tipoPropiedad: busqueda.tipoPropiedad ?? undefined,
    ambientesMin: busqueda.ambientesMin ?? undefined,
    ambientesMax: busqueda.ambientesMax ?? undefined,
    precioMin: busqueda.precioMin ?? undefined,
    precioMax: busqueda.precioMax ?? undefined,
    modoPago: busqueda.modoPago ?? undefined,
    cochera: busqueda.cochera ?? undefined,
    aptoCredito: busqueda.aptoCredito ?? undefined,
    requisitosExtra: busqueda.requisitosExtra ?? undefined,
  };

  const propiedadesRaw = busqueda.propiedades.map((p) => ({
    titulo: p.titulo ?? undefined,
    direccion: p.direccion ?? undefined,
    barrio: p.barrio ?? undefined,
    precio: p.precio ?? undefined,
    expensas: p.expensas ?? undefined,
    ambientes: p.ambientes ?? undefined,
    superficie: p.superficie ?? undefined,
    cochera: p.cochera ?? undefined,
    aptoCredito: p.aptoCredito ?? undefined,
    descripcion: p.descripcion ?? undefined,
    linkOriginal: p.linkOriginal,
    portal: p.portal,
    idExterno: p.idExterno ?? undefined,
  }));

  if (propiedadesRaw.length === 0) {
    return NextResponse.json({ mensaje: "No hay propiedades pendientes para rankear", total: 0 });
  }

  const rankings = await rankearPropiedades(perfil, busqueda.contextoPrevioIA, propiedadesRaw);

  // Actualizar scores en la DB
  for (const r of rankings) {
    await prisma.propiedadBusqueda.updateMany({
      where: { busquedaId: busqueda.id, linkOriginal: r.linkOriginal },
      data: { scoreIA: r.score, razonIA: r.razon },
    });
  }

  return NextResponse.json({ mensaje: `${rankings.length} propiedades rankeadas`, rankings });
}
