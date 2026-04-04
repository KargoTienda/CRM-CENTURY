import { supabase } from "@/lib/supabase";
import { formatMoney, formatDate } from "@/lib/utils";
import { Users, FileText, TrendingUp, Calendar } from "lucide-react";

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

  const proximosContactos = (proximosContactosRaw ?? []).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    telefono: c.telefono,
    proximoContacto: c.proximo_contacto,
    tarea: c.tarea,
  }));

  const reservasRecientes = (reservasRecientesRaw ?? []).map((r) => ({
    id: r.id,
    nombreCliente: r.nombre_cliente,
    tipoTransaccion: r.tipo_transaccion,
    zona: r.zona,
    valorReserva: r.valor_reserva,
    comisionMia: r.comision_mia,
    estado: r.estado,
    fechaReserva: r.fecha_reserva,
  }));

  return {
    totalClientes: totalClientes ?? 0,
    reservasActivas: reservasActivas ?? 0,
    comisionesProyectadas,
    proximosContactos,
    reservasRecientes,
  };
}

const ESTADO_BADGE: Record<string, { bg: string; color: string }> = {
  escriturada: { bg: "rgba(52,211,153,0.12)", color: "#34D399" },
  en_escritura: { bg: "rgba(96,165,250,0.12)", color: "#60A5FA" },
  reservada: { bg: "rgba(251,191,36,0.12)", color: "#FBBF24" },
};

export default async function DashboardPage() {
  const data = await getKPIs();

  const kpis = [
    {
      label: "Clientes activos",
      value: data.totalClientes,
      icon: Users,
      accent: "#60A5FA",
      accentBg: "rgba(96,165,250,0.1)",
    },
    {
      label: "Reservas activas",
      value: data.reservasActivas,
      icon: FileText,
      accent: "#FBBF24",
      accentBg: "rgba(251,191,36,0.1)",
    },
    {
      label: "Comisiones proyectadas",
      value: formatMoney(data.comisionesProyectadas),
      icon: TrendingUp,
      accent: "#C9A84C",
      accentBg: "rgba(201,168,76,0.1)",
      gold: true,
    },
    {
      label: "Contactos próx. 7 días",
      value: data.proximosContactos.length,
      icon: Calendar,
      accent: "#A78BFA",
      accentBg: "rgba(167,139,250,0.1)",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "#EDEAE3", letterSpacing: "-0.02em" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "#8A8799" }}>
          Resumen de tu negocio inmobiliario
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
              style={{
                background: "var(--bg-card)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium" style={{ color: "#8A8799" }}>{kpi.label}</p>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: kpi.accentBg }}
                >
                  <Icon className="w-4 h-4" style={{ color: kpi.accent }} />
                </div>
              </div>
              <p
                className="text-2xl font-bold tracking-tight"
                style={{ color: kpi.gold ? "#C9A84C" : "#EDEAE3" }}
              >
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservas activas */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <h2 className="font-semibold text-sm" style={{ color: "#EDEAE3" }}>Reservas activas</h2>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(251,191,36,0.12)", color: "#FBBF24" }}
            >
              {data.reservasRecientes.length}
            </span>
          </div>
          <div>
            {data.reservasRecientes.length === 0 && (
              <p className="px-5 py-10 text-center text-sm" style={{ color: "#47455A" }}>
                Sin reservas activas
              </p>
            )}
            {data.reservasRecientes.map((r, i) => {
              const badge = ESTADO_BADGE[r.estado] ?? { bg: "rgba(255,255,255,0.08)", color: "#8A8799" };
              return (
                <div
                  key={r.id}
                  className="px-5 py-3.5 flex items-center justify-between transition-colors hover:bg-white/[0.02]"
                  style={i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.04)" } : {}}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#EDEAE3" }}>{r.nombreCliente}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8A8799" }}>
                      {r.tipoTransaccion} · {r.zona} · {formatDate(r.fechaReserva)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: "#C9A84C" }}>{formatMoney(r.comisionMia)}</p>
                    <span className="badge mt-1" style={{ background: badge.bg, color: badge.color }}>
                      {r.estado.replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximos contactos */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <h2 className="font-semibold text-sm" style={{ color: "#EDEAE3" }}>Próximos contactos</h2>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(167,139,250,0.12)", color: "#A78BFA" }}
            >
              7 días
            </span>
          </div>
          <div>
            {data.proximosContactos.length === 0 && (
              <p className="px-5 py-10 text-center text-sm" style={{ color: "#47455A" }}>
                Sin contactos programados
              </p>
            )}
            {data.proximosContactos.map((c, i) => (
              <div
                key={c.id}
                className="px-5 py-3.5 flex items-center justify-between transition-colors hover:bg-white/[0.02]"
                style={i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.04)" } : {}}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "#EDEAE3" }}>{c.nombre}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8A8799" }}>{c.tarea}</p>
                </div>
                <span className="text-xs" style={{ color: "#47455A" }}>{formatDate(c.proximoContacto)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
