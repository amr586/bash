import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";
import { useLang } from "@/lib/i18n";
import { BLOG_POSTS } from "@/lib/blogs-data";
import { Calendar } from "lucide-react";

interface DbPost {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  coverImageUrl: string;
  dateLabel: string;
  isPublished: boolean;
}

export default function BlogsPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const [dbPosts, setDbPosts] = useState<DbPost[] | null>(null);

  useEffect(() => {
    fetch("/api/blog-posts")
      .then((r) => r.json())
      .then((d: { posts?: DbPost[] }) => setDbPosts(d.posts ?? []))
      .catch(() => setDbPosts([]));
  }, []);

  const showStatic = dbPosts !== null && dbPosts.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-16" dir={isAr ? "rtl" : "ltr"}>
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h1
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{ color: "var(--gold-light)", fontFamily: "'Tajawal', sans-serif" }}
              >
                {t("المدوّنة", "Blog")}
              </h1>
              <p className="text-foreground/60 text-base max-w-xl mx-auto">
                {t(
                  "مقالات ونصايح عقارية من خبرة باشاك في السوق المصري",
                  "Real estate articles and tips from Bashak's experience in the Egyptian market",
                )}
              </p>
            </div>

            {dbPosts === null ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* DB posts */}
                {dbPosts.map((post) => (
                  <Link key={post.id} href={`/blogs/${post.slug}`} className="group block">
                    <article className="rounded-2xl overflow-hidden border border-border/40 bg-background/60 backdrop-blur hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5">
                        {post.coverImageUrl ? (
                          <img
                            src={post.coverImageUrl}
                            alt={isAr ? post.titleAr : post.titleEn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-foreground/20 text-4xl">📰</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </div>
                      <div className="p-5 flex flex-col flex-1 gap-3">
                        {post.dateLabel && (
                          <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                            <Calendar className="h-3.5 w-3.5" />
                            {post.dateLabel}
                          </div>
                        )}
                        <h2
                          className="font-bold text-lg leading-snug group-hover:text-[var(--gold-light)] transition-colors line-clamp-2"
                          style={{ fontFamily: "'Tajawal', sans-serif" }}
                        >
                          {isAr ? post.titleAr : post.titleEn}
                        </h2>
                        <p className="text-sm text-foreground/65 leading-relaxed line-clamp-3 flex-1">
                          {isAr ? post.excerptAr : post.excerptEn}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold mt-1" style={{ color: "var(--gold-light)" }}>
                          {t("اقرأ المزيد ←", "Read more →")}
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}

                {/* Static fallback posts */}
                {showStatic &&
                  BLOG_POSTS.map((post) => (
                    <Link key={post.slug} href={`/blogs/${post.slug}`} className="group block">
                      <article className="rounded-2xl overflow-hidden border border-border/40 bg-background/60 backdrop-blur hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                        <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5">
                          <img
                            src={post.coverImage}
                            alt={isAr ? post.titleAr : post.titleEn}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>
                        <div className="p-5 flex flex-col flex-1 gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                            <Calendar className="h-3.5 w-3.5" />
                            {isAr ? post.dateAr : post.dateEn}
                          </div>
                          <h2
                            className="font-bold text-lg leading-snug group-hover:text-[var(--gold-light)] transition-colors line-clamp-2"
                            style={{ fontFamily: "'Tajawal', sans-serif" }}
                          >
                            {isAr ? post.titleAr : post.titleEn}
                          </h2>
                          <p className="text-sm text-foreground/65 leading-relaxed line-clamp-3 flex-1">
                            {isAr ? post.excerptAr : post.excerptEn}
                          </p>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold mt-1" style={{ color: "var(--gold-light)" }}>
                            {t("اقرأ المزيد ←", "Read more →")}
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
