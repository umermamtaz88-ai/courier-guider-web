import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId() {
  return crypto.randomUUID();
}

export function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return `${str.slice(0, max)}…`;
}
