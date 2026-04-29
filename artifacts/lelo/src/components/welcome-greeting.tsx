import { useEffect } from "react";
import { useLang } from "@/lib/i18n";

const SESSION_FLAG = "bashak.welcome.played";

function pickVoice(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const exact = voices.find((v) => v.lang.toLowerCase() === langCode.toLowerCase());
  if (exact) return exact;
  const prefix = langCode.split("-")[0].toLowerCase();
  const partial = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  return partial ?? voices[0] ?? null;
}

function speak(text: string, langCode: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langCode;
    utter.rate = 0.95;
    utter.pitch = 1.05;
    utter.volume = 1;
    const v = pickVoice(langCode);
    if (v) utter.voice = v;
    synth.speak(utter);
    return true;
  } catch {
    return false;
  }
}

export function WelcomeGreeting() {
  const { lang } = useLang();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    let played = false;
    try {
      played = sessionStorage.getItem(SESSION_FLAG) === "1";
    } catch {
      /* ignore */
    }
    if (played) return;

    const text = lang === "ar" ? "أهلاً بعودتك في باشاك" : "Welcome back to Bashak";
    const langCode = lang === "ar" ? "ar-EG" : "en-US";

    const markPlayed = () => {
      try {
        sessionStorage.setItem(SESSION_FLAG, "1");
      } catch {
        /* ignore */
      }
    };

    let cancelled = false;

    const tryNow = () => {
      if (cancelled) return;
      const ok = speak(text, langCode);
      if (ok) markPlayed();
    };

    const onFirstInteraction = () => {
      if (cancelled) return;
      cleanupListeners();
      const ok = speak(text, langCode);
      if (ok) markPlayed();
    };

    const cleanupListeners = () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    };

    const start = () => {
      tryNow();
      window.setTimeout(() => {
        try {
          if (sessionStorage.getItem(SESSION_FLAG) === "1") return;
        } catch {
          /* ignore */
        }
        window.addEventListener("pointerdown", onFirstInteraction, { once: false });
        window.addEventListener("keydown", onFirstInteraction, { once: false });
        window.addEventListener("touchstart", onFirstInteraction, { once: false });
      }, 600);
    };

    const synth = window.speechSynthesis;
    if (synth.getVoices().length === 0) {
      const onVoices = () => {
        synth.removeEventListener("voiceschanged", onVoices);
        start();
      };
      synth.addEventListener("voiceschanged", onVoices);
      window.setTimeout(start, 700);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      cleanupListeners();
    };
  }, [lang]);

  return null;
}
