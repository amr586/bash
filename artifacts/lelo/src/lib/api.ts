export type PropertyFinishing = "full" | "semi" | "three_quarters" | "super_lux";

export type Property = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: string;
  listingType: string;
  price: number;
  location: string;
  addressDetails: string | null;
  downPayment: string | null;
  deliveryStatus: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  floor: number | null;
  furnished: boolean;
  parking: boolean;
  elevator: boolean;
  pool: boolean;
  garden: boolean;
  basement: boolean;
  finishing: PropertyFinishing | null;
  featured: boolean;
  mainImageUrl: string | null;
  imageUrls: string[];
  floorPlanUrls: string[];
  mapsLink: string | null;
  contactPhone: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export const finishingLabels: Record<PropertyFinishing, string> = {
  full: "تشطيب كامل",
  semi: "نص تشطيب",
  three_quarters: "3/4 تشطيب",
  super_lux: "سوبر لوكس",
};

const finishingLabelsEn: Record<PropertyFinishing, string> = {
  full: "Fully finished",
  semi: "Semi-finished",
  three_quarters: "3/4 finished",
  super_lux: "Super lux",
};

export const amenityLabels: Record<string, string> = {
  furnished: "مفروش",
  parking: "موقف سيارات",
  elevator: "مصعد",
  pool: "حمام سباحة",
  garden: "حديقة",
  basement: "بيزمنت",
};

const amenityLabelsEn: Record<string, string> = {
  furnished: "Furnished",
  parking: "Parking",
  elevator: "Elevator",
  pool: "Pool",
  garden: "Garden",
  basement: "Basement",
};

export type ContactRequest = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  propertyId: string | null;
  propertyTitle: string | null;
  isRead: boolean;
  createdAt: string;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
};

import { useLang } from "./i18n";

export const propertyTypeLabels: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  office: "مكتب",
  chalet: "شاليه",
  shop: "محل تجاري",
  land: "أرض",
};

const propertyTypeLabelsEn: Record<string, string> = {
  apartment: "Apartment",
  villa: "Villa",
  office: "Office",
  chalet: "Chalet",
  shop: "Shop",
  land: "Land",
};

export const listingTypeLabels: Record<string, string> = {
  sale: "للبيع",
};

const listingTypeLabelsEn: Record<string, string> = {
  sale: "For Sale",
};

export function usePropertyTypeLabels(): Record<string, string> {
  const { lang } = useLang();
  return lang === "ar" ? propertyTypeLabels : propertyTypeLabelsEn;
}

export function useListingTypeLabels(): Record<string, string> {
  const { lang } = useLang();
  return lang === "ar" ? listingTypeLabels : listingTypeLabelsEn;
}

export const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد المراجعة", color: "bg-yellow-500/20 text-yellow-300" },
  approved: { label: "منشور", color: "bg-green-500/20 text-green-300" },
  rejected: { label: "مرفوض", color: "bg-red-500/20 text-red-300" },
};

const statusLabelsEn: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-300" },
  approved: { label: "Published", color: "bg-green-500/20 text-green-300" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-300" },
};

export function useStatusLabels(): Record<string, { label: string; color: string }> {
  const { lang } = useLang();
  return lang === "ar" ? statusLabels : statusLabelsEn;
}

export function useFinishingLabels(): Record<PropertyFinishing, string> {
  const { lang } = useLang();
  return lang === "ar" ? finishingLabels : finishingLabelsEn;
}

export function useAmenityLabels(): Record<string, string> {
  const { lang } = useLang();
  return lang === "ar" ? amenityLabels : amenityLabelsEn;
}

export async function addFavorite(propertyId: string): Promise<void> {
  await apiFetch(`/api/favorites/${propertyId}`, { method: "POST" });
}

export async function removeFavorite(propertyId: string): Promise<void> {
  await apiFetch(`/api/favorites/${propertyId}`, { method: "DELETE" });
}

export async function fetchFavoriteIds(): Promise<Set<string>> {
  try {
    const data = await apiFetch<{ ids: string[] }>("/api/me/favorites/ids");
    return new Set(data.ids);
  } catch {
    return new Set();
  }
}

export async function apiFetch<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

/**
 * Resolve a stored image reference to a renderable URL.
 * - Full URLs (http/https) pass through.
 * - Object storage paths (`/objects/...`) are routed through `/api/storage`.
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/objects/")) return `/api/storage${url}`;
  return url;
}

export function formatPrice(n: number, lang: "ar" | "en" = "ar"): string {
  if (!n || n <= 0) return lang === "ar" ? "السعر عند الطلب" : "Price on request";
  if (lang === "en") {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(n) + " EGP";
  }
  return new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 0,
  }).format(n) + " جنيه";
}

export function useFormatPrice(): (n: number) => string {
  const { lang } = useLang();
  return (n: number) => formatPrice(n, lang);
}

export function formatRelative(iso: string, lang: "ar" | "en" = "ar"): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const m = Math.round(diffMs / 60_000);
  if (lang === "en") {
    if (m < 1) return "just now";
    if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} h ago`;
    const days = Math.round(h / 24);
    if (days < 30) return `${days} d ago`;
    return d.toLocaleDateString("en-US");
  }
  if (m < 1) return "دلوقتي";
  if (m < 60) return `من ${m} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return `من ${h} ساعة`;
  const days = Math.round(h / 24);
  if (days < 30) return `من ${days} يوم`;
  return d.toLocaleDateString("ar-EG");
}
