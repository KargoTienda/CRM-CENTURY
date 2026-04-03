import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/utils";
import { Users, FileText, TrendingUp, Calendar } from "lucide-react";

async function getKPIs() {
  const [
    totalClientes,
    reservasActivas,
    comisionesProyectadas,
    proximosContactos,
    reservasRecientes,
  ] = await Promise.all([
    prisma.cliente.count({ where: { estadoBusqueda: "activo" } }),
    prisma.reserva.count({ where: { estado: { in: ["reservada", "en_escritura"] } } }),
    prisma.reserva.aggregate({
      where: { estado: { in: ["reservada", "en_escritura"] } },
      _sum: { comisionMia: true },
    }),
    prisma.cliente.findMany({
      where: {
        proximoContacto: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { proximoContacto: "asc" },
      take: 10,
      select: { id: true, nombre: true, telefono: true, proximoContacto: true, tarea: true },
    }),
    prisma.reserva.findMany({
      where: { estado: { in: ["reservada", "en_escritura"] } },
      orderBy: { fechaReserva: "desc" },
      take: 8,
      select: {
        id: true,
        nombreCliente: true,
        tipoTransaccion: true,
        zona: true,
        valorReserva: true,
        comisionMia: true,
        estado: true,
        fechaReserva: true,
      },
    }),
  ]);

  return {
    totalClientes,
    reservasActivas,
    comisionesProyectadas: comisionesProyectadas._sum.comisionMia ?? 0,
    proximosContactos,
    reservasRecientes,
  };
}

export default async function DashboardPage() {
  const data = await getKPIs();

  const kpis = [
    {
      label: "Clientes activos",
      value: data.totalClientes,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Reservas activas",
      value: data.reservasActivas,
      icon: FileText,
      color: "bg-amber-500",
    },
    {
      label: "Comisiones proyectadas",
      value: formatMoney(data.comisionesProyectadas),
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      label: "Contactos próx. 7 días",
      value: data.proximosContactos.length,
      icon: Calendar,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen de tu negocio inmobiliario</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{kpi.label}</span>
                <div className={`w-9 h-9 rounded-lg ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservas pendientes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Reservas activas</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.reservasRecientes.length === 0 && (
              <p className="px-5 py-8 text-gray-400 text-center text-sm">Sin reservas activas</p>
            )}
            {data.reservasRecientes.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">{r.nombreCliente}</p>
                  <p className="text-xs text-gray-500">
                    {r.tipoTransaccion} · {r.zona} · {formatDate(r.fechaReserva)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-700">{formatMoney(r.comisionMia)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.estado === "escriturada"
                      ? "bg-green-100 text-green-700"
                      : r.estado === "en_escritura"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {r.estado.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos contactos */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Próximos contactos (7 días)</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.proximosContactos.length === 0 && (
              <p className="px-5 py-8 text-gray-400 text-center text-sm">Sin contactos programados</p>
            )}
            {data.proximosContactos.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">{c.nombre}</p>
                  <p className="text-xs text-gray-500">{c.tarea}</p>
                </div>
                <span className="text-xs text-gray-400">{formatDate(c.proximoContacto)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
