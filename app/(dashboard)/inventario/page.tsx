import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const propiedades = await prisma.propiedadInventario.findMany({
    orderBy: { creadoEn: "desc" },
    include: {
      cliente: { select: { nombre: true } },
      visitas: { select: { id: true } },
    },
  });

  const ESTADO_COLORS: Record<string, string> = {
    activa: "bg-green-100 text-green-700",
    en_negociacion: "bg-yellow-100 text-yellow-700",
    reservada: "bg-blue-100 text-blue-700",
    vendida: "bg-gray-100 text-gray-600",
    retirada: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 mt-1">Tus propiedades en captación y venta</p>
        </div>
        <Link
          href="/inventario/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Nueva propiedad
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {propiedades.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Sin propiedades cargadas</p>
          </div>
        )}
        {propiedades.map((p) => (
          <Link
            key={p.id}
            href={`/inventario/${p.id}`}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-orange-600" />
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[p.estado] || "bg-gray-100 text-gray-600"}`}>
                {p.estado.replace("_", " ")}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{p.titulo}</h3>
            <p className="text-sm text-gray-500 mt-1">{p.direccion}</p>
            {p.barrio && <p className="text-xs text-gray-400">{p.barrio}</p>}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-900">{formatMoney(p.precioPublicado)}</p>
              <div className="flex gap-2 text-xs text-gray-400">
                <span>{p.visitas.length} visitas</span>
                <span>·</span>
                <span>{formatDate(p.creadoEn)}</span>
              </div>
            </div>
            {p.cliente && (
              <p className="text-xs text-gray-400 mt-1">Propietario: {p.cliente.nombre}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
