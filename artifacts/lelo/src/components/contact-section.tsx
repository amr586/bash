import { useState, type FormEvent, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export function ContactSection() {
  const { lang, t } = useLang();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState<"buy" | "general" | "partner">("buy");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
      if (full && !name) setName(full);
      if (user.email && !email) setEmail(user.email);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [isAuthenticated, user, name, email, phone]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || message.trim().length < 2) {
      toast({
        title: t("بيانات ناقصة", "Missing details"),
        description: t("اكتب اسمك ورسالتك.", "Please add your name and your message."),
        variant: "destructive",
      });
      return;
    }
    setSending(true);
    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          reason,
          message: message.trim(),
        }),
      });
      toast({
        title: t("وصلتنا رسالتك", "We've got your message"),
        description: t("هنرد عليك في أقرب وقت.", "We'll get back to you shortly."),
      });
      setMessage("");
    } catch (err) {
      toast({
        title: t("خطأ", "Error"),
        description: err instanceof Error ? err.message : t("تعذّر الإرسال.", "Couldn't send your message."),
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      id="contact"
      className="relative py-12 sm:py-16 md:py-20 px-4 bg-background"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "var(--gold-light)" }}
          >
            {t("تواصل معنا", "Contact Us")}
          </h2>
          <p className="text-foreground/70 mt-3">
            {t(
              "ابعتلنا رسالتك وفريقنا هيرجعلك بأقرب وقت.",
              "Send us a message and our team will reply soon.",
            )}
          </p>
        </div>
        <Card className="border-border/40 bg-background/60 backdrop-blur">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="c-name">{t("الاسم *", "Name *")}</Label>
                  <Input
                    id="c-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-phone">{t("رقم الهاتف", "Phone Number")}</Label>
                  <Input
                    id="c-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className={lang === "ar" ? "text-right" : ""}
                    maxLength={30}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-email">{t("الإيميل", "Email")}</Label>
                <Input
                  id="c-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className={lang === "ar" ? "text-right" : ""}
                  maxLength={255}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-reason">{t("سبب الاستفسار *", "Reason *")}</Label>
                <select
                  id="c-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as typeof reason)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  data-testid="select-contact-reason"
                >
                  <option value="buy">{t("شراء عقار", "Buying a property")}</option>
                  <option value="general">{t("استفسار", "General enquiry")}</option>
                  <option value="partner">{t("طلب شراكة", "Partnership request")}</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-msg">{t("رسالتك *", "Your message *")}</Label>
                <Textarea
                  id="c-msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  required
                  placeholder={t("ابعتلنا استفسارك أو طلبك...", "Tell us your enquiry or request…")}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={sending}
                  className="rounded-xl text-black font-semibold"
                  style={{ background: "var(--gold)" }}
                >
                  {sending ? (
                    <Loader2 className={`${lang === "ar" ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`} />
                  ) : (
                    <Send className={`${lang === "ar" ? "ml-2" : "mr-2"} h-4 w-4`} />
                  )}
                  {t("إرسال", "Send")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
