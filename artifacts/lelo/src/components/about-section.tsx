export function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 bg-background" dir="rtl">
      <div className="max-w-5xl mx-auto" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        <div className="text-center mb-10">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "var(--gold)" }}
            data-testid="heading-about"
          >
            عننا
          </h2>
          <div
            className="w-20 h-1 mx-auto rounded-full"
            style={{ background: "var(--gold)" }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <div className="rounded-2xl border p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--gold-light)" }}>
              من نحن
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              <strong>شركة باشاك للتطوير العقاري</strong> — أكتر من <strong>10 سنوات</strong> خبرة في
              تطوير وبناء المشاريع السكنية والاستثمارية في قلب التجمع الخامس بالقاهرة الجديدة.
              كل مشاريعنا اللي بتشوفها على الموقع <strong>بنبنيها بأنفسنا</strong> — من التصميم
              للتنفيذ للتسليم — مش بنعرض عقارات حد تاني، إحنا المطوّر والمالك.
            </p>
          </div>

          <div className="rounded-2xl border p-6 bg-card/50 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--gold-light)" }}>
              قيمنا
            </h3>
            <ul className="space-y-2 text-foreground/80 leading-relaxed">
              <li>• الشفافية الكاملة في كل تعاملاتنا.</li>
              <li>• جودة بناء وتشطيب على أعلى مستوى.</li>
              <li>• فريق خدمة عملاء متاح طول الوقت.</li>
              <li>• خبرة طويلة في السوق المصري.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
