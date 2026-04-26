"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "أين تقع مشاريع شركة باشاك؟",
    answer:
      "تتميز مواقع مشاريع شركة باشاك في قلب التجمع الخامس مع قرب فائق من الطرق الرئيسية والخدمات الحيوية. تتمتع المشاريع بتميز خاص بإطلالات بانوراميا على حدائق وشوارع رئيسية.",
  },
  {
    question: "ما هي مساحات الوحدات المتاحة؟",
    answer:
      "تتوفر شقق أرضي بحديقة خاصة من 3 غرف بمساحات تبدأ من 130 م²، مع إمكانية استلام الحديقة متشطبة مجانًا خلال التعاقد في شهر رمضان.",
  },
  {
    question: "ما نظام السداد المتاح؟",
    answer:
      "مقدم يبدأ من 700 ألف جنيه والباقي يُقسَّط على 60 شهرًا، مع استلام خلال سنتين من تاريخ التعاقد.",
  },
  {
    question: "ما الذي يميز خدمة العملاء في باشاك؟",
    answer:
      "في شركة باشاك نؤمن أن الاحترافية في خدمة العملاء هي أساس نجاح أي مشروع. فريقنا المختص يتابع مع كل عميل كل خطوة في مسار التنفيذ بدايةً من التخطيط وحتى التسليم النهائي.",
  },
  {
    question: "كم سنة خبرة لدى الشركة؟",
    answer:
      "شركة بشاك للتطوير العقاري تمتلك خبرة تمتد لأكثر من 10 أعوام في تقديم حلول عقارية مبتكرة وموثوقة بمعايير عالية من الجودة والمصداقية.",
  },
  {
    question: "كيف يمكنني الحجز أو الاستعلام؟",
    answer:
      "للحجز والاستعلام تواصل معنا على الخط الساخن 17327 أو 01151313999، أو عبر واتساب على wa.me/201151313999.",
  },
  {
    question: "أين يقع المقر الرئيسي للشركة؟",
    answer:
      "يقع مقرنا في فيلا 99، الحي الأول، شارع 90، التجمع الخامس، القاهرة الجديدة 1، محافظة القاهرة، مصر، 11835.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 px-4 bg-background">
      <div
        className="container mx-auto max-w-4xl"
        dir="rtl"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl font-bold mb-4"
            style={{ color: "var(--gold-light)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            الأسئلة الشائعة
          </motion.h2>
          <motion.p
            className="text-xl text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            كل ما تريد معرفته عن مشاريع شركة باشاك. لم تجد إجابتك؟ تواصل معنا.
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
                className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-white/5 transition-colors rounded-lg"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-white pl-4">{faq.question}</span>
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
                <div className="px-6 pb-4">
                  <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
