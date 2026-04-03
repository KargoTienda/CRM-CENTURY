import { supabase } from "@/lib/supabase";
import ReservasClient from "@/components/reservas/ReservasClient";

export const dynamic = "force-dynamic";

export default async function ReservasPage() {
  const { data: reservasRaw } = await supabase
    .from("reservas")
    .select("*, clientes!cliente_id(id, nombre)")
    .order("fecha_reserva", { ascending: false });

  const reservas = (reservasRaw ?? []).map(({ clientes, ...r }) => ({
    ...r,
    nombreCliente: r.nombre_cliente,
    tipoTransaccion: r.tipo_transaccion,
    valorReserva: r.valor_reserva,
    precioNegociado: r.precio_negociado,
    porcentajeParteCompradora: r.porcentaje_parte_compradora,
    porcentajeParteVendedora: r.porcentaje_parte_vendedora,
    comisionBruta: r.comision_bruta,
    comisionMia: r.comision_mia,
    fechaReserva: r.fecha_reserva,
    fechaEscritura: r.fecha_escritura,
    creadoEn: r.creado_en,
    actualizadoEn: r.actualizado_en,
    cliente: clientes,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500 mt-1">{reservas.length} reservas registradas</p>
        </div>
      </div>
      <ReservasClient reservas={reservas} />
    </div>
  );
}
