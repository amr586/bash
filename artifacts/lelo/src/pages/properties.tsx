import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { Footer } from "@/components/footer";
import { PropertyCard } from "@/components/property-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import {
  apiFetch,
  useAmenityLabels,
  useFinishingLabels,
  usePropertyTypeLabels,
  type Property,
} from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function PropertiesPage() {
  const { lang, t } = useLang();
  const search = useSearch();
  const initial = useMemo(() => new URLSearchParams(search), [search]);
  const propertyTypeLabels = usePropertyTypeLabels();
  const finishingLabels = useFinishingLabels();
  const amenityLabels = useAmenityLabels();

  const TYPE_OPTIONS = useMemo(
    () => [
      { value: "all", label: t("كل الأنواع", "All types") },
      ...Object.entries(propertyTypeLabels).map(([value, label]) => ({ value, label })),
    ],
    [propertyTypeLabels, t],
  );

  const FINISHING_OPTIONS = useMemo(
    () => [
      { value: "all", label: t("كل الأنواع", "All types") },
      ...Object.entries(finishingLabels).map(([value, label]) => ({ value, label })),
    ],
    [finishingLabels, t],
  );

  const ROOM_OPTIONS = useMemo(
    () => [
      { value: "all", label: t("أي عدد", "Any") },
      { value: "1", label: "1+" },
      { value: "2", label: "2+" },
      { value: "3", label: "3+" },
      { value: "4", label: "4+" },
      { value: "5", label: "5+" },
    ],
    [t],
  );

  const AMENITIES = useMemo(
    () =>
      (["furnished", "parking", "elevator", "pool", "garden", "basement"] as const).map((k) => ({
        key: k as keyof Property,
        label: amenityLabels[k] ?? k,
      })),
    [amenityLabels],
  );

  const [type, setType] = useState<string>(initial.get("type") || "all");
  const [q, setQ] = useState<string>(initial.get("q") || "");
  const [locationFilter, setLocationFilter] = useState<string>(
    initial.get("location") || "all",
  );
  const [priceMin, setPriceMin] = useState<string>(initial.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState<string>(initial.get("priceMax") || "");
  const [areaMin, setAreaMin] = useState<string>(initial.get("areaMin") || "");
  const [areaMax, setAreaMax] = useState<string>(initial.get("areaMax") || "");
  const [bedroomsMin, setBedroomsMin] = useState<string>(
    initial.get("bedroomsMin") || "all",
  );
  const [finishing, setFinishing] = useState<string>(
    initial.get("finishing") || "all",
  );
  const [amenities, setAmenities] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<Property[] | null>(null);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  useEffect(() => {
    setType(initial.get("type") || "all");
    setQ(initial.get("q") || "");
    setLocationFilter(initial.get("location") || "all");
    setPriceMin(initial.get("priceMin") || "");
    setPriceMax(initial.get("priceMax") || "");
    setAreaMin(initial.get("areaMin") || "");
    setAreaMax(initial.get("areaMax") || "");
  }, [initial]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    setItems(null);
    apiFetch<{ properties: Property[] }>(
      `/api/properties${params.toString() ? `?${params.toString()}` : ""}`,
    )
      .then((d) => setItems(d.properties))
      .catch(() => setItems([]));
  }, [type]);

  const locationOptions = useMemo(() => {
    if (!items) return [{ value: "all", label: t("كل المناطق", "All locations") }];
    const set = new Set<string>();
    for (const p of items) if (p.location) set.add(p.location.trim());
    return [
      { value: "all", label: t("كل المناطق", "All locations") },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b, lang === "ar" ? "ar" : "en"))
        .map((l) => ({ value: l, label: l })),
    ];
  }, [items, lang, t]);

  const filtered = useMemo(() => {
    if (!items) return null;
    const term = q.trim().toLowerCase();
    const pMin = priceMin ? Number(priceMin) : null;
    const pMax = priceMax ? Number(priceMax) : null;
    const aMin = areaMin ? Number(areaMin) : null;
    const aMax = areaMax ? Number(areaMax) : null;
    const bMin = bedroomsMin !== "all" ? Number(bedroomsMin) : null;
    const wantedAmenities = AMENITIES.filter((a) => amenities[a.key as string]);
    return items.filter((p) => {
      if (term) {
        const hit = [p.title, p.location, p.description]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(term));
        if (!hit) return false;
      }
      if (locationFilter !== "all" && p.location !== locationFilter) return false;
      if (pMin != null && Number(p.price) < pMin) return false;
      if (pMax != null && Number(p.price) > pMax) return false;
      if (aMin != null && (p.area == null || p.area < aMin)) return false;
      if (aMax != null && (p.area == null || p.area > aMax)) return false;
      if (bMin != null && (p.bedrooms == null || p.bedrooms < bMin)) return false;
      if (finishing !== "all" && p.finishing !== finishing) return false;
      for (const a of wantedAmenities) {
        if (!(p as unknown as Record<string, boolean>)[a.key as string])
          return false;
      }
      return true;
    });
  }, [
    items,
    q,
    locationFilter,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    bedroomsMin,
    finishing,
    amenities,
    AMENITIES,
  ]);

  function resetFilters() {
    setType("all");
    setQ("");
    setLocationFilter("all");
    setPriceMin("");
    setPriceMax("");
    setAreaMin("");
    setAreaMax("");
    setBedroomsMin("all");
    setFinishing("all");
    setAmenities({});
  }

  const activeFilterCount = [
    type !== "all",
    locationFilter !== "all",
    priceMin !== "",
    priceMax !== "",
    areaMin !== "",
    areaMax !== "",
    bedroomsMin !== "all",
    finishing !== "all",
    ...AMENITIES.map((a) => Boolean(amenities[a.key as string])),
  ].filter(Boolean).length;

  const isAr = lang === "ar";
  const sideMargin = isAr ? "ml-1" : "mr-1";
  const searchIconPos = isAr ? "right-3" : "left-3";
  const inputPad = isAr ? "pr-9" : "pl-9";

  const filterPanel = (
    <Card className="border-border/40 bg-background/60 backdrop-blur sticky top-24">
      <CardContent className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" style={{ color: "var(--gold)" }} />
            {t("فلاتر", "Filters")}
          </h3>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-foreground/60 hover:text-foreground inline-flex items-center gap-1"
              data-testid="button-reset-filters"
            >
              <X className="h-3 w-3" />
              {t("مسح", "Clear")} ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="grid gap-2">
          <Label className="text-xs">{t("نوع الوحدة", "Property type")}</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger data-testid="filter-type">
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
        </div>

        <div className="grid gap-2">
          <Label className="text-xs">{t("المنطقة", "Location")}</Label>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger data-testid="filter-location">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label className="text-xs">{t("عدد الغرف", "Bedrooms")}</Label>
          <Select value={bedroomsMin} onValueChange={setBedroomsMin}>
            <SelectTrigger data-testid="filter-bedrooms">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label className="text-xs">{t("التشطيب", "Finishing")}</Label>
          <Select value={finishing} onValueChange={setFinishing}>
            <SelectTrigger data-testid="filter-finishing">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FINISHING_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label className="text-xs">{t("السعر (جنيه)", "Price (EGP)")}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="0"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder={t("من", "From")}
              dir="ltr"
              className={`${isAr ? "text-right" : "text-left"} text-sm`}
              data-testid="filter-price-min"
            />
            <Input
              type="number"
              min="0"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder={t("إلى", "To")}
              dir="ltr"
              className={`${isAr ? "text-right" : "text-left"} text-sm`}
              data-testid="filter-price-max"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="text-xs">{t("المساحة (م²)", "Area (m²)")}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="0"
              value={areaMin}
              onChange={(e) => setAreaMin(e.target.value)}
              placeholder={t("من", "From")}
              dir="ltr"
              className={`${isAr ? "text-right" : "text-left"} text-sm`}
              data-testid="filter-area-min"
            />
            <Input
              type="number"
              min="0"
              value={areaMax}
              onChange={(e) => setAreaMax(e.target.value)}
              placeholder={t("إلى", "To")}
              dir="ltr"
              className={`${isAr ? "text-right" : "text-left"} text-sm`}
              data-testid="filter-area-max"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="text-xs">{t("المميزات", "Amenities")}</Label>
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES.map((a) => {
              const k = a.key as string;
              return (
                <label
                  key={k}
                  className="flex items-center gap-2 cursor-pointer text-xs py-1"
                >
                  <Checkbox
                    checked={amenities[k] ?? false}
                    onCheckedChange={(v) =>
                      setAmenities((prev) => ({ ...prev, [k]: v === true }))
                    }
                    data-testid={`filter-amenity-${k}`}
                  />
                  <span>{a.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <main
        dir={isAr ? "rtl" : "ltr"}
        className="pt-24 pb-16"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
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
              {t("تصفّح العقارات", "Browse Properties")}
            </h1>
            <p className="text-foreground/70 mt-2 max-w-xl mx-auto">
              {t(
                "ابحث، قارن وتواصل معنا في أي وقت.",
                "Search, compare, and reach out to us anytime.",
              )}
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <aside className="hidden lg:block">{filterPanel}</aside>

            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="relative flex-1">
                  <Search className={`absolute ${searchIconPos} top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50`} />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("ابحث بالعنوان أو المنطقة...", "Search by title or location…")}
                    className={inputPad}
                    data-testid="input-search-properties"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="lg:hidden rounded-xl"
                  onClick={() => setFiltersOpen((o) => !o)}
                  data-testid="button-toggle-filters"
                >
                  <SlidersHorizontal className={`${sideMargin} h-4 w-4`} />
                  {t("فلاتر", "Filters")}
                  {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </Button>
              </div>

              {filtersOpen && (
                <div className="lg:hidden mb-5">{filterPanel}</div>
              )}

              {filtered == null ? (
                <div className="py-24 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-foreground/70 mb-4">
                    {t(
                      "مفيش عقارات مطابقة للفلاتر دلوقتي.",
                      "No properties match these filters right now.",
                    )}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="rounded-xl"
                    >
                      {t("مسح الفلاتر", "Clear filters")}
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link href="/">{t("العودة للرئيسية", "Back to Home")}</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-foreground/60 mb-3">
                    {t(
                      `${filtered.length} عقار مطابق`,
                      `${filtered.length} matching ${filtered.length === 1 ? "property" : "properties"}`,
                    )}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((p) => (
                      <PropertyCard key={p.id} property={p} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
