import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { ClipboardList } from "lucide-react"
import { HeroSlideshow } from "./hero-slideshow"
import { RegisterNowDialog } from "./register-now-dialog"
import { apiFetch, type Property } from "@/lib/api"
import heroBg from "../assets/hero-bg.png"
import project1 from "../assets/project-1.png"
import project2 from "../assets/project-2.png"
import project3 from "../assets/project-3.png"
import project4 from "../assets/project-4.png"
import project5 from "../assets/project-5.png"
import project6 from "../assets/project-6.png"
import project7 from "../assets/project-7.png"
import project8 from "../assets/project-8.png"
import project9 from "../assets/project-9.png"
import project10 from "../assets/project-10.png"

const fallbackImages = [
  heroBg,
  project1,
  project2,
  project3,
  project4,
  project5,
  project6,
  project7,
  project8,
  project9,
  project10,
]

export function HeroSection() {
  const [propertyImages, setPropertyImages] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    apiFetch<{ properties: Property[] }>("/api/properties?status=approved&limit=20")
      .then((d) => {
        if (cancelled) return
        const imgs: string[] = []
        for (const p of d.properties ?? []) {
          if (p.mainImageUrl) imgs.push(p.mainImageUrl)
          for (const u of p.imageUrls ?? []) {
            if (u && !imgs.includes(u)) imgs.push(u)
          }
        }
        if (imgs.length > 0) setPropertyImages(imgs.slice(0, 12))
      })
      .catch(() => {
        /* keep fallback */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const slideshowImages = propertyImages.length > 0 ? propertyImages : fallbackImages

  return (
    <section className="py-20 px-4 relative overflow-hidden min-h-screen flex flex-col justify-between">
      {/* Animated real-estate slideshow background */}
      <HeroSlideshow images={slideshowImages} intervalMs={3000} />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/95" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        />
      </div>

      <div className="flex-1 flex items-start justify-center pt-20 relative z-10 px-4">
        <h1
          className="text-center font-bold leading-[1.05] tracking-[0.08em] uppercase text-balance"
          style={{
            color: "var(--gold)",
            fontFamily: "'Tajawal', sans-serif",
            textShadow: "0 2px 18px rgba(0,0,0,0.55)",
          }}
        >
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            Bashak
          </span>
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2 tracking-[0.18em]">
            Developments
          </span>
        </h1>
      </div>

      <div className="container mx-auto text-center relative z-10 pb-8">
        <div className="max-w-4xl mx-auto">
          <p
            dir="rtl"
            lang="ar"
            className="text-xl md:text-2xl font-medium text-white/95 mb-8 text-balance leading-relaxed max-w-3xl mx-auto"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            شركة باشاك للتطوير العقاري — بنبني ونطوّر مشاريعنا بنفسنا في قلب التجمع الخامس بأكتر من 10 سنين خبرة.
            <br />
            <span style={{ color: "var(--gold-light)" }}>
              كل وحدة بتشوفها هنا من تصميمنا وتنفيذنا — إحنا المطوّر والمالك.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mb-12">
            <RegisterNowDialog
              trigger={
                <Button
                  size="lg"
                  className="text-black font-semibold rounded-xl transform-gpu transition-all duration-150 ease-out hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(212,175,55,0.55)] active:scale-95 active:translate-y-0.5 active:shadow-[inset_0_4px_10px_rgba(0,0,0,0.35)] active:brightness-90 focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
                  style={{
                    background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
                    boxShadow: "0 8px 20px rgba(212,175,55,0.35)",
                  }}
                  data-testid="button-register-now"
                >
                  <ClipboardList className="ml-2 h-4 w-4" />
                  سجّل الآن
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}
