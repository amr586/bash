import { ServicesSection } from "@/components/services-section";
import { AnimatedFeaturesSection } from "@/components/animated-features-section";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        <AnimatedFeaturesSection />
        <ServicesSection />
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
