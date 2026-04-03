"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";

interface Cliente {
  id: number;
  nombre: string;
}

const TIPOS = ["departamento", "casa", "ph", "local", "oficina", "terreno", "duplex", "triplex"];

export default function NuevaPropiedadPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titulo: "",
    direccion: "",
    barrio: "",
    zona: "",
    tipo: "departamento",
    ambientes: "",
    superficie: "",
    cochera: false,
    precioPublicado: "",
    moneda: "USD",
    tipoTransaccion: "venta",
    estado: "activa",
    clienteId: "",
    linkPortal: "",
    porcentajeComision: "",
    origen: "",
  });

  useEffect(() => {
    fetch("/api/clientes?limit=500")
      .then((r) => r.json())
      .then((data) => setClientes(Array.isArray(data) ? data : data.clientes || []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo || !form.direccion) { setError("Título y dirección son requeridos"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/inventario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/inventario/${data.id}`);
    } else {
      setError("Error al crear la propiedad");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/inventario" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva propiedad</h1>
          <p className="text-gray-500 text-sm mt-0.5">Agregar propiedad al inventario</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Departamento 3 amb en Palermo con cochera"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            placeholder="Thames 1234"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barrio</label>
            <input
              type="text"
              value={form.barrio}
              onChange={(e) => setForm({ ...form, barrio: e.target.value })}
              placeholder="Palermo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
            <input
              type="text"
              value={form.zona}
              onChange={(e) => setForm({ ...form, zona: e.target.value })}
              placeholder="CABA Norte"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ambientes</label>
            <input
              type="number"
              value={form.ambientes}
              onChange={(e) => setForm({ ...form, ambientes: e.target.value })}
              min={1} max={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sup. (m²)</label>
            <input
              type="number"
              value={form.superficie}
              onChange={(e) => setForm({ ...form, superficie: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="75"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio publicado</label>
            <input
              type="number"
              value={form.precioPublicado}
              onChange={(e) => setForm({ ...form, precioPublicado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="120000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select
              value={form.moneda}
              onChange={(e) => setForm({ ...form, moneda: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo operación</label>
            <select
              value={form.tipoTransaccion}
              onChange={(e) => setForm({ ...form, tipoTransaccion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">% Comisión</label>
            <input
              type="number"
              step="0.5"
              value={form.porcentajeComision}
              onChange={(e) => setForm({ ...form, porcentajeComision: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="activa">Activa</option>
              <option value="en_negociacion">En negociación</option>
              <option value="reservada">Reservada</option>
              <option value="vendida">Vendida</option>
              <option value="retirada">Retirada</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Propietario (cliente)</label>
          <select
            value={form.clienteId}
            onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Sin propietario en la base...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link portal</label>
          <input
            type="url"
            value={form.linkPortal}
            onChange={(e) => setForm({ ...form, linkPortal: e.target.value })}
            placeholder="https://www.zonaprop.com.ar/..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="cochera"
            checked={form.cochera}
            onChange={(e) => setForm({ ...form, cochera: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="cochera" className="text-sm text-gray-700 cursor-pointer">Tiene cochera</label>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
        >
          <Building2 className="w-4 h-4" />
          {loading ? "Guardando..." : "Guardar propiedad"}
        </button>
      </form>
    </div>
  );
}
