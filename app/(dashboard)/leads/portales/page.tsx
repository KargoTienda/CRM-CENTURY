import { supabase } from "@/lib/supabase";
import LeadsClient from "@/components/leads/LeadsClient";

export const dynamic = "force-dynamic";

export default async function LeadsPortalesPage() {
  const { data: leadsRaw } = await supabase
    .from("leads")
    .select("*, proyectos!proyecto_id(id, nombre)")
    .in("origen", ["C21", "ZONAPROP", "ARGENPROP", "PROPIO", "MANUAL"])
    .order("creado_en", { ascending: false });

  const leads = (leadsRaw ?? []).map(({ proyectos, ...l }) => ({
    ...l,
    propiedadInteres: l.propiedad_interes,
    mensajeInicial: l.mensaje_inicial,
    scoreIA: l.score_ia,
    proyectoSugeridoId: l.proyecto_sugerido_id,
    proyectoId: l.proyecto_id,
    clienteId: l.cliente_id,
    creadoEn: l.creado_en,
    actualizadoEn: l.actualizado_en,
    proyecto: proyectos,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "#EDEAE3", letterSpacing: "-0.02em" }}>Leads Portales / Manual</h1>
        <p className="text-sm mt-1" style={{ color: "#8A8799" }}>Leads de C21, ZonaProp, ArgenProp y entrada manual</p>
      </div>
      <LeadsClient leads={leads} origen="MANUAL" />
    </div>
  );
}
