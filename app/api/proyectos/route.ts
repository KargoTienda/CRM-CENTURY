import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const { data: proyectos, error } = await supabase
    .from("proyectos")
    .select("*")
    .eq("activo", true)
    .order("creado_en", { ascending: true });

  if (error) throw error;
  return NextResponse.json(proyectos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const { data: proyecto, error } = await supabase
    .from("proyectos")
    .insert({ nombre: body.nombre, descripcion: body.descripcion || null })
    .select()
    .single();

  if (error) throw error;
  return NextResponse.json(proyecto, { status: 201 });
}
