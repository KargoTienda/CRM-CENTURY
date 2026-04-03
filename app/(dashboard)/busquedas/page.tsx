import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, formatMoney } from "@/lib/utils";
import { Search, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BusquedasPage() {
  const busquedas = await prisma.busqueda.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      cliente: { select: { id: true, nombre: true } },
      propiedades: { select: { id: true, estadoCliente: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Búsquedas</h1>
          <p className="text-gray-500 mt-1">{busquedas.length} búsquedas activas</p>
        </div>
        <Link
          href="/busquedas/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Nueva búsqueda
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {busquedas.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay búsquedas todavía</p>
            <Link href="/busquedas/nueva" className="mt-3 inline-block text-blue-600 text-sm hover:underline">
              Crear la primera búsqueda
            </Link>
          </div>
        )}
        {busquedas.map((b) => {
          const zonas = JSON.parse(b.zonas || "[]") as string[];
          const total = b.propiedades.length;
          const descartadas = b.propiedades.filter((p) => p.estadoCliente === "DESCARTADO").length;
          const llamar = b.propiedades.filter((p) => p.estadoCliente === "LLAMAR").length;

          return (
            <Link
              key={b.id}
              href={`/busquedas/${b.id}`}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  b.estado === "activa" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {b.estado}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900">{b.cliente.nombre}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {zonas.join(", ")} {b.ambientesMin ? `· ${b.ambientesMin}+ amb` : ""}
              </p>
              {b.precioMax && (
                <p className="text-sm text-gray-500">Hasta {formatMoney(b.precioMax)}</p>
              )}

              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>{total} propiedades</span>
                {llamar > 0 && <span className="text-green-600 font-medium">{llamar} a llamar</span>}
                {descartadas > 0 && <span>{descartadas} descartadas</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">{formatDate(b.creadoEn)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
