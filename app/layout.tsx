import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "CRM Inmobiliario",
  description: "Sistema de gestión para agentes inmobiliarios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
