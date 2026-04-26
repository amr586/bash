import { Button } from "./ui/button"
import { ArrowRight, Phone, ClipboardList } from "lucide-react"
import { ParticleTextEffect } from "./particle-text-effect"
import { HeroSlideshow } from "./hero-slideshow"
import { RegisterNowDialog } from "./register-now-dialog"
import heroBg from "../assets/hero-bg.png"

const BASE = import.meta.env.BASE_URL
const slideshowImages = [
  heroBg,
  `${BASE}images/project-1.png`,
  `${BASE}images/project-2.png`,
  `${BASE}images/project-3.png`,
  `${BASE}images/project-4.png`,
]

export function HeroSection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden min-h-screen flex flex-col justify-between">
      {/* Animated real-estate slideshow background */}
      <HeroSlideshow images={slideshowImages} />
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

      <div className="flex-1 flex items-start justify-center pt-20 relative z-10">
        <ParticleTextEffect words={["BASHAK", "DEVELOPMENTS"]} />
      </div>

      <div className="container mx-auto text-center relative z-10 pb-8">
        <div className="max-w-4xl mx-auto">
          <p
            dir="rtl"
            lang="ar"
            className="text-xl md:text-2xl font-medium text-white/95 mb-8 text-balance leading-relaxed max-w-3xl mx-auto"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            شركة بشاك للتطوير العقاري بخبرة تمتد لأكثر من 10 أعوام في تقديم حلول عقارية مبتكرة وموثوقة.
            <br />
            <span style={{ color: "var(--gold-light)" }}>
              نسعى دائمًا لتحويل رؤاكم إلى واقع ملموس بمعايير عالية من الجودة والمصداقية.
            </span>
          </p>

          <div
            dir="rtl"
            className="flex flex-wrap items-center justify-center gap-3 mb-8 text-sm md:text-base"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            <span
              className="px-4 py-1.5 rounded-full border"
              style={{ color: "var(--gold)", borderColor: "var(--gold-dark)" }}
            >
              #باشاك
            </span>
            <span
              className="px-4 py-1.5 rounded-full border"
              style={{ color: "var(--gold)", borderColor: "var(--gold-dark)" }}
            >
              #باشاك_رؤية_جديدة_تطوير_مختلف
            </span>
            <span
              className="px-4 py-1.5 rounded-full border"
              style={{ color: "var(--gold)", borderColor: "var(--gold-dark)" }}
            >
              #فيها_حاجة_حلوة
            </span>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="text-black group font-semibold"
              style={{ background: "var(--gold)" }}
              asChild
            >
              <a href="https://wa.me/201151313999" target="_blank" rel="noreferrer">
                احجز شقتك الآن
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform rotate-180" />
              </a>
            </Button>

            <RegisterNowDialog
              trigger={
                <Button
                  size="lg"
                  className="text-black font-semibold"
                  style={{ background: "var(--gold-light)" }}
                  data-testid="button-register-now"
                >
                  <ClipboardList className="ml-2 h-4 w-4" />
                  سجّل الآن
                </Button>
              }
            />

            <Button
              size="lg"
              variant="outline"
              className="text-white bg-transparent hover:bg-white/5"
              style={{ borderColor: "var(--gold)", color: "var(--gold-light)" }}
              asChild
            >
              <a href="tel:17327">
                <Phone className="mr-2 h-4 w-4" />
                الخط الساخن 17327
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
