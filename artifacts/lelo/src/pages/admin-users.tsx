import { useEffect, useRef, useState, type FormEvent } from "react";
import { BlogsPanel } from "@/components/blogs-panel";
import { useAuth, type AuthUser } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useSiteSettings,
  DEFAULT_SETTINGS,
  type SiteSettings,
} from "@/lib/site-settings";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Check,
  Inbox,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PropertyCard } from "@/components/property-card";
import {
  apiFetch,
  formatRelative,
  resolveImageUrl,
  type ContactRequest,
  type Property,
} from "@/lib/api";

const TABS = ["users", "properties", "contacts", "about", "jobs", "blogs", "settings"] as const;
type Tab = (typeof TABS)[number];

function readTab(): Tab {
  if (typeof window === "undefined") return "users";
  const t = new URLSearchParams(window.location.search).get("tab");
  return (TABS as readonly string[]).includes(t ?? "") ? (t as Tab) : "users";
}

function initials(u: AuthUser): string {
  const f = u.firstName?.[0] ?? "";
  const l = u.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || (u.email?.[0]?.toUpperCase() ?? "U");
}

function fullName(u: AuthUser): string {
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || "بدون اسم";
}

export default function AdminPage() {
  const { user: me, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>(readTab);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) navigate("/login");
      else if (!me?.isAdmin) navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, me, navigate]);

  function changeTab(v: string) {
    const next = (TABS as readonly string[]).includes(v) ? (v as Tab) : "users";
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url.toString());
  }

  if (isLoading || !me || !me.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-24" dir="rtl">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            لوحة السوبر أدمن
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            إدارة المستخدمين، مراجعة العقارات، طلبات التواصل.
          </p>
        </div>

        <Tabs value={tab} onValueChange={changeTab} dir="rtl">
          <TabsList className="flex flex-wrap gap-1 h-auto w-full justify-start">
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-4 w-4" /> المستخدمين
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-1.5">
              <ShieldCheck className="h-4 w-4" /> العقارات
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-1.5">
              <Inbox className="h-4 w-4" /> طلبات التواصل
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-1.5">
              عننا
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-1.5">
              الوظائف
            </TabsTrigger>
            <TabsTrigger value="blogs" className="gap-1.5">
              المقالات
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <SettingsIcon className="h-4 w-4" /> إعدادات الموقع
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UsersPanel me={me} />
          </TabsContent>
          <TabsContent value="properties" className="mt-6">
            <PropertiesPanel />
          </TabsContent>
          <TabsContent value="contacts" className="mt-6">
            <ContactsPanel />
          </TabsContent>
          <TabsContent value="about" className="mt-6">
            <AboutPanel />
          </TabsContent>
          <TabsContent value="jobs" className="mt-6">
            <JobsPanel />
          </TabsContent>
          <TabsContent value="blogs" className="mt-6">
            <BlogsPanel />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function UsersPanel({ me }: { me: AuthUser }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [deleting, setDeleting] = useState<AuthUser | null>(null);

  async function loadUsers() {
    setFetching(true);
    try {
      const data = await apiFetch<{ users: AuthUser[] }>("/api/admin/users");
      setUsers(data.users);
    } catch {
      toast({
        title: "خطأ",
        description: "تعذّر جلب المستخدمين.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="border-border/40 bg-background/60 backdrop-blur">
      <CardContent className="p-0">
        <div className="flex justify-end p-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={fetching}
            className="rounded-xl"
          >
            {fetching ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="ml-2 h-4 w-4" />
            )}
            تحديث
          </Button>
        </div>
        {fetching && users.length === 0 ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-foreground/60">
            لا يوجد مستخدمين بعد.
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {users.map((u) => (
              <li key={u.id} className="flex items-center gap-4 p-4 flex-wrap">
                <Avatar className="h-12 w-12 border border-[var(--gold)]/30">
                  <AvatarImage src={u.profileImageUrl ?? undefined} />
                  <AvatarFallback
                    className="text-sm font-bold text-black"
                    style={{ background: "var(--gold)" }}
                  >
                    {initials(u)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground truncate">
                      {fullName(u)}
                    </span>
                    {u.isAdmin && (
                      <Badge
                        className="text-black font-semibold border-0"
                        style={{ background: "var(--gold)" }}
                      >
                        أدمن
                      </Badge>
                    )}
                    {u.isDisabled && (
                      <Badge variant="destructive">معطّل</Badge>
                    )}
                    {u.id === me.id && (
                      <Badge variant="outline">حسابك</Badge>
                    )}
                  </div>
                  <div className="text-sm text-foreground/60 truncate">
                    {u.email ?? "بدون إيميل"}
                    {u.phone ? ` · ${u.phone}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(u)}
                    className="rounded-xl"
                  >
                    <Pencil className="ml-1 h-4 w-4" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleting(u)}
                    disabled={u.id === me.id}
                    className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <EditUserDialog
        user={editing}
        currentUserId={me.id}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          loadUsers();
        }}
      />
      <DeleteUserDialog
        user={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => {
          setDeleting(null);
          loadUsers();
        }}
      />
    </Card>
  );
}

function EditUserDialog({
  user,
  currentUserId,
  onClose,
  onSaved,
}: {
  user: AuthUser | null;
  currentUserId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      setPhoto(user.profileImageUrl ?? "");
      setIsAdmin(user.isAdmin);
      setIsDisabled(user.isDisabled);
      setNewPassword("");
    }
  }, [user]);

  if (!user) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (newPassword && newPassword.length < 8) {
      toast({
        title: "كلمة مرور قصيرة",
        description: "كلمة المرور لازم 8 حروف على الأقل.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        profileImageUrl: photo.trim() || null,
        isAdmin,
        isDisabled,
      };
      if (newPassword.trim().length > 0) {
        body.password = newPassword;
      }
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      toast({ title: "تم الحفظ", description: "تم تحديث المستخدم." });
      onSaved();
    } catch (err) {
      toast({
        title: "خطأ",
        description: err instanceof Error ? err.message : "فشل الحفظ.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>الاسم الأول</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="grid gap-2">
              <Label>الاسم الأخير</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={100}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>الإيميل</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="text-right"
              maxLength={255}
            />
          </div>
          <div className="grid gap-2">
            <Label>رقم الهاتف</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className="text-right"
              maxLength={30}
            />
          </div>
          <div className="grid gap-2">
            <Label>رابط الصورة</Label>
            <Input
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="https://..."
              dir="ltr"
              className="text-right"
              maxLength={1000}
            />
          </div>
          <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
            <div>
              <Label className="cursor-pointer">صلاحيات السوبر أدمن</Label>
              <p className="text-xs text-foreground/60 mt-1">
                يقدر يدخل على لوحة الأدمن ويعدّل أي مستخدم.
              </p>
            </div>
            <Switch
              checked={isAdmin}
              onCheckedChange={setIsAdmin}
              disabled={user.id === currentUserId}
            />
          </div>
          <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
            <div>
              <Label className="cursor-pointer">تعطيل الحساب</Label>
              <p className="text-xs text-foreground/60 mt-1">
                المستخدم مش هيقدر يدخل لما الحساب يبقى معطّل.
              </p>
            </div>
            <Switch
              checked={isDisabled}
              onCheckedChange={setIsDisabled}
              disabled={user.id === currentUserId}
            />
          </div>
          <div className="grid gap-2">
            <Label>كلمة مرور جديدة (اختياري)</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="سيب فاضي لو مش عايز تغيرها"
              dir="ltr"
              className="text-right"
              autoComplete="new-password"
              maxLength={200}
            />
            <p className="text-xs text-foreground/60">
              8 حروف على الأقل. هيحل محل كلمة المرور القديمة فوراً.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="text-black font-semibold"
              style={{ background: "var(--gold)" }}
            >
              {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteUserDialog({
  user,
  onClose,
  onDeleted,
}: {
  user: AuthUser | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  if (!user) return null;
  async function confirm() {
    if (!user) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      toast({ title: "تم الحذف" });
      onDeleted();
    } catch {
      toast({
        title: "خطأ",
        description: "تعذّر الحذف.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }
  return (
    <AlertDialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>حذف المستخدم؟</AlertDialogTitle>
          <AlertDialogDescription>
            هتحذف "{[user.firstName, user.lastName].filter(Boolean).join(" ") ||
              user.email ||
              user.id}
            " نهائي.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            تأكيد الحذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PropertiesPanel() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [items, setItems] = useState<Property[] | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">(
    "pending",
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setItems(null);
    try {
      const url =
        filter === "all"
          ? "/api/admin/properties"
          : `/api/admin/properties?status=${filter}`;
      const data = await apiFetch<{ properties: Property[] }>(url);
      setItems(data.properties);
    } catch {
      setItems([]);
      toast({
        title: "خطأ",
        description: "تعذّر جلب العقارات.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function setStatus(p: Property, status: "approved" | "rejected") {
    setBusyId(p.id);
    try {
      await apiFetch(`/api/admin/properties/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast({
        title: status === "approved" ? "تم الاعتماد" : "تم الرفض",
      });
      load();
    } catch {
      toast({
        title: "خطأ",
        description: "تعذّر التحديث.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(p: Property) {
    if (!window.confirm(`حذف عقار "${p.title}"؟`)) return;
    setBusyId(p.id);
    try {
      await apiFetch(`/api/admin/properties/${p.id}`, { method: "DELETE" });
      toast({ title: "تم الحذف" });
      load();
    } catch {
      toast({ title: "خطأ", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="rounded-xl"
            style={
              filter === f
                ? { background: "var(--gold)", color: "#000" }
                : undefined
            }
          >
            {f === "pending"
              ? "قيد المراجعة"
              : f === "approved"
                ? "منشور"
                : f === "rejected"
                  ? "مرفوض"
                  : "الكل"}
          </Button>
        ))}
      </div>

      {items == null ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--gold)]" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-foreground/60 border border-dashed border-border/40 rounded-xl">
          مفيش عقارات في القسم ده.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              showStatus
              actions={
                <div className="flex flex-wrap gap-2">
                  {p.status !== "approved" && (
                    <Button
                      size="sm"
                      onClick={() => setStatus(p, "approved")}
                      disabled={busyId === p.id}
                      className="rounded-lg text-black font-semibold"
                      style={{ background: "var(--gold)" }}
                      data-testid={`button-approve-${p.id}`}
                    >
                      <Check className="ml-1 h-3.5 w-3.5" /> اعتماد
                    </Button>
                  )}
                  {p.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatus(p, "rejected")}
                      disabled={busyId === p.id}
                      className="rounded-lg"
                      data-testid={`button-reject-${p.id}`}
                    >
                      <X className="ml-1 h-3.5 w-3.5" /> رفض
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/edit-property/${p.id}`)}
                    disabled={busyId === p.id}
                    className="rounded-lg"
                    style={{ borderColor: "var(--gold)", color: "var(--gold-light)" }}
                    data-testid={`button-edit-${p.id}`}
                  >
                    <Pencil className="ml-1 h-3.5 w-3.5" /> تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(p)}
                    disabled={busyId === p.id}
                    className="rounded-lg text-destructive hover:bg-destructive/10"
                    data-testid={`button-delete-${p.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContactsPanel() {
  const { toast } = useToast();
  const [items, setItems] = useState<ContactRequest[] | null>(null);

  async function load() {
    setItems(null);
    try {
      const data = await apiFetch<{ contactRequests: ContactRequest[] }>(
        "/api/admin/contact-requests",
      );
      setItems(data.contactRequests);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(c: ContactRequest) {
    if (c.isRead) return;
    try {
      await apiFetch(`/api/contact-requests/${c.id}/read`, { method: "PATCH" });
      load();
    } catch {
      /* ignore */
    }
  }

  async function remove(c: ContactRequest) {
    if (!window.confirm("حذف الرسالة؟")) return;
    try {
      await apiFetch(`/api/admin/contact-requests/${c.id}`, {
        method: "DELETE",
      });
      toast({ title: "تم الحذف" });
      load();
    } catch {
      toast({ title: "خطأ", variant: "destructive" });
    }
  }

  if (items == null) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--gold)]" />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-foreground/60 border border-dashed border-border/40 rounded-xl">
        مفيش طلبات تواصل لسه.
      </div>
    );
  }

  return (
    <Card className="border-border/40 bg-background/60 backdrop-blur">
      <CardContent className="p-0">
        <ul className="divide-y divide-border/30">
          {items.map((c) => (
            <li
              key={c.id}
              className={`p-4 ${c.isRead ? "" : "bg-[var(--gold)]/5"}`}
              onMouseEnter={() => markRead(c)}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="font-semibold flex items-center gap-2">
                  {c.name}
                  {!c.isRead && (
                    <Badge
                      className="text-black font-semibold border-0"
                      style={{ background: "var(--gold)" }}
                    >
                      جديد
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground/60">
                  <span>{formatRelative(c.createdAt)}</span>
                  <button
                    onClick={() => remove(c)}
                    className="text-destructive hover:opacity-80"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {c.propertyTitle && (
                <div className="text-xs text-foreground/70 mt-1">
                  عن عقار: {c.propertyTitle}
                </div>
              )}
              <div className="text-sm text-foreground/80 mt-1">{c.message}</div>
              <div className="flex gap-3 text-xs text-foreground/60 mt-1">
                {c.phone && (
                  <a
                    href={`tel:${c.phone}`}
                    dir="ltr"
                    className="hover:text-foreground"
                  >
                    {c.phone}
                  </a>
                )}
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    dir="ltr"
                    className="hover:text-foreground"
                  >
                    {c.email}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}


const TAB_LABELS = {
  brand: "العلامة + الشعار",
  contact: "أرقام التواصل",
  socials: "السوشيال ميديا",
  locations: "المناطق",
  ai: "ردود المساعد الذكي",
} as const;

type SettingsSection = keyof typeof TAB_LABELS;

async function uploadLogoFile(file: File): Promise<string> {
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
    throw new Error(err.error ?? "تعذّر بدء الرفع");
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
  if (!putRes.ok) throw new Error("فشل رفع الشعار");
  return objectPath;
}

function SettingsPanel() {
  const { settings, refresh } = useSiteSettings();
  const { toast } = useToast();
  const [section, setSection] = useState<SettingsSection>("brand");
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function onLogoFile(file: File | null) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: "حجم كبير",
        description: "الشعار لازم يبقى أصغر من 8 ميجا.",
        variant: "destructive",
      });
      return;
    }
    setUploadingLogo(true);
    try {
      const path = await uploadLogoFile(file);
      update("logoUrl", path);
      toast({
        title: "اترفع الشعار",
        description: "اضغط حفظ لتثبيته على الهيدر والفوتر.",
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: err instanceof Error ? err.message : "فشل الرفع.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      await refresh();
      toast({
        title: "تم الحفظ",
        description: "إعدادات الموقع اتحدّثت لكل الزوار.",
      });
    } catch (err) {
      toast({
        title: "حصل خطأ",
        description: err instanceof Error ? err.message : "ما قدرناش نحفظ.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function onResetDefaults() {
    setDraft(DEFAULT_SETTINGS);
    toast({
      title: "تم استرجاع الافتراضي",
      description: "اضغط حفظ لتطبيق الإعدادات الافتراضية.",
    });
  }

  const logoPreview = draft.logoUrl ? resolveImageUrl(draft.logoUrl) : "";

  return (
    <Card className="border-border/40">
      <CardContent className="pt-6 pb-6 px-6">
        <form onSubmit={onSave} className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TAB_LABELS) as SettingsSection[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                data-testid={`tab-settings-${s}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  section === s
                    ? "text-black"
                    : "text-foreground/70 bg-foreground/5 hover:bg-foreground/10"
                }`}
                style={
                  section === s
                    ? { background: "var(--gold)" }
                    : undefined
                }
              >
                {TAB_LABELS[s]}
              </button>
            ))}
          </div>

          {section === "brand" && (
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">شعار الموقع (للهيدر والفوتر)</Label>
                <div className="flex items-center gap-4 flex-wrap">
                  <div
                    className="rounded-lg border border-border/40 flex items-center justify-center"
                    style={{
                      width: 200,
                      height: 80,
                      background: "#000",
                    }}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="logo preview"
                        style={{
                          maxWidth: 180,
                          maxHeight: 64,
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <span className="text-xs text-foreground/40">
                        الشعار الافتراضي
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      data-testid="button-upload-logo"
                      className="rounded-xl"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="ml-2 h-4 w-4" />
                      )}
                      اختر صورة من جهازك
                    </Button>
                    {draft.logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => update("logoUrl", null)}
                        data-testid="button-clear-logo"
                        className="rounded-xl text-xs"
                      >
                        ارجع للشعار الافتراضي
                      </Button>
                    )}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      data-testid="input-logo-file"
                      onChange={(e) =>
                        onLogoFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-foreground/50 mt-2">
                  PNG شفّاف بنسبة قريبة من 160×56 يدّي أحسن نتيجة.
                </p>
              </div>
            </div>
          )}

          {section === "contact" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="hotlineNumber">الخط الساخن</Label>
                <Input
                  id="hotlineNumber"
                  value={draft.hotlineNumber}
                  onChange={(e) => update("hotlineNumber", e.target.value)}
                  dir="ltr"
                  className="text-right"
                  data-testid="input-hotline"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="contactPhone">الموبايل المعلن</Label>
                <Input
                  id="contactPhone"
                  value={draft.contactPhone}
                  onChange={(e) => update("contactPhone", e.target.value)}
                  dir="ltr"
                  className="text-right"
                  data-testid="input-contact-phone"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="whatsappNumber">رقم واتساب (دولي بدون +)</Label>
                <Input
                  id="whatsappNumber"
                  value={draft.whatsappNumber}
                  onChange={(e) => update("whatsappNumber", e.target.value)}
                  dir="ltr"
                  className="text-right"
                  placeholder="201151313999"
                  data-testid="input-whatsapp"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="contactEmail">إيميل التواصل</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={draft.contactEmail}
                  onChange={(e) => update("contactEmail", e.target.value)}
                  dir="ltr"
                  className="text-right"
                  data-testid="input-contact-email"
                />
              </div>
              <div className="grid gap-1.5 md:col-span-2">
                <Label htmlFor="address">العنوان (يظهر في الفوتر والخريطة)</Label>
                <Textarea
                  id="address"
                  value={draft.address}
                  onChange={(e) => update("address", e.target.value)}
                  rows={2}
                  data-testid="input-address"
                />
              </div>
            </div>
          )}

          {section === "socials" && (
            <div className="grid gap-4 md:grid-cols-2">
              {([
                ["facebookUrl", "فيسبوك"],
                ["instagramUrl", "إنستجرام"],
                ["tiktokUrl", "تيك توك"],
                ["youtubeUrl", "يوتيوب"],
                ["linkedinUrl", "لينكدإن"],
              ] as const).map(([key, label]) => (
                <div className="grid gap-1.5" key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    value={draft[key]}
                    onChange={(e) => update(key, e.target.value)}
                    dir="ltr"
                    className="text-right"
                    placeholder="https://"
                    data-testid={`input-${key}`}
                  />
                </div>
              ))}
            </div>
          )}

          {section === "locations" && (
            <LocationsEditor
              value={draft.locations}
              onChange={(next) => update("locations", next)}
            />
          )}

          {section === "ai" && (
            <div className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="aiWelcomeMessage">رسالة الترحيب للمساعد</Label>
                <Textarea
                  id="aiWelcomeMessage"
                  value={draft.aiWelcomeMessage}
                  onChange={(e) =>
                    update("aiWelcomeMessage", e.target.value)
                  }
                  rows={3}
                  data-testid="input-ai-welcome"
                />
                <p className="text-xs text-foreground/50">
                  أول رسالة بيشوفها العميل لما يفتح الشات.
                </p>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="aiCompanyFacts">
                  المعلومات اللي يستخدمها المساعد عن الشركة
                </Label>
                <Textarea
                  id="aiCompanyFacts"
                  value={draft.aiCompanyFacts}
                  onChange={(e) => update("aiCompanyFacts", e.target.value)}
                  rows={10}
                  data-testid="input-ai-facts"
                />
                <p className="text-xs text-foreground/50">
                  دي اللي بيرجع لها بشاك بوت لما حد يسأل عن الشركة. خلّيها
                  مختصرة وواضحة.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-border/40 gap-2 flex-wrap">
            <Button
              type="button"
              variant="ghost"
              onClick={onResetDefaults}
              className="rounded-xl text-foreground/70"
              data-testid="button-reset-defaults"
            >
              <RefreshCcw className="ml-2 h-4 w-4" />
              استرجاع الافتراضي
            </Button>
            <Button
              type="submit"
              disabled={saving || uploadingLogo}
              className="rounded-xl text-black font-semibold"
              style={{ background: "var(--gold)" }}
              data-testid="button-save-settings"
            >
              {saving ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="ml-2 h-4 w-4" />
              )}
              حفظ
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function LocationsEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const { toast } = useToast();
  const [draftItem, setDraftItem] = useState("");

  function addItem() {
    const trimmed = draftItem.trim();
    if (trimmed.length === 0) return;
    if (trimmed.length > 100) {
      toast({
        title: "اسم طويل",
        description: "اسم المنطقة لازم يكون 100 حرف كحد أقصى.",
        variant: "destructive",
      });
      return;
    }
    if (value.includes(trimmed)) {
      toast({
        title: "موجودة بالفعل",
        description: "المنطقة دي مضافة قبل كده.",
      });
      setDraftItem("");
      return;
    }
    onChange([...value, trimmed]);
    setDraftItem("");
  }

  function removeAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item!);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">المناطق المتاحة في الموقع</Label>
        <p className="text-xs text-foreground/60">
          المناطق دي بتظهر في فلتر البحث وفي فورم إضافة وتعديل العقار. الترتيب
          هنا هو نفس الترتيب اللي بيشوفه الزائر.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={draftItem}
          onChange={(e) => setDraftItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder="مثال: التجمع الأول"
          maxLength={100}
          data-testid="input-new-location"
        />
        <Button
          type="button"
          onClick={addItem}
          disabled={draftItem.trim().length === 0}
          className="rounded-xl text-black font-semibold whitespace-nowrap"
          style={{ background: "var(--gold)" }}
          data-testid="button-add-location"
        >
          <Plus className="ml-1 h-4 w-4" />
          إضافة
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="py-10 text-center text-foreground/60 border border-dashed border-border/40 rounded-xl">
          مفيش مناطق مضافة. ضيف منطقة من فوق.
        </div>
      ) : (
        <ul className="grid gap-2">
          {value.map((loc, idx) => (
            <li
              key={`${loc}-${idx}`}
              className="flex items-center gap-2 p-3 border border-border/40 rounded-xl bg-background/40"
              data-testid={`location-row-${idx}`}
            >
              <MapPin
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--gold)" }}
              />
              <span className="flex-1 text-sm truncate">{loc}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="h-8 w-8 p-0"
                data-testid={`button-location-up-${idx}`}
                title="تحريك لأعلى"
              >
                ▲
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => move(idx, 1)}
                disabled={idx === value.length - 1}
                className="h-8 w-8 p-0"
                data-testid={`button-location-down-${idx}`}
                title="تحريك لأسفل"
              >
                ▼
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeAt(idx)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                data-testid={`button-location-remove-${idx}`}
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-foreground/50">
        لا تنسى الضغط على "حفظ" في الأسفل لتطبيق التعديلات.
      </p>
    </div>
  );
}

// ─── ABOUT PANEL ──────────────────────────────────────────────────────────────

function AboutPanel() {
  const { settings, refresh } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setDraft(settings); }, [settings]);

  async function save() {
    setSaving(true);
    try {
      await apiFetch("/api/admin/site-settings", {
        method: "PUT",
        body: JSON.stringify({
          aboutWhoWeAreAr: draft.aboutWhoWeAreAr,
          aboutWhoWeAreEn: draft.aboutWhoWeAreEn,
          aboutValuesAr: draft.aboutValuesAr,
          aboutValuesEn: draft.aboutValuesEn,
        }),
      });
      await refresh();
      toast({ title: "✅ تم حفظ محتوى عننا" });
    } catch {
      toast({ title: "خطأ في الحفظ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-bold" style={{ color: "var(--gold)" }}>تعديل محتوى قسم عننا</h2>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>من نحن — عربي</Label>
          <Textarea rows={5} value={draft.aboutWhoWeAreAr ?? ""} onChange={(e) => setDraft({ ...draft, aboutWhoWeAreAr: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>من نحن — English</Label>
          <Textarea rows={5} dir="ltr" value={draft.aboutWhoWeAreEn ?? ""} onChange={(e) => setDraft({ ...draft, aboutWhoWeAreEn: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>قيمنا — عربي</Label>
          <Textarea rows={5} value={draft.aboutValuesAr ?? ""} onChange={(e) => setDraft({ ...draft, aboutValuesAr: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>قيمنا — English</Label>
          <Textarea rows={5} dir="ltr" value={draft.aboutValuesEn ?? ""} onChange={(e) => setDraft({ ...draft, aboutValuesEn: e.target.value })} />
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="rounded-xl text-black" style={{ background: "var(--gold)" }}>
        {saving ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الحفظ...</> : <><Save className="ml-2 h-4 w-4" /> حفظ</>}
      </Button>
    </div>
  );
}

// ─── JOBS PANEL ───────────────────────────────────────────────────────────────

interface JobListing {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  requirementsAr: string;
  requirementsEn: string;
  location: string;
  isActive: boolean;
}

const emptyJob = (): Omit<JobListing, "id"> => ({
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  requirementsAr: "",
  requirementsEn: "",
  location: "التجمع الخامس، القاهرة الجديدة",
  isActive: true,
});

function JobsPanel() {
  const [jobs, setJobs] = useState<JobListing[] | null>(null);
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyJob());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  async function load() {
    try {
      const d = (await apiFetch("/api/admin/job-listings")) as { jobs: JobListing[] };
      setJobs(d.jobs);
    } catch { setJobs([]); }
  }

  useEffect(() => { void load(); }, []);

  function startNew() {
    setForm(emptyJob());
    setEditId("new");
  }

  function startEdit(j: JobListing) {
    setForm({ titleAr: j.titleAr, titleEn: j.titleEn, descriptionAr: j.descriptionAr, descriptionEn: j.descriptionEn, requirementsAr: j.requirementsAr ?? "", requirementsEn: j.requirementsEn ?? "", location: j.location ?? "", isActive: j.isActive });
    setEditId(j.id);
  }

  async function save() {
    if (!form.titleAr.trim()) { toast({ title: "العنوان بالعربي مطلوب", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editId === "new") {
        await apiFetch("/api/admin/job-listings", { method: "POST", body: JSON.stringify(form) });
      } else {
        await apiFetch(`/api/admin/job-listings/${editId}`, { method: "PUT", body: JSON.stringify(form) });
      }
      toast({ title: "✅ تم الحفظ" });
      setEditId(null);
      void load();
    } catch {
      toast({ title: "خطأ في الحفظ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/admin/job-listings/${deleteId}`, { method: "DELETE" });
      toast({ title: "✅ تم الحذف" });
      setDeleteId(null);
      void load();
    } catch {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: "var(--gold)" }}>إدارة الوظائف المتاحة</h2>
        <Button onClick={startNew} className="rounded-xl text-black gap-1.5" style={{ background: "var(--gold)" }}><Plus className="h-4 w-4" /> وظيفة جديدة</Button>
      </div>

      {editId && (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold">{editId === "new" ? "➕ إضافة وظيفة" : "✏️ تعديل وظيفة"}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>العنوان — عربي *</Label><Input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} /></div>
              <div className="grid gap-2"><Label>العنوان — English</Label><Input dir="ltr" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} /></div>
              <div className="grid gap-2"><Label>الوصف — عربي</Label><Textarea rows={3} value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} /></div>
              <div className="grid gap-2"><Label>الوصف — English</Label><Textarea rows={3} dir="ltr" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} /></div>
              <div className="grid gap-2"><Label>المتطلبات — عربي</Label><Textarea rows={3} value={form.requirementsAr} onChange={(e) => setForm({ ...form, requirementsAr: e.target.value })} /></div>
              <div className="grid gap-2"><Label>المتطلبات — English</Label><Textarea rows={3} dir="ltr" value={form.requirementsEn} onChange={(e) => setForm({ ...form, requirementsEn: e.target.value })} /></div>
              <div className="grid gap-2"><Label>الموقع</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} id="job-active" />
              <Label htmlFor="job-active">الوظيفة نشطة (تظهر للزوار)</Label>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={save} disabled={saving} className="rounded-xl text-black" style={{ background: "var(--gold)" }}>
                {saving ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري...</> : <><Save className="ml-2 h-4 w-4" /> حفظ</>}
              </Button>
              <Button variant="outline" onClick={() => setEditId(null)} className="rounded-xl">إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {jobs === null ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--gold)" }} /></div>
      ) : jobs.length === 0 ? (
        <p className="text-center text-foreground/50 py-10">مفيش وظائف مضافة لحد دلوقتي.</p>
      ) : (
        <div className="grid gap-3">
          {jobs.map((j) => (
            <Card key={j.id} className="border-border/40 bg-card/40">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{j.titleAr}</p>
                  {j.titleEn && <p className="text-sm text-foreground/50 dir-ltr">{j.titleEn}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${j.isActive ? "bg-green-500/20 text-green-500" : "bg-foreground/10 text-foreground/50"}`}>{j.isActive ? "نشطة" : "متوقفة"}</span>
                    {j.location && <span className="text-xs text-foreground/40">{j.location}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(j)} className="h-8 w-8 p-0"><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(j.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذه الوظيفة؟</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


