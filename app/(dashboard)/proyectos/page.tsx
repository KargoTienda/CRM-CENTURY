import { supabase } from "@/lib/supabase";
import ProyectosClient from "@/components/leads/ProyectosClient";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLead(l: any) {
  return {
    id: l.id,
    nombre: l.nombre,
    telefono: l.telefono,
    notas: l.notas,
    estado: l.estado,
    creadoEn: l.creado_en,
    proyecto: l.proyectos ?? null,
  };
}

export default async function ProyectosPage() {
  const [{ data: proyectosRaw }, { data: sinAsignarRaw }] = await Promise.all([
    supabase
      .from("proyectos")
      .select("*, leads!proyecto_id(*, proyectos!proyecto_id(id, nombre))")
      .eq("activo", true)
      .order("creado_en", { ascending: true }),
    supabase
      .from("leads")
      .select("*, proyectos!proyecto_id(id, nombre)")
      .is("proyecto_id", null)
      .neq("origen", "INSTAGRAM_PAUTA")
      .order("creado_en", { ascending: false }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proyectos = (proyectosRaw ?? []).map((p: any) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    leadsAsignados: (p.leads ?? []).map(mapLead),
  }));

  const sinAsignar = (sinAsignarRaw ?? []).map(mapLead);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "#EDEAE3", letterSpacing: "-0.02em" }}>Proyectos</h1>
        <p className="text-sm mt-1" style={{ color: "#8A8799" }}>Leads potenciales por proyecto</p>
      </div>
      <ProyectosClient proyectos={proyectos} sinAsignar={sinAsignar} />
    </div>
  );
}
