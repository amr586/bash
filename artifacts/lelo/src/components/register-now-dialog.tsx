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

const REASONS = [
  { value: "buy", label: "شراء عقار" },
  { value: "general", label: "استفسار" },
  { value: "partner", label: "طلب شراكة" },
] as const;

interface Props {
  trigger: ReactNode;
}

export function RegisterNowDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState<string>("buy_apartment");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setName("");
    setPhone("");
    setReason("buy_apartment");
    setNotes("");
    setError(null);
    setSuccess(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError("اكتب اسمك من فضلك.");
      return;
    }
    if (phone.trim().length < 6) {
      setError("اكتب رقم تليفون صحيح.");
      return;
    }
    setSubmitting(true);
    const reasonLabel =
      REASONS.find((r) => r.value === reason)?.label ?? "تسجيل اهتمام";
    const message = notes.trim()
      ? `[${reasonLabel}] ${notes.trim()}`
      : `[${reasonLabel}] تسجيل اهتمام جديد عبر زر "سجّل الآن".`;
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
        throw new Error(body.error ?? "حصل خطأ، حاول تاني.");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ، حاول تاني.");
    } finally {
      setSubmitting(false);
    }
  };

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
        dir="rtl"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl" style={{ color: "var(--gold-light)" }}>
            سجّل اهتمامك الآن
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            اترك بياناتك وفريق المبيعات هيتواصل معاك في أسرع وقت.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-lg font-semibold">تم استلام طلبك!</p>
            <p className="text-sm text-foreground/70">
              فريق باشاك هيتواصل معاك قريبًا. شكرًا لاهتمامك.
            </p>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 text-black font-semibold"
              style={{ background: "var(--gold)" }}
            >
              تمام
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4 text-right">
            <div className="flex flex-col gap-2">
              <Label htmlFor="rn-name">الاسم</Label>
              <Input
                id="rn-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك بالكامل"
                required
                data-testid="input-register-name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rn-phone">رقم الموبايل</Label>
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
              <Label htmlFor="rn-reason">سبب التواصل</Label>
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
              <Label htmlFor="rn-notes">معلومات إضافية</Label>
              <Textarea
                id="rn-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلاً: ميزانية، عدد الغرف، المنطقة المفضلة..."
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
              {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {submitting ? "جاري الإرسال..." : "سجّل الآن"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
