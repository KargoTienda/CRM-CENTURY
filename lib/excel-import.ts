import * as XLSX from "xlsx";
import { supabase } from "./supabase";

type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

function parseDate(val: unknown): string | null {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "number") {
    const date = XLSX.SSF.parse_date_code(val);
    if (date) return new Date(date.y, date.m - 1, date.d).toISOString();
  }
  if (typeof val === "string") {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

function parseFloat2(val: unknown): number | null {
  if (!val) return null;
  const n = parseFloat(String(val).replace(/[,$\s]/g, ""));
  return isNaN(n) ? null : n;
}

function parseStr(val: unknown): string | null {
  if (!val) return null;
  const s = String(val).trim();
  return s === "" ? null : s;
}

// ─── CLIENTES ────────────────────────────────────────────────

export async function importClientes(buffer: Buffer): Promise<ImportResult> {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const ws = wb.Sheets["Datos clientes"];
  if (!ws) throw new Error("Hoja 'Datos clientes' no encontrada");

  const rows = XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[];
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const nombre = parseStr(row["NOMBRE"]);
    if (!nombre) { skipped++; continue; }

    const telefono = parseStr(row["TELEFONO"]);

    let dupQuery = supabase.from("clientes").select("id").eq("nombre", nombre);
    if (telefono) dupQuery = dupQuery.eq("telefono", telefono);
    const { data: existing } = await dupQuery.limit(1);
    if (existing && existing.length > 0) { skipped++; continue; }

    try {
      const { error } = await supabase.from("clientes").insert({
        nombre,
        telefono,
        instagram: parseStr(row["INSTAGRAM"]),
        zona: parseStr(row["ZONA"]),
        modo_pago: parseStr(row["MODO DE PAGO"]),
        tipo_buscado: parseStr(row["TIPO DE PROPIEDAD"]),
        valor_presupuesto: parseFloat2(row["VALOR"]),
        ambientes: row["AMBIENTES"] ? parseInt(String(row["AMBIENTES"])) : null,
        tarea: parseStr(row["TAREA"]),
        notas: [
          parseStr(row["HISTORIAL CONTACTO"]),
          parseStr(row["SIGUIMIENTO"]),
        ].filter(Boolean).join("\n") || null,
        proximo_contacto: parseDate(row["PROXIMO CONTACTO"]),
        origen: parseStr(row["ORIGEN DE CONTACTO"]) || "IG",
        estado_busqueda: parseStr(row["BUSQUEDA"]) === "INACTIVO" ? "pausado" : "activo",
        importado_de_excel: true,
      });
      if (error) throw error;
      imported++;
    } catch (e) {
      errors.push(`Error en fila ${nombre}: ${e}`);
    }
  }

  return { imported, skipped, errors };
}

// ─── DATOS C21 (Leads) ───────────────────────────────────────

export async function importDatosC21(buffer: Buffer): Promise<ImportResult> {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const ws = wb.Sheets["DATOS C21"];
  if (!ws) throw new Error("Hoja 'DATOS C21' no encontrada");

  const rows = XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[];
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const nombre = parseStr(row["NOMBRE"]);
    if (!nombre) { skipped++; continue; }

    try {
      const { error } = await supabase.from("leads").insert({
        nombre,
        telefono: parseStr(row["TELEFONO"]),
        origen: "C21",
        estado: "CONTACTADO",
        propiedad_interes: parseStr(row["ANUNCIO"]),
        notas: parseStr(row["INFORMACION"]),
        mensaje_inicial: parseStr(row["TAREA REALIZADA"]),
      });
      if (error) throw error;
      imported++;
    } catch (e) {
      errors.push(`Error en fila ${nombre}: ${e}`);
      skipped++;
    }
  }

  return { imported, skipped, errors };
}

// ─── RESERVAS ────────────────────────────────────────────────

