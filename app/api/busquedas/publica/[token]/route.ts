import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const { data: busqueda, error } = await supabase
    .from("busquedas")
    .select("*")
    .eq("token_publico", params.token)
    .single();

  if (error || !busqueda) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const [{ data: cliente }, { data: propiedades }] = await Promise.all([
    supabase.from("clientes").select("nombre").eq("id", busqueda.cliente_id).single(),
    supabase
      .from("propiedades_busqueda")
      .select("*")
      .eq("busqueda_id", busqueda.id)
      .order("score_ia", { ascending: false, nullsFirst: false })
      .order("orden", { ascending: true }),
  ]);

  return NextResponse.json({ ...busqueda, cliente, propiedades: propiedades ?? [] });
}
