export type Property = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: string;
  listingType: string;
  price: number;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  mainImageUrl: string | null;
  contactPhone: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
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

export const propertyTypeLabels: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  office: "مكتب",
  chalet: "شاليه",
  shop: "محل تجاري",
  land: "أرض",
};

export const listingTypeLabels: Record<string, string> = {
  sale: "للبيع",
  rent: "للإيجار",
};

export const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد المراجعة", color: "bg-yellow-500/20 text-yellow-300" },
  approved: { label: "منشور", color: "bg-green-500/20 text-green-300" },
  rejected: { label: "مرفوض", color: "bg-red-500/20 text-red-300" },
};

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

export function formatPrice(n: number): string {
  if (!n || n <= 0) return "السعر عند الطلب";
  return new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 0,
  }).format(n) + " جنيه";
}

export function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const m = Math.round(diffMs / 60_000);
  if (m < 1) return "دلوقتي";
  if (m < 60) return `من ${m} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return `من ${h} ساعة`;
  const days = Math.round(h / 24);
  if (days < 30) return `من ${days} يوم`;
  return d.toLocaleDateString("ar-EG");
}
