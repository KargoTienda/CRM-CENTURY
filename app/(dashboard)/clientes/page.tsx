import { prisma } from "@/lib/prisma";
import ClientesTable from "@/components/clientes/ClientesTable";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string; page?: string };
}) {
  const q = searchParams.q || "";
  const estado = searchParams.estado || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 50;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { nombre: { contains: q } },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">{total} registros totales</p>
        </div>
      </div>
      <ClientesTable
        clientes={clientes}
        total={total}
        page={page}
        pages={Math.ceil(total / limit)}
        q={q}
        estado={estado}
      />
    </div>
  );
}
