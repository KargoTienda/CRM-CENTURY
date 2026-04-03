import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, formatMoney, whatsappLink } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClienteDetallePage({ params }: { params: { id: string } }) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      interacciones: { orderBy: { fecha: "desc" }, take: 20 },
      busquedas: { orderBy: { creadoEn: "desc" }, take: 5 },
      reservas: { orderBy: { fechaReserva: "desc" }, take: 5 },
    },
  });

  if (!cliente) notFound();

  const TIPO_ICONS: Record<string, string> = {
    llamada: "📞",
    whatsapp: "💬",
    email: "📧",
    visita: "🏠",
    nota: "📝",
    sistema: "⚙️",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/clientes" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" />
        Volver a clientes
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {cliente.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{cliente.nombre}</h1>
              <div className="flex gap-3 mt-1 text-sm text-gray-500">
                {cliente.origen && <span>{cliente.origen}</span>}
                {cliente.zona && <span>· {cliente.zona}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {cliente.telefono && (
              <a
                href={whatsappLink(cliente.telefono)}
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Data grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Teléfono</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{cliente.telefono || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Instagram</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{cliente.instagram || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Modo de pago</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{cliente.modoPago || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Presupuesto</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">
              {cliente.valorPresupuesto ? formatMoney(cliente.valorPresupuesto) : "-"}
              {cliente.ambientes ? ` · ${cliente.ambientes} amb` : ""}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500">Busca</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{cliente.tipoBuscado || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Estado</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{cliente.estadoBusqueda}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Próximo contacto</p>
            <p className={`text-sm font-medium mt-0.5 ${cliente.proximoContacto && new Date(cliente.proximoContacto) < new Date() ? "text-red-600" : "text-gray-900"}`}>
              {formatDate(cliente.proximoContacto)}
            </p>
          </div>
        </div>

        {cliente.notas && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Notas / Historial</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{cliente.notas}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Búsquedas */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Búsquedas</h2>
            <Link href="/busquedas" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {cliente.busquedas.length === 0 && (
              <p className="px-5 py-6 text-center text-sm text-gray-400">Sin búsquedas</p>
            )}
            {cliente.busquedas.map((b) => {
              const zonas = JSON.parse(b.zonas || "[]") as string[];
              return (
                <Link key={b.id} href={`/busquedas/${b.id}`} className="block px-5 py-3 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">{zonas.join(", ")}</p>
                  <p className="text-xs text-gray-500">{formatDate(b.creadoEn)}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Reservas */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Reservas</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {cliente.reservas.length === 0 && (
              <p className="px-5 py-6 text-center text-sm text-gray-400">Sin reservas</p>
            )}
            {cliente.reservas.map((r) => (
              <div key={r.id} className="px-5 py-3">
                <p className="text-sm font-medium text-gray-900">{r.tipoTransaccion} · {r.zona}</p>
                <p className="text-xs text-gray-500">{formatDate(r.fechaReserva)} · {formatMoney(r.comisionMia)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Historial de interacciones</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {cliente.interacciones.length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-gray-400">Sin interacciones registradas</p>
          )}
          {cliente.interacciones.map((i) => (
            <div key={i.id} className="px-5 py-3 flex gap-3">
              <span className="text-base">{TIPO_ICONS[i.tipo] || "📌"}</span>
              <div>
                <p className="text-sm text-gray-700">{i.nota}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(i.fecha)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
