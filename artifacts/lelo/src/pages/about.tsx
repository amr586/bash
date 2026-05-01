import { AboutSection } from "@/components/about-section";
import { AnimatedFeaturesSection } from "@/components/animated-features-section";
import { ServicesSection } from "@/components/services-section";
import { MediaSection } from "@/components/media-section";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        <AboutSection />
        <AnimatedFeaturesSection />
        <ServicesSection />
        <MediaSection />
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
