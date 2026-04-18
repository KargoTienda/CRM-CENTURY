import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: reservasRaw, error } = await supabase
    .from("reservas")
    .select("*, clientes!cliente_id(id, nombre)")
    .order("fecha_reserva", { ascending: false });

  if (error) throw error;

  const reservas = (reservasRaw ?? []).map(({ clientes, ...r }) => ({ ...r, cliente: clientes }));
  return NextResponse.json(reservas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data: reserva, error } = await supabase
    .from("reservas")
    .insert({
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
      fecha_reserva: body.fechaReserva ? new Date(body.fechaReserva).toISOString() : new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(reserva, { status: 201 });
}
