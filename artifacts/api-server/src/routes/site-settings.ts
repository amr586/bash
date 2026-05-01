import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

export const SETTINGS_KEY = "main";

export const siteSettingsSchema = z.object({
  logoUrl: z.string().trim().max(1000).nullable().default(null),
  whatsappNumber: z.string().trim().max(30).default("201151313999"),
  hotlineNumber: z.string().trim().max(30).default("17327"),
  contactPhone: z.string().trim().max(30).default("+20 11 5131 3999"),
  contactEmail: z
    .string()
    .trim()
    .max(255)
    .default("info@bashakdevelopments.com"),
  address: z
    .string()
    .trim()
    .max(500)
    .default(
      "فيلا 99، الحي الأول، شارع 90، التجمع الخامس، القاهرة الجديدة، مصر",
    ),
  facebookUrl: z
    .string()
    .trim()
    .max(500)
    .default("https://www.facebook.com/BashakDevelopments"),
  instagramUrl: z
    .string()
    .trim()
    .max(500)
    .default("https://www.instagram.com/bashakdevelopments"),
  tiktokUrl: z
    .string()
    .trim()
    .max(500)
    .default("https://www.tiktok.com/@bashakdevelopments"),
  youtubeUrl: z
    .string()
    .trim()
    .max(500)
    .default("https://youtube.com/@bashakdevelopments"),
  linkedinUrl: z
    .string()
    .trim()
    .max(500)
    .default("https://www.linkedin.com/company/bashakdevelopments/"),
  aiWelcomeMessage: z
    .string()
    .trim()
    .max(2000)
    .default(
      "أهلاً بيك في باشاك! 👋 اسألني عن الشركة، أرقام التواصل، آخر مشاريعنا، أو العقارات المتاحة دلوقتي.",
    ),
  locations: z
    .array(z.string().trim().min(1).max(100))
    .max(100)
    .default([
      "التجمع الخامس",
      "شارع 90 الشمالي",
      "الحي الأول",
      "الحي الثاني",
      "الحي الخامس",
      "النرجس",
      "اللوتس",
      "بيت الوطن",
      "جولدن سكوير",
      "القطامية هايتس",
      "ميفيدا",
      "تاج سيتي",
    ]),
  aboutWhoWeAreAr: z
    .string()
    .trim()
    .max(4000)
    .default(
      "شركة باشاك للتطوير العقاري — أكتر من 10 سنوات خبرة في تطوير وبناء المشاريع السكنية والاستثمارية في قلب التجمع الخامس بالقاهرة الجديدة. كل مشاريعنا اللي بتشوفها على الموقع بنبنيها بأنفسنا — من التصميم للتنفيذ للتسليم — مش بنعرض عقارات حد تاني، إحنا المطوّر والمالك.",
    ),
  aboutWhoWeAreEn: z
    .string()
    .trim()
    .max(4000)
    .default(
      "Bashak Developments — over 10 years of experience developing residential and investment projects in the heart of the 5th Settlement, New Cairo. Every project on this site is built by us — from design to construction to handover. We don't list other people's properties; we are the developer and the owner.",
    ),
  aboutValuesAr: z
    .string()
    .trim()
    .max(4000)
    .default(
      "• الشفافية الكاملة في كل تعاملاتنا.\n• جودة بناء وتشطيب على أعلى مستوى.\n• فريق خدمة عملاء متاح طول الوقت.\n• خبرة طويلة في السوق المصري.",
    ),
  aboutValuesEn: z
    .string()
    .trim()
    .max(4000)
    .default(
      "• Complete transparency in everything we do.\n• Top-tier construction and finishing quality.\n• A customer service team available around the clock.\n• Long-standing expertise in the Egyptian market.",
    ),
  aiCompanyFacts: z
    .string()
    .trim()
    .max(8000)
    .default(
      `شركة باشاك للتطوير العقاري بخبرة تمتد لأكثر من 10 أعوام.
12 مشروع تم تسليمه بنجاح، أكثر من 850 عميل سعيد، نسبة رضا 99%.
متخصصون في الشقق والفيلات والمكاتب والشاليهات والمحلات التجارية والأراضي.
المناطق: التجمع الخامس، شارع 90 الشمالي، الحي الأول، الحي الثاني، الحي الخامس، النرجس، اللوتس، بيت الوطن.
شركاء التمويل العقاري: بنك مصر، البنك الأهلي، CIB، QNB الأهلي، بنك الإمارات دبي الوطني، بنك الكويت الوطني، HSBC، بنك أبوظبي الإسلامي.
مميزات: ضمان الجودة، تشطيبات فاخرة، حدائق متشطبة، تقسيط حتى 8 سنوات، تسليم في الميعاد، عقود موثقة.`,
    ),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

const defaults: SiteSettings = siteSettingsSchema.parse({});

export async function loadSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, SETTINGS_KEY))
      .limit(1);
    if (rows.length === 0) return defaults;
    const merged = { ...defaults, ...((rows[0]!.value as object) ?? {}) };
    return siteSettingsSchema.parse(merged);
  } catch {
    return defaults;
  }
}

router.get("/site-settings", async (_req: Request, res: Response) => {
  const settings = await loadSiteSettings();
  res.json({ settings });
});

router.put("/admin/site-settings", async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const current = await loadSiteSettings();
  const merged = { ...current, ...(req.body ?? {}) };
  const parsed = siteSettingsSchema.safeParse(merged);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid settings", issues: parsed.error.issues });
    return;
  }
  const value = parsed.data;
  const existing = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, SETTINGS_KEY))
    .limit(1);
  if (existing.length === 0) {
    await db
      .insert(siteSettingsTable)
      .values({ key: SETTINGS_KEY, value });
  } else {
    await db
      .update(siteSettingsTable)
      .set({ value })
      .where(eq(siteSettingsTable.key, SETTINGS_KEY));
  }
  res.json({ settings: value });
});

export default router;
