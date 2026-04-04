"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Instagram,
  Globe,
  FolderKanban,
  Search,
  Building2,
  FileText,
  Upload,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/leads/instagram", label: "Leads Instagram", icon: Instagram },
  { href: "/leads/portales", label: "Leads Portales", icon: Globe },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/busquedas", label: "Búsquedas", icon: Search },
  { href: "/inventario", label: "Inventario", icon: Building2 },
  { href: "/reservas", label: "Reservas", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 flex flex-col z-50"
      style={{
        background: "linear-gradient(180deg, #0A0B12 0%, #07080D 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)", boxShadow: "0 4px 14px rgba(201,168,76,0.3)" }}
          >
            <Building2 className="w-4 h-4" style={{ color: "#07080D" }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#EDEAE3", letterSpacing: "0.02em" }}>CRM</p>
            <p className="text-xs" style={{ color: "#47455A" }}>Inmobiliario</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#47455A" }}>
          Navegación
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                    active
                      ? "font-medium"
                      : "hover:bg-white/[0.04]"
                  )}
                  style={active ? {
                    background: "rgba(201,168,76,0.12)",
                    color: "#C9A84C",
                    borderLeft: "2px solid #C9A84C",
                  } : {
                    color: "#8A8799",
                    borderLeft: "2px solid transparent",
                  }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#47455A" }}>
            Admin
          </p>
          <Link
            href="/admin/import"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
              pathname.startsWith("/admin")
                ? "font-medium"
                : "hover:bg-white/[0.04]"
            )}
            style={pathname.startsWith("/admin") ? {
              background: "rgba(201,168,76,0.12)",
              color: "#C9A84C",
              borderLeft: "2px solid #C9A84C",
            } : {
              color: "#8A8799",
              borderLeft: "2px solid transparent",
            }}
          >
            <Upload className="w-4 h-4" />
            Importar Excel
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 w-full hover:bg-white/[0.04]"
          style={{ color: "#47455A" }}
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
