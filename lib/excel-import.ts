import * as XLSX from "xlsx";
import { prisma } from "./prisma";

type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

function parseDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "number") {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(val);
    if (date) return new Date(date.y, date.m - 1, date.d);
  }
  if (typeof val === "string") {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
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

    // Check duplicate
    const existing = await prisma.cliente.findFirst({
      where: { nombre, telefono: telefono ?? undefined },
    });
    if (existing) { skipped++; continue; }

    try {
      await prisma.cliente.create({
        data: {
          nombre,
          telefono,
          instagram: parseStr(row["INSTAGRAM"]),
          zona: parseStr(row["ZONA"]),
          modoPago: parseStr(row["MODO DE PAGO"]),
          tipoBuscado: parseStr(row["TIPO DE PROPIEDAD"]),
          valorPresupuesto: parseFloat2(row["VALOR"]),
          ambientes: row["AMBIENTES"] ? parseInt(String(row["AMBIENTES"])) : null,
          tarea: parseStr(row["TAREA"]),
          notas: [
            parseStr(row["HISTORIAL CONTACTO"]),
            parseStr(row["SIGUIMIENTO"]),
          ].filter(Boolean).join("\n") || null,
          proximoContacto: parseDate(row["PROXIMO CONTACTO"]),
          origen: parseStr(row["ORIGEN DE CONTACTO"]) || "IG",
          estadoBusqueda: parseStr(row["BUSQUEDA"]) === "INACTIVO" ? "pausado" : "activo",
          importadoDeExcel: true,
        },
      });
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
      await prisma.lead.create({
        data: {
          nombre,
          telefono: parseStr(row["TELEFONO"]),
          origen: "C21",
          estado: "CONTACTADO",
          propiedadInteres: parseStr(row["ANUNCIO"]),
          notas: parseStr(row["INFORMACION"]),
          mensajeInicial: parseStr(row["TAREA REALIZADA"]),
        },
      });
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

    // Try to find existing cliente
    const cliente = await prisma.cliente.findFirst({
      where: { nombre: { contains: nombreCliente } },
    });

    const porcentaje = parseFloat2(row["%"]);
    const dato = parseFloat2(row["DATO"]);
    const mio = parseFloat2(row["MIO"]);

    try {
      await prisma.reserva.create({
        data: {
          nombreCliente,
          clienteId: cliente?.id || null,
          telefono: parseStr(row["TELEFONO"]),
          tipoTransaccion: parseStr(row["TRANSACCION"]) || "compra",
          zona: parseStr(row["ZONA"]),
          valorReserva: parseFloat2(row["VALOR DE PUBLI"]),
          precioNegociado: parseFloat2(row["PRECIO DE NEGOCIONACION FINAL"]),
          origen: parseStr(row["ORIGEN DE CONTACTO"]),
          fechaReserva: parseDate(row["FECHA"]) || new Date(),
          estado: "escriturada",
          comisionBruta: dato,
          comisionMia: mio,
          notas: [
            parseStr(row["COMPRO"]) ? `COMPRÓ: ${row["COMPRO"]}` : null,
            parseStr(row["VENDIO"]) ? `VENDIÓ: ${row["VENDIO"]}` : null,
          ].filter(Boolean).join(" | ") || null,
        },
      });
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
      await prisma.preListing.create({
        data: {
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
        },
      });
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

  // Asegurar que el proyecto existe
  let proyecto = await prisma.proyecto.findFirst({ where: { nombre: nombreProyecto } });
  if (!proyecto) {
    proyecto = await prisma.proyecto.create({ data: { nombre: nombreProyecto } });
  }

  const rows = XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[];
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const nombre = parseStr(row["CLIENTE"]);
    if (!nombre) { skipped++; continue; }

    try {
      await prisma.lead.create({
        data: {
          nombre,
          telefono: parseStr(row["TELEFONO"]),
          origen: "INSTAGRAM_PAUTA",
          estado: "NUEVO",
          proyectoId: proyecto.id,
          notas: [
            parseStr(row["DISPONIBILIDAD"]) ? `Disponibilidad: ${row["DISPONIBILIDAD"]}` : null,
            parseStr(row["AGENDA"]) ? `Agenda: ${row["AGENDA"]}` : null,
          ].filter(Boolean).join(" | ") || null,
        },
      });
      imported++;
    } catch (e) {
      errors.push(`Error lead ${nombre}: ${e}`);
      skipped++;
    }
  }

  return { imported, skipped, errors };
}
