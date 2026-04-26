import { useEffect, useState, type FormEvent } from "react";
import { useAuth, type AuthUser } from "@workspace/replit-auth-web";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, LogOut, ShieldCheck, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function initials(user: AuthUser): string {
  const f = user.firstName?.[0] ?? "";
  const l = user.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || (user.email?.[0]?.toUpperCase() ?? "U");
}

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
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
          phone: phone.trim() || null,
          profileImageUrl: profileImageUrl.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({
        title: "تم الحفظ",
        description: "تم تحديث بروفايلك بنجاح.",
      });
      window.location.reload();
    } catch (err) {
      toast({
        title: "حصل خطأ",
        description: "ما قدرناش نحفظ التغييرات، حاول تاني.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-24" dir="rtl">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">بروفايلك</h1>
          <div className="flex gap-2">
            {user.isAdmin && (
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/admin">
                  <Settings className="ml-2 h-4 w-4" />
                  لوحة الأدمن
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={logout}
              className="rounded-xl text-foreground/80 hover:text-foreground"
            >
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>

        <Card className="border-border/40 bg-background/60 backdrop-blur">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="flex items-center gap-5 mb-8">
              <Avatar className="h-20 w-20 border-2 border-[var(--gold)]/40">
                <AvatarImage src={profileImageUrl || undefined} alt="avatar" />
                <AvatarFallback
                  className="text-xl font-bold text-black"
                  style={{ background: "var(--gold)" }}
                >
                  {initials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-semibold text-foreground truncate">
                    {firstName || lastName
                      ? `${firstName} ${lastName}`.trim()
                      : "بدون اسم"}
                  </h2>
                  {user.isAdmin && (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold text-black px-2 py-0.5 rounded-md"
                      style={{ background: "var(--gold)" }}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      سوبر أدمن
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/60 truncate">
                  {user.email ?? "بدون إيميل"}
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="grid gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثال: محمد"
                    maxLength={100}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثال: أحمد"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 01151313999"
                  maxLength={30}
                  dir="ltr"
                  className="text-right"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="photo">رابط الصورة الشخصية</Label>
                <Input
                  id="photo"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  placeholder="https://..."
                  maxLength={1000}
                  dir="ltr"
                  className="text-right"
                />
                <p className="text-xs text-foreground/50">
                  ضع رابط صورة من الإنترنت. هنضيف رفع الصور قريبًا.
                </p>
              </div>

              <div className="grid gap-2">
                <Label>الإيميل</Label>
                <Input
                  value={user.email ?? ""}
                  disabled
                  dir="ltr"
                  className="text-right opacity-70"
                />
                <p className="text-xs text-foreground/50">
                  الإيميل والباسورد بيتداروا من حساب Replit المرتبط بحسابك.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl text-black font-semibold"
                  style={{ background: "var(--gold)" }}
                >
                  {saving ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="ml-2 h-4 w-4" />
                  )}
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
