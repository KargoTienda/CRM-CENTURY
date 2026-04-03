import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export interface PropiedadRaw {
  titulo?: string;
  direccion?: string;
  barrio?: string;
  precio?: number;
  expensas?: number;
  ambientes?: number;
  superficie?: number;
  cochera?: boolean;
  aptoCredito?: boolean;
  descripcion?: string;
  linkOriginal: string;
  portal: string;
  idExterno?: string;
  fotos?: string[];
}

export interface RankingResult {
  linkOriginal: string;
  score: number;
  razon: string;
}

export interface PerfilBusqueda {
  zonas: string[];
  tipoPropiedad?: string;
  ambientesMin?: number;
  ambientesMax?: number;
  precioMin?: number;
  precioMax?: number;
  modoPago?: string;
  cochera?: boolean;
  aptoCredito?: boolean;
  requisitosExtra?: string;
}

export async function rankearPropiedades(
  perfil: PerfilBusqueda,
  contextoPrevio: string | null,
  propiedades: PropiedadRaw[]
): Promise<RankingResult[]> {
  if (propiedades.length === 0) return [];

  const prompt = `Sos un asistente de una agente inmobiliaria en Argentina.
Tu tarea es evaluar propiedades y asignarles un score del 0 al 100 según qué tan bien se ajustan al perfil del comprador.

## Perfil del comprador
${JSON.stringify(perfil, null, 2)}

${contextoPrevio ? `## Historial de feedback del cliente (propiedades vistas antes)
${contextoPrevio}` : ""}

## Propiedades a evaluar
${JSON.stringify(propiedades.map((p, i) => ({ index: i, ...p })), null, 2)}

## Instrucciones
- Asigná un score del 0 al 100 a cada propiedad
- 100 = perfecta para el cliente, 0 = no sirve para nada
- Considerá: precio vs presupuesto, ambientes, zona, cochera, apto crédito, estado general
- Priorizá propiedades que se ajusten al historial de gustos del cliente
- La razón debe ser 1-2 oraciones en español, muy concretas (ej: "Precio dentro del presupuesto, 3 ambientes como buscaba, pero sin cochera")

Respondé SOLO con un JSON array, sin markdown, sin explicaciones:
[{"linkOriginal": "...", "score": 85, "razon": "..."}, ...]`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  return JSON.parse(jsonMatch[0]) as RankingResult[];
}

export interface LeadParaClasificar {
  id: number;
  nombre?: string;
  telefono?: string;
  propiedadInteres?: string;
  notas?: string;
  mensajeInicial?: string;
}

export interface ProyectoParaClasificar {
  id: number;
  nombre: string;
  descripcion?: string;
  reglasClasificacion?: string;
}

export interface ClasificacionResult {
  leadId: number;
  proyectoId: number;
  confianza: number;
  razon: string;
}

export async function clasificarLeads(
  leads: LeadParaClasificar[],
  proyectos: ProyectoParaClasificar[]
): Promise<ClasificacionResult[]> {
  if (leads.length === 0 || proyectos.length === 0) return [];

  const prompt = `Sos un asistente de una agente inmobiliaria en Argentina.
Clasificá cada lead en el proyecto inmobiliario que mejor le corresponda.

## Proyectos disponibles
${JSON.stringify(proyectos, null, 2)}

## Leads a clasificar
${JSON.stringify(leads, null, 2)}

## Instrucciones
- Asigná cada lead al proyecto más apropiado según su mensaje, interés declarado y notas
- La confianza va de 0 a 100 (cuánto estás seguro de la clasificación)
- La razón debe ser 1 oración breve en español
- Si un lead no encaja en ningún proyecto, usá el proyectoId del proyecto más cercano con confianza baja

Respondé SOLO con un JSON array, sin markdown:
[{"leadId": 1, "proyectoId": 2, "confianza": 80, "razon": "..."}, ...]`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  return JSON.parse(jsonMatch[0]) as ClasificacionResult[];
}

export interface PropiedadConFeedback {
  titulo?: string;
  direccion?: string;
  barrio?: string;
  precio?: number;
  ambientes?: number;
  estadoCliente: string;
  comentarioCliente?: string;
  scoreIA?: number;
  razonIA?: string;
}

export async function actualizarContextoCliente(
  propiedadesConFeedback: PropiedadConFeedback[]
): Promise<string> {
  if (propiedadesConFeedback.length === 0) return "{}";

  const prompt = `Analizá el feedback de un cliente sobre propiedades inmobiliarias y generá un resumen estructurado de sus preferencias reales.

## Propiedades vistas con feedback
${JSON.stringify(propiedadesConFeedback, null, 2)}

## Estados posibles
- LLAMAR = le gustó, quiere verla
- VISITADO = la vio
- DESCARTADO = no le gustó
- CONTACTADO / VISITA_AGENDADA = en proceso
- RESERVADO = la reservó

## Instrucciones
Generá un JSON con el aprendizaje del cliente:
{
  "gustos": ["lista de cosas que le gustaron de las propiedades buenas"],
  "rechazos": ["lista de cosas que NO le gustaron de las descartadas"],
  "precioReferencia": "rango de precios que más le interesan",
  "barrios": ["barrios que prefiere según las que le gustaron"],
  "resumen": "1-2 oraciones resumiendo el perfil real del cliente"
}

Respondé SOLO con el JSON, sin markdown.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : "{}";
}
