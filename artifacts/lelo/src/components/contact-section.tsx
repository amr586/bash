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

export function ContactSection() {
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
        title: "بيانات ناقصة",
        description: "اكتب اسمك ورسالتك.",
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
        title: "وصلتنا رسالتك",
        description: "هنرد عليك في أقرب وقت.",
      });
      setMessage("");
    } catch (err) {
      toast({
        title: "خطأ",
        description: err instanceof Error ? err.message : "تعذّر الإرسال.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      id="contact"
      className="relative py-20 px-4 bg-background"
      dir="rtl"
    >
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: "var(--gold-light)" }}
          >
            تواصل معنا
          </h2>
          <p className="text-foreground/70 mt-3">
            ابعتلنا رسالتك وفريقنا هيرجعلك بأقرب وقت.
          </p>
        </div>
        <Card className="border-border/40 bg-background/60 backdrop-blur">
          <CardContent className="pt-6 pb-6 px-6">
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="c-name">الاسم *</Label>
                  <Input
                    id="c-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-phone">رقم الهاتف</Label>
                  <Input
                    id="c-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className="text-right"
                    maxLength={30}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-email">الإيميل</Label>
                <Input
                  id="c-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="text-right"
                  maxLength={255}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-reason">سبب الاستفسار *</Label>
                <select
                  id="c-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as typeof reason)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  data-testid="select-contact-reason"
                >
                  <option value="buy">شراء عقار</option>
                  <option value="general">استفسار</option>
                  <option value="partner">طلب شراكة</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-msg">رسالتك *</Label>
                <Textarea
                  id="c-msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  required
                  placeholder="ابعتلنا استفسارك أو طلبك..."
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
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="ml-2 h-4 w-4" />
                  )}
                  إرسال
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
