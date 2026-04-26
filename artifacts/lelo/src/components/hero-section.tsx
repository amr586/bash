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
