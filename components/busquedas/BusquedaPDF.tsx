"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#FFFFFF" },
  header: { marginBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  logo: { width: 40, height: 40, backgroundColor: "#BEAF87", borderRadius: 6, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#3C3A3C" },
  agencia: { fontSize: 7, color: "#808285", textAlign: "right" },
  divider: { height: 2, backgroundColor: "#BEAF87", marginBottom: 14 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#1A1A1A", marginBottom: 4 },
  subtitle: { fontSize: 9, color: "#808285", marginBottom: 2 },
  criteriosRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8, marginBottom: 4 },
  chip: { backgroundColor: "#FAF8F3", borderWidth: 1, borderColor: "#DDD9D0", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  chipText: { fontSize: 7, color: "#3C3A3C" },
  propCard: { marginBottom: 14, borderWidth: 1, borderColor: "#DDD9D0", borderRadius: 8, overflow: "hidden" },
  propHeader: { backgroundColor: "#3C3A3C", padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  propNum: { fontSize: 8, color: "#BEAF87", fontFamily: "Helvetica-Bold" },
  propPortal: { fontSize: 7, color: "rgba(255,255,255,0.5)" },
  propBody: { padding: 10 },
  propTitulo: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1A1A1A", marginBottom: 3 },
  propDir: { fontSize: 8, color: "#808285", marginBottom: 6 },
  propRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  propData: { flex: 1, backgroundColor: "#FAF8F3", padding: 6, borderRadius: 4 },
  propDataLabel: { fontSize: 6, color: "#808285", marginBottom: 1 },
  propDataValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1A1A1A" },
  propPrecio: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#BEAF87" },
  propDesc: { fontSize: 7, color: "#5A585A", lineHeight: 1.4, marginTop: 6 },
  scoreBox: { backgroundColor: "#BEAF87", borderRadius: 4, padding: 4, alignItems: "center", minWidth: 36 },
  scoreNum: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#3C3A3C" },
  scoreLabel: { fontSize: 5, color: "#3C3A3C" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#DDD9D0", paddingTop: 6 },
  footerText: { fontSize: 7, color: "#808285" },
  noProps: { padding: 30, alignItems: "center" },
  noPropsText: { fontSize: 11, color: "#808285" },
  agentContact: { marginTop: 6 },
  agentContactText: { fontSize: 8, color: "#BEAF87", fontFamily: "Helvetica-Bold" },
});

type Propiedad = {
  id: number;
  titulo: string | null;
  direccion: string | null;
  barrio: string | null;
  precio: number | null;
  expensas: number | null;
  ambientes: number | null;
  superficie: number | null;
  portal: string;
  estadoCliente: string;
  scoreIA: number | null;
  razonIA: string | null;
  descripcion?: string | null;
  fotos: string | null;
};

type Busqueda = {
  id: number;
  zonas: string;
  tipoPropiedad: string | null;
  ambientesMin: number | null;
  ambientesMax: number | null;
  precioMin: number | null;
  precioMax: number | null;
  cliente: { nombre: string };
};

function formatMonto(n: number | null) {
  if (!n) return "—";
  return `USD ${n.toLocaleString("es-AR")}`;
}

function PDFDocument({ busqueda, propiedades }: { busqueda: Busqueda; propiedades: Propiedad[] }) {
  const zonas = (() => {
    try { return JSON.parse(busqueda.zonas) as string[]; } catch { return []; }
  })();

  // Excluir descartadas
  const props = propiedades.filter((p) => p.estadoCliente !== "DESCARTADO");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.logo}>
                <Text style={styles.logoText}>C21</Text>
              </View>
            </View>
            <View>
              <Text style={styles.agencia}>CENTURY 21</Text>
              <Text style={styles.agencia}>Selección de propiedades</Text>
              <Text style={styles.agencia}>{new Date().toLocaleDateString("es-AR")}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.title}>Propiedades para {busqueda.cliente.nombre}</Text>
          <Text style={styles.subtitle}>
            Selección personalizada — {props.length} propiedad{props.length !== 1 ? "es" : ""}
          </Text>

          {/* Criterios */}
          <View style={styles.criteriosRow}>
            {busqueda.tipoPropiedad && (
              <View style={styles.chip}><Text style={styles.chipText}>Tipo: {busqueda.tipoPropiedad}</Text></View>
            )}
            {(busqueda.ambientesMin || busqueda.ambientesMax) && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {busqueda.ambientesMin && busqueda.ambientesMax
                    ? `${busqueda.ambientesMin}–${busqueda.ambientesMax} ambientes`
                    : busqueda.ambientesMin
                    ? `Desde ${busqueda.ambientesMin} amb.`
                    : `Hasta ${busqueda.ambientesMax} amb.`}
                </Text>
              </View>
            )}
            {(busqueda.precioMin || busqueda.precioMax) && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {busqueda.precioMin && busqueda.precioMax
                    ? `USD ${busqueda.precioMin.toLocaleString()} – ${busqueda.precioMax.toLocaleString()}`
                    : busqueda.precioMax
                    ? `Hasta USD ${busqueda.precioMax.toLocaleString()}`
                    : `Desde USD ${busqueda.precioMin?.toLocaleString()}`}
                </Text>
              </View>
            )}
            {zonas.slice(0, 5).map((z) => (
              <View key={z} style={styles.chip}><Text style={styles.chipText}>{z}</Text></View>
            ))}
          </View>
        </View>

        {/* Propiedades */}
        {props.length === 0 ? (
          <View style={styles.noProps}>
            <Text style={styles.noPropsText}>No hay propiedades seleccionadas</Text>
          </View>
        ) : (
          props.map((p, i) => (
            <View key={p.id} style={styles.propCard} wrap={false}>
              <View style={styles.propHeader}>
                <Text style={styles.propNum}>Propiedad {i + 1}</Text>
                {p.scoreIA != null && (
                  <View style={styles.scoreBox}>
                    <Text style={styles.scoreNum}>{Math.round(p.scoreIA)}</Text>
                    <Text style={styles.scoreLabel}>score</Text>
                  </View>
                )}
              </View>
              <View style={styles.propBody}>
                <Text style={styles.propTitulo}>{p.titulo || "Sin título"}</Text>
                <Text style={styles.propDir}>
                  {p.direccion || "Dirección a confirmar"}{p.barrio ? ` — ${p.barrio}` : ""}
                </Text>

                <View style={styles.propRow}>
                  <View style={styles.propData}>
                    <Text style={styles.propDataLabel}>Precio</Text>
                    <Text style={[styles.propDataValue, { color: "#BEAF87" }]}>{formatMonto(p.precio)}</Text>
                  </View>
                  {p.expensas != null && p.expensas > 0 && (
                    <View style={styles.propData}>
                      <Text style={styles.propDataLabel}>Expensas</Text>
                      <Text style={styles.propDataValue}>$ {p.expensas.toLocaleString("es-AR")}</Text>
                    </View>
                  )}
                  {p.ambientes != null && (
                    <View style={styles.propData}>
                      <Text style={styles.propDataLabel}>Ambientes</Text>
                      <Text style={styles.propDataValue}>{p.ambientes}</Text>
                    </View>
                  )}
                  {p.superficie != null && (
                    <View style={styles.propData}>
                      <Text style={styles.propDataLabel}>Superficie</Text>
                      <Text style={styles.propDataValue}>{p.superficie} m²</Text>
                    </View>
                  )}
                </View>

                {p.razonIA && (
                  <Text style={styles.propDesc}>💡 {p.razonIA}</Text>
                )}
              </View>
            </View>
          ))
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>CENTURY 21 — Búsqueda #{busqueda.id} — {busqueda.cliente.nombre}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export default function DownloadBusquedaPDF({
  busqueda,
  propiedades,
}: {
  busqueda: Busqueda;
  propiedades: Propiedad[];
}) {
  return (
    <PDFDownloadLink
      document={<PDFDocument busqueda={busqueda} propiedades={propiedades} />}
      fileName={`busqueda-${busqueda.cliente.nombre.toLowerCase().replace(/\s+/g, "-")}-${busqueda.id}.pdf`}
    >
      {({ loading }) => (
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#BEAF87", color: "#3C3A3C" }}
          disabled={loading}
        >
          {loading ? "Generando..." : "📄 Generar PDF para cliente"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
