import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const { data: reserva, error } = await supabase
    .from("reservas")
    .update({
      nombre_cliente: body.nombreCliente,
      telefono: body.telefono || null,
      tipo_transaccion: body.tipoTransaccion || "compra",
      zona: body.zona || null,
      valor_reserva: body.valorReserva ? parseFloat(body.valorReserva) : null,
      precio_negociado: body.precioNegociado ? parseFloat(body.precioNegociado) : null,
      porcentaje_parte_compradora: body.porcentajeParteCompradora ? parseFloat(body.porcentajeParteCompradora) : null,
      porcentaje_parte_vendedora: body.porcentajeParteVendedora ? parseFloat(body.porcentajeParteVendedora) : null,
      escribano: body.escribano || false,
      bonus_escribano: body.bonusEscribano ? parseFloat(body.bonusEscribano) : 0,
      comision_bruta: body.comisionBruta ? parseFloat(body.comisionBruta) : null,
      comision_mia: body.comisionMia ? parseFloat(body.comisionMia) : null,
      estado: body.estado || "reservada",
      origen: body.origen || null,
      notas: body.notas || null,
      operacion_cruzada_id: body.operacionCruzadaId ? parseInt(body.operacionCruzadaId) : null,
    })
    .eq("id", parseInt(params.id))
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(reserva);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase.from("reservas").delete().eq("id", parseInt(params.id));
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
