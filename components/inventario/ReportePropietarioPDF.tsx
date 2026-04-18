"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#FFFFFF" },
  header: { marginBottom: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  logo: { width: 40, height: 40, backgroundColor: "#BEAF87", borderRadius: 6, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#3C3A3C" },
  agencia: { fontSize: 7, color: "#808285", textAlign: "right" },
  divider: { height: 2, backgroundColor: "#BEAF87", marginBottom: 16 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#1A1A1A", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#808285", marginBottom: 2 },
  fecha: { fontSize: 8, color: "#808285" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1A1A1A", marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "#DDD9D0" },
  row2: { flexDirection: "row", gap: 16, marginBottom: 12 },
  infoBox: { flex: 1, backgroundColor: "#FAF8F3", padding: 10, borderRadius: 6, borderWidth: 1, borderColor: "#DDD9D0" },
  infoLabel: { fontSize: 7, color: "#808285", marginBottom: 2 },
  infoValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1A1A1A" },
  tableHeader: { flexDirection: "row", backgroundColor: "#3C3A3C", padding: 8, borderRadius: 4, marginBottom: 2 },
  tableHeaderCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  tableRow: { flexDirection: "row", padding: 8, borderBottomWidth: 1, borderBottomColor: "#F2F1EF" },
  tableRowAlt: { flexDirection: "row", padding: 8, backgroundColor: "#FAF8F3", borderBottomWidth: 1, borderBottomColor: "#F2F1EF" },
  cell: { fontSize: 8, color: "#3C3A3C" },
  colFecha: { width: "15%" },
  colCliente: { width: "25%" },
  colInteres: { width: "15%" },
  colFeedback: { width: "45%" },
  statsGrid: { flexDirection: "row", gap: 8, marginTop: 8 },
  statBox: { flex: 1, padding: 10, borderRadius: 6, alignItems: "center" },
  statNum: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  statLabel: { fontSize: 7, color: "#808285", marginTop: 2 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#808285" },
  interesAlto: { color: "#065F46", fontFamily: "Helvetica-Bold" },
  interesMedio: { color: "#92400E" },
  interesBajo: { color: "#991B1B" },
});

type Visita = {
  id: number;
  fecha: string | Date;
  feedback?: string | null;
  interes?: string | null;
  cliente?: { nombre: string } | null;
};

type Propiedad = {
  titulo: string;
  direccion: string;
  barrio?: string | null;
  zona?: string | null;
  tipo: string;
  ambientes?: number | null;
  superficie?: number | null;
  precioPublicado?: number | null;
  precioNegociado?: number | null;
  moneda: string;
  tipoTransaccion: string;
};

function formatFecha(d: string | Date) {
  return new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function PDFDocument({ propiedad, visitas }: { propiedad: Propiedad; visitas: Visita[] }) {
  const alto = visitas.filter((v) => v.interes === "alto").length;
  const medio = visitas.filter((v) => v.interes === "medio").length;
  const bajo = visitas.filter((v) => v.interes === "bajo").length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>C21</Text>
            </View>
            <View>
              <Text style={styles.agencia}>CENTURY 21</Text>
              <Text style={styles.agencia}>CRM Inmobiliario</Text>
              <Text style={styles.agencia}>Reporte generado: {formatFecha(new Date())}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.title}>{propiedad.titulo}</Text>
          <Text style={styles.subtitle}>{propiedad.direccion}{propiedad.barrio ? `, ${propiedad.barrio}` : ""}</Text>
          {propiedad.zona && <Text style={styles.fecha}>Zona: {propiedad.zona}</Text>}
        </View>

        {/* Datos de la propiedad */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de la propiedad</Text>
          <View style={styles.row2}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Tipo</Text>
              <Text style={styles.infoValue}>{propiedad.tipo}</Text>
            </View>
            {propiedad.ambientes != null && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Ambientes</Text>
                <Text style={styles.infoValue}>{propiedad.ambientes}</Text>
              </View>
            )}
            {propiedad.superficie != null && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Superficie</Text>
                <Text style={styles.infoValue}>{propiedad.superficie} m²</Text>
              </View>
            )}
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Operación</Text>
              <Text style={styles.infoValue}>{propiedad.tipoTransaccion}</Text>
            </View>
          </View>
          <View style={styles.row2}>
            {propiedad.precioPublicado != null && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Precio publicado</Text>
                <Text style={styles.infoValue}>USD {propiedad.precioPublicado.toLocaleString("es-AR")}</Text>
              </View>
            )}
            {propiedad.precioNegociado != null && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Precio negociado</Text>
                <Text style={[styles.infoValue, { color: "#065F46" }]}>USD {propiedad.precioNegociado.toLocaleString("es-AR")}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Resumen de visitas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de visitas ({visitas.length} total)</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0" }]}>
              <Text style={[styles.statNum, { color: "#065F46" }]}>{alto}</Text>
              <Text style={styles.statLabel}>Interés alto</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A" }]}>
              <Text style={[styles.statNum, { color: "#92400E" }]}>{medio}</Text>
              <Text style={styles.statLabel}>Interés medio</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" }]}>
              <Text style={[styles.statNum, { color: "#991B1B" }]}>{bajo}</Text>
              <Text style={styles.statLabel}>Interés bajo</Text>
            </View>
          </View>
        </View>

        {/* Historial de visitas */}
        {visitas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial de visitas</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colFecha]}>Fecha</Text>
              <Text style={[styles.tableHeaderCell, styles.colCliente]}>Visitante</Text>
              <Text style={[styles.tableHeaderCell, styles.colInteres]}>Interés</Text>
              <Text style={[styles.tableHeaderCell, styles.colFeedback]}>Comentarios</Text>
            </View>
            {visitas.map((v, i) => (
              <View key={v.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.cell, styles.colFecha]}>{formatFecha(v.fecha)}</Text>
                <Text style={[styles.cell, styles.colCliente]}>{v.cliente?.nombre || "—"}</Text>
                <Text style={[
                  styles.cell,
                  styles.colInteres,
                  v.interes === "alto" ? styles.interesAlto : v.interes === "medio" ? styles.interesMedio : styles.interesBajo,
                ]}>
                  {v.interes || "—"}
                </Text>
                <Text style={[styles.cell, styles.colFeedback]}>{v.feedback || "Sin comentarios"}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>CENTURY 21 — Reporte de propiedad</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export default function DownloadReportePropietario({
  propiedad,
  visitas,
}: {
  propiedad: Propiedad;
  visitas: Visita[];
}) {
  return (
    <PDFDownloadLink
      document={<PDFDocument propiedad={propiedad} visitas={visitas} />}
      fileName={`reporte-propietario-${propiedad.titulo.toLowerCase().replace(/\s+/g, "-")}.pdf`}
    >
      {({ loading }) => (
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#BEAF87", color: "#3C3A3C" }}
          disabled={loading}
        >
          {loading ? "Generando..." : "📄 Reporte para propietario"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
