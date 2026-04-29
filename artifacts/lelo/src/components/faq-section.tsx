"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useLang } from "@/lib/i18n"

export function FAQSection() {
  const { lang, t } = useLang()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: t("أين تقع مشاريع شركة باشاك؟", "Where are Bashak's projects located?"),
      answer: t(
        "تتميز مواقع مشاريع شركة باشاك في قلب التجمع الخامس مع قرب فائق من الطرق الرئيسية والخدمات الحيوية. تتمتع المشاريع بتميز خاص بإطلالات بانوراميا على حدائق وشوارع رئيسية.",
        "Bashak's projects sit in the heart of the 5th Settlement, close to main roads and essential services, with panoramic views over gardens and major boulevards.",
      ),
    },
    {
      question: t("ما نظام السداد المتاح؟", "What payment plans are available?"),
      answer: t(
        "مقدم يبدأ من 700 ألف جنيه والباقي يُقسَّط على 60 شهرًا، مع استلام خلال سنتين من تاريخ التعاقد.",
        "A down payment starting from EGP 700,000 with the remainder spread over 60 months — handover within two years of contract signing.",
      ),
    },
    {
      question: t(
        "ما الذي يميز خدمة العملاء في باشاك؟",
        "What makes Bashak's customer service special?",
      ),
      answer: t(
        "في شركة باشاك نؤمن أن الاحترافية في خدمة العملاء هي أساس نجاح أي مشروع. فريقنا المختص يتابع مع كل عميل كل خطوة في مسار التنفيذ بدايةً من التخطيط وحتى التسليم النهائي.",
        "We believe professional customer service is the foundation of every successful project. Our team walks each client through every step — from planning to final handover.",
      ),
    },
    {
      question: t("كم سنة خبرة لدى الشركة؟", "How many years of experience does Bashak have?"),
      answer: t(
        "شركة بشاك للتطوير العقاري تمتلك خبرة تمتد لأكثر من 10 أعوام في تقديم حلول عقارية مبتكرة وموثوقة بمعايير عالية من الجودة والمصداقية.",
        "Bashak Developments has more than 10 years of experience providing innovative, reliable real estate solutions of the highest quality.",
      ),
    },
    {
      question: t(
        "كيف يمكنني الحجز أو الاستعلام؟",
        "How can I book a unit or get more information?",
      ),
      answer: t(
        "للحجز والاستعلام تواصل معنا على الخط الساخن 17327 أو 01151313999، أو عبر واتساب على wa.me/201151313999.",
        "To book or enquire, reach our hotline at 17327 or 01151313999, or message us on WhatsApp at wa.me/201151313999.",
      ),
    },
    {
      question: t("أين يقع المقر الرئيسي للشركة؟", "Where is the company's head office?"),
      answer: t(
        "يقع مقرنا في فيلا 99، الحي الأول، شارع 90، التجمع الخامس، القاهرة الجديدة 1، محافظة القاهرة، مصر، 11835.",
        "Villa 99, First District, 90th Street, 5th Settlement, New Cairo 1, Cairo, Egypt, 11835.",
      ),
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-12 sm:py-16 md:py-20 px-4 bg-background">
      <div
        className="container mx-auto max-w-4xl"
        dir={lang === "ar" ? "rtl" : "ltr"}
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4"
            style={{ color: "var(--gold-light)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {t("الأسئلة الشائعة", "Frequently Asked Questions")}
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t(
              "كل ما تريد معرفته عن مشاريع شركة باشاك. لم تجد إجابتك؟ تواصل معنا.",
              "Everything you need to know about Bashak. Can't find what you need? Get in touch.",
            )}
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border rounded-lg bg-card/50 backdrop-blur-sm"
              style={{ borderColor: "var(--border)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <button
                className={`w-full px-4 sm:px-6 py-3 sm:py-4 ${lang === "ar" ? "text-right" : "text-left"} flex items-center justify-between hover:bg-foreground/5 transition-colors rounded-lg`}
                onClick={() => toggleFAQ(index)}
              >
                <span className={`text-sm sm:text-base md:text-lg font-medium text-foreground ${lang === "ar" ? "pl-3" : "pr-3"}`}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform flex-shrink-0 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  style={{ color: "var(--gold)" }}
                />
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-6 pb-4">
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
