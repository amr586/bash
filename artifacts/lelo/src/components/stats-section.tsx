"use client"

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useRef } from "react"
import { Building2, Users, Award, Calendar } from "lucide-react"
import { useLang } from "@/lib/i18n"

interface CounterProps {
  to: number
  suffix?: string
  duration?: number
}

function Counter({ to, suffix = "", duration = 2 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.floor(v).toString())

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration, ease: "easeOut" })
      return () => controls.stop()
    }
  }, [inView, to, duration, count])

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{rounded}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  )
}

export function StatsSection() {
  const { lang, t } = useLang()
  const stats = [
    { icon: Calendar, value: 10, suffix: "+", label: t("سنوات من الخبرة", "Years of Experience") },
    { icon: Building2, value: 50, suffix: "+", label: t("مشروع تم تسليمه", "Projects Delivered") },
    { icon: Users, value: 850, suffix: "+", label: t("عميل سعيد", "Happy Clients") },
    { icon: Award, value: 99, suffix: "%", label: t("نسبة رضا العملاء", "Client Satisfaction") },
  ]

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)",
          }}
        />
      </div>

      <div
        className="container mx-auto relative z-10"
        dir={lang === "ar" ? "rtl" : "ltr"}
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--gold-light)" }}>
            {t("أرقام تتحدث عن نجاحنا", "Numbers That Speak for Our Success")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="relative text-center p-6 md:p-8 rounded-2xl border backdrop-blur-sm"
              style={{
                borderColor: "var(--gold-dark)",
                background: "var(--card)",
              }}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              whileHover={{
                y: -6,
                borderColor: "var(--gold)",
                transition: { duration: 0.2 },
              }}
            >
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                style={{ background: "rgba(212, 175, 55, 0.12)" }}
              >
                <stat.icon className="h-7 w-7" style={{ color: "var(--gold)" }} />
              </div>
              <div
                className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-3 leading-none tracking-tight"
                style={{
                  color: "var(--gold-light)",
                  textShadow: "0 4px 24px rgba(212, 175, 55, 0.35)",
                }}
              >
                <Counter to={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-foreground/80 text-base md:text-lg font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
