import { useState } from "react";
import { useLocation } from "wouter";
import { Search, ChevronUp, ChevronDown, MapPin } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useSiteSettings } from "@/lib/site-settings";
import { useLang } from "@/lib/i18n";

export function PropertySearch() {
  const { lang, t } = useLang();
  const [, setLocation] = useLocation();
  const { settings } = useSiteSettings();
  const quickLocations = settings.locations.slice(0, 8);
  const [q, setQ] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);

  const goToResults = (overrides?: Record<string, string>) => {
    const params = new URLSearchParams();
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

  const sideMargin = lang === "ar" ? "ml-2" : "mr-2";
  const searchIconPos = lang === "ar" ? "right-3" : "left-3";
  const inputPad = lang === "ar" ? "pr-9" : "pl-9";

  return (
    <section
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="relative z-20 -mt-16 md:-mt-20 mb-16 px-4"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-6">
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{ color: "var(--gold-light)" }}
          >
            {t("ابحث عن منزل أحلامك", "Find Your Dream Home")}
            <br className="md:hidden" />
            <span className={lang === "ar" ? "md:mr-2" : "md:ml-2"}>
              {t(" في قلب التجمع الخامس", " in the heart of the 5th Settlement")}
            </span>
          </h2>
          <p className="text-foreground/70 mt-2">
            {t(
              "مشاريع باشاك للتطوير العقاري — وحدات سكنية وتجارية حصرية في قلب القاهرة الجديدة.",
              "Bashak Developments — exclusive residential and commercial units in the heart of New Cairo.",
            )}
          </p>
        </div>

        <div
          className="rounded-2xl border backdrop-blur-md p-4 md:p-6 shadow-2xl"
          style={{
            background: "rgba(20, 20, 20, 0.85)",
            borderColor: "rgba(212, 175, 55, 0.25)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
            <div className="relative">
              <Search className={`absolute ${searchIconPos} top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50 pointer-events-none`} />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goToResults();
                }}
                placeholder={t("ابحث بالموقع أو نوع العقار...", "Search by location or property type…")}
                className={`${inputPad} h-11`}
                data-testid="input-search"
              />
            </div>
            <Button
              onClick={() => goToResults()}
              className="h-11 px-6 text-black font-semibold"
              style={{ background: "var(--gold)" }}
              data-testid="button-search"
            >
              <Search className={`${sideMargin} h-4 w-4`} />
              {t("بحث", "Search")}
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
                  <ChevronUp className={`${sideMargin} h-4 w-4`} />
                  {t("إخفاء", "Hide")}
                </>
              ) : (
                <>
                  <ChevronDown className={`${sideMargin} h-4 w-4`} />
                  {t("المزيد", "More")}
                </>
              )}
            </Button>
          </div>

          {showAdvanced && (
            <div className="mt-5 pt-5 border-t border-foreground/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-foreground/60 mb-1 block">
                    {t("السعر الأدنى", "Min price")}
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder={t("من", "From")}
                    data-testid="input-price-min"
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block text-[#cf902799]">
                    {t("السعر الأقصى", "Max price")}
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder={t("إلى", "To")}
                    data-testid="input-price-max"
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block text-[#99772e99]">
                    {t("المساحة (م²)", "Area (m²)")}
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={areaMin}
                    onChange={(e) => setAreaMin(e.target.value)}
                    placeholder={t("من", "From")}
                    data-testid="input-area-min"
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block text-[#c28a2f99]">
                    {t("المساحة (م²)", "Area (m²)")}
                  </label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={areaMax}
                    onChange={(e) => setAreaMax(e.target.value)}
                    placeholder={t("إلى", "To")}
                    data-testid="input-area-max"
                  />
                </div>
              </div>

              <div className="mt-5">
                <div className="text-xs text-foreground/60 mb-2 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {t("مناطق سريعة", "Quick locations")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => goToResults({ q: loc })}
                      className="px-3 py-1.5 rounded-full text-sm hover:text-black hover:bg-[var(--gold)] transition-all text-[#dec221]"
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
                    {t("مناطق أخرى ›", "Other areas ›")}
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
