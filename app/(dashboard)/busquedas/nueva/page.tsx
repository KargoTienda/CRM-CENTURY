"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ZonaMapSelector = dynamic(() => import("@/components/busquedas/ZonaMapSelector"), {
  ssr: false,
  loading: () => <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />,
});

interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
}

const TIPOS = ["departamento", "casa", "ph", "local", "oficina", "terreno"];
const MODOS_PAGO = ["efectivo", "credito", "permuta"];

export default function NuevaBusquedaPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    clienteId: "",
    zonas: [] as string[],
    tipoPropiedad: "departamento",
    ambientesMin: "",
    ambientesMax: "",
    precioMin: "",
    precioMax: "",
    modoPago: "efectivo",
    cochera: false,
    aptoCredito: false,
    requisitosExtra: "",
  });

  useEffect(() => {
    fetch("/api/clientes?limit=500")
      .then((r) => r.json())
      .then((data) => setClientes(Array.isArray(data) ? data : data.clientes || []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clienteId) { setError("Seleccioná un cliente"); return; }
    if (form.zonas.length === 0) { setError("Seleccioná al menos un barrio en el mapa"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/busquedas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clienteId: form.clienteId,
        zonas: form.zonas,
        tipoPropiedad: form.tipoPropiedad,
        ambientesMin: form.ambientesMin || null,
        ambientesMax: form.ambientesMax || null,
        precioMin: form.precioMin || null,
        precioMax: form.precioMax || null,
        modoPago: form.modoPago,
        cochera: form.cochera,
        aptoCredito: form.aptoCredito,
        requisitosExtra: form.requisitosExtra || null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/busquedas/${data.id}`);
    } else {
      setError("Error al crear la búsqueda");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/busquedas" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva búsqueda</h1>
          <p className="text-gray-500 text-sm mt-0.5">Perfil de búsqueda para un cliente comprador</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
          <select
            value={form.clienteId}
            onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Seleccioná un cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.telefono ? `— ${c.telefono}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Mapa de barrios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Barrios / Zonas *{" "}
            {form.zonas.length > 0 && (
              <span className="text-blue-600 font-normal">({form.zonas.length} seleccionados)</span>
            )}
          </label>
          <ZonaMapSelector
            value={form.zonas}
            onChange={(zonas) => setForm({ ...form, zonas })}
          />
        </div>

        {/* Tipo + Ambientes */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={form.tipoPropiedad}
              onChange={(e) => setForm({ ...form, tipoPropiedad: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amb. mín.</label>
            <input
              type="number"
              value={form.ambientesMin}
              onChange={(e) => setForm({ ...form, ambientesMin: e.target.value })}
              min={1} max={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amb. máx.</label>
            <input
              type="number"
              value={form.ambientesMax}
              onChange={(e) => setForm({ ...form, ambientesMax: e.target.value })}
              min={1} max={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="5"
            />
          </div>
        </div>

        {/* Precios */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio mín. (USD)</label>
            <input
              type="number"
              value={form.precioMin}
              onChange={(e) => setForm({ ...form, precioMin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio máx. (USD)</label>
            <input
              type="number"
              value={form.precioMax}
              onChange={(e) => setForm({ ...form, precioMax: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="150000"
            />
          </div>
        </div>

        {/* Modo pago + checkboxes */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modo pago</label>
            <select
              value={form.modoPago}
              onChange={(e) => setForm({ ...form, modoPago: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {MODOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.cochera}
                onChange={(e) => setForm({ ...form, cochera: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Cochera</span>
            </label>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.aptoCredito}
                onChange={(e) => setForm({ ...form, aptoCredito: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Apto crédito</span>
            </label>
          </div>
        </div>

        {/* Requisitos extra */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos adicionales</label>
          <textarea
            value={form.requisitosExtra}
            onChange={(e) => setForm({ ...form, requisitosExtra: e.target.value })}
            rows={3}
            placeholder="Luminoso, piso alto, cerca de subte, mascotas permitidas..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
        >
          <Search className="w-4 h-4" />
          {loading ? "Creando..." : "Crear búsqueda"}
        </button>
      </form>
    </div>
  );
}
