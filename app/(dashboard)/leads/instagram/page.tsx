import { supabase } from "@/lib/supabase";
import LeadsClient from "@/components/leads/LeadsClient";

export const dynamic = "force-dynamic";

export default async function LeadsInstagramPage() {
  const { data: leadsRaw } = await supabase
    .from("leads")
    .select("*, proyectos!proyecto_id(id, nombre)")
    .eq("origen", "INSTAGRAM_PAUTA")
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
        <h1 className="text-2xl font-semibold" style={{ color: "#1A1A1A", letterSpacing: "-0.02em" }}>Leads Instagram</h1>
        <p className="text-sm mt-1" style={{ color: "#8A8799" }}>Leads de pautas publicitarias en Instagram</p>
      </div>
      <LeadsClient leads={leads} origen="INSTAGRAM_PAUTA" />
    </div>
  );
}
