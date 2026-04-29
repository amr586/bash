import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LeLoLogo } from "@/components/lelo-logo";
import { TermsDialog } from "@/components/terms-dialog";
import { useLang } from "@/lib/i18n";
import {
  Loader2,
  LogIn,
  UserPlus,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  ArrowRight,
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
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  const nextUrl = (() => {
    if (typeof window === "undefined") return "/profile";
    const sp = new URLSearchParams(window.location.search);
    const n = sp.get("next");
    return n && n.startsWith("/") ? n : "/profile";
  })();

  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [otp, setOtp] = useState<OtpState | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(nextUrl);
    }
  }, [isAuthenticated, isLoading, navigate, nextUrl]);

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
        setError(t("اكتب اسمك الأول.", "Enter your first name."));
        return;
      }
      if (phone.trim().length < 8) {
        setError(t("اكتب رقم موبايل صحيح.", "Enter a valid mobile number."));
        return;
      }
      if (pwScore(password) < 4) {
        setError(
          t(
            "كلمة السر لازم 8 أحرف على الأقل وفيها حرف كبير ورقم ورمز.",
            "Password must be at least 8 chars with an uppercase letter, a digit and a symbol.",
          ),
        );
        return;
      }
      if (password !== confirmPassword) {
        setError(t("كلمتي السر مش متطابقتين.", "Passwords do not match."));
        return;
      }
      if (!acceptedTerms) {
        setError(
          t(
            "لازم توافق على الشروط والأحكام وسياسة الخصوصية.",
            "You must accept the Terms and Privacy Policy.",
          ),
        );
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
        setError(data.error ?? t("حدث خطأ، حاول تاني.", "Something went wrong, please try again."));
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
      setError(t("تعذّر الاتصال بالسيرفر.", "Could not reach the server."));
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
        setError(data.error ?? t("الكود غلط أو انتهت صلاحيته.", "Invalid or expired code."));
        return;
      }
      window.location.href = nextUrl;
    } catch {
      setError(t("تعذّر التحقق. حاول تاني.", "Verification failed, try again."));
    } finally {
      setVerifying(false);
    }
  };

  const Back = isAr ? ArrowLeft : ArrowRight;
  const iconMargin = isAr ? "ml-2" : "mr-2";

  if (otp) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background px-4 py-10"
        dir={isAr ? "rtl" : "ltr"}
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
                {t("أكّد كود التحقق", "Confirm verification code")}
              </h1>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {t("بعتنا كود مكوّن من 6 أرقام إلى ", "We sent a 6-digit code to ")}
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
                {t(
                  "الكود الخاص بك (يظهر هنا تلقائيًا للتجربة):",
                  "Your code (shown here automatically for demo):",
                )}
              </p>
              <div
                className="text-4xl font-extrabold tracking-[0.5em] font-mono"
                style={{ color: "var(--gold)" }}
                dir="ltr"
              >
                {otp.devOtp}
              </div>
              <p className="text-xs text-foreground/60 mt-2">
                {t("ينتهي خلال ", "Expires in ")}
                <span dir="ltr" className="font-bold">
                  {Math.floor(secondsLeft / 60)}:
                  {String(secondsLeft % 60).padStart(2, "0")}
                </span>
              </p>
            </div>

            <form onSubmit={onVerify} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp-input">
                  {t("اكتب الكود", "Enter the code")}
                </Label>
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
                  <Loader2 className={`${iconMargin} h-4 w-4 animate-spin`} />
                ) : (
                  <KeyRound className={`${iconMargin} h-4 w-4`} />
                )}
                {t("تأكيد الكود", "Confirm code")}
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
                <Back className="h-4 w-4" />
                {t("رجوع وتعديل البيانات", "Back and edit details")}
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
      dir={isAr ? "rtl" : "ltr"}
    >
      <Card className="w-full max-w-md border-border/40 bg-background/80 backdrop-blur">
        <CardContent className="pt-8 pb-8 px-8 flex flex-col items-center text-center gap-6">
          <LeLoLogo />

          <div>
            <h1 className="text-2xl font-bold mb-2 text-foreground">
              {t("مرحبًا بك في باشاك", "Welcome to Bashak")}
            </h1>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {mode === "login"
                ? t(
                    "ادخل إيميلك وكلمة المرور وهنبعتلك كود تحقق.",
                    "Enter your email and password and we'll send you a verification code.",
                  )
                : t(
                    "املأ بياناتك وهيتعمل لك حساب جديد بعد كود التحقق.",
                    "Fill in your details and we'll create your account after the verification code.",
                  )}
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
              {t("تسجيل الدخول", "Login")}
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
              {t("إنشاء حساب جديد", "Create new account")}
            </button>
          </div>

          <form
            onSubmit={onSubmit}
            className={`w-full flex flex-col gap-4 ${isAr ? "text-right" : "text-left"}`}
          >
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName">
                      {t("الاسم الأول *", "First name *")}
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName">
                      {t("الاسم الأخير", "Last name")}
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">
                    {t("رقم الموبايل *", "Mobile number *")}
                  </Label>
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
              <Label htmlFor="email">{t("الإيميل *", "Email *")}</Label>
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
              <Label htmlFor="password">
                {t("كلمة المرور *", "Password *")}
              </Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "signup"
                    ? t("8 أحرف، حرف كبير، رقم، رمز", "8 chars, uppercase, digit, symbol")
                    : ""
                }
                dir="ltr"
                minLength={mode === "signup" ? 8 : undefined}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                data-testid="input-password"
              />
              {mode === "signup" && password.length > 0 && (
                <ul className="text-xs space-y-1 mt-1">
                  <PwRule
                    ok={PW_RULES.len(password)}
                    label={t("8 أحرف على الأقل", "At least 8 characters")}
                  />
                  <PwRule
                    ok={PW_RULES.upper(password)}
                    label={t("حرف إنجليزي كبير (A-Z)", "Uppercase letter (A-Z)")}
                  />
                  <PwRule
                    ok={PW_RULES.digit(password)}
                    label={t("رقم (0-9)", "Digit (0-9)")}
                  />
                  <PwRule
                    ok={PW_RULES.symbol(password)}
                    label={t("رمز خاص (!@#$...)", "Special symbol (!@#$...)")}
                  />
                </ul>
              )}
            </div>

            {mode === "signup" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">
                  {t("تأكيد كلمة المرور *", "Confirm password *")}
                </Label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  dir="ltr"
                  autoComplete="new-password"
                  required
                  data-testid="input-confirm-password"
                />
                {confirmPassword.length > 0 && (
                  <PwRule
                    ok={password === confirmPassword}
                    label={
                      password === confirmPassword
                        ? t("متطابقة", "Match")
                        : t("غير متطابقة", "Do not match")
                    }
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
                <span>{t("تذكّرني لمدة شهر", "Remember me for a month")}</span>
              </label>
            )}

            {mode === "signup" && (
              <label
                className="flex items-start gap-2 text-sm text-foreground/80 cursor-pointer select-none"
                data-testid="label-accept-terms"
              >
                <Checkbox
                  checked={acceptedTerms}
                  onCheckedChange={(v) => setAcceptedTerms(v === true)}
                  className="mt-0.5"
                  data-testid="checkbox-accept-terms"
                />
                <span>
                  {t("أوافق على ", "I agree to the ")}
                  <TermsDialog
                    defaultTab="terms"
                    trigger={
                      <button
                        type="button"
                        className="font-semibold underline underline-offset-2"
                        style={{ color: "var(--gold-light)" }}
                        data-testid="button-open-terms"
                      >
                        {t("الشروط والأحكام", "Terms & Conditions")}
                      </button>
                    }
                  />
                  {t(" و ", " and ")}
                  <TermsDialog
                    defaultTab="privacy"
                    trigger={
                      <button
                        type="button"
                        className="font-semibold underline underline-offset-2"
                        style={{ color: "var(--gold-light)" }}
                        data-testid="button-open-privacy"
                      >
                        {t("سياسة الخصوصية", "Privacy Policy")}
                      </button>
                    }
                  />
                  .
                </span>
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
                <Loader2 className={`${iconMargin} h-4 w-4 animate-spin`} />
              ) : mode === "login" ? (
                <LogIn className={`${iconMargin} h-4 w-4`} />
              ) : (
                <UserPlus className={`${iconMargin} h-4 w-4`} />
              )}
              {mode === "login"
                ? t("إرسال كود التحقق", "Send verification code")
                : t("إنشاء الحساب", "Create account")}
            </Button>
          </form>

          <p className="text-xs text-foreground/50">
            {t(
              "بتسجيل دخولك أو إنشاء حسابك أنت موافق على شروط استخدام موقع باشاك.",
              "By logging in or creating an account, you agree to Bashak's terms of use.",
            )}
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
