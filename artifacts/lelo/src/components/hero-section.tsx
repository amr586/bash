import { useEffect, useState } from "react"
import { motion } from "framer-motion";
import { Button } from "./ui/button"
import { ClipboardList } from "lucide-react"
import { HeroSlideshow } from "./hero-slideshow"
import { RegisterNowDialog } from "./register-now-dialog"
import { apiFetch, type Property } from "@/lib/api"
import { useLang } from "@/lib/i18n"
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
  const { lang, t } = useLang()
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
    <section className="py-16 sm:py-20 px-4 relative overflow-hidden min-h-screen flex flex-col justify-between">
      <HeroSlideshow images={slideshowImages} intervalMs={3000} />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/75" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)",
          }}
        />
      </div>

      <div className="flex-1 flex items-start justify-center pt-16 sm:pt-20 relative z-10 px-4">
        <h1
          className="text-center font-bold leading-[1.05] tracking-[0.06em] sm:tracking-[0.08em] uppercase text-balance"
          style={{
            color: "var(--gold)",
            fontFamily: "'Tajawal', sans-serif",
            textShadow: "0 2px 18px rgba(0,0,0,0.55)",
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="block text-[2.5rem] leading-none sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Bashak
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 50, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.18em" }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="block text-xl sm:text-4xl md:text-5xl lg:text-6xl mt-1 sm:mt-2 tracking-[0.14em] sm:tracking-[0.18em]"
          >
            Developments
          </motion.span>
        </h1>
      </div>

      <div className="container mx-auto text-center relative z-10 pb-8">
        <div className="max-w-4xl mx-auto">
          <p
            dir={lang === "ar" ? "rtl" : "ltr"}
            lang={lang}
            className="text-base sm:text-lg md:text-2xl font-medium text-white/95 mb-6 sm:mb-8 text-balance leading-relaxed max-w-3xl mx-auto px-2"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {t(
              "شركة باشاك للتطوير العقاري — بنبني ونطوّر مشاريعنا بنفسنا في قلب التجمع الخامس بأكتر من 10 سنين خبرة.",
              "Bashak Developments — we design, build and deliver our own projects in the heart of New Cairo's 5th Settlement, with over 10 years of experience.",
            )}
            <br />
            <span style={{ color: "var(--gold-light)" }}>
              {t(
                "كل وحدة بتشوفها هنا من تصميمنا وتنفيذنا — إحنا المطوّر والمالك.",
                "Every unit you see here is designed and built by us — we are both the developer and the owner.",
              )}
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
                  <ClipboardList className={lang === "ar" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                  {t("سجّل الآن", "Register Now")}
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}
