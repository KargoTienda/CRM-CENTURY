"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

const IMPORT_TYPES = [
  {
    id: "clientes",
    label: "Base de clientes",
    desc: "Hoja 'Datos clientes' — nombre, teléfono, zona, búsqueda...",
    archivo: "BASE DATOS CLIENTES.xlsx",
  },
  {
    id: "reservas",
    label: "Reservas",
    desc: "Hoja 'Reservas' — historial de reservas con comisiones",
    archivo: "BASE DATOS CLIENTES.xlsx",
  },
  {
    id: "preListing",
    label: "Pre-listing",
    desc: "Hoja 'Pre-listing' — propiedades a captar",
    archivo: "BASE DATOS CLIENTES.xlsx",
  },
  {
    id: "datosC21",
    label: "Datos C21",
    desc: "Hoja 'DATOS C21' — leads de Century 21",
    archivo: "BASE DATOS CLIENTES.xlsx",
  },
  {
    id: "milAires",
    label: "Mil Aires (leads)",
    desc: "Hoja 'MIL AIRES' — leads del proyecto Mil Aires",
    archivo: "Isolina y Mil aires.xlsx",
  },
  {
    id: "isolina",
    label: "Isolina (leads)",
    desc: "Hoja 'ISOLINA' — leads del proyecto Isolina",
    archivo: "Isolina y Mil aires.xlsx",
  },
];

type Result = { imported: number; skipped: number; errors: string[] };

export default function ImportPage() {
  const [tipo, setTipo] = useState(IMPORT_TYPES[0].id);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const selectedType = IMPORT_TYPES.find((t) => t.id === tipo)!;

  async function handleImport() {
    if (!file) { toast.error("Seleccioná un archivo"); return; }
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("tipo", tipo);
    formData.append("file", file);

    try {
      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error importando");
        return;
      }
      setResult(data);
      toast.success(`Importación completada: ${data.imported} registros`);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importar Excel</h1>
        <p className="text-gray-500 mt-1">Importá tus datos existentes desde los archivos Excel</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Qué querés importar?
          </label>
          <div className="grid gap-2">
            {IMPORT_TYPES.map((t) => (
              <label
                key={t.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  tipo === t.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={t.id}
                  checked={tipo === t.id}
                  onChange={() => setTipo(t.id)}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                  <p className="text-xs text-blue-600 mt-0.5">Archivo: {t.archivo}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccioná el archivo <span className="text-gray-400">({selectedType.archivo})</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              {file ? file.name : "Arrastrá el archivo o hacé clic para seleccionar"}
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Elegir archivo
            </label>
          </div>
        </div>

        <button
          onClick={handleImport}
          disabled={loading || !file}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
        >
          {loading ? "Importando..." : "Iniciar importación"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Resultado</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-800">{result.imported}</p>
                <p className="text-xs text-green-600">Importados</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-semibold text-gray-700">{result.skipped}</p>
                <p className="text-xs text-gray-500">Omitidos (duplicados o vacíos)</p>
              </div>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-2">Errores ({result.errors.length}):</p>
              <ul className="space-y-1">
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i} className="text-xs text-red-700">{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
