import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { apiFetch, formatRelative, type Notification } from "@/lib/api";

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await apiFetch<{
        notifications: Notification[];
        unreadCount: number;
      }>("/api/me/notifications");
      setItems(data.notifications);
      setUnread(data.unreadCount);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setUnread(0);
      return;
    }
    load();
    const interval = window.setInterval(load, 30_000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, load]);

  if (!isAuthenticated) return null;

  async function markRead(n: Notification) {
    if (!n.isRead) {
      try {
        await apiFetch(`/api/me/notifications/${n.id}/read`, {
          method: "PATCH",
        });
      } catch {
        /* ignore */
      }
    }
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
    load();
  }

  async function markAllRead() {
    try {
      await apiFetch("/api/me/notifications/read-all", { method: "POST" });
      load();
    } catch {
      /* ignore */
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-foreground/5 transition-colors"
          onClick={() => !open && load()}
        >
          <Bell className="h-5 w-5 text-foreground/80" />
          {unread > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-black flex items-center justify-center"
              style={{ background: "var(--gold)" }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[28rem] overflow-hidden p-0"
        dir="rtl"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
          <span className="text-sm font-semibold">الإشعارات</span>
          {items.length > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-foreground/60 hover:text-foreground inline-flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              قراءة الكل
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && items.length === 0 ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--gold)]" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 px-4 text-center text-sm text-foreground/60">
              لا توجد إشعارات بعد.
            </div>
          ) : (
            <ul>
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-border/30 last:border-b-0 ${
                    n.isRead ? "bg-transparent" : "bg-[var(--gold)]/5"
                  }`}
                >
                  <button
                    onClick={() => markRead(n)}
                    className="w-full text-right px-3 py-2.5 hover:bg-foreground/5 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {!n.isRead && (
                        <span
                          className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0"
                          style={{ background: "var(--gold)" }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {n.title}
                        </div>
                        {n.body && (
                          <div className="text-xs text-foreground/70 mt-0.5 line-clamp-2">
                            {n.body}
                          </div>
                        )}
                        <div className="text-[10px] text-foreground/50 mt-1">
                          {formatRelative(n.createdAt)}
                        </div>
                      </div>
                      {n.isRead && (
                        <Check className="h-3.5 w-3.5 text-foreground/30 mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-border/40 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={() => {
              setOpen(false);
              navigate("/dashboard?tab=notifications");
            }}
          >
            افتح الداشبورد
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
