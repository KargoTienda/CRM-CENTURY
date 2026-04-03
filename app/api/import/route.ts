import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  importClientes,
  importDatosC21,
  importReservas,
  importPreListing,
  importLeadsProyecto,
} from "@/lib/excel-import";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formData = await req.formData();
  const tipo = formData.get("tipo") as string;
  const file = formData.get("file") as File;

  if (!file || !tipo) {
    return NextResponse.json({ error: "Falta archivo o tipo" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let result;

    switch (tipo) {
      case "clientes":
        result = await importClientes(buffer);
        break;
      case "datosC21":
        result = await importDatosC21(buffer);
        break;
      case "reservas":
        result = await importReservas(buffer);
        break;
      case "preListing":
        result = await importPreListing(buffer);
        break;
      case "milAires":
        result = await importLeadsProyecto(buffer, "MIL AIRES", "Mil Aires");
        break;
      case "isolina":
        result = await importLeadsProyecto(buffer, "ISOLINA", "Isolina");
        break;
      default:
        return NextResponse.json({ error: "Tipo de importación no válido" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error importando" },
      { status: 500 }
    );
  }
}
