import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";
import { useLang } from "@/lib/i18n";
import { BookOpen } from "lucide-react";

export default function BlogsPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-xl">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ background: "rgba(212,175,55,0.1)", border: "2px solid var(--gold)" }}
            >
              <BookOpen className="h-9 w-9" style={{ color: "var(--gold)" }} />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "var(--gold-light)" }}
            >
              {t("المدوّنة", "Blog")}
            </h1>
            <p className="text-foreground/60 text-lg leading-relaxed">
              {t(
                "قريباً — هنشارك معاك مقالات ونصايح عقارية من خبرتنا في السوق المصري.",
                "Coming soon — we'll be sharing articles and real-estate tips from our experience in the Egyptian market.",
              )}
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