export async function importReservas(buffer: Buffer): Promise<ImportResult> {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const ws = wb.Sheets["Reservas"];
  if (!ws) throw new Error("Hoja 'Reservas' no encontrada");

  const rows = XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[];
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const nombreCliente = parseStr(row["NOMBRE"]);
    if (!nombreCliente) { skipped++; continue; }

    const { data: clientes } = await supabase
      .from("clientes")
      .select("id")
      .ilike("nombre", `%${nombreCliente}%`)
      .limit(1);

    const clienteId = clientes?.[0]?.id ?? null;

    try {
      const { error } = await supabase.from("reservas").insert({
        nombre_cliente: nombreCliente,
        cliente_id: clienteId,
        telefono: parseStr(row["TELEFONO"]),
        tipo_transaccion: parseStr(row["TRANSACCION"]) || "compra",
        zona: parseStr(row["ZONA"]),
        valor_reserva: parseFloat2(row["VALOR DE PUBLI"]),
        precio_negociado: parseFloat2(row["PRECIO DE NEGOCIONACION FINAL"]),
        origen: parseStr(row["ORIGEN DE CONTACTO"]),
        fecha_reserva: parseDate(row["FECHA"]) || new Date().toISOString(),
        estado: "escriturada",
        comision_bruta: parseFloat2(row["DATO"]),
        comision_mia: parseFloat2(row["MIO"]),
        notas: [
          parseStr(row["COMPRO"]) ? `COMPRÓ: ${row["COMPRO"]}` : null,
          parseStr(row["VENDIO"]) ? `VENDIÓ: ${row["VENDIO"]}` : null,
        ].filter(Boolean).join(" | ") || null,
      });
      if (error) throw error;
      imported++;
    } catch (e) {
      errors.push(`Error en reserva ${nombreCliente}: ${e}`);
      skipped++;
    }
  }

  return { imported, skipped, errors };
}

// ─── PRE-LISTING ─────────────────────────────────────────────

export async function importPreListing(buffer: Buffer): Promise<ImportResult> {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const ws = wb.Sheets["Pre-listing"];
  if (!ws) throw new Error("Hoja 'Pre-listing' no encontrada");

  const rows = XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[];
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const contacto = parseStr(row["NOMBRE"]);
    if (!contacto) { skipped++; continue; }

    try {
      const { error } = await supabase.from("pre_listings").insert({
        contacto,
        telefono: parseStr(row["TELEFONO"]),
        zona: parseStr(row["ZONA"]),
        direccion: parseStr(row["DIRECCION"]),
        tipo: parseStr(row["TRANSACCION"]),
        estado: parseStr(row["CAPTADO"]) === "SI" ? "captado" : "prospecto",
        notas: [
          parseStr(row["PRE -LISTING"]) ? `Pre-listing: ${row["PRE -LISTING"]}` : null,
          parseStr(row["FUENTE"]) ? `Fuente: ${row["FUENTE"]}` : null,
        ].filter(Boolean).join(" | ") || null,
      });
      if (error) throw error;
      imported++;
    } catch (e) {
      errors.push(`Error pre-listing ${contacto}: ${e}`);
      skipped++;
    }
  }

  return { imported, skipped, errors };
}

// ─── LEADS PROYECTOS (Mil Aires / Isolina) ───────────────────

export async function importLeadsProyecto(buffer: Buffer, hoja: string, nombreProyecto: string): Promise<ImportResult> {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const ws = wb.Sheets[hoja];
  if (!ws) throw new Error(`Hoja '${hoja}' no encontrada`);

  // Buscar o crear proyecto
  const { data: proyectos } = await supabase
    .from("proyectos")
    .select("id")
    .eq("nombre", nombreProyecto)
    .limit(1);

  let proyectoId: number;
  if (proyectos && proyectos.length > 0) {
    proyectoId = proyectos[0].id;
  } else {
    const { data: nuevo } = await supabase
      .from("proyectos")
      .insert({ nombre: nombreProyecto })
      .select("id")
      .single();
    proyectoId = nuevo!.id;
  }

  const rows = XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[];
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const nombre = parseStr(row["CLIENTE"]);
    if (!nombre) { skipped++; continue; }

    try {
      const { error } = await supabase.from("leads").insert({
        nombre,
        telefono: parseStr(row["TELEFONO"]),
        origen: "INSTAGRAM_PAUTA",
        estado: "NUEVO",
        proyecto_id: proyectoId,
        notas: [
          parseStr(row["DISPONIBILIDAD"]) ? `Disponibilidad: ${row["DISPONIBILIDAD"]}` : null,
          parseStr(row["AGENDA"]) ? `Agenda: ${row["AGENDA"]}` : null,
        ].filter(Boolean).join(" | ") || null,
      });
      if (error) throw error;
      imported++;
    } catch (e) {
      errors.push(`Error lead ${nombre}: ${e}`);
      skipped++;
    }
  }

  return { imported, skipped, errors };
}
