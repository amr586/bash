import { MediaSection } from "@/components/media-section";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";

export default function MediaPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20">
        <MediaSection />
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
