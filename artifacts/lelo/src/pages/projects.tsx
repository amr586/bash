import { ProjectsSection } from "@/components/projects-section";
import { PastProjectsSection } from "@/components/past-projects-section";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        <ProjectsSection />
        <PastProjectsSection />
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
