import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import InventarioDetalle from "@/components/inventario/InventarioDetalle";

export const dynamic = "force-dynamic";

export default async function PropiedadPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const [{ data: p, error }, { data: visitasRaw }, { data: reservasRaw }, { data: clientesRaw }] =
    await Promise.all([
      supabase.from("propiedades_inventario").select("*, clientes!cliente_id(id, nombre, telefono)").eq("id", id).single(),
      supabase.from("visitas_inventario").select("*, clientes!cliente_id(nombre)").eq("propiedad_id", id).order("fecha", { ascending: false }),
      supabase.from("reservas").select("id, estado, fecha_reserva, nombre_cliente").eq("propiedad_id", id).order("fecha_reserva", { ascending: false }),
      supabase.from("clientes").select("id, nombre").order("nombre", { ascending: true }).limit(500),
    ]);

  if (error || !p) notFound();

  const { clientes: clienteProp, ...propRaw } = p as typeof p & { clientes: unknown };

  const propiedad = {
    ...propRaw,
    clienteId: propRaw.cliente_id,
    precioPublicado: propRaw.precio_publicado,
    precioNegociado: propRaw.precio_negociado,
    tipoTransaccion: propRaw.tipo_transaccion,
    linkPortal: propRaw.link_portal,
    porcentajeComision: propRaw.porcentaje_comision,
    creadoEn: propRaw.creado_en,
    actualizadoEn: propRaw.actualizado_en,
    cliente: clienteProp,
    visitas: (visitasRaw ?? []).map(({ clientes: c, ...v }) => ({
      ...v,
      cliente: c,
    })),
    reservas: (reservasRaw ?? []).map((r) => ({
      ...r,
      fechaReserva: r.fecha_reserva,
      nombreCliente: r.nombre_cliente,
    })),
  };

  const clientes = (clientesRaw ?? []);

  return <InventarioDetalle propiedad={propiedad} clientes={clientes} />;
}
