import { useEffect, useState } from "react";
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
import {
  Bell,
  Heart,
  Inbox,
  Loader2,
  Plus,
  User as UserIcon,
} from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import {
  apiFetch,
  formatRelative,
  type ContactRequest,
  type Notification,
  type Property,
} from "@/lib/api";

const TAB_KEYS = [
  "recommended",
  "my-properties",
  "contact-requests",
  "notifications",
] as const;
type TabKey = (typeof TAB_KEYS)[number];

function readTabFromHash(): TabKey {
  if (typeof window === "undefined") return "recommended";
  const params = new URLSearchParams(window.location.search);
  const t = params.get("tab");
  if (t && (TAB_KEYS as readonly string[]).includes(t)) return t as TabKey;
  return "recommended";
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<TabKey>(readTabFromHash);

  const [recommended, setRecommended] = useState<Property[] | null>(null);
  const [mine, setMine] = useState<Property[] | null>(null);
  const [contacts, setContacts] = useState<ContactRequest[] | null>(null);
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null,
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login");
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    function onPop() {
      setTab(readTabFromHash());
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function changeTab(t: string) {
    const next = (TAB_KEYS as readonly string[]).includes(t)
      ? (t as TabKey)
      : "recommended";
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState({}, "", url.toString());
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    if (tab === "recommended" && recommended == null) {
      apiFetch<{ properties: Property[] }>("/api/me/recommended-properties")
        .then((d) => setRecommended(d.properties))
        .catch(() => setRecommended([]));
    } else if (tab === "my-properties" && mine == null) {
      apiFetch<{ properties: Property[] }>("/api/me/properties")
        .then((d) => setMine(d.properties))
        .catch(() => setMine([]));
    } else if (tab === "contact-requests" && contacts == null) {
      apiFetch<{ contactRequests: ContactRequest[] }>(
        "/api/me/contact-requests",
      )
        .then((d) => setContacts(d.contactRequests))
        .catch(() => setContacts([]));
    } else if (tab === "notifications" && notifications == null) {
      apiFetch<{ notifications: Notification[] }>("/api/me/notifications")
        .then((d) => setNotifications(d.notifications))
        .catch(() => setNotifications([]));
    }
  }, [tab, isAuthenticated, recommended, mine, contacts, notifications]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-24" dir="rtl">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              أهلاً، {user.firstName ?? "بك"}
            </h1>
            <p className="text-sm text-foreground/60 mt-1">
              من هنا تتابع عقاراتك، إشعاراتك، وطلبات التواصل.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/profile">
                <UserIcon className="ml-2 h-4 w-4" />
                البروفايل
              </Link>
            </Button>
            {isStaff(user) && (
              <Button
                asChild
                className="rounded-xl text-black font-semibold"
                style={{ background: "var(--gold)" }}
              >
                <Link href="/add-property">
                  <Plus className="ml-2 h-4 w-4" />
                  أضف عقار
                </Link>
              </Button>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={changeTab} dir="rtl">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto">
            <TabsTrigger value="recommended" className="gap-1.5">
              <Heart className="h-4 w-4" /> موصى بها
            </TabsTrigger>
            <TabsTrigger value="my-properties" className="gap-1.5">
              <Plus className="h-4 w-4" /> عقاراتي
            </TabsTrigger>
            <TabsTrigger value="contact-requests" className="gap-1.5">
              <Inbox className="h-4 w-4" /> طلبات التواصل
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5">
              <Bell className="h-4 w-4" /> الإشعارات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommended" className="mt-6">
            <SectionWrapper
              empty="مفيش عقارات موصى بها لسه. اطلب من الأدمن يضيف."
              data={recommended}
            >
              {recommended && recommended.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommended.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              )}
            </SectionWrapper>
          </TabsContent>

          <TabsContent value="my-properties" className="mt-6">
            <SectionWrapper
              empty="ما عندكش عقارات هنا حالياً."
              data={mine}
            >
              {mine && mine.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mine.map((p) => (
                    <PropertyCard key={p.id} property={p} showStatus />
                  ))}
                </div>
              )}
            </SectionWrapper>
          </TabsContent>

          <TabsContent value="contact-requests" className="mt-6">
            <SectionWrapper
              empty="مفيش طلبات تواصل على عقاراتك حتى الآن."
              data={contacts}
            >
              {contacts && contacts.length > 0 && (
                <Card className="border-border/40 bg-background/60 backdrop-blur">
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border/30">
                      {contacts.map((c) => (
                        <li key={c.id} className="p-4 space-y-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="font-semibold">
                              {c.name}{" "}
                              {!c.isRead && (
                                <Badge
                                  className="border-0 text-black font-semibold"
                                  style={{ background: "var(--gold)" }}
                                >
                                  جديد
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-foreground/60">
                              {formatRelative(c.createdAt)}
                            </div>
                          </div>
                          {c.propertyTitle && (
                            <div className="text-xs text-foreground/70">
                              عن عقار: {c.propertyTitle}
                            </div>
                          )}
                          <div className="text-sm text-foreground/80">
                            {c.message}
                          </div>
                          <div className="flex gap-3 text-xs text-foreground/60">
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
              )}
            </SectionWrapper>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <SectionWrapper
              empty="مفيش إشعارات لسه."
              data={notifications}
            >
              {notifications && notifications.length > 0 && (
                <Card className="border-border/40 bg-background/60 backdrop-blur">
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border/30">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          className={`p-4 ${
                            n.isRead ? "" : "bg-[var(--gold)]/5"
                          }`}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="font-semibold">
                              {!n.isRead && (
                                <span
                                  className="inline-block h-2 w-2 rounded-full ml-2"
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
                            <button
                              onClick={() => navigate(n.link!)}
                              className="text-xs mt-2 underline"
                              style={{ color: "var(--gold-light)" }}
                            >
                              افتح
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </SectionWrapper>
          </TabsContent>
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
