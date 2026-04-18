import { supabase } from "@/lib/supabase";
import { formatMoney, formatDate } from "@/lib/utils";
import { Users, FileText, TrendingUp, Calendar, DollarSign } from "lucide-react";

async function getKPIs() {
  const ahora = new Date();
  const en7dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const inicioAnio = new Date(new Date().getFullYear(), 0, 1).toISOString();

  const [
    { count: totalClientes },
    { count: reservasActivas },
    { data: reservasParaSum },
    { data: proximosContactosRaw },
    { data: reservasRecientesRaw },
    { data: cobradoAnioRaw },
  ] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }).eq("estado_busqueda", "activo"),
    supabase.from("reservas").select("*", { count: "exact", head: true }).in("estado", ["reservada", "en_escritura"]),
    supabase.from("reservas").select("comision_mia, estado").in("estado", ["reservada", "en_escritura"]),
    supabase
      .from("clientes")
      .select("id, nombre, telefono, proximo_contacto, tarea")
      .gte("proximo_contacto", ahora.toISOString())
      .lte("proximo_contacto", en7dias.toISOString())
      .order("proximo_contacto", { ascending: true })
      .limit(10),
    supabase
      .from("reservas")
      .select("id, nombre_cliente, tipo_transaccion, zona, comision_mia, estado, fecha_reserva")
      .in("estado", ["reservada", "en_escritura"])
      .order("fecha_reserva", { ascending: false })
      .limit(8),
    supabase
      .from("reservas")
      .select("comision_mia")
      .eq("estado", "escriturada")
      .gte("creado_en", inicioAnio),
  ]);

  const reservadas = (reservasParaSum ?? []).filter((r) => r.estado === "reservada");
  const enEscritura = (reservasParaSum ?? []).filter((r) => r.estado === "en_escritura");
  const comisionesReservadas = reservadas.reduce((s, r) => s + (r.comision_mia ?? 0), 0);
  const comisionesEscritura = enEscritura.reduce((s, r) => s + (r.comision_mia ?? 0), 0);
  const comisionesProyectadas = comisionesReservadas + comisionesEscritura;
  const cobradoEsteAnio = (cobradoAnioRaw ?? []).reduce((s, r) => s + (r.comision_mia ?? 0), 0);

  return {
    totalClientes: totalClientes ?? 0,
    reservasActivas: reservasActivas ?? 0,
    comisionesProyectadas,
    comisionesReservadas,
    comisionesEscritura,
    cantReservadas: reservadas.length,
    cantEscritura: enEscritura.length,
    cobradoEsteAnio,
    proximosContactos: (proximosContactosRaw ?? []).map((c) => ({
      id: c.id, nombre: c.nombre, proximoContacto: c.proximo_contacto, tarea: c.tarea,
    })),
    reservasRecientes: (reservasRecientesRaw ?? []).map((r) => ({
      id: r.id, nombreCliente: r.nombre_cliente, tipoTransaccion: r.tipo_transaccion,
      zona: r.zona, comisionMia: r.comision_mia, estado: r.estado, fechaReserva: r.fecha_reserva,
    })),
  };
}

const ESTADO_BADGE: Record<string, { bg: string; color: string }> = {
  escriturada: { bg: "#D1FAE5", color: "#065F46" },
  en_escritura: { bg: "#DBEAFE", color: "#1E40AF" },
  reservada:    { bg: "#FEF3C7", color: "#92400E" },
};

