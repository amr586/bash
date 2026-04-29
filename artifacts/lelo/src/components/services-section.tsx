"use client"

import { motion } from "framer-motion"
import { Home, Building, TrendingUp, Key, ShieldCheck, Hammer } from "lucide-react"

const services = [
  {
    icon: Home,
    title: "تطوير سكني",
    description: "وحدات سكنية فاخرة بتصميمات معاصرة وتشطيبات راقية في أفضل مواقع التجمع الخامس",
  },
  {
    icon: Building,
    title: "كومباوندات متكاملة",
    description: "مجمعات سكنية متكاملة بحدائق وخدمات وأمن على مدار الساعة لتجربة سكن متميزة",
  },
  {
    icon: TrendingUp,
    title: "استشارات استثمارية",
    description: "نصائح متخصصة لاختيار الوحدة العقارية الأنسب كاستثمار يحقق عائدًا مستدامًا",
  },
  {
    icon: Key,
    title: "تسليم متشطب",
    description: "وحدات تُسلَّم بتشطيبات حديثة كاملة جاهزة للسكن خلال سنتين من التعاقد",
  },
  {
    icon: ShieldCheck,
    title: "ضمان الجودة",
    description: "معايير عالية في التنفيذ ومواد بناء أصلية مع ضمان شامل على كل وحدة",
  },
  {
    icon: Hammer,
    title: "إدارة المشاريع",
    description: "متابعة احترافية لكل مشروع من التخطيط حتى التسليم بدقة واهتمام",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 px-4 bg-background overflow-hidden">
      <div
        className="container mx-auto"
        dir="rtl"
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
            خدماتنا العقارية
          </motion.h2>
          <motion.p
            className="text-xl text-foreground/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            حلول عقارية متكاملة تغطي كل احتياجاتك من البحث والاستشارة وحتى التسليم
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
