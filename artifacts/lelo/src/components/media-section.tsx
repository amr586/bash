import { Youtube, ExternalLink } from "lucide-react";

const VIDEOS = [
  { id: "EOvgM4AxKY4", title: "جولة في مشاريع باشاك" },
  { id: "7gMMPnWzpqk", title: "لحظات من تسليم العملاء" },
  { id: "1Oal6cCM3Q8", title: "تعرّف على فريق باشاك" },
];

export function MediaSection() {
  return (
    <section
      id="media"
      className="py-20 px-4"
      dir="rtl"
      style={{ background: "var(--background)", fontFamily: "'Tajawal', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--gold)" }}>
            المكتبة الإعلامية
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            فيديوهاتنا على يوتيوب — جولات في المشاريع، لقاءات ولحظات تسليم.
          </p>
          <div className="w-20 h-1 mx-auto rounded-full mt-4" style={{ background: "var(--gold)" }} />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {VIDEOS.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl overflow-hidden border bg-card/60 hover:shadow-xl transition-all hover:-translate-y-1"
              data-testid={`media-video-${v.id}`}
            >
              <div className="relative aspect-[9/16] bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${v.id}`}
                  title={v.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold" style={{ color: "var(--gold-light)" }}>
                  {v.title}
                </h3>
                <a
                  href={`https://youtube.com/shorts/${v.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-foreground/60 hover:text-foreground"
                  data-testid={`link-video-${v.id}`}
                >
                  <Youtube className="h-4 w-4" /> فتح على يوتيوب
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://www.youtube.com/@BashakDevelopments/shorts"
            target="_blank"
            rel="noreferrer"
            data-testid="link-media-more"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black hover:scale-105 transition-transform shadow-lg"
            style={{ background: "var(--gold)" }}
          >
            <Youtube className="h-5 w-5" />
            عرض المزيد على قناتنا
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
