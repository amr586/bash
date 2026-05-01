import { ContactSection } from "@/components/contact-section";
import { FAQSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        <ContactSection />
        <FAQSection />
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
