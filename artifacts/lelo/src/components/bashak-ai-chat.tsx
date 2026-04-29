import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Sparkles, Send, X, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteSettings } from "@/lib/site-settings";
import { useLang } from "@/lib/i18n";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function BashakAIChat() {
  const { lang, t } = useLang();
  const { settings } = useSiteSettings();

  const QUICK_PROMPTS = lang === "ar"
    ? [
        "مين شركة باشاك؟",
        "أرقام التواصل؟",
        "آخر مشاريعكم؟",
        "إيه العقارات المتاحة؟",
      ]
    : [
        "Who is Bashak?",
        "What are the contact numbers?",
        "What are your latest projects?",
        "What properties are available?",
      ];

  const welcome = useMemo<ChatMessage>(
    () => ({
      role: "assistant",
      content:
        lang === "ar"
          ? settings.aiWelcomeMessage
          : "Hi! I'm Bashak's AI assistant. Ask me anything about our company or properties.",
    }),
    [settings.aiWelcomeMessage, lang],
  );
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0]?.role === "assistant" ? [welcome] : prev,
    );
  }, [welcome]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages, sending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError(null);
    const next: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/bashak-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m !== welcome).slice(-12),
          lang,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };
      if (!res.ok || !body.reply) {
        throw new Error(body.error ?? t("حصل خطأ، حاول تاني.", "Something went wrong, please try again."));
      }
      setMessages((m) => [...m, { role: "assistant", content: body.reply! }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("حصل خطأ، حاول تاني.", "Something went wrong, please try again."));
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const isAr = lang === "ar";
  const sidePos = isAr ? "left-6" : "right-6";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("افتح المساعد الذكي لباشاك", "Open Bashak AI assistant")}
        data-testid="button-ai-chat-toggle"
        className={`fixed bottom-6 ${sidePos} z-50 inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-black shadow-2xl hover:scale-105 active:scale-95 transition-transform`}
        style={{
          background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
          boxShadow: "0 12px 32px rgba(212,175,55,0.45)",
          fontFamily: "'Tajawal', sans-serif",
        }}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        {open ? t("إغلاق", "Close") : t("مساعد باشاك", "Bashak AI")}
      </button>

      {open && (
        <div
          className={`fixed bottom-24 ${sidePos} ${isAr ? "right-6" : "left-6"} sm:right-auto sm:left-auto sm:${sidePos} sm:w-[380px] z-50 rounded-2xl overflow-hidden border bg-background/95 backdrop-blur shadow-2xl flex flex-col`}
          style={{
            borderColor: "var(--gold-dark)",
            maxHeight: "min(70vh, 600px)",
            fontFamily: "'Tajawal', sans-serif",
          }}
          dir={isAr ? "rtl" : "ltr"}
          data-testid="ai-chat-window"
        >
          <div
            className="px-4 py-3 flex items-center gap-2 border-b"
            style={{
              borderColor: "var(--gold-dark)",
              background: "linear-gradient(90deg, rgba(212,175,55,0.18), rgba(212,175,55,0.04))",
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--gold)" }}
            >
              <Bot className="h-5 w-5 text-black" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "var(--gold-light)" }}>
                {t("مساعد باشاك الذكي", "Bashak AI Assistant")}
              </p>
              <p className="text-[11px] text-foreground/60">
                {t(
                  "يجاوب على أسئلتك عن الشركة والعقارات",
                  "Answers your questions about the company and properties",
                )}
              </p>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-foreground/10 text-foreground"
                      : "text-black"
                  }`}
                  style={
                    m.role === "assistant"
                      ? { background: "var(--gold)" }
                      : undefined
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-end">
                <div
                  className="rounded-2xl px-4 py-2 text-sm text-black inline-flex items-center gap-2"
                  style={{ background: "var(--gold)" }}
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t("بكتب...", "Typing…")}
                </div>
              </div>
            )}
            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-center">
                {error}
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => void send(p)}
                  className="text-xs px-3 py-1.5 rounded-full border hover:bg-[var(--gold)]/10 transition-colors"
                  style={{ borderColor: "var(--gold-dark)", color: "var(--gold-light)" }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="border-t p-3 flex items-center gap-2"
            style={{ borderColor: "var(--gold-dark)" }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("اكتب سؤالك...", "Type your question…")}
              disabled={sending}
              data-testid="input-ai-chat"
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={sending || !input.trim()}
              className="text-black shrink-0"
              style={{ background: "var(--gold)" }}
              data-testid="button-ai-chat-send"
              aria-label={t("إرسال", "Send")}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
