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
      style={{ background: "linear-gradient(135deg, #2A282A 0%, #3C3A3C 50%, #4A484A 100%)" }}
    >
      {/* Left: decorative panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Gold circle rings */}
        {[200, 340, 480, 620].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: size,
              height: size,
              borderColor: "rgba(190,175,135,0.1)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
        {/* C21 logo mark */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 relative z-10"
          style={{ background: "#BEAF87" }}
        >
          <span className="text-2xl font-bold" style={{ color: "#3C3A3C", fontFamily: "'Barlow Semi Condensed', sans-serif" }}>C21</span>
        </div>
        <h2 className="text-4xl font-bold relative z-10 text-center leading-tight" style={{ color: "#E6E7E8" }}>
          Tu negocio<br />inmobiliario<br />en un solo lugar.
        </h2>
        <p className="mt-4 text-center text-sm relative z-10 max-w-xs" style={{ color: "rgba(190,175,135,0.7)" }}>
          Gestioná clientes, leads, reservas e inventario con claridad y eficiencia.
        </p>
      </div>

      {/* Right: login card */}
      <div
        className="w-full lg:w-[420px] flex items-center justify-center p-8"
        style={{ background: "#FFFFFF" }}
      >
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-10">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5"
              style={{ background: "#BEAF87" }}
            >
              <span className="text-lg font-bold" style={{ color: "#3C3A3C", fontFamily: "'Barlow Semi Condensed', sans-serif" }}>C21</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A", letterSpacing: "-0.03em" }}>
              Bienvenido
            </h1>
            <p className="text-sm mt-1" style={{ color: "#808285" }}>
              Ingresá a CRM Inmobiliario
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3C3A3C" }}>
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
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#3C3A3C" }}>
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
                  background: "rgba(192,57,43,0.08)",
                  color: "#C0392B",
                  border: "1px solid rgba(192,57,43,0.2)",
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
