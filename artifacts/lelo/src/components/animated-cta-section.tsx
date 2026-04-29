"use client"

import { useRef } from "react"
import { Button } from "./ui/button"
import { ArrowRight, MessageCircle, Phone } from "lucide-react"
import { BackgroundPaths } from "./ui/floating-paths"
import { useLang } from "@/lib/i18n"

export function AnimatedCTASection() {
  const { lang, t } = useLang()
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0">
        <div className="h-full w-full bg-gradient-to-br from-[#1a1408] via-black to-[#0f0c05]">
          <BackgroundPaths />
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
              style={{ background: "rgba(212, 175, 55, 0.15)" }}
            />
            <div
              className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
              style={{ background: "rgba(201, 165, 92, 0.12)", animationDelay: "1s" }}
            />
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse"
              style={{ background: "rgba(230, 199, 133, 0.1)", animationDelay: "2s" }}
            />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />

      <div className="relative z-10 container mx-auto">
        <div
          className="rounded-2xl p-8 md:p-12 text-center animate-fade-in-up max-w-4xl mx-auto"
          ref={contentRef}
          style={{ animationDelay: "0.3s" }}
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg animate-fade-in-up"
            dir={lang === "ar" ? "rtl" : "ltr"}
            lang={lang}
            style={{
              fontFamily: "'Tajawal', sans-serif",
              animationDelay: "0.5s",
              color: "var(--gold-light)",
            }}
          >
            {t(
              "امتلك شقتك الأرضي بحديقة خاصة",
              "Own a Ground-Floor Apartment with a Private Garden",
            )}
          </h2>
          <p
            className="text-lg md:text-xl text-white/90 mb-3 max-w-2xl mx-auto drop-shadow-md animate-fade-in-up leading-relaxed"
            dir={lang === "ar" ? "rtl" : "ltr"}
            lang={lang}
            style={{ fontFamily: "'Tajawal', sans-serif", animationDelay: "0.7s" }}
          >
            {t(
              <>
                3 غرف بمساحة تبدأ من <span style={{ color: "var(--gold)" }}>130 م²</span>،
                استلم الحديقة متشطبة مجانًا خلال التعاقد في شهر رمضان.
              </>,
              <>
                3 bedrooms starting from <span style={{ color: "var(--gold)" }}>130 m²</span> —
                get the garden fully landscaped for free when you sign during Ramadan.
              </>,
            )}
          </p>
          <p
            className="text-base md:text-lg text-white/80 mb-8 max-w-2xl mx-auto animate-fade-in-up"
            dir={lang === "ar" ? "rtl" : "ltr"}
            lang={lang}
            style={{ fontFamily: "'Tajawal', sans-serif", animationDelay: "0.8s" }}
          >
            {t(
              <>
                مقدم يبدأ من <span style={{ color: "var(--gold)", fontWeight: 700 }}>700 ألف جنيه</span> والباقي على
                <span style={{ color: "var(--gold)", fontWeight: 700 }}> 60 شهر</span> — استلام خلال سنتين.
              </>,
              <>
                Down payment from <span style={{ color: "var(--gold)", fontWeight: 700 }}>EGP 700,000</span> and the rest over
                <span style={{ color: "var(--gold)", fontWeight: 700 }}> 60 months</span> — handover within two years.
              </>,
            )}
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
            style={{ animationDelay: "0.9s" }}
          >
            <Button
              size="lg"
              className="text-black hover:opacity-90 group font-semibold"
              style={{ background: "var(--gold)" }}
              asChild
            >
              <a href="https://wa.me/201151313999" target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                {t("تواصل عبر واتساب", "WhatsApp Us")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white bg-transparent hover:bg-white/10"
              style={{ borderColor: "var(--gold)", color: "var(--gold-light)" }}
              asChild
            >
              <a href="tel:+201151313999">
                <Phone className="mr-2 h-4 w-4" />
                01151313999
              </a>
            </Button>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(24px);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `,
        }}
      />
    </section>
  )
}
