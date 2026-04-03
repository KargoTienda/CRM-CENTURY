import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InventarioDetalle from "@/components/inventario/InventarioDetalle";

export const dynamic = "force-dynamic";

export default async function PropiedadPage({ params }: { params: { id: string } }) {
  const propiedad = await prisma.propiedadInventario.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true } },
      visitas: {
        orderBy: { fecha: "desc" },
        include: { cliente: { select: { nombre: true } } },
      },
      reservas: { orderBy: { fechaReserva: "desc" } },
    },
  });

  if (!propiedad) notFound();

  const clientes = await prisma.cliente.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
    take: 500,
  });

  return <InventarioDetalle propiedad={propiedad} clientes={clientes} />;
}
