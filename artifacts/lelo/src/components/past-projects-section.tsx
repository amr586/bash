import { Building2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function PastProjectsSection() {
  const { lang, t } = useLang();

  const PAST = [
    {
      name: t("كمبوند الواحة", "Al-Waha Compound"),
      location: t("التجمع الخامس", "5th Settlement"),
      year: "2018",
      units: t("120 وحدة", "120 units"),
      description: t(
        "مشروع سكني فاخر تم تسليمه بالكامل، بمساحات خضراء وحديقة مركزية.",
        "A premium residential project, fully delivered with green spaces and a central garden.",
      ),
    },
    {
      name: t("أبراج النخيل", "Al-Nakheel Towers"),
      location: t("المعادي الجديدة", "New Maadi"),
      year: "2020",
      units: t("85 وحدة", "85 units"),
      description: t(
        "أبراج إدارية وسكنية تم بيعها بالكامل خلال سنة من الإطلاق.",
        "Office and residential towers — fully sold out within a year of launch.",
      ),
    },
    {
      name: t("فيلات السلام", "Al-Salam Villas"),
      location: t("الشيخ زايد", "Sheikh Zayed"),
      year: "2022",
      units: t("32 فيلا", "32 villas"),
      description: t(
        "مجموعة فيلات مستقلة بتشطيب فاخر، تسليم 100% في الموعد المحدد.",
        "A collection of detached villas with luxury finishing — delivered 100% on schedule.",
      ),
    },
  ];

  return (
    <section
      id="past-projects"
      className="py-12 sm:py-16 md:py-20 px-4"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        background: "linear-gradient(180deg, var(--background), color-mix(in srgb, var(--gold) 6%, var(--background)))",
        fontFamily: "'Tajawal', sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4" style={{ color: "var(--gold)" }}>
            {t("مشاريعنا السابقة", "Our Past Projects")}
          </h2>
          <p className="text-sm sm:text-base text-foreground/70 max-w-2xl mx-auto">
            {t(
              "مجموعة من المشاريع اللي تم تسليمها بنجاح على مدار سنين خبرتنا.",
              "A selection of projects successfully delivered throughout our years of experience.",
            )}
          </p>
          <div className="w-20 h-1 mx-auto rounded-full mt-4" style={{ background: "var(--gold)" }} />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {PAST.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border p-5 sm:p-6 bg-card/60 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1"
              data-testid={`past-project-${p.name}`}
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                style={{ background: "color-mix(in srgb, var(--gold) 15%, transparent)" }}
              >
                <Building2 className="h-6 w-6" style={{ color: "var(--gold)" }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--gold-light)" }}>
                {p.name}
              </h3>
              <div className="text-sm text-foreground/60 mb-3 flex flex-wrap gap-x-3">
                <span>{p.location}</span>
                <span>•</span>
                <span>{p.year}</span>
                <span>•</span>
                <span>{p.units}</span>
              </div>
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{p.description}</p>
              <div
                className="mt-4 inline-block text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  background: "color-mix(in srgb, var(--gold) 20%, transparent)",
                  color: "var(--gold-light)",
                }}
              >
                {t("تم التسليم بالكامل ✓", "Fully Delivered ✓")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
