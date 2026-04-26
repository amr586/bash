import { useState } from "react";
import { useLocation } from "wouter";
import { Search, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { listingTypeLabels } from "@/lib/api";

const LISTING_TABS: { value: string; label: string }[] = [
  { value: "all", label: "الكل" },
  ...Object.entries(listingTypeLabels).map(([value, label]) => ({
    value,
    label,
  })),
];

const QUICK_LOCATIONS = [
  "التجمع الخامس",
  "جولدن سكوير",
  "العاصمة الإدارية",
  "التجمع السادس",
  "مصر الجديدة",
  "الشيخ زايد",
];

export function PropertySearch() {
  const [, setLocation] = useLocation();
  const [listing, setListing] = useState<string>("all");
  const [q, setQ] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);

  const goToResults = (overrides?: Record<string, string>) => {
    const params = new URLSearchParams();
    if (listing !== "all") params.set("listing", listing);
    if (q.trim()) params.set("q", q.trim());
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (areaMin) params.set("areaMin", areaMin);
    if (areaMax) params.set("areaMax", areaMax);
    if (overrides) {
      for (const [k, v] of Object.entries(overrides)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
    }
    const qs = params.toString();
    setLocation(`/properties${qs ? `?${qs}` : ""}`);
  };

  return (
    <section
      dir="rtl"
      className="relative z-20 -mt-16 md:-mt-20 mb-16 px-4"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-6">
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{ color: "var(--gold-light)" }}
          >
            ابحث عن منزل أحلامك
            <br className="md:hidden" />
            <span className="md:mr-2"> في قلب القاهرة</span>
          </h2>
          <p className="text-foreground/70 mt-2">
            أكثر من 100 عقار في مختلف الأماكن · ابحث، قارن وتواصل معنا.
          </p>
        </div>

        <div
          className="rounded-2xl border backdrop-blur-md p-4 md:p-6 shadow-2xl"
          style={{
            background: "rgba(20, 20, 20, 0.85)",
            borderColor: "rgba(212, 175, 55, 0.25)",
          }}
        >
          {/* Listing tabs */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto">
            {LISTING_TABS.map((tab) => {
              const active = tab.value === listing;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setListing(tab.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    active
                      ? "text-black"
                      : "text-foreground/70 hover:text-[var(--gold-light)]"
                  }`}
                  style={
                    active
                      ? { background: "var(--gold)" }
                      : {
                          border: "1px solid rgba(212, 175, 55, 0.25)",
                          background: "rgba(255,255,255,0.02)",
                        }
                  }
                  data-testid={`tab-listing-${tab.value}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search row */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50 pointer-events-none" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goToResults();
                }}
                placeholder="ابحث بالموقع أو نوع العقار..."
                className="pr-9 h-11"
                data-testid="input-search"
              />
            </div>
            <Button
              onClick={() => goToResults()}
              className="h-11 px-6 text-black font-semibold"
              style={{ background: "var(--gold)" }}
              data-testid="button-search"
            >
              <Search className="ml-2 h-4 w-4" />
              بحث
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-4 rounded-md"
              onClick={() => setShowAdvanced((v) => !v)}
              data-testid="button-toggle-advanced"
            >
              {showAdvanced ? (
                <>
                  <ChevronUp className="ml-2 h-4 w-4" />
                  إخفاء
                </>
              ) : (
                <>
                  <ChevronDown className="ml-2 h-4 w-4" />
                  المزيد
                </>
              )}
            </Button>
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="mt-5 pt-5 border-t border-white/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-foreground/60 mb-1 block">
                    السعر الأدنى
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="من"
                    data-testid="input-price-min"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground/60 mb-1 block">
                    السعر الأقصى
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="إلى"
                    data-testid="input-price-max"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground/60 mb-1 block">
                    المساحة (م²)
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={areaMin}
                    onChange={(e) => setAreaMin(e.target.value)}
                    placeholder="من"
                    data-testid="input-area-min"
                  />
                </div>
                <div>
                  <label className="text-xs text-foreground/60 mb-1 block">
                    المساحة (م²)
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={areaMax}
                    onChange={(e) => setAreaMax(e.target.value)}
                    placeholder="إلى"
                    data-testid="input-area-max"
                  />
                </div>
              </div>

              {/* Quick locations */}
              <div className="mt-5">
                <div className="text-xs text-foreground/60 mb-2 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  مناطق سريعة
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => goToResults({ q: loc })}
                      className="px-3 py-1.5 rounded-full text-sm text-foreground/85 hover:text-black hover:bg-[var(--gold)] transition-all"
                      style={{
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                      data-testid={`chip-location-${loc}`}
                    >
                      {loc}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => goToResults()}
                    className="px-3 py-1.5 rounded-full text-sm text-[var(--gold-light)] hover:text-[var(--gold)] transition-all"
                  >
                    مناطق أخرى ›
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
