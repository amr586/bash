import { useLang } from "@/lib/i18n";
import { useSiteSettings } from "@/lib/site-settings";

export function AboutSection() {
  const { lang, t } = useLang();
  const { settings } = useSiteSettings();
  const isAr = lang === "ar";

  const whoWeAre = isAr
    ? (settings?.aboutWhoWeAreAr ?? "")
    : (settings?.aboutWhoWeAreEn ?? "");

  const values = isAr
    ? (settings?.aboutValuesAr ?? "")
    : (settings?.aboutValuesEn ?? "");

  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 px-4 bg-background" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        <div className="text-center mb-8 sm:mb-10">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4"
            style={{ color: "var(--gold)" }}
            data-testid="heading-about"
          >
            {t("عننا", "About Us")}
          </h2>
          <div
            className="w-20 h-1 mx-auto rounded-full"
            style={{ background: "var(--gold)" }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6 md:gap-8 items-stretch">
          <div className="rounded-2xl border p-5 sm:p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: "var(--gold-light)" }}>
              {t("من نحن", "Who We Are")}
            </h3>
            <p className="text-foreground/80 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {whoWeAre}
            </p>
          </div>

          <div className="rounded-2xl border p-5 sm:p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: "var(--gold-light)" }}>
              {t("قيمنا", "Our Values")}
            </h3>
            <p className="text-foreground/80 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {values}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
