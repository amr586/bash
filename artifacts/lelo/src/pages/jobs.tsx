import { useEffect, useRef, useState, type FormEvent } from "react";
import { Footer } from "@/components/footer";
import { BashakAIChat } from "@/components/bashak-ai-chat";
import { ContactWidget } from "@/components/contact-widget";
import { useLang } from "@/lib/i18n";
import { apiFetch, uploadFile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, CheckCircle2, Loader2, MapPin, Paperclip, Send, X } from "lucide-react";

interface JobListing {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  requirementsAr: string;
  requirementsEn: string;
  location: string;
}


export default function JobsPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  const [jobs, setJobs] = useState<JobListing[] | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = uploading || submitting;

  useEffect(() => {
    fetch("/api/job-listings")
      .then((r) => r.json())
      .then((d: { jobs?: JobListing[] }) => setJobs(d.jobs ?? []))
      .catch(() => setJobs([]));
  }, []);

  function applyToJob(job: JobListing) {
    setSelectedJob(job);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) { toast({ title: t("الاسم مطلوب", "Name is required"), variant: "destructive" }); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast({ title: t("الإيميل غير صحيح", "Invalid email"), variant: "destructive" }); return; }
    if (qualifications.trim().length < 10) { toast({ title: t("اكتب مؤهلاتك بالتفصيل", "Please describe your qualifications"), variant: "destructive" }); return; }

    let cvUrl: string | null = null;
    if (cvFile) {
      setUploading(true);
      try {
        cvUrl = await uploadFile(cvFile);
      } catch {
        toast({
          title: t(
            "ملاحظة: تعذّر رفع السيرة الذاتية",
            "Note: CV could not be uploaded",
          ),
          description: t(
            "هيتم إرسال طلبك بدون السيرة الذاتية. يمكنك إرسالها لاحقاً على الإيميل.",
            "Your application will be sent without the CV. You can email it separately.",
          ),
        });
        cvUrl = null;
      } finally {
        setUploading(false);
      }
    }

    setSubmitting(true);
    try {
      const jobTitle = selectedJob ? (isAr ? selectedJob.titleAr : selectedJob.titleEn) : undefined;
      await apiFetch("/api/jobs/apply", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), qualifications: qualifications.trim(), cvUrl, jobTitle }),
      });
      setSubmitted(true);
    } catch (err) {
      toast({ title: t("خطأ في الإرسال", "Submission error"), description: err instanceof Error ? err.message : t("حاول تاني.", "Please try again."), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-20 pb-16" dir={isAr ? "rtl" : "ltr"}>
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: "rgba(212,175,55,0.1)", border: "2px solid var(--gold)" }}
              >
                <Briefcase className="h-7 w-7" style={{ color: "var(--gold)" }} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "var(--gold-light)", fontFamily: "'Tajawal', sans-serif" }}>
                {t("الوظائف", "Jobs")}
              </h1>
              <p className="text-foreground/60 text-base leading-relaxed">
                {t(
                  "باشاك دايماً بتدور على مواهب جديدة. ابعتلنا بياناتك وهنتواصل معاك لو كان في فرصة مناسبة.",
                  "Bashak is always looking for new talent. Send us your details and we'll reach out if there's a suitable opportunity.",
                )}
              </p>
            </div>

            {/* Job Listings */}
            {jobs !== null && jobs.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-5" style={{ color: "var(--gold)", fontFamily: "'Tajawal', sans-serif" }}>
                  {t("الوظائف المتاحة", "Open Positions")}
                </h2>
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <Card key={job.id} className="border-border/40 bg-card/50 backdrop-blur">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                              {isAr ? job.titleAr : job.titleEn}
                            </h3>
                            {job.location && (
                              <div className="flex items-center gap-1 text-xs text-foreground/50 mb-2">
                                <MapPin className="h-3.5 w-3.5" />
                                {job.location}
                              </div>
                            )}
                            {(isAr ? job.descriptionAr : job.descriptionEn) && (
                              <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
                                {isAr ? job.descriptionAr : job.descriptionEn}
                              </p>
                            )}
                            {(isAr ? job.requirementsAr : job.requirementsEn) && (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-foreground/50 mb-1">{t("المتطلبات:", "Requirements:")}</p>
                                <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                                  {isAr ? job.requirementsAr : job.requirementsEn}
                                </p>
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => applyToJob(job)}
                            className="shrink-0 rounded-xl text-black font-semibold text-sm"
                            style={{ background: "var(--gold)" }}
                          >
                            {t("قدّم الآن", "Apply Now")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Application Form */}
            <div ref={formRef} className="scroll-mt-24">
              {selectedJob && (
                <div
                  className="flex items-center gap-2 mb-4 p-3 rounded-xl text-sm border"
                  style={{ borderColor: "var(--gold)", background: "rgba(212,175,55,0.06)" }}
                >
                  <Briefcase className="h-4 w-4 shrink-0" style={{ color: "var(--gold)" }} />
                  <span style={{ color: "var(--gold)" }} className="font-semibold">
                    {t("التقديم على:", "Applying for:")}{" "}
                    {isAr ? selectedJob.titleAr : selectedJob.titleEn}
                  </span>
                  <button type="button" onClick={() => setSelectedJob(null)} className="ms-auto text-foreground/40 hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {submitted ? (
                <Card className="border-border/40 bg-background/60 backdrop-blur">
                  <CardContent className="p-10 text-center">
                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4" style={{ color: "var(--gold)" }} />
                    <h2 className="text-2xl font-bold mb-3">{t("تم إرسال طلبك!", "Application Received!")}</h2>
                    <p className="text-foreground/70 text-base leading-relaxed">
                      {t(
                        "شكراً على اهتمامك بالانضمام لفريق باشاك. هيتم مراجعة بياناتك والتواصل معاك قريباً.",
                        "Thank you for your interest in joining the Bashak team. We'll review your application and get in touch soon.",
                      )}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/40 bg-background/60 backdrop-blur">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-5" style={{ color: "var(--gold-light)", fontFamily: "'Tajawal', sans-serif" }}>
                      {t("تقديم طلب توظيف", "Submit Your Application")}
                    </h2>
                    <form onSubmit={onSubmit} className="grid gap-5">
                      <div className="grid gap-2">
                        <Label htmlFor="job-name">{t("الاسم الكامل *", "Full Name *")}</Label>
                        <Input id="job-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} required disabled={busy} placeholder={t("اكتب اسمك هنا", "Enter your full name")} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="job-email">{t("الإيميل *", "Email *")}</Label>
                        <Input id="job-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required dir="ltr" disabled={busy} placeholder="you@example.com" className={isAr ? "text-right" : ""} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="job-qualifications">{t("المؤهلات والخبرات *", "Qualifications & Experience *")}</Label>
                        <Textarea id="job-qualifications" value={qualifications} onChange={(e) => setQualifications(e.target.value)} rows={5} maxLength={5000} required disabled={busy} placeholder={t("اكتب مؤهلاتك الدراسية وخبراتك...", "Describe your educational background and experience...")} />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t("السيرة الذاتية (اختياري)", "CV / Resume (optional)")}</Label>
                        <div
                          className="flex items-center gap-3 p-3 rounded-xl border border-border/40 cursor-pointer hover:border-[var(--gold)]/60 transition-colors"
                          style={{ background: "rgba(212,175,55,0.02)" }}
                          onClick={() => !busy && fileRef.current?.click()}
                        >
                          <Paperclip className="h-5 w-5 shrink-0" style={{ color: "var(--gold)" }} />
                          <span className="text-sm text-foreground/70 flex-1 truncate">
                            {cvFile ? cvFile.name : t("اضغط لرفع ملف PDF أو Word", "Click to upload PDF or Word file")}
                          </span>
                          {cvFile && !busy && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); setCvFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="shrink-0 text-foreground/40 hover:text-foreground">
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) { if (f.size > 10 * 1024 * 1024) { toast({ title: t("الملف كبير (أقصى 10MB)", "File too large (max 10MB)"), variant: "destructive" }); return; } setCvFile(f); } }} />
                        <p className="text-xs text-foreground/40">{t("PDF أو Word — حجم أقصى 10MB", "PDF or Word — max 10MB")}</p>
                      </div>
                      <Button type="submit" disabled={busy} className="rounded-xl text-black font-semibold w-full mt-2" style={{ background: "var(--gold)" }}>
                        {busy ? (
                          <><Loader2 className={`${isAr ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`} />{uploading ? t("جاري رفع السي في...", "Uploading CV...") : t("جاري الإرسال...", "Sending...")}</>
                        ) : (
                          <><Send className={`${isAr ? "ml-2" : "mr-2"} h-4 w-4`} />{t("إرسال الطلب", "Submit Application")}</>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BashakAIChat />
      <ContactWidget />
    </div>
  );
}
