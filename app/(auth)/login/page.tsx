"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,168,76,0.08) 0%, var(--bg-base) 60%)",
        backgroundColor: "var(--bg-base)",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-sm px-4">
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--bg-card)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                boxShadow: "0 8px 24px rgba(201,168,76,0.35)",
              }}
            >
              <Building2 className="w-6 h-6" style={{ color: "#07080D" }} />
            </div>
            <h1
              className="text-xl font-semibold"
              style={{ color: "#EDEAE3", letterSpacing: "-0.02em" }}
            >
              CRM Inmobiliario
            </h1>
            <p className="text-sm mt-1" style={{ color: "#47455A" }}>
              Ingresá a tu cuenta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#8A8799" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-primary)",
                }}
                placeholder="agente@century21.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#8A8799" }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-primary)",
                }}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div
                className="px-4 py-2.5 rounded-lg text-xs"
                style={{ background: "rgba(248,113,113,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all mt-2"
              style={{
                background: loading
                  ? "rgba(201,168,76,0.5)"
                  : "linear-gradient(135deg, #C9A84C, #E8C97A)",
                color: "#07080D",
                boxShadow: loading ? "none" : "0 4px 16px rgba(201,168,76,0.25)",
              }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
