import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { StatsSection } from "@/components/stats-section";
import { PartnersMarquee } from "@/components/partners-marquee";
import { AnimatedFeaturesSection } from "@/components/animated-features-section";
import { ProjectsSection } from "@/components/projects-section";
import { ServicesSection } from "@/components/services-section";
import { FAQSection } from "@/components/faq-section";
import { AnimatedCTASection } from "@/components/animated-cta-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <HeroSection />
        <StatsSection />
        <PartnersMarquee />
        <ProjectsSection />
        <AnimatedFeaturesSection />
        <ServicesSection />
        <FAQSection />
        <AnimatedCTASection />
        <ContactSection />
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
