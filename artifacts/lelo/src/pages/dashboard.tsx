import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Heart,
  Inbox,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  User as UserIcon,
} from "lucide-react";
import { BlogsPanel } from "@/components/blogs-panel";
import { PropertyCard } from "@/components/property-card";
import {
  apiFetch,
  fetchFavoriteIds,
  formatRelative,
  type ContactRequest,
  type Notification,
  type Property,
} from "@/lib/api";
import { isStaff, canManageProperties, canHandleSupport } from "@/lib/roles";
import { useLang } from "@/lib/i18n";

const ALL_TABS = [
  "recommended",
  "favorites",
  "contact-us",
  "my-contact-requests",
  "my-properties",
  "edit-properties",
  "contact-requests",
  "notifications",
  "manage-blogs",
] as const;
type TabKey = (typeof ALL_TABS)[number];

function readTabFromHash(allowed: readonly TabKey[]): TabKey {
  if (typeof window === "undefined") return allowed[0];
  const params = new URLSearchParams(window.location.search);
  const t = params.get("tab");
  if (t && (allowed as readonly string[]).includes(t)) return t as TabKey;
  return allowed[0];
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const iconMargin = isAr ? "ml-2" : "mr-2";

  const staff = isStaff(user);
  const canProps = canManageProperties(user);
  const canSupport = canHandleSupport(user);

  const isAdmin = user?.isAdmin === true;

  const allowedTabs: readonly TabKey[] = useMemo(() => {
    if (!staff) {
      return [
        "recommended",
        "favorites",
        "contact-us",
        "my-contact-requests",
        "notifications",
      ];
    }
    const tabs: TabKey[] = ["recommended"];
    if (canProps) tabs.push("my-properties", "edit-properties");
    if (canSupport) tabs.push("contact-requests");
    tabs.push("favorites", "notifications");
    if (isAdmin) tabs.push("manage-blogs");
    return tabs;
  }, [staff, canProps, canSupport, isAdmin]);

  const [tab, setTab] = useState<TabKey>(() => readTabFromHash(allowedTabs));

  const [recommended, setRecommended] = useState<Property[] | null>(null);
  const [favorites, setFavorites] = useState<Property[] | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [mine, setMine] = useState<Property[] | null>(null);
  const [allProperties, setAllProperties] = useState<Property[] | null>(null);
  const [contacts, setContacts] = useState<ContactRequest[] | null>(null);
  const [sentContacts, setSentContacts] = useState<ContactRequest[] | null>(null);
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null,
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login");
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    function onPop() {
      setTab(readTabFromHash(allowedTabs));
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [allowedTabs]);

  // If the active tab is no longer in the allowed list (role changed), reset.
  useEffect(() => {
    if (!(allowedTabs as readonly string[]).includes(tab)) {
      setTab(allowedTabs[0]);
    }
  }, [allowedTabs, tab]);

  function changeTab(t: string) {
    const next = (allowedTabs as readonly string[]).includes(t)
      ? (t as TabKey)
      : allowedTabs[0];
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url.toString());
  }

  // Pre-load favorite IDs once so the heart icon reflects state on any tab.
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchFavoriteIds().then(setFavoriteIds).catch(() => undefined);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (tab === "recommended" && recommended == null) {
      apiFetch<{ properties: Property[] }>("/api/me/recommended-properties")
        .then((d) => setRecommended(d.properties))
        .catch(() => setRecommended([]));
    } else if (tab === "favorites" && favorites == null) {
      apiFetch<{ properties: Property[] }>("/api/me/favorites")
        .then((d) => {
          setFavorites(d.properties);
          setFavoriteIds(new Set(d.properties.map((p) => p.id)));
        })
        .catch(() => setFavorites([]));
    } else if (tab === "my-properties" && mine == null) {
      apiFetch<{ properties: Property[] }>("/api/me/properties")
        .then((d) => setMine(d.properties))
        .catch(() => setMine([]));
    } else if (tab === "edit-properties" && allProperties == null) {
      apiFetch<{ properties: Property[] }>("/api/admin/properties")
        .then((d) => setAllProperties(d.properties))
        .catch(() => setAllProperties([]));
    } else if (tab === "contact-requests" && contacts == null) {
      const url = staff
        ? "/api/admin/contact-requests"
        : "/api/me/contact-requests";
      apiFetch<{ contactRequests: ContactRequest[] }>(url)
        .then((d) => setContacts(d.contactRequests))
        .catch(() => setContacts([]));
    } else if (tab === "my-contact-requests" && sentContacts == null) {
      apiFetch<{ contactRequests: ContactRequest[] }>(
        "/api/me/sent-contact-requests",
      )
        .then((d) => setSentContacts(d.contactRequests))
        .catch(() => setSentContacts([]));
    } else if (tab === "notifications" && notifications == null) {
      apiFetch<{ notifications: Notification[] }>("/api/me/notifications")
        .then((d) => setNotifications(d.notifications))
        .catch(() => setNotifications([]));
    }
  }, [tab, isAuthenticated, staff, recommended, favorites, mine, allProperties, contacts, sentContacts, notifications]);

  async function onNotificationClick(n: Notification) {
    if (!n.isRead) {
      setNotifications((prev) =>
        prev ? prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)) : prev,
      );
      try {
        await apiFetch(`/api/me/notifications/${n.id}/read`, {
          method: "PATCH",
        });
      } catch {
        /* ignore — UI already updated optimistically */
      }
    }
    if (n.link) {
      navigate(n.link);
    }
  }

  function onFavoriteChange(propertyId: string, next: boolean) {
    setFavoriteIds((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(propertyId);
      else copy.delete(propertyId);
      return copy;
    });
    if (!next) {
      // Optimistically remove from the list when on favorites tab.
      setFavorites((prev) =>
        prev ? prev.filter((p) => p.id !== propertyId) : prev,
      );
    } else {
      // Force refetch next time we open favorites.
      setFavorites(null);
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background px-4 py-24"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("أهلاً، ", "Hi, ")}
              {user.firstName ?? t("بك", "there")}
            </h1>
            <p className="text-sm text-foreground/60 mt-1">
              {t(
                "من هنا تتابع العقارات الموصى بها، المفضلة، وتتواصل مع باشاك.",
                "Here you can browse recommended and saved properties, and reach out to Bashak.",
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/profile">
                <UserIcon className={`${iconMargin} h-4 w-4`} />
                {t("البروفايل", "Profile")}
              </Link>
            </Button>
            {staff && (
              <Button
                asChild
                className="rounded-xl text-black font-semibold"
                style={{ background: "var(--gold)" }}
              >
                <Link href="/add-property">
                  <Plus className={`${iconMargin} h-4 w-4`} />
                  {t("أضف عقار", "Add property")}
                </Link>
              </Button>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={changeTab} dir={isAr ? "rtl" : "ltr"}>
          <TabsList
            className={`grid grid-cols-2 ${
              staff ? "md:grid-cols-6" : "md:grid-cols-5"
            } w-full h-auto`}
          >
            <TabsTrigger value="recommended" className="gap-1.5" data-testid="tab-recommended">
              <Heart className="h-4 w-4" /> {t("موصى بها", "Recommended")}
            </TabsTrigger>
            {staff && (
              <TabsTrigger value="my-properties" className="gap-1.5" data-testid="tab-my-properties">
                <Plus className="h-4 w-4" /> {t("عقاراتي", "My properties")}
              </TabsTrigger>
            )}
            {staff && (
              <TabsTrigger value="edit-properties" className="gap-1.5" data-testid="tab-edit-properties">
                <Pencil className="h-4 w-4" /> {t("تعديل عقار", "Edit property")}
              </TabsTrigger>
            )}
            {staff && (
              <TabsTrigger value="contact-requests" className="gap-1.5" data-testid="tab-contact-requests">
                <Inbox className="h-4 w-4" />{" "}
                {t("طلبات التواصل", "Contact requests")}
              </TabsTrigger>
            )}
            <TabsTrigger value="favorites" className="gap-1.5" data-testid="tab-favorites">
              <Heart className="h-4 w-4" /> {t("المفضلة", "Favorites")}
            </TabsTrigger>
            {!staff && (
              <TabsTrigger value="contact-us" className="gap-1.5" data-testid="tab-contact-us">
                <MessageSquare className="h-4 w-4" /> {t("تواصل معنا", "Contact us")}
              </TabsTrigger>
            )}
            {!staff && (
              <TabsTrigger value="my-contact-requests" className="gap-1.5" data-testid="tab-my-contact-requests">
                <Inbox className="h-4 w-4" /> {t("طلبات تواصلك", "Your requests")}
              </TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="gap-1.5" data-testid="tab-notifications">
              <Bell className="h-4 w-4" /> {t("الإشعارات", "Notifications")}
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="manage-blogs" className="gap-1.5" data-testid="tab-manage-blogs">
                <BookOpen className="h-4 w-4" /> {t("المقالات", "Blog Posts")}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="recommended" className="mt-6">
            <SectionWrapper
              empty={t(
                "مفيش عقارات موصى بها لسه. اطلب من الأدمن يضيف.",
                "No recommended properties yet. Ask the admin to add some.",
              )}
              data={recommended}
            >
              {recommended && recommended.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommended.map((p) => (
                    <PropertyCard
                      key={p.id}
                      property={p}
                      isFavorite={favoriteIds.has(p.id)}
                      onFavoriteChange={(next) => onFavoriteChange(p.id, next)}
                    />
                  ))}
                </div>
              )}
            </SectionWrapper>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <SectionWrapper
              empty={t(
                "ما عندكش عقارات مفضلة لسه. اضغط على القلب على أي عقار.",
                "No favorites yet. Tap the heart on any property to save it.",
              )}
              data={favorites}
            >
              {favorites && favorites.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((p) => (
                    <PropertyCard
                      key={p.id}
                      property={p}
                      isFavorite={true}
                      onFavoriteChange={(next) => onFavoriteChange(p.id, next)}
                    />
                  ))}
                </div>
              )}
            </SectionWrapper>
          </TabsContent>

          <TabsContent value="contact-us" className="mt-6">
            <ContactUsPanel
              defaultName={
                [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
              }
              defaultPhone={user.phone ?? ""}
              defaultEmail={user.email ?? ""}
            />
          </TabsContent>

          {staff && (
            <TabsContent value="edit-properties" className="mt-6">
              <SectionWrapper
                empty={t(
                  "مفيش عقارات هنا لسه.",
                  "No properties yet.",
                )}
                data={allProperties}
              >
                {allProperties && allProperties.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allProperties.map((p) => (
                      <PropertyCard
                        key={p.id}
                        property={p}
                        showStatus
                        isFavorite={favoriteIds.has(p.id)}
                        onFavoriteChange={(next) => onFavoriteChange(p.id, next)}
                        actions={
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/edit-property/${p.id}`)}
                            className="rounded-lg w-full"
                            style={{
                              borderColor: "var(--gold)",
                              color: "var(--gold-light)",
                            }}
                            data-testid={`button-edit-property-${p.id}`}
                          >
                            <Pencil className={`${iconMargin} h-3.5 w-3.5`} />
                            {t("تعديل", "Edit")}
                          </Button>
                        }
                      />
                    ))}
                  </div>
                )}
              </SectionWrapper>
            </TabsContent>
          )}

          {staff && (
            <TabsContent value="my-properties" className="mt-6">
              <SectionWrapper
                empty={t(
                  "ما عندكش عقارات هنا حالياً.",
                  "You have no properties here yet.",
                )}
                data={mine}
              >
                {mine && mine.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mine.map((p) => (
                      <PropertyCard
                        key={p.id}
                        property={p}
                        showStatus
                        isFavorite={favoriteIds.has(p.id)}
                        onFavoriteChange={(next) => onFavoriteChange(p.id, next)}
                      />
                    ))}
                  </div>
                )}
              </SectionWrapper>
            </TabsContent>
          )}

          {staff && (
            <TabsContent value="contact-requests" className="mt-6">
              <SectionWrapper
                empty={t(
                  "مفيش طلبات تواصل لسه.",
                  "No contact requests yet.",
                )}
                data={contacts}
              >
                {contacts && contacts.length > 0 && (
                  <div className="space-y-3">
                    {contacts.map((c) => (
                      <StaffContactRequestCard
                        key={c.id}
                        contact={c}
                        isAr={isAr}
                        t={t}
                        onReplied={(updated) =>
                          setContacts((prev) =>
                            prev
                              ? prev.map((x) =>
                                  x.id === c.id ? { ...x, ...updated } : x,
                                )
                              : prev,
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </SectionWrapper>
            </TabsContent>
          )}

          {!staff && (
            <TabsContent value="my-contact-requests" className="mt-6">
              <SectionWrapper
                empty={t(
                  "لسه ما بعتش أي طلب تواصل.",
                  "You haven't sent any contact requests yet.",
                )}
                data={sentContacts}
              >
                {sentContacts && sentContacts.length > 0 && (
                  <Card className="border-border/40 bg-background/60 backdrop-blur">
                    <CardContent className="p-0">
                      <ul className="divide-y divide-border/30">
                        {sentContacts.map((c) => (
                          <li key={c.id} className="p-4 space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="font-semibold">
                                {c.reason
                                  ? c.reason
                                  : t("طلب تواصل", "Contact request")}
                              </div>
                              <div className="text-xs text-foreground/60">
                                {formatRelative(c.createdAt)}
                              </div>
                            </div>
                            {c.propertyTitle && (
                              <div className="text-xs text-foreground/70">
                                {t("عن عقار: ", "About: ")}
                                {c.propertyTitle}
                              </div>
                            )}
                            <div className="text-sm text-foreground/80 whitespace-pre-wrap">
                              {c.message}
                            </div>
                            {c.replyMessage ? (
                              <div
                                className="rounded-md p-3 text-sm whitespace-pre-wrap"
                                style={{
                                  background: "var(--gold)/10",
                                  border: "1px solid var(--gold)",
                                  backgroundColor: "rgba(212,175,55,0.08)",
                                }}
                              >
                                <div
                                  className="text-xs font-semibold mb-1"
                                  style={{ color: "var(--gold-light)" }}
                                >
                                  {t("رد فريق الدعم", "Support reply")}
                                  {c.repliedAt && (
                                    <span className="text-foreground/60 font-normal">
                                      {" · "}
                                      {formatRelative(c.repliedAt)}
                                    </span>
                                  )}
                                </div>
                                <div className="text-foreground/90">
                                  {c.replyMessage}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-foreground/50">
                                {t(
                                  "لسه ما حدش رد. هنبعتلك إشعار لما الدعم يرد.",
                                  "No reply yet. You'll be notified when support responds.",
                                )}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </SectionWrapper>
            </TabsContent>
          )}

          <TabsContent value="notifications" className="mt-6">
            <SectionWrapper
              empty={t("مفيش إشعارات لسه.", "No notifications yet.")}
              data={notifications}
            >
              {notifications && notifications.length > 0 && (
                <Card className="border-border/40 bg-background/60 backdrop-blur">
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border/30">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          className={`${n.isRead ? "" : "bg-[var(--gold)]/5"}`}
                        >
                          <button
                            type="button"
                            onClick={() => onNotificationClick(n)}
                            className={`w-full ${isAr ? "text-right" : "text-left"} p-4 hover:bg-foreground/5 transition-colors`}
                            data-testid={`notification-row-${n.id}`}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="font-semibold">
                                {!n.isRead && (
                                  <span
                                    className={`inline-block h-2 w-2 rounded-full ${isAr ? "ml-2" : "mr-2"}`}
                                    style={{ background: "var(--gold)" }}
                                  />
                                )}
                                {n.title}
                              </div>
                              <div className="text-xs text-foreground/60">
                                {formatRelative(n.createdAt)}
                              </div>
                            </div>
                            {n.body && (
                              <div className="text-sm text-foreground/70 mt-1">
                                {n.body}
                              </div>
                            )}
                            {n.link && (
                              <div
                                className="text-xs mt-2 underline"
                                style={{ color: "var(--gold-light)" }}
                              >
                                {t("افتح", "Open")}
                              </div>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </SectionWrapper>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="manage-blogs" className="mt-6">
              <BlogsPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function SectionWrapper({
  data,
  empty,
  children,
}: {
  data: unknown[] | null;
  empty: string;
  children: React.ReactNode;
}) {
  if (data == null) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--gold)]" />
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="py-16 text-center text-foreground/60 border border-dashed border-border/40 rounded-xl">
        {empty}
      </div>
    );
  }
  return <>{children}</>;
}

function ContactUsPanel({
  defaultName,
  defaultPhone,
  defaultEmail,
}: {
  defaultName: string;
  defaultPhone: string;
  defaultEmail: string;
}) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const iconMargin = isAr ? "ml-2" : "mr-2";

  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [reason, setReason] = useState<string>("buy");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const REASONS: { value: string; labelAr: string; labelEn: string }[] = [
    { value: "buy", labelAr: "شراء عقار", labelEn: "Buy a property" },
    { value: "general", labelAr: "استفسار عام", labelEn: "General inquiry" },
    { value: "partner", labelAr: "طلب شراكة", labelEn: "Partnership request" },
  ];

  function reset() {
    setMessage("");
    setReason("buy");
    setSuccess(false);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError(t("اكتب اسمك من فضلك.", "Please enter your name."));
      return;
    }
    if (phone.trim().length < 6 && (!email || email.trim().length < 5)) {
      setError(
        t(
          "اكتب رقم تليفون أو إيميل على الأقل.",
          "Enter a phone number or email at minimum.",
        ),
      );
      return;
    }
    if (message.trim().length < 2) {
      setError(t("اكتب رسالتك.", "Write your message."));
      return;
    }
    setSubmitting(true);
    const reasonRow = REASONS.find((r) => r.value === reason);
    const reasonLabel = reasonRow
      ? isAr
        ? reasonRow.labelAr
        : reasonRow.labelEn
      : t("تواصل عام", "General contact");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          reason,
          message: `[${reasonLabel}] ${message.trim()}`,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? t("حصل خطأ، حاول تاني.", "Something went wrong, please try again."));
      }
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("حصل خطأ، حاول تاني.", "Something went wrong, please try again."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card className="border-border/40 bg-background/60 backdrop-blur">
        <CardContent className="py-12 flex flex-col items-center text-center gap-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <p className="text-lg font-semibold">
            {t("تم استلام رسالتك!", "Your message has been received!")}
          </p>
          <p className="text-sm text-foreground/70 max-w-md">
            {t(
              "فريق باشاك هيتواصل معاك قريبًا على البيانات اللي بعتها.",
              "The Bashak team will contact you soon using the info you provided.",
            )}
          </p>
          <Button
            type="button"
            onClick={reset}
            variant="outline"
            className="mt-2 rounded-xl"
            data-testid="button-contact-send-another"
          >
            {t("ابعت رسالة تانية", "Send another message")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-background/60 backdrop-blur">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold" style={{ color: "var(--gold-light)" }}>
            {t("تواصل مع باشاك", "Contact Bashak")}
          </h2>
          <p className="text-sm text-foreground/60 mt-1">
            {t(
              "ابعت رسالتك مباشرة لفريق باشاك ولينا الشرف نخدمك.",
              "Send your message directly to the Bashak team — we're glad to help.",
            )}
          </p>
        </div>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cu-name">{t("الاسم", "Name")}</Label>
            <Input
              id="cu-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid="input-contact-name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cu-phone">{t("رقم الموبايل", "Mobile number")}</Label>
            <Input
              id="cu-phone"
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01xxxxxxxxx"
              data-testid="input-contact-phone"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="cu-email">
              {t("الإيميل (اختياري)", "Email (optional)")}
            </Label>
            <Input
              id="cu-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              data-testid="input-contact-email"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="cu-reason">{t("سبب التواصل", "Reason")}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="cu-reason" data-testid="select-contact-reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {isAr ? r.labelAr : r.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="cu-message">{t("الرسالة", "Message")}</Label>
            <Textarea
              id="cu-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("اكتب تفاصيل طلبك...", "Type the details of your request…")}
              required
              data-testid="input-contact-message"
            />
          </div>
          {error && (
            <div
              className="md:col-span-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
              data-testid="text-contact-error"
            >
              {error}
            </div>
          )}
          <div className="md:col-span-2 flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="rounded-xl text-black font-semibold"
              style={{ background: "var(--gold)" }}
              data-testid="button-contact-submit"
            >
              {submitting ? (
                <Loader2 className={`${iconMargin} h-4 w-4 animate-spin`} />
              ) : (
                <Send className={`${iconMargin} h-4 w-4`} />
              )}
              {submitting
                ? t("جاري الإرسال...", "Sending…")
                : t("إرسال", "Send")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function StaffContactRequestCard({
  contact,
  isAr,
  t,
  onReplied,
}: {
  contact: ContactRequest;
  isAr: boolean;
  t: (ar: string, en: string) => string;
  onReplied: (updated: Partial<ContactRequest>) => void;
}) {
  const [reply, setReply] = useState(contact.replyMessage ?? "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alreadyReplied = !!contact.replyMessage;

  async function send() {
    const trimmed = reply.trim();
    if (!trimmed) return;
    setSending(true);
    setError(null);
    try {
      const res = await apiFetch<{ contactRequest: ContactRequest }>(
        `/api/admin/contact-requests/${contact.id}/reply`,
        {
          method: "POST",
          body: JSON.stringify({ replyMessage: trimmed }),
        },
      );
      onReplied({
        replyMessage: res.contactRequest.replyMessage,
        repliedAt: res.contactRequest.repliedAt,
        isRead: true,
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t("حصلت مشكلة، حاول تاني.", "Something went wrong, try again."),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="border-border/40 bg-background/60 backdrop-blur">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="font-semibold flex items-center gap-2 flex-wrap">
            <span>{contact.name}</span>
            {!contact.isRead && !alreadyReplied && (
              <Badge
                className="border-0 text-black font-semibold"
                style={{ background: "var(--gold)" }}
              >
                {t("جديد", "New")}
              </Badge>
            )}
            {alreadyReplied && (
              <Badge
                variant="outline"
                className="border-foreground/30 text-foreground/70"
              >
                {t("تم الرد", "Replied")}
              </Badge>
            )}
          </div>
          <div className="text-xs text-foreground/60">
            {formatRelative(contact.createdAt)}
          </div>
        </div>

        {contact.reason && (
          <div className="text-xs text-foreground/70">
            {t("السبب: ", "Reason: ")}
            {contact.reason}
          </div>
        )}
        {contact.propertyTitle && (
          <div className="text-xs text-foreground/70">
            {t("عن عقار: ", "About: ")}
            {contact.propertyTitle}
          </div>
        )}

        <div className="text-sm text-foreground/85 whitespace-pre-wrap">
          {contact.message}
        </div>

        <div className="flex flex-wrap gap-2">
          {contact.phone && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-[var(--gold)]/40 hover:bg-[var(--gold)]/10"
              data-testid={`button-call-${contact.id}`}
            >
              <a href={`tel:${contact.phone}`} dir="ltr">
                {t("اتصال", "Call")} · {contact.phone}
              </a>
            </Button>
          )}
          {contact.email && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-[var(--gold)]/40 hover:bg-[var(--gold)]/10"
              data-testid={`button-email-${contact.id}`}
            >
              <a href={`mailto:${contact.email}`} dir="ltr">
                {t("إيميل", "Email")} · {contact.email}
              </a>
            </Button>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-border/30">
          <Label htmlFor={`reply-${contact.id}`} className="text-xs">
            {alreadyReplied
              ? t("ردك السابق", "Your previous reply")
              : t("رد مباشر", "Direct reply")}
          </Label>
          <Textarea
            id={`reply-${contact.id}`}
            rows={3}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={t(
              "اكتب ردك هنا...",
              "Type your reply here…",
            )}
            data-testid={`input-reply-${contact.id}`}
            dir={isAr ? "rtl" : "ltr"}
          />
          {error && (
            <div className="text-xs text-red-400">{error}</div>
          )}
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={send}
              disabled={sending || !reply.trim()}
              className="text-black font-semibold"
              style={{ background: "var(--gold)" }}
              data-testid={`button-send-reply-${contact.id}`}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : alreadyReplied ? (
                t("تحديث الرد", "Update reply")
              ) : (
                t("إرسال الرد", "Send reply")
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
