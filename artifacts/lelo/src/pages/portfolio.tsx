import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Loader2, MapPin, Calendar, Tag, ArrowLeft, ExternalLink } from "lucide-react";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";
import { apiFetch, resolveImageUrl } from "@/lib/api";
import { useLang } from "@/lib/i18n";

interface PortfolioItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  coverImageUrl: string;
  images: string[];
  location: string;
  category: string;
  yearLabel: string;
  googleMapsUrl: string;
  isPublished: boolean;
}

function toEmbedUrl(url: string): string {
  if (!url.trim()) return "";
  if (url.includes("maps/embed")) return url;
  try {
    const u = new URL(url);
    if (u.hostname.includes("google.com")) {
      u.searchParams.set("output", "embed");
      return u.toString();
    }
  } catch {}
  return url;
}

function GoldenMapCircle({ url }: { url: string }) {
  const embedUrl = toEmbedUrl(url);
  if (!embedUrl) return null;
  return (
    <div className="flex justify-center my-6">
      <div className="relative">
        {/* outer glow ring */}
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: "conic-gradient(from 0deg, var(--gold), var(--gold-dark), var(--gold-light), var(--gold-dark), var(--gold))",
            padding: 3,
            borderRadius: "50%",
            filter: "blur(1px)",
          }}
        />
        {/* golden border ring */}
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: "50%",
            padding: 4,
            background: "conic-gradient(from 0deg, var(--gold), var(--gold-dark), var(--gold-light), var(--gold-dark), var(--gold))",
            boxShadow: "0 0 0 1px rgba(212,175,55,0.15), 0 8px 32px rgba(212,175,55,0.25), inset 0 0 0 1px rgba(212,175,55,0.1)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* inner circle clip */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              overflow: "hidden",
              background: "#000",
            }}
          >
            <iframe
              src={embedUrl}
              title="موقع المشروع على الخريطة"
              className="border-0"
              style={{ width: "100%", height: "100%", pointerEvents: "none" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const title = isAr ? item.titleAr : (item.titleEn || item.titleAr);
  const description = isAr ? item.descriptionAr : (item.descriptionEn || item.descriptionAr);
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="group rounded-2xl overflow-hidden border border-border/40 bg-card/60 hover:border-[var(--gold)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--gold)]/5 flex flex-col">
      {/* cover image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
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

      {/* info */}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <h3 className="font-bold text-lg text-foreground leading-snug">{title}</h3>

        {description && (
          <p className="text-sm text-foreground/65 leading-relaxed line-clamp-3">{description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-foreground/50 mt-auto">
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

        {/* gallery strip */}
        {item.images?.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {item.images.slice(0, 5).map((img, i) => (
              <img
                key={i}
                src={resolveImageUrl(img)}
                alt=""
                className="h-14 w-20 shrink-0 object-cover rounded-lg border border-border/30"
              />
            ))}
            {item.images.length > 5 && (
              <div className="h-14 w-14 shrink-0 rounded-lg border border-border/30 bg-foreground/5 flex items-center justify-center text-xs text-foreground/40 font-semibold">
                +{item.images.length - 5}
              </div>
            )}
          </div>
        )}

        {/* map toggle */}
        {item.googleMapsUrl && (
          <div className="border-t border-border/30 pt-3">
            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              className="flex items-center gap-2 text-xs font-semibold transition-colors hover:text-[var(--gold-light)]"
              style={{ color: "var(--gold)" }}
            >
              <MapPin className="h-3.5 w-3.5" />
              {showMap ? (isAr ? "إخفاء الخريطة" : "Hide Map") : (isAr ? "عرض الموقع على الخريطة" : "Show on Map")}
            </button>

            {showMap && <GoldenMapCircle url={item.googleMapsUrl} />}

            {showMap && (
              <a
                href={item.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {isAr ? "فتح في جوجل ماب" : "Open in Google Maps"}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const [items, setItems] = useState<PortfolioItem[] | null>(null);

  useEffect(() => {
    apiFetch<{ items: PortfolioItem[] }>("/api/portfolio")
      .then((d) => setItems(d.items))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* header */}
          <div className="mb-12 text-center space-y-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border"
              style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
            >
              <Tag className="h-3.5 w-3.5" />
              {t("إنجازاتنا", "Our Work")}
            </div>
            <h1
              className="text-4xl sm:text-5xl font-bold text-foreground"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              {t("سابقة الأعمال", "Portfolio")}
            </h1>
            <p className="text-foreground/60 max-w-xl mx-auto leading-relaxed">
              {t(
                "نماذج من مشاريعنا المتميزة في مجال التطوير العقاري بمصر",
                "Highlights from our distinguished real estate development projects across Egypt"
              )}
            </p>
          </div>

          {items === null ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--gold)" }} />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <p className="text-foreground/50 text-lg">
                {t("لا توجد مشاريع منشورة حالياً.", "No projects published yet.")}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm"
                style={{ color: "var(--gold)" }}
              >
                <ArrowLeft className="h-4 w-4" />
                {t("العودة للرئيسية", "Back to Home")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
