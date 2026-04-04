import { supabase } from "@/lib/supabase";
import { formatMoney, formatDate } from "@/lib/utils";
import { Users, FileText, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";

async function getKPIs() {
  const ahora = new Date();
  const en7dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [
    { count: totalClientes },
    { count: reservasActivas },
    { data: reservasParaSum },
    { data: proximosContactosRaw },
    { data: reservasRecientesRaw },
  ] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }).eq("estado_busqueda", "activo"),
    supabase.from("reservas").select("*", { count: "exact", head: true }).in("estado", ["reservada", "en_escritura"]),
    supabase.from("reservas").select("comision_mia").in("estado", ["reservada", "en_escritura"]),
    supabase
      .from("clientes")
      .select("id, nombre, telefono, proximo_contacto, tarea")
      .gte("proximo_contacto", ahora.toISOString())
      .lte("proximo_contacto", en7dias.toISOString())
      .order("proximo_contacto", { ascending: true })
      .limit(10),
    supabase
      .from("reservas")
      .select("id, nombre_cliente, tipo_transaccion, zona, valor_reserva, comision_mia, estado, fecha_reserva")
      .in("estado", ["reservada", "en_escritura"])
      .order("fecha_reserva", { ascending: false })
      .limit(8),
  ]);

  const comisionesProyectadas = (reservasParaSum ?? []).reduce((s, r) => s + (r.comision_mia ?? 0), 0);

  return {
    totalClientes: totalClientes ?? 0,
    reservasActivas: reservasActivas ?? 0,
    comisionesProyectadas,
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
  reservada:   { bg: "#FEF3C7", color: "#92400E" },
};

export default async function DashboardPage() {
  const data = await getKPIs();

  const kpis = [
    {
      label: "Clientes activos",
      value: data.totalClientes,
      icon: Users,
      gradient: "linear-gradient(135deg, #0077B6, #0096C7)",
      iconBg: "rgba(0,119,182,0.1)",
      iconColor: "#0077B6",
    },
    {
      label: "Reservas activas",
      value: data.reservasActivas,
      icon: FileText,
      gradient: "linear-gradient(135deg, #0096C7, #00B4D8)",
      iconBg: "rgba(0,150,199,0.1)",
      iconColor: "#0096C7",
    },
    {
      label: "Comisiones proyectadas",
      value: formatMoney(data.comisionesProyectadas),
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, #00B4D8, #48CAE4)",
      iconBg: "rgba(0,180,216,0.1)",
      iconColor: "#00B4D8",
      highlight: true,
    },
    {
      label: "Contactos próx. 7 días",
      value: data.proximosContactos.length,
      icon: Calendar,
      gradient: "linear-gradient(135deg, #48CAE4, #ADE8F4)",
      iconBg: "rgba(72,202,228,0.12)",
      iconColor: "#0096C7",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#023E8A", letterSpacing: "-0.02em" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "#90AFCC" }}>
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
                border: "1px solid #D0E8F5",
                boxShadow: "0 1px 4px rgba(0,119,182,0.06), 0 4px 16px rgba(0,119,182,0.04)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: kpi.iconBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: kpi.iconColor }} />
                </div>
                <ArrowUpRight className="w-4 h-4" style={{ color: "#ADE8F4" }} />
              </div>
              <p className="text-xs font-medium mb-1" style={{ color: "#90AFCC" }}>{kpi.label}</p>
              <p
                className="text-2xl font-bold tracking-tight"
                style={{ color: kpi.highlight ? "#0077B6" : "#023E8A" }}
              >
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Gradient banner */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #023E8A 0%, #0096C7 60%, #48CAE4 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle 400px at 80% 50%, #ADE8F4, transparent)",
          }}
        />
        <div className="relative">
          <p className="text-white font-bold text-lg">¿Todo al día?</p>
          <p className="text-white/70 text-sm mt-0.5">Revisá tus contactos pendientes y reservas activas.</p>
        </div>
        <div className="relative flex gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{data.reservasActivas}</p>
            <p className="text-white/60 text-xs">reservas</p>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <p className="text-2xl font-bold text-white">{data.proximosContactos.length}</p>
            <p className="text-white/60 text-xs">contactos</p>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservas */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #D0E8F5", boxShadow: "0 1px 4px rgba(0,119,182,0.06)" }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid #EEF6FF" }}
          >
            <h2 className="font-bold text-sm" style={{ color: "#023E8A" }}>Reservas activas</h2>
            <span className="badge" style={{ background: "#FEF3C7", color: "#92400E" }}>
              {data.reservasRecientes.length} en curso
            </span>
          </div>
          <div>
            {data.reservasRecientes.length === 0 && (
              <p className="px-5 py-10 text-center text-sm" style={{ color: "#90AFCC" }}>
                Sin reservas activas
              </p>
            )}
            {data.reservasRecientes.map((r, i) => {
              const badge = ESTADO_BADGE[r.estado] ?? { bg: "#F3F4F6", color: "#6B7280" };
              return (
                <div
                  key={r.id}
                  className="px-5 py-3.5 flex items-center justify-between transition-colors hover:bg-[#F0F8FF]"
                  style={i > 0 ? { borderTop: "1px solid #EEF6FF" } : {}}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#023E8A" }}>{r.nombreCliente}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#90AFCC" }}>
                      {r.tipoTransaccion} · {r.zona} · {formatDate(r.fechaReserva)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "#0077B6" }}>{formatMoney(r.comisionMia)}</p>
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
          style={{ background: "#FFFFFF", border: "1px solid #D0E8F5", boxShadow: "0 1px 4px rgba(0,119,182,0.06)" }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid #EEF6FF" }}
          >
            <h2 className="font-bold text-sm" style={{ color: "#023E8A" }}>Próximos contactos</h2>
            <span className="badge" style={{ background: "#DBEAFE", color: "#1E40AF" }}>
              7 días
            </span>
          </div>
          <div>
            {data.proximosContactos.length === 0 && (
              <p className="px-5 py-10 text-center text-sm" style={{ color: "#90AFCC" }}>
                Sin contactos programados
              </p>
            )}
            {data.proximosContactos.map((c, i) => (
              <div
                key={c.id}
                className="px-5 py-3.5 flex items-center justify-between transition-colors hover:bg-[#F0F8FF]"
                style={i > 0 ? { borderTop: "1px solid #EEF6FF" } : {}}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#023E8A" }}>{c.nombre}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#90AFCC" }}>{c.tarea}</p>
                </div>
                <span className="text-xs font-medium" style={{ color: "#0096C7" }}>
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
