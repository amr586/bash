import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth, type AuthUser } from "@workspace/replit-auth-web";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Save,
  LogOut,
  ShieldCheck,
  Settings,
  Camera,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/api";
import { isStaff } from "@/lib/roles";
import { useLang } from "@/lib/i18n";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

function initials(user: AuthUser): string {
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || (user.email?.[0]?.toUpperCase() ?? "U");
}

async function uploadProfileImage(
  file: File,
  fallbackError: string,
): Promise<string> {
  const metaRes = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    }),
  });
  if (!metaRes.ok) {
    const err = (await metaRes.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? fallbackError);
  }
  const { uploadURL, objectPath } = (await metaRes.json()) as {
    uploadURL: string;
    objectPath: string;
  };
  const putRes = await fetch(uploadURL, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!putRes.ok) throw new Error(fallbackError);
  return objectPath;
}

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const iconMargin = isAr ? "ml-2" : "mr-2";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      setProfileImageUrl(user.profileImageUrl ?? "");
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  async function onPickPhoto(file: File | null) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: t("حجم كبير", "File too large"),
        description: t(
          "الصورة لازم تبقى أصغر من 8 ميجا.",
          "Image must be smaller than 8 MB.",
        ),
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      const path = await uploadProfileImage(
        file,
        t("فشل رفع الصورة", "Image upload failed"),
      );
      setProfileImageUrl(path);
      toast({
        title: t("اترفعت الصورة", "Image uploaded"),
        description: t(
          "اضغط حفظ التغييرات لتثبيت الصورة على بروفايلك.",
          "Click Save to apply the new picture to your profile.",
        ),
      });
    } catch (err) {
      toast({
        title: t("خطأ", "Error"),
        description:
          err instanceof Error ? err.message : t("فشل الرفع.", "Upload failed."),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          profileImageUrl: profileImageUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      toast({
        title: t("تم الحفظ", "Saved"),
        description: t(
          "تم تحديث بروفايلك بنجاح.",
          "Your profile was updated successfully.",
        ),
      });
      window.location.reload();
    } catch (err) {
      toast({
        title: t("حصل خطأ", "Something went wrong"),
        description:
          err instanceof Error
            ? err.message
            : t("ما قدرناش نحفظ.", "We couldn't save your changes."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  const previewSrc = profileImageUrl ? resolveImageUrl(profileImageUrl) : "";

  return (
    <div
      className="min-h-screen bg-background px-4 py-24"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            {t("بروفايلك", "Your profile")}
          </h1>
          <div className="flex gap-2">
            {isStaff(user) && (
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/admin">
                  <Settings className={`${iconMargin} h-4 w-4`} />
                  {t("لوحة الأدمن", "Admin panel")}
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={logout}
              className="rounded-xl text-foreground/80 hover:text-foreground"
            >
              <LogOut className={`${iconMargin} h-4 w-4`} />
              {t("تسجيل الخروج", "Logout")}
            </Button>
          </div>
        </div>

        <Card className="border-border/40 bg-background/60 backdrop-blur">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="flex items-center gap-5 mb-8">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-[var(--gold)]/40">
                  <AvatarImage src={previewSrc || undefined} alt="avatar" />
                  <AvatarFallback
                    className="text-xl font-bold text-black"
                    style={{ background: "var(--gold)" }}
                  >
                    {initials(user)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  data-testid="button-pick-profile-photo"
                  className={`absolute -bottom-1 ${isAr ? "-left-1" : "-right-1"} inline-flex items-center justify-center w-9 h-9 rounded-full text-black shadow-lg disabled:opacity-60`}
                  style={{ background: "var(--gold)" }}
                  aria-label={t("ارفع صورة من جهازك", "Upload a picture")}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  data-testid="input-profile-photo"
                  onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-semibold text-foreground truncate">
                    {firstName || lastName
                      ? `${firstName} ${lastName}`.trim()
                      : t("بدون اسم", "No name")}
                  </h2>
                  {user.isAdmin && (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold text-black px-2 py-0.5 rounded-md"
                      style={{ background: "var(--gold)" }}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {t("سوبر أدمن", "Super admin")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/60 truncate">
                  {user.email ?? t("بدون إيميل", "No email")}
                </p>
                <p className="text-xs text-foreground/50 mt-1">
                  {t(
                    "دوس على الكاميرا لتغيير صورتك من جهازك.",
                    "Click the camera to change your picture.",
                  )}
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="grid gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">
                    {t("الاسم الأول", "First name")}
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t("مثال: محمد", "e.g. Mohamed")}
                    maxLength={100}
                    data-testid="input-first-name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">
                    {t("الاسم الأخير", "Last name")}
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t("مثال: أحمد", "e.g. Ahmed")}
                    maxLength={100}
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">{t("الإيميل", "Email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={255}
                  dir="ltr"
                  className={isAr ? "text-right" : "text-left"}
                  data-testid="input-email"
                />
                <p className="text-xs text-foreground/50">
                  {t(
                    "بتقدر تغيّر إيميل الدخول من هنا. هتسجّل دخول بالإيميل الجديد المرة الجاية.",
                    "You can change your login email here. You'll log in with the new email next time.",
                  )}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">{t("رقم الهاتف", "Phone")}</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("مثال: 01151313999", "e.g. 01151313999")}
                  maxLength={30}
                  dir="ltr"
                  className={isAr ? "text-right" : "text-left"}
                  data-testid="input-phone"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-xl text-black font-semibold"
                  style={{ background: "var(--gold)" }}
                  data-testid="button-save-profile"
                >
                  {saving ? (
                    <Loader2 className={`${iconMargin} h-4 w-4 animate-spin`} />
                  ) : (
                    <Save className={`${iconMargin} h-4 w-4`} />
                  )}
                  {t("حفظ التغييرات", "Save changes")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
