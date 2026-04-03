import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import BusquedaDetalle from "@/components/busquedas/BusquedaDetalle";

export const dynamic = "force-dynamic";

export default async function BusquedaPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const [{ data: b, error }, { data: propiedadesRaw }] = await Promise.all([
    supabase.from("busquedas").select("*, clientes!cliente_id(id, nombre, telefono)").eq("id", id).single(),
    supabase
      .from("propiedades_busqueda")
      .select("*")
      .eq("busqueda_id", id)
      .order("score_ia", { ascending: false, nullsFirst: false })
      .order("orden", { ascending: true }),
  ]);

  if (error || !b) notFound();

  const { clientes, ...busquedaRaw } = b as typeof b & { clientes: unknown };

  // Map to camelCase for BusquedaDetalle component
  const busqueda = {
    ...busquedaRaw,
    clienteId: busquedaRaw.cliente_id,
    tipoPropiedad: busquedaRaw.tipo_propiedad,
    ambientesMin: busquedaRaw.ambientes_min,
    ambientesMax: busquedaRaw.ambientes_max,
    precioMin: busquedaRaw.precio_min,
    precioMax: busquedaRaw.precio_max,
    modoPago: busquedaRaw.modo_pago,
    aptoCredito: busquedaRaw.apto_credito,
    requisitosExtra: busquedaRaw.requisitos_extra,
    linkCompartido: busquedaRaw.link_compartido,
    tokenPublico: busquedaRaw.token_publico,
    contextoPrevioIA: busquedaRaw.contexto_previo_ia,
    creadoEn: busquedaRaw.creado_en,
    actualizadoEn: busquedaRaw.actualizado_en,
    cliente: clientes,
    propiedades: (propiedadesRaw ?? []).map((p) => ({
      ...p,
      busquedaId: p.busqueda_id,
      aptoCredito: p.apto_credito,
      linkOriginal: p.link_original,
      linkMarcado: p.link_marcado,
      idExterno: p.id_externo,
      estadoCliente: p.estado_cliente,
      comentarioCliente: p.comentario_cliente,
      scoreIA: p.score_ia,
      razonIA: p.razon_ia,
      creadoEn: p.creado_en,
      actualizadoEn: p.actualizado_en,
    })),
  };

  return <BusquedaDetalle busqueda={busqueda} />;
}
