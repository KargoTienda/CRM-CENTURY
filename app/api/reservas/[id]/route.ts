import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

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
      comision_bruta: body.comisionBruta ? parseFloat(body.comisionBruta) : null,
      comision_mia: body.comisionMia ? parseFloat(body.comisionMia) : null,
      estado: body.estado || "reservada",
      origen: body.origen || null,
      notas: body.notas || null,
    })
    .eq("id", parseInt(params.id))
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(reserva);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { error } = await supabase.from("reservas").delete().eq("id", parseInt(params.id));
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
