"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

type Lead = {
  id?: number;
  nombre?: string | null;
  telefono?: string | null;
  instagram?: string | null;
  email?: string | null;
  origen?: string;
  estado?: string;
  propiedadInteres?: string | null;
  notas?: string | null;
};

export default function LeadModal({
  lead,
  defaultOrigen,
  onClose,
  onSaved,
}: {
  lead: Lead | null;
  defaultOrigen: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!lead?.id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: lead?.nombre || "",
    telefono: lead?.telefono || "",
    instagram: lead?.instagram || "",
    email: lead?.email || "",
    origen: lead?.origen || defaultOrigen,
    estado: lead?.estado || "NUEVO",
    propiedadInteres: lead?.propiedadInteres || "",
    notas: lead?.notas || "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setLoading(true);
    try {
      const url = isEdit ? `/api/leads/${lead!.id}` : "/api/leads";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Lead actualizado" : "Lead creado");
      onSaved();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";
  const labelClass = "block text-xs font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{isEdit ? "Editar lead" : "Nuevo lead"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Nombre</label>
              <input className={inputClass} value={form.nombre} onChange={(e) => update("nombre", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input className={inputClass} value={form.telefono} onChange={(e) => update("telefono", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Instagram</label>
              <input className={inputClass} value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@usuario" />
            </div>
            <div>
              <label className={labelClass}>Origen</label>
              <select className={inputClass} value={form.origen} onChange={(e) => update("origen", e.target.value)}>
                <option value="INSTAGRAM_PAUTA">Instagram Pauta</option>
                <option value="C21">Century 21</option>
                <option value="ZONAPROP">ZonaProp</option>
                <option value="ARGENPROP">ArgenProp</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <select className={inputClass} value={form.estado} onChange={(e) => update("estado", e.target.value)}>
                <option value="NUEVO">Nuevo</option>
                <option value="CONTACTADO">Contactado</option>
                <option value="CALIFICADO">Calificado</option>
                <option value="CONVERTIDO">Convertido</option>
                <option value="DESCARTADO">Descartado</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Propiedad de interés</label>
              <input className={inputClass} value={form.propiedadInteres} onChange={(e) => update("propiedadInteres", e.target.value)} placeholder="Qué propiedad / video le interesó" />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Notas</label>
              <textarea className={`${inputClass} resize-none`} rows={3} value={form.notas} onChange={(e) => update("notas", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear lead"}
          </button>
        </div>
      </div>
    </div>
  );
}
