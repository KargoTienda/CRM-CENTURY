"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

type Cliente = {
  id?: number;
  nombre?: string;
  telefono?: string | null;
  instagram?: string | null;
  email?: string | null;
  zona?: string | null;
  modoPago?: string | null;
  tipoBuscado?: string | null;
  valorPresupuesto?: number | null;
  ambientes?: number | null;
  origen?: string | null;
  estadoBusqueda?: string;
  tarea?: string | null;
  notas?: string | null;
};

export default function ClienteModal({
  cliente,
  onClose,
  onSaved,
}: {
  cliente: Cliente | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!cliente?.id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: cliente?.nombre || "",
    telefono: cliente?.telefono || "",
    instagram: cliente?.instagram || "",
    email: cliente?.email || "",
    zona: cliente?.zona || "",
    modoPago: cliente?.modoPago || "",
    tipoBuscado: cliente?.tipoBuscado || "",
    valorPresupuesto: cliente?.valorPresupuesto?.toString() || "",
    ambientes: cliente?.ambientes?.toString() || "",
    origen: cliente?.origen || "",
    estadoBusqueda: cliente?.estadoBusqueda || "activo",
    tarea: cliente?.tarea || "",
    notas: cliente?.notas || "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setLoading(true);
    try {
      const url = isEdit ? `/api/clientes/${cliente!.id}` : "/api/clientes";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error guardando");
      toast.success(isEdit ? "Cliente actualizado" : "Cliente creado");
      onSaved();
    } catch {
      toast.error("Error al guardar el cliente");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            {isEdit ? "Editar cliente" : "Nuevo cliente"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Datos personales */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos personales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Nombre *</label>
                <input className={inputClass} value={form.nombre} onChange={(e) => update("nombre", e.target.value)} placeholder="Nombre completo" />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input className={inputClass} value={form.telefono} onChange={(e) => update("telefono", e.target.value)} placeholder="11 1234-5678" />
              </div>
              <div>
                <label className={labelClass}>Instagram</label>
                <input className={inputClass} value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@usuario" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} type="email" />
              </div>
              <div>
                <label className={labelClass}>Origen</label>
                <select className={inputClass} value={form.origen} onChange={(e) => update("origen", e.target.value)}>
                  <option value="">Seleccionar</option>
                  <option value="IG">Instagram</option>
                  <option value="C21">Century 21</option>
                  <option value="referido">Referido</option>
                  <option value="portal">Portal</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Perfil de búsqueda */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Perfil de búsqueda</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Zona</label>
                <input className={inputClass} value={form.zona} onChange={(e) => update("zona", e.target.value)} placeholder="Caballito, Palermo..." />
              </div>
              <div>
                <label className={labelClass}>Modo de pago</label>
                <select className={inputClass} value={form.modoPago} onChange={(e) => update("modoPago", e.target.value)}>
                  <option value="">Seleccionar</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="credito">Crédito hipotecario</option>
                  <option value="permuta">Permuta</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Tipo de propiedad buscada</label>
                <input className={inputClass} value={form.tipoBuscado} onChange={(e) => update("tipoBuscado", e.target.value)} placeholder="Departamento 3 amb, PH con terraza..." />
              </div>
              <div>
                <label className={labelClass}>Presupuesto (USD)</label>
                <input className={inputClass} value={form.valorPresupuesto} onChange={(e) => update("valorPresupuesto", e.target.value)} type="number" placeholder="150000" />
              </div>
              <div>
                <label className={labelClass}>Ambientes</label>
                <input className={inputClass} value={form.ambientes} onChange={(e) => update("ambientes", e.target.value)} type="number" placeholder="3" />
              </div>
            </div>
          </div>

          {/* Gestión */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Gestión</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Estado</label>
                <select className={inputClass} value={form.estadoBusqueda} onChange={(e) => update("estadoBusqueda", e.target.value)}>
                  <option value="activo">Activo</option>
                  <option value="pausado">Pausado</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Tarea pendiente</label>
                <input className={inputClass} value={form.tarea} onChange={(e) => update("tarea", e.target.value)} placeholder="Llamar, enviar opciones..." />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Notas / Historial</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={form.notas}
                  onChange={(e) => update("notas", e.target.value)}
                  placeholder="Historial de contacto, observaciones..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}
