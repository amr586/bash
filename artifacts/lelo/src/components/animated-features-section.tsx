"use client"

import type React from "react"
import { motion } from "framer-motion"
import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg"
import { useLang } from "@/lib/i18n"

interface BentoCardProps {
  title: string
  value: string | number
  subtitle?: string
  colors: string[]
  delay: number
}

const BentoCard: React.FC<BentoCardProps> = ({ title, value, subtitle, colors, delay }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay + 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      className="relative overflow-hidden h-full bg-card rounded-lg border border-border/20 group"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      style={{
        filter: "url(#noise)",
      }}
    >
      <AnimatedGradient colors={colors} speed={0.05} blur="medium" />

      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: "256px 256px",
            mixBlendMode: "overlay",
          }}
        />
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="w-full h-full animate-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "48px 48px, 64px 64px",
            backgroundPosition: "0 0, 24px 24px",
          }}
        />
      </div>

      <div className="absolute inset-0 opacity-80 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-[shine_4s_ease-in-out_infinite] w-[200%]" />
      </div>

      <motion.div
        className="relative z-10 p-3 sm:p-5 md:p-8 text-foreground backdrop-blur-sm h-full flex flex-col justify-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h3 className="text-sm sm:text-base md:text-lg text-foreground mb-2" variants={item}>
          {title}
        </motion.h3>
        <motion.p className="text-2xl sm:text-4xl md:text-5xl font-medium mb-4 text-foreground" variants={item}>
          {value}
        </motion.p>
        {subtitle && (
          <motion.p className="text-sm text-foreground/80" variants={item}>
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  )
}

export function AnimatedFeaturesSection() {
  const { lang, t } = useLang()
  return (
    <section id="features" className="py-20 px-4 bg-background">
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="noise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence baseFrequency="0.4" numOctaves="2" result="noise" seed="2" type="fractalNoise" />
            <feColorMatrix in="noise" type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0.02 0.04 0.06" />
            </feComponentTransfer>
            <feComposite operator="over" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      <div className="container mx-auto" dir={lang === "ar" ? "rtl" : "ltr"} style={{ fontFamily: "'Tajawal', sans-serif" }}>
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: "var(--gold-light)" }}
          >
            {t("لماذا باشاك؟", "Why Bashak?")}
          </h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            {t(
              "أكثر من 10 أعوام من الخبرة في التطوير العقاري — نحوّل رؤاكم إلى واقع ملموس.",
              "Over 10 years of real estate development experience — turning your vision into reality.",
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          <div className="md:col-span-2">
            <BentoCard
              title={t("خبرة 10 سنوات", "10 Years of Experience")}
              value={t("ثقة وموثوقية", "Trust & Reliability")}
              subtitle={t(
                "خبرة تمتد لأكثر من 10 أعوام في تقديم حلول عقارية مبتكرة وموثوقة بمعايير عالية",
                "More than a decade delivering innovative, dependable real estate solutions to the highest standards.",
              )}
              colors={["#1a1408", "#2a2418", "#14110a"]}
              delay={0.2}
            />
          </div>
          <BentoCard
            title={t("موقع التجمع الخامس", "5th Settlement Location")}
            value={t("قلب القاهرة", "Heart of Cairo")}
            subtitle={t("قرب من الطرق الرئيسية", "Steps from the main roads")}
            colors={["#1f1808", "#2c2418", "#14110a"]}
            delay={0.4}
          />
          <BentoCard
            title={t("استلام سريع", "Fast Handover")}
            value={t("سنتين", "Two Years")}
            subtitle={t("من التعاقد للتسليم", "From contract to handover")}
            colors={["#1c1608", "#2a2014", "#14110a"]}
            delay={0.6}
          />
          <div className="md:col-span-2">
            <BentoCard
              title={t("إطلالات بانوراميا", "Panoramic Views")}
              value={t("حدائق وشوارع", "Gardens & Boulevards")}
              subtitle={t(
                "تتمتع المشاريع بتميز خاص بإطلالات بانوراميا على حدائق وشوارع رئيسية وخدمات حيوية",
                "Our projects enjoy panoramic views over gardens, main streets and key services.",
              )}
              colors={["#171208", "#2a2418", "#14110a"]}
              delay={0.8}
            />
          </div>
          <div className="md:col-span-3">
            <BentoCard
              title={t(
                "خدمة عملاء احترافية تتابع كل خطوة",
                "Professional Customer Service Every Step of the Way",
              )}
              value={t("من التخطيط للتسليم", "From Planning to Handover")}
              subtitle={t(
                "فريقنا المختص يتابع مع كل عميل كل خطوة في مسار التنفيذ بدايةً من التخطيط وحتى التسليم النهائي، هدفنا توفير تجربة سلسة وشفافة تمنح العملاء الثقة والاطمئنان",
                "Our dedicated team walks every client through each stage — from planning to final handover — for a smooth, transparent experience built on trust.",
              )}
              colors={["#13100a", "#231e10", "#14110a"]}
              delay={1}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
