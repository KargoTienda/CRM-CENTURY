import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const estado = searchParams.get("estado") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("clientes")
    .select("*", { count: "exact" })
    .order("proximo_contacto", { ascending: true, nullsFirst: false })
    .order("creado_en", { ascending: false })
    .range(from, to);

  if (q) {
    query = query.or(`nombre.ilike.%${q}%,telefono.ilike.%${q}%,instagram.ilike.%${q}%`);
  }
  if (estado) query = query.eq("estado_busqueda", estado);

  const { data: clientes, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return NextResponse.json({ clientes, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const { data: cliente, error } = await supabase
    .from("clientes")
    .insert({
      nombre: body.nombre,
      telefono: body.telefono || null,
      instagram: body.instagram || null,
      email: body.email || null,
      fecha_nacimiento: body.fechaNacimiento ? new Date(body.fechaNacimiento).toISOString() : null,
      zona: body.zona || null,
      modo_pago: body.modoPago || null,
      tipo_buscado: body.tipoBuscado || null,
      valor_presupuesto: body.valorPresupuesto ? parseFloat(body.valorPresupuesto) : null,
      ambientes: body.ambientes ? parseInt(body.ambientes) : null,
      origen: body.origen || null,
      estado_busqueda: body.estadoBusqueda || "activo",
      tarea: body.tarea || null,
      proximo_contacto: body.proximoContacto ? new Date(body.proximoContacto).toISOString() : null,
      notas: body.notas || null,
    })
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(cliente, { status: 201 });
}
