import type { Role } from "./types";

export function formatMoney(cents: number) {
  return `Le ${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function roleHome(role: Role) {
  if (role === "seller") return "seller" as const;
  if (role === "driver") return "driver" as const;
  if (role === "admin") return "admin" as const;
  return "customer" as const;
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || `item-${Date.now()}`;
}
