import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LeLoLogo } from "@/components/lelo-logo";
import { Loader2, LogIn, UserPlus } from "lucide-react";

type Mode = "login" | "signup";

export default function LoginPage() {
  const { isAuthenticated, isLoading, login, signup } = useAuth();
  const [, navigate] = useLocation();

  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result =
      mode === "login"
        ? await login({ email: email.trim(), password, remember })
        : await signup({
            firstName: firstName.trim(),
            lastName: lastName.trim() || undefined,
            email: email.trim(),
            phone: phone.trim() || undefined,
            password,
          });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate("/profile");
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background px-4 py-10"
      dir="rtl"
    >
      <Card className="w-full max-w-md border-border/40 bg-background/80 backdrop-blur">
        <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center text-center gap-6">
          <LeLoLogo />

          <div>
            <h1 className="text-2xl font-bold mb-2 text-foreground">
              مرحبًا بك في باشاك
            </h1>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {mode === "login"
                ? "ادخل إيميلك وكلمة المرور للوصول لحسابك."
                : "املأ بياناتك لإنشاء حساب جديد على باشاك."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full p-1 rounded-xl bg-foreground/5 border border-border/40">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`py-2 rounded-lg text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-[var(--gold)] text-black"
                  : "text-foreground/70 hover:text-foreground"
              }`}
              data-testid="tab-login"
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`py-2 rounded-lg text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-[var(--gold)] text-black"
                  : "text-foreground/70 hover:text-foreground"
              }`}
              data-testid="tab-signup"
            >
              إنشاء حساب جديد
            </button>
          </div>

          <form onSubmit={onSubmit} className="w-full flex flex-col gap-4 text-right">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName">الاسم الأول</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName">الاسم الأخير</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">رقم الموبايل</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    data-testid="input-phone"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">الإيميل</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                dir="ltr"
                required
                data-testid="input-email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "6 أحرف على الأقل" : ""}
                dir="ltr"
                minLength={mode === "signup" ? 6 : undefined}
                required
                data-testid="input-password"
              />
            </div>

            {mode === "login" && (
              <label
                className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer select-none"
                data-testid="label-remember"
              >
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  data-testid="checkbox-remember"
                />
                <span>تذكّرني لمدة شهر</span>
              </label>
            )}

            {error && (
              <div
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                data-testid="text-auth-error"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full text-black font-semibold rounded-xl"
              style={{ background: "var(--gold)" }}
              data-testid="button-submit"
            >
              {submitting ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                <LogIn className="ml-2 h-4 w-4" />
              ) : (
                <UserPlus className="ml-2 h-4 w-4" />
              )}
              {mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
            </Button>
          </form>

          <p className="text-xs text-foreground/50">
            بتسجيل دخولك أو إنشاء حسابك أنت موافق على شروط استخدام موقع باشاك.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
