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
    <aside
      className="fixed inset-y-0 left-0 w-60 flex flex-col z-50"
      style={{ background: "linear-gradient(180deg, #2A282A 0%, #3C3A3C 60%, #4A484A 100%)" }}
    >
      {/* Subtle gold top border */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, #BEAF87, #D4C9A8, #BEAF87)" }} />

      {/* Logo */}
      <div
        className="relative px-5 py-5"
        style={{ borderBottom: "1px solid rgba(190,175,135,0.15)" }}
      >
        <div className="flex items-center gap-3">
          {/* C21 Logo mark */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#BEAF87" }}
          >
            <span className="font-bold text-sm" style={{ color: "#3C3A3C", letterSpacing: "-0.02em", fontFamily: "'Barlow Semi Condensed', sans-serif" }}>
              C21
            </span>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#E6E7E8", letterSpacing: "0.02em" }}>
              CENTURY 21
            </p>
            <p className="text-xs" style={{ color: "#BEAF87" }}>
              CRM Inmobiliario
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 overflow-y-auto py-4 px-3">
        <p
          className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "rgba(190,175,135,0.5)" }}
        >
          Menú
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
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                    active ? "nav-active font-semibold" : "nav-inactive"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          className="mt-5 pt-4"
          style={{ borderTop: "1px solid rgba(190,175,135,0.1)" }}
        >
          <p
            className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "rgba(190,175,135,0.5)" }}
          >
            Admin
          </p>
          <Link
            href="/admin/import"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
              pathname.startsWith("/admin") ? "nav-active font-semibold" : "nav-inactive"
            )}
          >
            <Upload className="w-4 h-4" />
            Importar Excel
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div
        className="relative px-3 py-4"
        style={{ borderTop: "1px solid rgba(190,175,135,0.1)" }}
      >
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all nav-inactive"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
