import { useState, type FormEvent, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface Props {
  trigger: ReactNode;
}

export function RegisterNowDialog({ trigger }: Props) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState<string>("buy");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const REASONS = [
    { value: "buy", label: t("شراء عقار", "Buying a property") },
    { value: "general", label: t("استفسار", "General enquiry") },
    { value: "partner", label: t("طلب شراكة", "Partnership request") },
  ];

  const reset = () => {
    setName("");
    setPhone("");
    setReason("buy");
    setNotes("");
    setError(null);
    setSuccess(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError(t("اكتب اسمك من فضلك.", "Please enter your name."));
      return;
    }
    if (phone.trim().length < 6) {
      setError(t("اكتب رقم تليفون صحيح.", "Please enter a valid phone number."));
      return;
    }
    setSubmitting(true);
    const reasonLabel =
      REASONS.find((r) => r.value === reason)?.label ?? t("تسجيل اهتمام", "Interest registration");
    const message = notes.trim()
      ? `[${reasonLabel}] ${notes.trim()}`
      : `[${reasonLabel}] ${t("تسجيل اهتمام جديد عبر زر \"سجّل الآن\".", "New interest registration via the Register Now button.")}`;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? t("حصل خطأ، حاول تاني.", "Something went wrong, please try again."));
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("حصل خطأ، حاول تاني.", "Something went wrong, please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const isAr = lang === "ar";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setTimeout(reset, 200);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        dir={isAr ? "rtl" : "ltr"}
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <DialogHeader className={isAr ? "text-right" : "text-left"}>
          <DialogTitle className="text-xl" style={{ color: "var(--gold-light)" }}>
            {t("سجّل اهتمامك الآن", "Register Your Interest Now")}
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            {t(
              "اترك بياناتك وفريق المبيعات هيتواصل معاك في أسرع وقت.",
              "Leave your details and our sales team will contact you shortly.",
            )}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-lg font-semibold">{t("تم استلام طلبك!", "Your request has been received!")}</p>
            <p className="text-sm text-foreground/70">
              {t(
                "فريق باشاك هيتواصل معاك قريبًا. شكرًا لاهتمامك.",
                "The Bashak team will be in touch soon. Thanks for your interest.",
              )}
            </p>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 text-black font-semibold"
              style={{ background: "var(--gold)" }}
            >
              {t("تمام", "OK")}
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${isAr ? "text-right" : "text-left"}`}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rn-name">{t("الاسم", "Name")}</Label>
              <Input
                id="rn-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("اسمك بالكامل", "Your full name")}
                required
                data-testid="input-register-name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rn-phone">{t("رقم الموبايل", "Mobile number")}</Label>
              <Input
                id="rn-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                dir="ltr"
                required
                data-testid="input-register-phone"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rn-reason">{t("سبب التواصل", "Reason for contact")}</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="rn-reason" data-testid="select-register-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rn-notes">{t("معلومات إضافية", "Additional notes")}</Label>
              <Textarea
                id="rn-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t(
                  "مثلاً: ميزانية، عدد الغرف، المنطقة المفضلة...",
                  "E.g. budget, number of bedrooms, preferred area…",
                )}
                rows={3}
                data-testid="input-register-notes"
              />
            </div>

            {error && (
              <div
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                data-testid="text-register-error"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full text-black font-semibold rounded-xl"
              style={{ background: "var(--gold)" }}
              data-testid="button-register-submit"
            >
              {submitting && <Loader2 className={`${isAr ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`} />}
              {submitting
                ? t("جاري الإرسال...", "Sending…")
                : t("سجّل الآن", "Register Now")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
