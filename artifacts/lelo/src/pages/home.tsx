import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { PropertySearch } from "@/components/property-search";
import { StatsSection } from "@/components/stats-section";
import { PartnersMarquee } from "@/components/partners-marquee";
import { AnimatedFeaturesSection } from "@/components/animated-features-section";
import { AboutSection } from "@/components/about-section";
import { ProjectsSection } from "@/components/projects-section";
import { PastProjectsSection } from "@/components/past-projects-section";
import { MediaSection } from "@/components/media-section";
import { ServicesSection } from "@/components/services-section";
import { FAQSection } from "@/components/faq-section";
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
        <PropertySearch />
        <StatsSection />
        <PartnersMarquee />
        <AboutSection />
        <ProjectsSection />
        <PastProjectsSection />
        <AnimatedFeaturesSection />
        <ServicesSection />
        <MediaSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
