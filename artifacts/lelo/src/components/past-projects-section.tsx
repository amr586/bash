import { Building2 } from "lucide-react";

const PAST = [
  {
    name: "كمبوند الواحة",
    location: "التجمع الخامس",
    year: "2018",
    units: "120 وحدة",
    description: "مشروع سكني فاخر تم تسليمه بالكامل، بمساحات خضراء وحديقة مركزية.",
  },
  {
    name: "أبراج النخيل",
    location: "المعادي الجديدة",
    year: "2020",
    units: "85 وحدة",
    description: "أبراج إدارية وسكنية تم بيعها بالكامل خلال سنة من الإطلاق.",
  },
  {
    name: "فيلات السلام",
    location: "الشيخ زايد",
    year: "2022",
    units: "32 فيلا",
    description: "مجموعة فيلات مستقلة بتشطيب فاخر، تسليم 100% في الموعد المحدد.",
  },
];

export function PastProjectsSection() {
  return (
    <section
      id="past-projects"
      className="py-20 px-4"
      dir="rtl"
      style={{
        background: "linear-gradient(180deg, var(--background), color-mix(in srgb, var(--gold) 6%, var(--background)))",
        fontFamily: "'Tajawal', sans-serif",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--gold)" }}>
            مشاريعنا السابقة
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            مجموعة من المشاريع اللي تم تسليمها بنجاح على مدار سنين خبرتنا.
          </p>
          <div className="w-20 h-1 mx-auto rounded-full mt-4" style={{ background: "var(--gold)" }} />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PAST.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border p-6 bg-card/60 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1"
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
              <p className="text-foreground/80 leading-relaxed">{p.description}</p>
              <div
                className="mt-4 inline-block text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  background: "color-mix(in srgb, var(--gold) 20%, transparent)",
                  color: "var(--gold-light)",
                }}
              >
                تم التسليم بالكامل ✓
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