export default async function DashboardPage() {
  const data = await getKPIs();

  const kpis = [
    {
      label: "Clientes activos",
      value: data.totalClientes,
      icon: Users,
      iconBg: "rgba(190,175,135,0.12)",
      iconColor: "#BEAF87",
    },
    {
      label: "Reservas activas",
      value: data.reservasActivas,
      icon: FileText,
      iconBg: "rgba(190,175,135,0.12)",
      iconColor: "#BEAF87",
    },
    {
      label: "Por cobrar",
      value: formatMoney(data.comisionesProyectadas),
      icon: TrendingUp,
      iconBg: "rgba(190,175,135,0.2)",
      iconColor: "#A89A6E",
      highlight: true,
    },
    {
      label: "Contactos próx. 7 días",
      value: data.proximosContactos.length,
      icon: Calendar,
      iconBg: "rgba(190,175,135,0.12)",
      iconColor: "#BEAF87",
    },
  ];

  const totalPorCobrar = data.comisionesProyectadas;
  const pctEscritura = totalPorCobrar > 0 ? (data.comisionesEscritura / totalPorCobrar) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A", letterSpacing: "-0.02em" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "#808285" }}>
          Resumen de tu negocio inmobiliario
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "#FFFFFF",
                border: "1px solid #DDD9D0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: kpi.iconBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: kpi.iconColor }} />
                </div>
              </div>
              <p className="text-xs font-medium mb-1" style={{ color: "#808285" }}>{kpi.label}</p>
              <p
                className="text-2xl font-bold tracking-tight"
                style={{ color: kpi.highlight ? "#BEAF87" : "#1A1A1A" }}
              >
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Proyección Financiera */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "#FFFFFF", border: "1px solid #DDD9D0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center gap-2 mb-5">
          <DollarSign className="w-4 h-4" style={{ color: "#BEAF87" }} />
          <h2 className="font-bold text-sm" style={{ color: "#1A1A1A" }}>Proyección financiera</h2>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-5">
          {/* Reservadas */}
          <div className="p-4 rounded-xl" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "#92400E" }}>Reservadas</p>
            <p className="text-xl font-bold" style={{ color: "#92400E" }}>{formatMoney(data.comisionesReservadas)}</p>
            <p className="text-xs mt-1" style={{ color: "#B45309" }}>{data.cantReservadas} operación{data.cantReservadas !== 1 ? "es" : ""}</p>
            <p className="text-xs mt-1" style={{ color: "#D97706" }}>puede caerse</p>
          </div>

          {/* En escritura */}
          <div className="p-4 rounded-xl" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "#1E40AF" }}>En escritura</p>
            <p className="text-xl font-bold" style={{ color: "#1E40AF" }}>{formatMoney(data.comisionesEscritura)}</p>
            <p className="text-xs mt-1" style={{ color: "#2563EB" }}>{data.cantEscritura} operación{data.cantEscritura !== 1 ? "es" : ""}</p>
            <p className="text-xs mt-1" style={{ color: "#3B82F6" }}>casi seguro</p>
          </div>

          {/* Cobrado este año */}
          <div className="p-4 rounded-xl" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "#065F46" }}>Cobrado este año</p>
            <p className="text-xl font-bold" style={{ color: "#065F46" }}>{formatMoney(data.cobradoEsteAnio)}</p>
            <p className="text-xs mt-1" style={{ color: "#059669" }}>escrituradas</p>
            <p className="text-xs mt-1" style={{ color: "#10B981" }}>ya en tu bolsillo</p>
          </div>
        </div>

        {/* Barra de progreso */}
        {totalPorCobrar > 0 && (
          <div>
            <div className="flex justify-between text-xs mb-2" style={{ color: "#808285" }}>
              <span>Total por cobrar: <strong style={{ color: "#1A1A1A" }}>{formatMoney(totalPorCobrar)}</strong></span>
              <span>{Math.round(pctEscritura)}% en escritura</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#FDE68A" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pctEscritura}%`, background: "#BEAF87" }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1" style={{ color: "#808285" }}>
              <span style={{ color: "#92400E" }}>Reservadas</span>
              <span style={{ color: "#1E40AF" }}>En escritura</span>
            </div>
          </div>
        )}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservas */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #DDD9D0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid #F2F1EF" }}
          >
            <h2 className="font-bold text-sm" style={{ color: "#1A1A1A" }}>Reservas activas</h2>
            <span className="badge" style={{ background: "#FAF8F3", color: "#A89A6E", border: "1px solid #DDD9D0" }}>
              {data.reservasRecientes.length} en curso
            </span>
          </div>
          <div>
            {data.reservasRecientes.length === 0 && (
              <p className="px-5 py-10 text-center text-sm" style={{ color: "#808285" }}>
                Sin reservas activas
              </p>
            )}
            {data.reservasRecientes.map((r, i) => {
              const badge = ESTADO_BADGE[r.estado] ?? { bg: "#F3F4F6", color: "#6B7280" };
              return (
                <div
                  key={r.id}
                  className="px-5 py-3.5 flex items-center justify-between transition-colors hover:bg-[#FAF8F3]"
                  style={i > 0 ? { borderTop: "1px solid #F2F1EF" } : {}}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{r.nombreCliente}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#808285" }}>
                      {r.tipoTransaccion} · {r.zona} · {formatDate(r.fechaReserva)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "#BEAF87" }}>{formatMoney(r.comisionMia)}</p>
                    <span className="badge mt-1" style={badge}>{r.estado.replace("_", " ")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximos contactos */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #DDD9D0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid #F2F1EF" }}
          >
            <h2 className="font-bold text-sm" style={{ color: "#1A1A1A" }}>Próximos contactos</h2>
            <span className="badge" style={{ background: "#FAF8F3", color: "#A89A6E", border: "1px solid #DDD9D0" }}>
              7 días
            </span>
          </div>
          <div>
            {data.proximosContactos.length === 0 && (
              <p className="px-5 py-10 text-center text-sm" style={{ color: "#808285" }}>
                Sin contactos programados
              </p>
            )}
            {data.proximosContactos.map((c, i) => (
              <div
                key={c.id}
                className="px-5 py-3.5 flex items-center justify-between transition-colors hover:bg-[#FAF8F3]"
                style={i > 0 ? { borderTop: "1px solid #F2F1EF" } : {}}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{c.nombre}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#808285" }}>{c.tarea}</p>
                </div>
                <span className="text-xs font-medium" style={{ color: "#BEAF87" }}>
                  {formatDate(c.proximoContacto)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
