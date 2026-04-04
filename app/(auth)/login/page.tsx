"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Waves } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "linear-gradient(135deg, #023E8A 0%, #0077B6 40%, #0096C7 70%, #00B4D8 100%)",
      }}
    >
      {/* Left: decorative ocean panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Wave circles */}
        {[200, 340, 480, 620].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: size,
              height: size,
              borderColor: "rgba(255,255,255,0.08)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
        <Waves className="w-16 h-16 text-white/30 mb-6 relative z-10" />
        <h2 className="text-4xl font-bold text-white relative z-10 text-center leading-tight">
          Tu negocio<br />inmobiliario<br />en un solo lugar.
        </h2>
        <p className="mt-4 text-white/60 text-center text-sm relative z-10 max-w-xs">
          Gestioná clientes, leads, reservas e inventario con claridad y eficiencia.
        </p>
      </div>

      {/* Right: login card */}
      <div
        className="w-full lg:w-[420px] flex items-center justify-center p-8"
        style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}
      >
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
              style={{ background: "linear-gradient(135deg, #0077B6, #00B4D8)" }}
            >
              <Waves className="w-5 h-5 text-white" />
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "#023E8A", letterSpacing: "-0.03em" }}
            >
              Bienvenido
            </h1>
            <p className="text-sm mt-1" style={{ color: "#90AFCC" }}>
              Ingresá a CRM Inmobiliario
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0077B6" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="agente@century21.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#0077B6" }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div
                className="px-4 py-2.5 rounded-xl text-xs font-medium"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  color: "#DC2626",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
              style={{ padding: "12px 18px", fontSize: "14px" }}
            >
              {loading ? "Ingresando..." : "Ingresar →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
