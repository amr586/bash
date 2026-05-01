import { Link } from "wouter";
import { HeroSection } from "@/components/hero-section";
import { PropertySearch } from "@/components/property-search";
import { StatsSection } from "@/components/stats-section";
import { AboutSection } from "@/components/about-section";
import { MediaSection } from "@/components/media-section";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";
import { useLang } from "@/lib/i18n";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

        <MediaSection />
        <SectionMore href="/media" label={t("المكتبة الإعلامية الكاملة", "Full Media Library")} />
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
