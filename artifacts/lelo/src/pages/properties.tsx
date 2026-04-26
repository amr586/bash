import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PropertyCard } from "@/components/property-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import {
  apiFetch,
  listingTypeLabels,
  propertyTypeLabels,
  type Property,
} from "@/lib/api";

const TYPE_OPTIONS = [
  { value: "all", label: "كل الأنواع" },
  ...Object.entries(propertyTypeLabels).map(([value, label]) => ({ value, label })),
];

const LISTING_OPTIONS = [
  { value: "all", label: "بيع وإيجار" },
  ...Object.entries(listingTypeLabels).map(([value, label]) => ({ value, label })),
];

export default function PropertiesPage() {
  const search = useSearch();
  const initial = useMemo(() => new URLSearchParams(search), [search]);
  const [type, setType] = useState<string>(initial.get("type") || "all");
  const [listing, setListing] = useState<string>(
    initial.get("listing") || "all",
  );
  const [q, setQ] = useState<string>(initial.get("q") || "");
  const [items, setItems] = useState<Property[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (listing !== "all") params.set("listingType", listing);
    setItems(null);
    apiFetch<{ properties: Property[] }>(
      `/api/properties${params.toString() ? `?${params.toString()}` : ""}`,
    )
      .then((d) => setItems(d.properties))
      .catch(() => setItems([]));
  }, [type, listing]);

  const filtered = useMemo(() => {
    if (!items) return null;
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((p) =>
      [p.title, p.location, p.description]
        .filter(Boolean)
        .some((s) => s.toLowerCase().includes(term)),
    );
  }, [items, q]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main
        dir="rtl"
        className="pt-24 pb-16"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span
              className="text-xs uppercase tracking-[0.3em] font-semibold"
              style={{ color: "var(--gold)" }}
            >
              All Properties
            </span>
            <h1
              className="text-3xl md:text-4xl font-bold mt-2"
              style={{ color: "var(--gold-light)" }}
            >
              جميع العقارات
            </h1>
            <p className="text-foreground/70 mt-2 max-w-xl mx-auto">
              اضغط على أي عقار تشوف تفاصيله وتقدر تبعت طلب تواصل مباشرة.
            </p>
          </div>

          <div className="grid md:grid-cols-[1fr_180px_180px] gap-3 mb-8 max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث بالعنوان أو المنطقة..."
                className="pr-9"
              />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={listing} onValueChange={setListing}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LISTING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered == null ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-foreground/70 mb-4">
                مفيش عقارات مطابقة للفلاتر دلوقتي.
              </p>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/">العودة للرئيسية</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
