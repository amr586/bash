"use client"

import { motion } from "framer-motion"
import { Building2, Landmark, MapPin, Award, ShieldCheck, Sparkles, Home, Briefcase } from "lucide-react"
import { InfiniteSlider } from "./ui/infinite-slider"

const banks = [
  { icon: Landmark, label: "تمويل بنك مصر" },
  { icon: Landmark, label: "البنك الأهلي" },
  { icon: Landmark, label: "CIB" },
  { icon: Landmark, label: "QNB الأهلي" },
  { icon: Landmark, label: "بنك الإمارات دبي الوطني" },
  { icon: Landmark, label: "بنك الكويت الوطني" },
  { icon: Landmark, label: "HSBC" },
  { icon: Landmark, label: "بنك أبوظبي الإسلامي" },
]

const locations = [
  { icon: MapPin, label: "التجمع الخامس" },
  { icon: MapPin, label: "شارع 90 الشمالي" },
  { icon: MapPin, label: "الحي الأول" },
  { icon: MapPin, label: "الحي الثاني" },
  { icon: MapPin, label: "الحي الخامس" },
  { icon: MapPin, label: "النرجس" },
  { icon: MapPin, label: "اللوتس" },
  { icon: MapPin, label: "بيت الوطن" },
]

const values = [
  { icon: Award, label: "10+ سنوات خبرة" },
  { icon: Building2, label: "12 مشروع تم تسليمه" },
  { icon: ShieldCheck, label: "ضمان الجودة" },
  { icon: Sparkles, label: "تشطيبات فاخرة" },
  { icon: Home, label: "حدائق متشطبة" },
  { icon: Briefcase, label: "تقسيط حتى 8 سنوات" },
  { icon: Award, label: "تسليم في الميعاد" },
  { icon: ShieldCheck, label: "عقود موثقة" },
]

interface PillItem {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
}

function Pill({ item }: { item: PillItem }) {
  const Icon = item.icon
  return (
    <div
      className="flex items-center gap-3 px-6 py-3 rounded-full border whitespace-nowrap shrink-0"
      style={{
        borderColor: "var(--gold-dark)",
        background: "rgba(20, 17, 10, 0.6)",
        fontFamily: "'Tajawal', sans-serif",
      }}
    >
      <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--gold)" }} />
      <span className="text-sm md:text-base text-white/90">{item.label}</span>
    </div>
  )
}

export function PartnersMarquee() {
  return (
    <section
      className="relative py-16 px-0 overflow-hidden bg-transparent"
    >
      <div
        className="container mx-auto px-4 mb-10"
        dir="rtl"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div className="text-center">
          <motion.span
            className="text-sm uppercase tracking-[0.3em] font-semibold inline-block mb-3"
            style={{ color: "var(--gold)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Trusted Real Estate Partners
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "var(--gold-light)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            شركاؤنا في تطوير العقار
          </motion.h2>
          <motion.p
            className="text-lg text-white/75 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            بنوك التمويل العقاري، أرقى المواقع، وقيم نفخر بها في كل مشروع
          </motion.p>
        </div>
      </div>

      <div className="relative">
        <InfiniteSlider gap={16} duration={32} className="py-2">
          {banks.map((b, i) => (
            <Pill key={`bank-${i}`} item={b} />
          ))}
        </InfiniteSlider>

        <InfiniteSlider gap={16} duration={36} reverse className="py-2 mt-4">
          {locations.map((l, i) => (
            <Pill key={`loc-${i}`} item={l} />
          ))}
        </InfiniteSlider>

        <InfiniteSlider gap={16} duration={40} className="py-2 mt-4">
          {values.map((v, i) => (
            <Pill key={`val-${i}`} item={v} />
          ))}
        </InfiniteSlider>
      </div>
    </section>
  )
}
