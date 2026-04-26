import { useEffect, useRef, useState, type FormEvent } from "react";
import { Sparkles, Send, X, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "أهلاً بيك في باشاك! 👋 اسألني عن الشركة، أرقام التواصل، آخر مشاريعنا، أو العقارات المتاحة دلوقتي.",
};

const QUICK_PROMPTS = [
  "مين شركة باشاك؟",
  "أرقام التواصل؟",
  "آخر مشاريعكم؟",
  "إيه العقارات المتاحة؟",
];

export function BashakAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
          messages: next.filter((m) => m !== WELCOME).slice(-12),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };
      if (!res.ok || !body.reply) {
        throw new Error(body.error ?? "حصل خطأ، حاول تاني.");
      }
      setMessages((m) => [...m, { role: "assistant", content: body.reply! }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ، حاول تاني.");
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="افتح المساعد الذكي لباشاك"
        data-testid="button-ai-chat-toggle"
        className="fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-black shadow-2xl hover:scale-105 active:scale-95 transition-transform"
        style={{
          background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
          boxShadow: "0 12px 32px rgba(212,175,55,0.45)",
          fontFamily: "'Tajawal', sans-serif",
        }}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        {open ? "إغلاق" : "مساعد باشاك"}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 left-6 right-6 sm:right-auto sm:w-[380px] z-50 rounded-2xl overflow-hidden border bg-background/95 backdrop-blur shadow-2xl flex flex-col"
          style={{
            borderColor: "var(--gold-dark)",
            maxHeight: "min(70vh, 600px)",
            fontFamily: "'Tajawal', sans-serif",
          }}
          dir="rtl"
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
                مساعد باشاك الذكي
              </p>
              <p className="text-[11px] text-foreground/60">
                يجاوب على أسئلتك عن الشركة والعقارات
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
                  بكتب...
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
              placeholder="اكتب سؤالك..."
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
              aria-label="إرسال"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
