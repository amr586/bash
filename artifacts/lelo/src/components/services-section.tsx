"use client"

import { motion } from "framer-motion"
import { Home, Building, TrendingUp, Key, ShieldCheck, Hammer } from "lucide-react"
import { useLang } from "@/lib/i18n"

export function ServicesSection() {
  const { lang, t } = useLang()

  const services = [
    {
      icon: Home,
      title: t("تطوير سكني", "Residential Development"),
      description: t(
        "وحدات سكنية فاخرة بتصميمات معاصرة وتشطيبات راقية في أفضل مواقع التجمع الخامس",
        "Luxury residential units with contemporary design and premium finishing in prime 5th Settlement locations.",
      ),
    },
    {
      icon: Building,
      title: t("كومباوندات متكاملة", "Integrated Compounds"),
      description: t(
        "مجمعات سكنية متكاملة بحدائق وخدمات وأمن على مدار الساعة لتجربة سكن متميزة",
        "Fully integrated compounds with gardens, services and 24/7 security for an exceptional living experience.",
      ),
    },
    {
      icon: TrendingUp,
      title: t("استشارات استثمارية", "Investment Advisory"),
      description: t(
        "نصائح متخصصة لاختيار الوحدة العقارية الأنسب كاستثمار يحقق عائدًا مستدامًا",
        "Expert guidance to pick the right unit as an investment with sustainable long-term returns.",
      ),
    },
    {
      icon: Key,
      title: t("تسليم متشطب", "Finished Handover"),
      description: t(
        "وحدات تُسلَّم بتشطيبات حديثة كاملة جاهزة للسكن خلال سنتين من التعاقد",
        "Units delivered fully finished and move-in ready within two years of contract signing.",
      ),
    },
    {
      icon: ShieldCheck,
      title: t("ضمان الجودة", "Quality Guarantee"),
      description: t(
        "معايير عالية في التنفيذ ومواد بناء أصلية مع ضمان شامل على كل وحدة",
        "High construction standards, genuine materials and a comprehensive warranty on every unit.",
      ),
    },
    {
      icon: Hammer,
      title: t("إدارة المشاريع", "Project Management"),
      description: t(
        "متابعة احترافية لكل مشروع من التخطيط حتى التسليم بدقة واهتمام",
        "Professional end-to-end project management — from planning all the way to handover.",
      ),
    },
  ]

  return (
    <section id="services" className="py-20 px-4 bg-background overflow-hidden">
      <div
        className="container mx-auto"
        dir={lang === "ar" ? "rtl" : "ltr"}
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span
              className="text-sm uppercase tracking-[0.3em] font-semibold"
              style={{ color: "var(--gold)" }}
            >
              Our Services
            </span>
          </motion.div>
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4 mt-3"
            style={{ color: "var(--gold-light)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {t("خدماتنا العقارية", "Our Real Estate Services")}
          </motion.h2>
          <motion.p
            className="text-xl text-foreground/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t(
              "حلول عقارية متكاملة تغطي كل احتياجاتك من البحث والاستشارة وحتى التسليم",
              "End-to-end real estate solutions covering every step — from search and advisory all the way to handover.",
            )}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              className="group relative p-8 rounded-2xl border overflow-hidden"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -6 }}
            >
              <motion.div
                className="absolute -top-12 -left-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)",
                }}
              />
              <div
                className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 transition-transform group-hover:scale-110 group-hover:rotate-3"
                style={{ background: "rgba(212, 175, 55, 0.1)" }}
              >
                <service.icon className="h-7 w-7" style={{ color: "var(--gold)" }} />
              </div>
              <h3
                className="text-xl font-bold mb-3 relative"
                style={{ color: "var(--gold-light)" }}
              >
                {service.title}
              </h3>
              <p className="text-foreground/75 leading-relaxed relative">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
