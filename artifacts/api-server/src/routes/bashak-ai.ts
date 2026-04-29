import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { db, propertiesTable } from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";
import { loadSiteSettings } from "./site-settings";

const router: IRouter = Router();

const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!ai) {
    if (!baseUrl || !apiKey) {
      throw new Error("Gemini AI integration not configured");
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: "", baseUrl },
    });
  }
  return ai;
}

const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

function buildCompanyFacts(s: {
  hotlineNumber: string;
  contactPhone: string;
  whatsappNumber: string;
  contactEmail: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  aiCompanyFacts: string;
}): string {
  return `
معلومات عن شركة باشاك للتطوير العقاري (Bashak Developments):
${s.aiCompanyFacts}

أرقام ووسائل التواصل:
- الخط الساخن: ${s.hotlineNumber}
- موبايل: ${s.contactPhone}
- واتساب: https://wa.me/${s.whatsappNumber}
- إيميل: ${s.contactEmail}
- العنوان: ${s.address}
- فيسبوك: ${s.facebookUrl}
- إنستجرام: ${s.instagramUrl}
`;
}

function formatProperty(p: typeof propertiesTable.$inferSelect): string {
  const parts = [
    `- ${p.title}`,
    p.location ? `(${p.location})` : "",
    p.priceLabel ? `- السعر: ${p.priceLabel}` : "",
    p.bedrooms ? `- ${p.bedrooms} غرف نوم` : "",
    p.area ? `- المساحة: ${p.area} م²` : "",
    "- للبيع",
  ].filter(Boolean);
  return parts.join(" ");
}

function fallbackReply(
  question: string,
  properties: (typeof propertiesTable.$inferSelect)[],
  s: {
    hotlineNumber: string;
    contactPhone: string;
    whatsappNumber: string;
    contactEmail: string;
  },
): string {
  const q = question.toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));

  if (has("واتساب", "whatsapp", "رقم", "تواصل", "اتصال", "موبايل", "ساخن", "هاتف", "تليفون")) {
    return [
      "تقدر تتواصل مع باشاك من خلال:",
      `• الخط الساخن: ${s.hotlineNumber}`,
      `• واتساب / موبايل: ${s.contactPhone}`,
      `• إيميل: ${s.contactEmail}`,
      "أو دوس على زر «سجّل الآن» وفريق المبيعات هيرجع لك بسرعة.",
    ].join("\n");
  }

  if (has("أعمال", "اعمال", "مشاريع", "مشروع", "آخر", "اخر")) {
    return [
      "آخر أعمال شركة باشاك:",
      "• 12 مشروع تم تسليمه بنجاح خلال 10 سنوات.",
      "• مناطق التطوير: التجمع الخامس، شارع 90 الشمالي، الحي الأول والثاني والخامس، النرجس، اللوتس، بيت الوطن.",
      "• شراكات مع كبرى البنوك للتمويل العقاري وتقسيط حتى 8 سنوات.",
      "تحب أرشّح لك مشاريع متاحة حاليًا؟",
    ].join("\n");
  }

  if (has("عقار", "عقارات", "متاح", "متاحه", "متاحة", "شقق", "فيلا", "وحدات", "وحده", "وحدات")) {
    if (properties.length === 0) {
      return `في الوقت الحالي مفيش عقارات منشورة على المنصة. تقدر تكلمنا على ${s.hotlineNumber} أو ${s.contactPhone} وفريق المبيعات هيقترح عليك أنسب الوحدات.`;
    }
    const lines = properties.slice(0, 5).map(formatProperty).join("\n");
    return `أحدث العقارات المتاحة من باشاك:\n${lines}\n\nللمعاينة أو الحجز كلمنا على ${s.hotlineNumber}.`;
  }

  if (has("مين", "ايه", "إيه", "بشاك", "باشاك", "الشركة", "الشركه", "عن")) {
    return [
      "شركة باشاك للتطوير العقاري:",
      "• خبرة أكثر من 10 أعوام في السوق المصري.",
      "• 12 مشروع مسلَّم، أكثر من 850 عميل، نسبة رضا 99%.",
      "• متخصصون في الشقق والفيلات والمكاتب والشاليهات والمحلات والأراضي.",
      `للاستفسار: ${s.hotlineNumber} أو واتساب ${s.contactPhone}.`,
    ].join("\n");
  }

  return `أهلاً بيك في باشاك! تقدر تسألني عن: أرقام التواصل، آخر مشاريعنا، أو العقارات المتاحة. وللحجز أو المعاينة كلمنا على ${s.hotlineNumber} أو واتساب ${s.contactPhone}.`;
}

router.post("/bashak-ai/chat", async (req: Request, res: Response) => {
  const parsed = chatBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة." });
    return;
  }

  let propertiesContext = "";
  let recentProperties: (typeof propertiesTable.$inferSelect)[] = [];
  try {
    const recent = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.status, "approved"))
      .orderBy(desc(propertiesTable.createdAt))
      .limit(8);
    recentProperties = recent;
    if (recent.length > 0) {
      propertiesContext =
        "\n\nأحدث العقارات المتاحة الآن:\n" +
        recent.map(formatProperty).join("\n");
    }
  } catch {
    /* ignore property fetch errors */
  }
  void and;

  const settings = await loadSiteSettings();
  const companyFacts = buildCompanyFacts(settings);

  const lastUserMessage =
    [...parsed.data.messages].reverse().find((m) => m.role === "user")?.content ?? "";

  if (!baseUrl || !apiKey) {
    res.json({ reply: fallbackReply(lastUserMessage, recentProperties, settings) });
    return;
  }

  const systemInstruction = `أنت "بشاك بوت"، المساعد الذكي الرسمي لشركة باشاك للتطوير العقاري.
تجاوب باللغة العربية المصرية البسيطة فقط، وبأسلوب مهذب ومحترف وودود.
مهمتك: تجاوب على أسئلة العملاء عن الشركة، أرقام التواصل، أحدث الأعمال، والعقارات المتاحة.

التزم بالقواعد دي:
1) ردّك يبقى مختصر (٢ إلى ٥ جمل) ومفيد، ولو الإجابة فيها تفاصيل استخدم نقاط قصيرة.
2) لو حد سأل عن السعر النهائي أو المعاينة أو الحجز، اعرض عليه الخط الساخن ${settings.hotlineNumber} أو واتساب ${settings.contactPhone} أو زر "سجّل الآن" في الموقع.
3) ما تختلقش معلومات. لو ما تعرفش، قول إنك هتحوّله لفريق المبيعات على الرقم ${settings.hotlineNumber}.
4) ما تتكلمش عن أي شركة منافسة.

${companyFacts}${propertiesContext}`;

  try {
    const client = getClient();
    const contents = parsed.data.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 8192,
        temperature: 0.6,
      },
    });

    const text = response.text ?? "";
    if (!text.trim()) {
      res
        .status(502)
        .json({ error: "ما قدرتش أرد دلوقتي، حاول تاني." });
      return;
    }
    res.json({ reply: text });
  } catch (err) {
    req.log.error({ err }, "Bashak AI chat error");
    res.status(500).json({ error: "حصل خطأ في المحادثة، حاول تاني." });
  }
});

export default router;
