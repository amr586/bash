import { useEffect, useState, type FormEvent } from "react";
import { useAuth, type AuthUser } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Pencil,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PropertyCard } from "@/components/property-card";
import {
  apiFetch,
  formatRelative,
  type ContactRequest,
  type Property,
} from "@/lib/api";

const TABS = ["users", "properties", "contacts"] as const;
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
          <TabsList className="grid grid-cols-3 w-full md:w-fit">
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-4 w-4" /> المستخدمين
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-1.5">
              <ShieldCheck className="h-4 w-4" /> العقارات
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-1.5">
              <Inbox className="h-4 w-4" /> طلبات التواصل
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      setPhoto(user.profileImageUrl ?? "");
      setIsAdmin(user.isAdmin);
    }
  }, [user]);

  if (!user) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          profileImageUrl: photo.trim() || null,
          isAdmin,
        }),
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
