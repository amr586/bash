import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Loader2, MapPin, Calendar, Tag, ArrowLeft } from "lucide-react";
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
  isPublished: boolean;
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const title = isAr ? item.titleAr : (item.titleEn || item.titleAr);
  const description = isAr ? item.descriptionAr : (item.descriptionEn || item.descriptionAr);

  return (
    <div className="group rounded-2xl overflow-hidden border border-border/40 bg-card/60 hover:border-[var(--gold)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--gold)]/5">
      <div className="relative overflow-hidden aspect-video">
        {item.coverImageUrl ? (
          <img
            src={resolveImageUrl(item.coverImageUrl)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--gold)]/10 to-[var(--gold)]/5 flex items-center justify-center">
            <span className="text-[var(--gold)]/40 text-4xl">🏗️</span>
          </div>
        )}
        {item.category && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold text-black" style={{ background: "var(--gold)" }}>
            {item.category}
          </div>
        )}
      </div>
      <div className="p-5 space-y-3">
        <h3 className="font-bold text-lg text-foreground leading-snug">{title}</h3>
        {description && (
          <p className="text-sm text-foreground/65 line-clamp-3 leading-relaxed">{description}</p>
        )}
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
          <div className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border" style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
              <Tag className="h-3.5 w-3.5" />
              {t("إنجازاتنا", "Our Work")}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground" style={{ fontFamily: "'Tajawal', sans-serif" }}>
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
              <p className="text-foreground/50 text-lg">{t("لا توجد مشاريع منشورة حالياً.", "No projects published yet.")}</p>
              <Link href="/" className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--gold)" }}>
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
