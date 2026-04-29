import type { Lang } from "./i18n";

const AR_TO_EN: Record<string, string> = {
  "التجمع الخامس": "Fifth Settlement",
  "شارع 90 الشمالي": "North 90th Street",
  "شارع 90 الجنوبي": "South 90th Street",
  "الحي الأول": "First District",
  "الحي الثاني": "Second District",
  "الحي الثالث": "Third District",
  "الحي الرابع": "Fourth District",
  "الحي الخامس": "Fifth District",
  "النرجس": "Narges",
  "اللوتس": "Lotus",
  "بيت الوطن": "Beit El Watan",
  "جولدن سكوير": "Golden Square",
  "القطامية هايتس": "Katameya Heights",
  "ميفيدا": "Mivida",
  "تاج سيتي": "Taj City",
  "القاهرة الجديدة": "New Cairo",
  "العاصمة الإدارية الجديدة": "New Administrative Capital",
  "العاصمة الإدارية": "New Administrative Capital",
  "الشيخ زايد": "Sheikh Zayed",
  "6 أكتوبر": "6th of October",
  "أكتوبر": "October City",
  "المعادي": "Maadi",
  "مصر الجديدة": "Heliopolis",
  "الزمالك": "Zamalek",
  "وسط البلد": "Downtown Cairo",
  "العين السخنة": "Ain Sokhna",
  "الساحل الشمالي": "North Coast",
  "مدينة نصر": "Nasr City",
  "الرحاب": "Rehab",
  "مدينتي": "Madinaty",
  "الشروق": "El Shorouk",
  "بدر": "Badr City",
  "العبور": "El Obour",
  "حدائق أكتوبر": "October Gardens",
  "الفيوم": "Fayoum",
  "الإسكندرية": "Alexandria",
  "الجيزة": "Giza",
  "الدقي": "Dokki",
  "المهندسين": "Mohandessin",
  "العجوزة": "Agouza",
  "الهرم": "Haram",
  "فيصل": "Faisal",
  "حلوان": "Helwan",
  "المقطم": "Mokattam",
};

export function translateLocation(
  loc: string | null | undefined,
  lang: Lang,
): string {
  if (!loc) return "";
  const trimmed = loc.trim();
  if (lang === "ar") return trimmed;
  return AR_TO_EN[trimmed] ?? trimmed;
}
