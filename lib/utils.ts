import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number | null | undefined, currency = "USD"): string {
  if (amount == null) return "-";
  if (currency === "USD") {
    return `USD ${amount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
  }
  return `$ ${amount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "-";
  const clean = phone.replace(/\D/g, "");
  return `+54 9 ${clean.slice(-10, -6)} ${clean.slice(-6)}`;
}

export function whatsappLink(phone: string | null | undefined): string {
  if (!phone) return "#";
  const clean = phone.replace(/\D/g, "");
  const num = clean.startsWith("54") ? clean : `549${clean.slice(-10)}`;
  return `https://wa.me/${num}`;
}
