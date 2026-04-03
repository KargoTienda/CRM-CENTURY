import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatMoney, formatDate } from "@/lib/utils";
import BusquedaDetalle from "@/components/busquedas/BusquedaDetalle";

export const dynamic = "force-dynamic";

export default async function BusquedaPage({ params }: { params: { id: string } }) {
  const busqueda = await prisma.busqueda.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true } },
      propiedades: { orderBy: [{ scoreIA: "desc" }, { orden: "asc" }] },
    },
  });

  if (!busqueda) notFound();

  return <BusquedaDetalle busqueda={busqueda} />;
}
