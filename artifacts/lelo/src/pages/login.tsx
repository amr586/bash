import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LeLoLogo } from "@/components/lelo-logo";
import {
  Loader2,
  LogIn,
  UserPlus,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";

type Mode = "login" | "signup";

interface OtpState {
  challengeId: string;
  devOtp: string;
  expiresAt: number;
  target: string;
  kind: "login" | "signup";
}

const PW_RULES = {
  len: (s: string) => s.length >= 8,
  upper: (s: string) => /[A-Z]/.test(s),
  digit: (s: string) => /\d/.test(s),
  symbol: (s: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(s),
};

function pwScore(s: string) {
  return Object.values(PW_RULES).filter((fn) => fn(s)).length;
}

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [otp, setOtp] = useState<OtpState | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!otp) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((otp.expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [otp]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setOtp(null);
    setCode("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (firstName.trim().length < 1) {
        setError("اكتب اسمك الأول.");
        return;
      }
      if (phone.trim().length < 8) {
        setError("اكتب رقم موبايل صحيح.");
        return;
      }
      if (pwScore(password) < 4) {
        setError("كلمة السر لازم 8 أحرف على الأقل وفيها حرف كبير ورقم ورمز.");
        return;
      }
      if (password !== confirmPassword) {
        setError("كلمتي السر مش متطابقتين.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body =
        mode === "login"
          ? { email: email.trim(), password, remember }
          : {
              firstName: firstName.trim(),
              lastName: lastName.trim() || undefined,
              email: email.trim(),
              phone: phone.trim(),
              password,
            };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as {
        needsOtp?: boolean;
        challengeId?: string;
        devOtp?: string;
        expiresAt?: number;
        target?: string;
        error?: string;
      };
      if (!res.ok || !data.needsOtp || !data.challengeId || !data.devOtp) {
        setError(data.error ?? "حدث خطأ، حاول تاني.");
        return;
      }
      setOtp({
        challengeId: data.challengeId,
        devOtp: data.devOtp,
        expiresAt: data.expiresAt ?? Date.now() + 5 * 60_000,
        target: data.target ?? email,
        kind: mode,
      });
      setCode("");
    } catch {
      setError("تعذّر الاتصال بالسيرفر.");
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setError(null);
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          challengeId: otp.challengeId,
          code: code.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "الكود غلط أو انتهت صلاحيته.");
        return;
      }
      window.location.href = "/profile";
    } catch {
      setError("تعذّر التحقق. حاول تاني.");
    } finally {
      setVerifying(false);
    }
  };

  if (otp) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background px-4 py-10"
        dir="rtl"
      >
        <Card className="w-full max-w-md border-border/40 bg-background/80 backdrop-blur">
          <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center text-center gap-6">
            <LeLoLogo />
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "color-mix(in srgb, var(--gold) 20%, transparent)",
              }}
            >
              <ShieldCheck className="h-8 w-8" style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2 text-foreground">
                أكّد كود التحقق
              </h1>
              <p className="text-sm text-foreground/70 leading-relaxed">
                بعتنا كود مكوّن من 6 أرقام إلى{" "}
                <span dir="ltr" className="font-semibold text-foreground">
                  {otp.target}
                </span>
              </p>
            </div>

            <div
              className="w-full rounded-2xl p-4 border-2"
              style={{
                background: "color-mix(in srgb, var(--gold) 12%, transparent)",
                borderColor: "var(--gold)",
              }}
              data-testid="otp-display"
            >
              <p className="text-xs text-foreground/70 mb-2">
                الكود الخاص بك (يظهر هنا تلقائيًا للتجربة):
              </p>
              <div
                className="text-4xl font-extrabold tracking-[0.5em] font-mono"
                style={{ color: "var(--gold)" }}
                dir="ltr"
              >
                {otp.devOtp}
              </div>
              <p className="text-xs text-foreground/60 mt-2">
                ينتهي خلال{" "}
                <span dir="ltr" className="font-bold">
                  {Math.floor(secondsLeft / 60)}:
                  {String(secondsLeft % 60).padStart(2, "0")}
                </span>
              </p>
            </div>

            <form onSubmit={onVerify} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp-input">اكتب الكود</Label>
                <Input
                  id="otp-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  dir="ltr"
                  className="text-center text-2xl tracking-[0.4em] font-mono"
                  data-testid="input-otp-code"
                  autoFocus
                />
              </div>

              {error && (
                <div
                  className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                  data-testid="text-otp-error"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={verifying || code.length !== 6 || secondsLeft === 0}
                className="w-full text-black font-semibold rounded-xl"
                style={{ background: "var(--gold)" }}
                data-testid="button-verify-otp"
              >
                {verifying ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="ml-2 h-4 w-4" />
                )}
                تأكيد الكود
              </Button>

              <button
                type="button"
                onClick={() => {
                  setOtp(null);
                  setError(null);
                  setCode("");
                }}
                className="inline-flex items-center justify-center gap-1 text-sm text-foreground/70 hover:text-foreground"
                data-testid="button-otp-back"
              >
                <ArrowLeft className="h-4 w-4" />
                رجوع وتعديل البيانات
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                ? "ادخل إيميلك وكلمة المرور وهنبعتلك كود تحقق."
                : "املأ بياناتك وهيتعمل لك حساب جديد بعد كود التحقق."}
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
                    <Label htmlFor="firstName">الاسم الأول *</Label>
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
                  <Label htmlFor="phone">رقم الموبايل *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    required
                    data-testid="input-phone"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">الإيميل *</Label>
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
              <Label htmlFor="password">كلمة المرور *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "8 أحرف، حرف كبير، رقم، رمز" : ""}
                dir="ltr"
                minLength={mode === "signup" ? 8 : undefined}
                required
                data-testid="input-password"
              />
              {mode === "signup" && password.length > 0 && (
                <ul className="text-xs space-y-1 mt-1">
                  <PwRule ok={PW_RULES.len(password)} label="8 أحرف على الأقل" />
                  <PwRule ok={PW_RULES.upper(password)} label="حرف إنجليزي كبير (A-Z)" />
                  <PwRule ok={PW_RULES.digit(password)} label="رقم (0-9)" />
                  <PwRule ok={PW_RULES.symbol(password)} label="رمز خاص (!@#$...)" />
                </ul>
              )}
            </div>

            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  dir="ltr"
                  required
                  data-testid="input-confirm-password"
                />
                {confirmPassword.length > 0 && (
                  <PwRule
                    ok={password === confirmPassword}
                    label={password === confirmPassword ? "متطابقة" : "غير متطابقة"}
                  />
                )}
              </div>
            )}

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
              {mode === "login" ? "إرسال كود التحقق" : "إنشاء الحساب"}
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

function PwRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={`inline-flex items-center gap-1 ml-3 ${
        ok ? "text-green-500" : "text-foreground/50"
      }`}
    >
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{label}</span>
    </li>
  );
}
