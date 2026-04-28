import { useState } from "react";
import { Youtube, ExternalLink, Play } from "lucide-react";

type Video = { id: string; title: string };

const VIDEOS: Video[] = [
  { id: "EOvgM4AxKY4", title: "جولة في مشاريع باشاك" },
  { id: "7gMMPnWzpqk", title: "لحظات من تسليم العملاء" },
  { id: "1Oal6cCM3Q8", title: "تعرّف على فريق باشاك" },
];

const THUMB_FALLBACKS = ["maxresdefault", "sddefault", "hqdefault", "mqdefault"];

function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const [thumbIdx, setThumbIdx] = useState(0);
  const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  const thumbUrl = `https://i.ytimg.com/vi/${video.id}/${THUMB_FALLBACKS[thumbIdx]}.jpg`;

  return (
    <div
      className="rounded-2xl overflow-hidden border bg-card/60 hover:shadow-xl transition-all hover:-translate-y-1"
      data-testid={`media-video-${video.id}`}
    >
      <div className="relative aspect-[9/16] bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            aria-label={`تشغيل: ${video.title}`}
            data-testid={`play-video-${video.id}`}
          >
            <img
              src={thumbUrl}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              onError={() => {
                if (thumbIdx < THUMB_FALLBACKS.length - 1) {
                  setThumbIdx(thumbIdx + 1);
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 group-hover:from-black/80 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform"
                style={{ background: "var(--gold)" }}
              >
                <Play className="h-7 w-7 text-black fill-black ml-0.5" />
              </div>
            </div>
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold" style={{ color: "var(--gold-light)" }}>
          {video.title}
        </h3>
        <a
          href={watchUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-sm text-foreground/60 hover:text-foreground"
          data-testid={`link-video-${video.id}`}
        >
          <Youtube className="h-4 w-4" /> فتح على يوتيوب
        </a>
      </div>
    </div>
  );
}

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
            <VideoCard key={v.id} video={v} />
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
