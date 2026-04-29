import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export type Lang = "ar" | "en"

const STORAGE_KEY = "bashak.lang"
const EVENT = "bashak:lang-change"

type LangContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: <T>(ar: T, en: T) => T
}

const LangContext = createContext<LangContextValue | undefined>(undefined)

function readInitial(): Lang {
  if (typeof window === "undefined") return "ar"
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === "ar" || v === "en") return v
  } catch {
    /* ignore */
  }
  return "ar"
}

function applyLang(l: Lang) {
  if (typeof document === "undefined") return
  document.documentElement.lang = l
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr"
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial)

  useEffect(() => {
    applyLang(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "ar" || e.newValue === "en")) {
        setLangState(e.newValue)
      }
    }
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent<Lang>).detail
      if (detail === "ar" || detail === "en") setLangState(detail)
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(EVENT, onEvent as EventListener)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(EVENT, onEvent as EventListener)
    }
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(EVENT, { detail: l }))
    }
  }

  const t = <T,>(ar: T, en: T): T => (lang === "ar" ? ar : en)

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>")
  return ctx
}
