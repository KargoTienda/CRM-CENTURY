import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const ZONAPROP_ACTOR = "PyCipBrbNO7KBfnQe";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function buildUrl(zona: string, tipo: string, ambMin?: number, ambMax?: number, precioMin?: number, precioMax?: number) {
  const tipoSlug =
    tipo === "departamento" ? "departamentos"
    : tipo === "casa" ? "casas"
    : tipo === "ph" ? "ph"
    : tipo === "local" ? "locales-comerciales"
    : tipo === "oficina" ? "oficinas"
    : "propiedades";

  const zonaSlug = slugify(zona);
  const parts: string[] = [];
  if (ambMin && ambMin > 1) parts.push(`${ambMin}-ambientes`);
  if (precioMin || precioMax) {
    const desde = precioMin || 0;
    const hasta = precioMax || 9999999;
    parts.push(`precio-desde-${desde}-hasta-${hasta}-dolares`);
  }
  const filterStr = parts.length > 0 ? `-${parts.join("-")}` : "";
  return `https://www.zonaprop.com.ar/${tipoSlug}-venta-${zonaSlug}${filterStr}.html`;
}

function parseNumber(val: unknown): number | undefined {
  if (val == null) return undefined;
  if (typeof val === "number") return val;
  const m = String(val).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : undefined;
}

function matchesCriteria(
  item: Record<string, unknown>,
  ambMin?: number | null,
  ambMax?: number | null,
  precioMin?: number | null,
  precioMax?: number | null
): boolean {
  const precio = parseNumber(item.list_price_amount);
  const ambientesStr = (item.list_units_rooms_quantity_range as string) || "";
  const ambientes = parseNumber(ambientesStr);

  if (precioMin && precio && precio < precioMin * 0.8) return false;
  if (precioMax && precio && precio > precioMax * 1.2) return false;
  if (ambMin && ambientes && ambientes < ambMin) return false;
  if (ambMax && ambientes && ambientes > ambMax) return false;
  return true;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: "APIFY_TOKEN no configurado" }, { status: 400 });
  }

  const { data: busqueda, error } = await supabase
    .from("busquedas")
    .select("*")
    .eq("id", parseInt(params.id))
    .single();

  if (error || !busqueda) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const zonas: string[] = JSON.parse(busqueda.zonas || "[]");
  if (zonas.length === 0) {
    return NextResponse.json({ error: "La búsqueda no tiene zonas configuradas" }, { status: 400 });
  }

  const tipo = busqueda.tipo_propiedad || "departamento";
  const zonasParaBuscar = zonas.slice(0, 4);
  const startUrls = zonasParaBuscar.map((zona) => ({
    url: buildUrl(
      zona,
      tipo,
      busqueda.ambientes_min ?? undefined,
      busqueda.ambientes_max ?? undefined,
      busqueda.precio_min ?? undefined,
      busqueda.precio_max ?? undefined,
    ),
  }));

  console.log("[Scrape] Zonas:", zonasParaBuscar);
  console.log("[Scrape] URLs:", startUrls.map(u => u.url));

  try {
    const apifyUrl = `https://api.apify.com/v2/acts/${ZONAPROP_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=180&memory=2048`;
    const res = await fetch(apifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls,
        maxItems: Math.min(40, 12 * zonasParaBuscar.length),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[Scrape] Apify error:", res.status, text.slice(0, 300));
      return NextResponse.json({ error: `Apify devolvió error ${res.status}` }, { status: 502 });
    }

    const allItems: Record<string, unknown>[] = await res.json();
    console.log(`[Scrape] Total items de Apify: ${allItems.length}`);

    const filtered = allItems.filter(item =>
      matchesCriteria(item, busqueda.ambientes_min, busqueda.ambientes_max, busqueda.precio_min, busqueda.precio_max)
    );
    console.log(`[Scrape] Después de filtrar: ${filtered.length}`);

    const propiedades = filtered
      .filter(item => item.list_public_url || item.propertyUrl)
      .map((item) => {
        const link = (item.list_public_url || item.propertyUrl) as string;
        const locationLabel = (item.list_location_label as string) || "";
        const locationParts = locationLabel.split(",");
        const barrio = locationParts.length >= 2
          ? locationParts[locationParts.length - 2]?.trim()
          : locationParts[0]?.trim();

        const fotos: string[] = [];
        if (item.list_first_image_url) fotos.push(item.list_first_image_url as string);
        const summary = item.listSummary as Record<string, unknown> | undefined;
        if (summary?.pictures && Array.isArray(summary.pictures)) {
          for (const pic of (summary.pictures as Record<string, unknown>[]).slice(0, 6)) {
            const sizes = pic.sizes as Array<{ url: string }> | undefined;
            const url = sizes?.[0]?.url;
            if (url && !fotos.includes(url)) fotos.push(url);
          }
        }

        return {
          titulo: ((item.list_title || item.title) as string | undefined)?.trim(),
          direccion: locationLabel,
          barrio,
          precio: parseNumber(item.list_price_amount),
          ambientes: parseNumber(item.list_units_rooms_quantity_range as string),
          superficie: parseNumber(item.list_units_total_area_range as string),
          cochera: !!(item.list_units_garages_quantity_range),
          descripcion: ((item.list_description || item.description) as string | undefined)?.slice(0, 600),
          fotos: JSON.stringify(fotos.slice(0, 6)),
          link_original: link,
          portal: "zonaprop",
          id_externo: (item.list_posting_id || item.listingId)?.toString(),
        };
      });

    if (propiedades.length === 0) {
      return NextResponse.json({
        mensaje: `No se encontraron propiedades que coincidan con los criterios (de ${allItems.length} resultados de ZonaProp)`,
        total: 0,
        debug: { totalScrapeado: allItems.length, filtradas: 0 },
      });
    }

    const { data: existentes } = await supabase
      .from("propiedades_busqueda")
      .select("link_original")
      .eq("busqueda_id", parseInt(params.id));

    const linksExistentes = new Set((existentes ?? []).map(e => e.link_original));
    const nuevas = propiedades.filter(p => !linksExistentes.has(p.link_original));

    if (nuevas.length > 0) {
      await supabase.from("propiedades_busqueda").insert(
        nuevas.map((p, i) => ({
          busqueda_id: parseInt(params.id),
          titulo: p.titulo,
          direccion: p.direccion,
          barrio: p.barrio,
          precio: p.precio,
          ambientes: p.ambientes,
          superficie: p.superficie,
          cochera: p.cochera,
          descripcion: p.descripcion,
          fotos: p.fotos,
          link_original: p.link_original,
          portal: p.portal,
          id_externo: p.id_externo,
          orden: (existentes?.length ?? 0) + i,
        }))
      );
    }

    return NextResponse.json({
      mensaje: `${nuevas.length} propiedades nuevas agregadas`,
      total: nuevas.length,
      totalScrapeado: allItems.length,
      filtradas: filtered.length,
    });
  } catch (err) {
    console.error("[Scrape] Error:", err);
    return NextResponse.json({ error: "Error al scrapear" }, { status: 500 });
  }
}
