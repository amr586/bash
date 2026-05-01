import { Link, useRoute } from "wouter";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";
import { useLang } from "@/lib/i18n";
import { getBlogPost, BLOG_POSTS } from "@/lib/blogs-data";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogDetailPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const [, params] = useRoute<{ slug: string }>("/blogs/:slug");
  const post = params?.slug ? getBlogPost(params.slug) : undefined;

  const body = isAr ? post?.bodyAr : post?.bodyEn;

  const related = post
    ? BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3)
    : [];

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="pt-20 flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t("المقال غير موجود", "Article not found")}</h1>
            <Button asChild style={{ background: "var(--gold)" }} className="text-black rounded-xl">
              <Link href="/blogs">{t("العودة للمدوّنة", "Back to Blog")}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-16" dir={isAr ? "rtl" : "ltr"}>
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-8 transition-colors"
          >
            {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t("العودة للمدوّنة", "Back to Blog")}
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-foreground/50 mb-4">
            <Calendar className="h-3.5 w-3.5" />
            {isAr ? post.dateAr : post.dateEn}
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold leading-snug mb-6"
            style={{ color: "var(--gold-light)", fontFamily: "'Tajawal', sans-serif" }}
          >
            {isAr ? post.titleAr : post.titleEn}
          </h1>

          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 border border-border/30">
            <img
              src={post.coverImage}
              alt={isAr ? post.titleAr : post.titleEn}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose-custom space-y-8">
            {body?.map((block, idx) => (
              <div key={idx} className="space-y-4">
                {block.heading && (
                  <h2
                    className="text-xl md:text-2xl font-bold"
                    style={{ color: "var(--gold)", fontFamily: "'Tajawal', sans-serif" }}
                  >
                    {block.heading}
                  </h2>
                )}
                <p className="text-foreground/80 leading-[1.9] text-base whitespace-pre-wrap">
                  {block.text}
                </p>
                {block.image && (
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-border/30 my-4">
                    <img
                      src={block.image}
                      alt={block.heading ?? ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {related.length > 0 && (
            <div className="mt-16 pt-10 border-t border-border/30">
              <h2
                className="text-xl font-bold mb-6"
                style={{ color: "var(--gold-light)", fontFamily: "'Tajawal', sans-serif" }}
              >
                {t("مقالات ذات صلة", "Related Articles")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map((rel) => (
                  <Link key={rel.slug} href={`/blogs/${rel.slug}`} className="group block">
                    <div className="rounded-xl overflow-hidden border border-border/40 bg-background/60 hover:shadow-lg transition-all duration-300">
                      <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5">
                        <img
                          src={rel.coverImage}
                          alt={isAr ? rel.titleAr : rel.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3
                          className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[var(--gold-light)] transition-colors"
                          style={{ fontFamily: "'Tajawal', sans-serif" }}
                        >
                          {isAr ? rel.titleAr : rel.titleEn}
                        </h3>
                        <p className="text-xs text-foreground/50 mt-1">
                          {isAr ? rel.dateAr : rel.dateEn}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
