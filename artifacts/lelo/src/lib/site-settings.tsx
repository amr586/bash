import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface SiteSettings {
  logoUrl: string | null;
  whatsappNumber: string;
  hotlineNumber: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  aiWelcomeMessage: string;
  aiCompanyFacts: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  logoUrl: null,
  whatsappNumber: "201151313999",
  hotlineNumber: "17327",
  contactPhone: "+20 11 5131 3999",
  contactEmail: "info@bashakdevelopments.com",
  address:
    "فيلا 99، الحي الأول، شارع 90، التجمع الخامس، القاهرة الجديدة، مصر",
  facebookUrl: "https://www.facebook.com/BashakDevelopments",
  instagramUrl: "https://www.instagram.com/bashakdevelopments",
  tiktokUrl: "https://www.tiktok.com/@bashakdevelopments",
  youtubeUrl: "https://youtube.com/@bashakdevelopments",
  linkedinUrl: "https://www.linkedin.com/company/bashakdevelopments/",
  aiWelcomeMessage:
    "أهلاً بيك في باشاك! 👋 اسألني عن الشركة، أرقام التواصل، آخر مشاريعنا، أو العقارات المتاحة دلوقتي.",
  aiCompanyFacts: "",
};

interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loading: false,
  refresh: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/site-settings", { credentials: "include" });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { settings?: Partial<SiteSettings> };
      setSettings({ ...DEFAULT_SETTINGS, ...(data.settings ?? {}) });
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ settings, loading, refresh }),
    [settings, loading, refresh],
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextValue {
  return useContext(SiteSettingsContext);
}
