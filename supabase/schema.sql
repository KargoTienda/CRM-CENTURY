-- ============================================================
-- CRM Inmobiliario — Schema para Supabase (PostgreSQL)
-- Correr en: Supabase → SQL Editor → New query
-- ============================================================

-- Función para auto-actualizar actualizado_en
CREATE OR REPLACE FUNCTION update_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── PROYECTOS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proyectos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  reglas_clasificacion TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CLIENTES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  instagram TEXT,
  email TEXT,
  fecha_nacimiento TIMESTAMPTZ,
  zona TEXT,
  modo_pago TEXT,
  tipo_buscado TEXT,
  valor_presupuesto FLOAT8,
  ambientes INT,
  origen TEXT,
  estado_busqueda TEXT NOT NULL DEFAULT 'activo',
  tarea TEXT,
  proximo_contacto TIMESTAMPTZ,
  notas TEXT,
  importado_de_excel BOOLEAN NOT NULL DEFAULT false,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado_busqueda);
CREATE INDEX IF NOT EXISTS idx_clientes_proximo_contacto ON clientes(proximo_contacto);
CREATE OR REPLACE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en();

-- ─── LEADS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  nombre TEXT,
  telefono TEXT,
  instagram TEXT,
  email TEXT,
  origen TEXT NOT NULL DEFAULT 'MANUAL',
  estado TEXT NOT NULL DEFAULT 'NUEVO',
  propiedad_interes TEXT,
  mensaje_inicial TEXT,
  notas TEXT,
  score_ia FLOAT8,
  proyecto_sugerido_id INT REFERENCES proyectos(id),
  proyecto_id INT REFERENCES proyectos(id),
  cliente_id INT REFERENCES clientes(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);
CREATE INDEX IF NOT EXISTS idx_leads_origen ON leads(origen);
CREATE OR REPLACE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en();

-- ─── BÚSQUEDAS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS busquedas (
  id SERIAL PRIMARY KEY,
  cliente_id INT NOT NULL REFERENCES clientes(id),
  zonas TEXT NOT NULL DEFAULT '[]',
  tipo_propiedad TEXT,
  ambientes_min INT,
  ambientes_max INT,
  precio_min FLOAT8,
  precio_max FLOAT8,
  modo_pago TEXT,
  cochera BOOLEAN,
  apto_credito BOOLEAN,
  requisitos_extra TEXT,
  estado TEXT NOT NULL DEFAULT 'activa',
  link_compartido TEXT,
  token_publico TEXT UNIQUE,
  contexto_previo_ia TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_busquedas_cliente ON busquedas(cliente_id);
CREATE OR REPLACE TRIGGER trg_busquedas_updated_at
  BEFORE UPDATE ON busquedas
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en();

-- ─── PROPIEDADES DE BÚSQUEDA ─────────────────────────────────
CREATE TABLE IF NOT EXISTS propiedades_busqueda (
  id SERIAL PRIMARY KEY,
  busqueda_id INT NOT NULL REFERENCES busquedas(id) ON DELETE CASCADE,
  titulo TEXT,
  direccion TEXT,
  barrio TEXT,
  zona TEXT,
  precio FLOAT8,
  expensas FLOAT8,
  ambientes INT,
  superficie FLOAT8,
  cochera BOOLEAN,
  apto_credito BOOLEAN,
  descripcion TEXT,
  fotos TEXT,
  link_original TEXT NOT NULL,
  link_marcado TEXT,
  portal TEXT NOT NULL,
  id_externo TEXT,
  estado_cliente TEXT NOT NULL DEFAULT 'PENDIENTE',
  comentario_cliente TEXT,
  score_ia FLOAT8,
  razon_ia TEXT,
  orden INT NOT NULL DEFAULT 0,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE TRIGGER trg_propiedades_busqueda_updated_at
  BEFORE UPDATE ON propiedades_busqueda
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en();

-- ─── PROPIEDADES INVENTARIO ───────────────────────────────────
CREATE TABLE IF NOT EXISTS propiedades_inventario (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  direccion TEXT NOT NULL,
  barrio TEXT,
  zona TEXT,
  tipo TEXT NOT NULL,
  ambientes INT,
  superficie FLOAT8,
  cochera BOOLEAN NOT NULL DEFAULT false,
  precio_publicado FLOAT8,
  precio_negociado FLOAT8,
  moneda TEXT NOT NULL DEFAULT 'USD',
  tipo_transaccion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activa',
  cliente_id INT REFERENCES clientes(id),
  link_portal TEXT,
  porcentaje_comision FLOAT8,
  fotos TEXT,
  origen TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE TRIGGER trg_propiedades_inventario_updated_at
  BEFORE UPDATE ON propiedades_inventario
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en();

-- ─── VISITAS INVENTARIO ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitas_inventario (
  id SERIAL PRIMARY KEY,
  propiedad_id INT NOT NULL REFERENCES propiedades_inventario(id),
  cliente_id INT REFERENCES clientes(id),
  fecha TIMESTAMPTZ NOT NULL,
  feedback TEXT,
  interes TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RESERVAS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  fecha_reserva TIMESTAMPTZ NOT NULL,
  cliente_id INT REFERENCES clientes(id),
  nombre_cliente TEXT NOT NULL,
  telefono TEXT,
  propiedad_id INT REFERENCES propiedades_inventario(id),
  descripcion_prop TEXT,
  tipo_transaccion TEXT NOT NULL,
  zona TEXT,
  valor_reserva FLOAT8,
  precio_negociado FLOAT8,
  moneda TEXT NOT NULL DEFAULT 'USD',
  porcentaje_parte_compradora FLOAT8,
  porcentaje_parte_vendedora FLOAT8,
  escribano BOOLEAN NOT NULL DEFAULT false,
  comision_bruta FLOAT8,
  comision_mia FLOAT8,
  estado TEXT NOT NULL DEFAULT 'reservada',
  fecha_escritura TIMESTAMPTZ,
  origen TEXT,
  compro_bool BOOLEAN,
  vendio_bool BOOLEAN,
  notas TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha_reserva);
CREATE OR REPLACE TRIGGER trg_reservas_updated_at
  BEFORE UPDATE ON reservas
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en();

-- ─── INTERACCIONES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interacciones (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  nota TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cliente_id INT REFERENCES clientes(id),
  lead_id INT REFERENCES leads(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRE-LISTINGS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pre_listings (
  id SERIAL PRIMARY KEY,
  direccion TEXT,
  zona TEXT,
  tipo TEXT,
  contacto TEXT,
  telefono TEXT,
  estado TEXT NOT NULL DEFAULT 'prospecto',
  notas TEXT,
  proximo_contacto TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE TRIGGER trg_pre_listings_updated_at
  BEFORE UPDATE ON pre_listings
  FOR EACH ROW EXECUTE FUNCTION update_actualizado_en();
