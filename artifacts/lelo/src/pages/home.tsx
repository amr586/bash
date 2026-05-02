import { useEffect, useState } from "react";
import { Link } from "wouter";
import { HeroSection } from "@/components/hero-section";
import { PropertySearch } from "@/components/property-search";
import { StatsSection } from "@/components/stats-section";
import { AboutSection } from "@/components/about-section";
import { MediaSection } from "@/components/media-section";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";
import { apiFetch, resolveImageUrl } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Calendar, MapPin } from "lucide-react";

function SectionMore({ href, label }: { href: string; label: string }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  return (
    <div className="text-center pb-6" dir={isAr ? "rtl" : "ltr"}>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm border transition-all hover:scale-105 hover:shadow-md"
        style={{
          borderColor: "var(--gold)",
          color: "var(--gold)",
          fontFamily: "'Tajawal', sans-serif",
        }}
      >
        {label}
        {isAr ? (
          <ArrowLeft className="h-4 w-4" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
      </Link>
    </div>
  );
}

interface PortfolioItem {
  id: string;
  titleAr: string;
  titleEn: string;
  coverImageUrl: string;
  category: string;
  yearLabel: string;
  location: string;
}

function PortfolioSection() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const [items, setItems] = useState<PortfolioItem[] | null>(null);

  useEffect(() => {
    apiFetch<{ items: PortfolioItem[] }>("/api/portfolio")
      .then((d) => setItems(d.items.slice(0, 6)))
      .catch(() => setItems([]));
  }, []);

  if (items !== null && items.length === 0) return null;

  return (
    <section className="py-16 px-4" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 space-y-3">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold border mb-2"
            style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
          >
            {t("إنجازاتنا", "Our Work")}
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold text-foreground"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {t("سابقة الأعمال", "Portfolio")}
          </h2>
          <p className="text-foreground/60 max-w-lg mx-auto leading-relaxed text-sm">
            {t(
              "نماذج من أبرز مشاريعنا العقارية المتميزة",
              "Highlights from our distinguished real estate projects"
            )}
          </p>
        </div>

        {items === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border/30 animate-pulse">
                <div className="aspect-video bg-foreground/5" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-foreground/8 rounded w-3/4" />
                  <div className="h-3 bg-foreground/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const title = isAr ? item.titleAr : (item.titleEn || item.titleAr);
              return (
                <div
                  key={item.id}
                  className="group rounded-2xl overflow-hidden border border-border/40 bg-card/60 hover:border-[var(--gold)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--gold)]/5"
                >
                  <div className="relative overflow-hidden aspect-video">
                    {item.coverImageUrl ? (
                      <img
                        src={resolveImageUrl(item.coverImageUrl)}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--gold)]/10 to-[var(--gold)]/5 flex items-center justify-center">
                        <span className="text-[var(--gold)]/30 text-5xl">🏗️</span>
                      </div>
                    )}
                    {item.category && (
                      <div
                        className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold text-black"
                        style={{ background: "var(--gold)" }}
                      >
                        {item.category}
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-foreground truncate">{title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-foreground/50">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {item.location}
                        </span>
                      )}
                      {item.yearLabel && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {item.yearLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        <HeroSection />
        <PropertySearch />
        <StatsSection />

        <AboutSection />
        <SectionMore href="/about" label={t("المزيد عننا", "More About Us")} />

        <div className="w-full h-px bg-border/30 mx-auto max-w-5xl" />

        <PortfolioSection />
        <SectionMore href="/portfolio" label={t("عرض كل المشاريع", "View All Projects")} />

        <div className="w-full h-px bg-border/30 mx-auto max-w-5xl" />

        <MediaSection />
        <SectionMore href="/media" label={t("المكتبة الإعلامية الكاملة", "Full Media Library")} />
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
