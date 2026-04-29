import { useLang } from "@/lib/i18n"

export function AboutSection() {
  const { lang, t } = useLang()
  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 px-4 bg-background" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        <div className="text-center mb-8 sm:mb-10">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4"
            style={{ color: "var(--gold)" }}
            data-testid="heading-about"
          >
            {t("عننا", "About Us")}
          </h2>
          <div
            className="w-20 h-1 mx-auto rounded-full"
            style={{ background: "var(--gold)" }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6 md:gap-8 items-stretch">
          <div className="rounded-2xl border p-5 sm:p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: "var(--gold-light)" }}>
              {t("من نحن", "Who We Are")}
            </h3>
            <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
              {t(
                <>
                  <strong>شركة باشاك للتطوير العقاري</strong> — أكتر من <strong>10 سنوات</strong> خبرة في
                  تطوير وبناء المشاريع السكنية والاستثمارية في قلب التجمع الخامس بالقاهرة الجديدة.
                  كل مشاريعنا اللي بتشوفها على الموقع <strong>بنبنيها بأنفسنا</strong> — من التصميم
                  للتنفيذ للتسليم — مش بنعرض عقارات حد تاني، إحنا المطوّر والمالك.
                </>,
                <>
                  <strong>Bashak Developments</strong> — over <strong>10 years</strong> of experience
                  developing residential and investment projects in the heart of the 5th Settlement, New Cairo.
                  Every project on this site is <strong>built by us</strong> — from design to construction
                  to handover. We don't list other people's properties; we are the developer and the owner.
                </>,
              )}
            </p>
          </div>

          <div className="rounded-2xl border p-5 sm:p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: "var(--gold-light)" }}>
              {t("قيمنا", "Our Values")}
            </h3>
            <ul className="space-y-2 text-foreground/80 leading-relaxed text-sm sm:text-base">
              <li>{t("• الشفافية الكاملة في كل تعاملاتنا.", "• Complete transparency in everything we do.")}</li>
              <li>{t("• جودة بناء وتشطيب على أعلى مستوى.", "• Top-tier construction and finishing quality.")}</li>
              <li>{t("• فريق خدمة عملاء متاح طول الوقت.", "• A customer service team available around the clock.")}</li>
              <li>{t("• خبرة طويلة في السوق المصري.", "• Long-standing expertise in the Egyptian market.")}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
