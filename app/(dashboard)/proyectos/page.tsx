import { prisma } from "@/lib/prisma";
import ProyectosClient from "@/components/leads/ProyectosClient";

export const dynamic = "force-dynamic";

export default async function ProyectosPage() {
  const proyectos = await prisma.proyecto.findMany({
    where: { activo: true },
    include: {
      leadsAsignados: {
        orderBy: { creadoEn: "desc" },
        include: { proyecto: { select: { id: true, nombre: true } } },
      },
    },
    orderBy: { creadoEn: "asc" },
  });

  const sinAsignar = await prisma.lead.findMany({
    where: { proyectoId: null, origen: { not: "INSTAGRAM_PAUTA" } },
    orderBy: { creadoEn: "desc" },
    include: { proyecto: { select: { id: true, nombre: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
        <p className="text-gray-500 mt-1">Leads potenciales por proyecto</p>
      </div>
      <ProyectosClient proyectos={proyectos} sinAsignar={sinAsignar} />
    </div>
  );
}
