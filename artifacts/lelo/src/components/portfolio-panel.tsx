import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, MapPin, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, resolveImageUrl, uploadFile } from "@/lib/api";

interface PortfolioItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  coverImageUrl: string;
  images: string[];
  location: string;
  category: string;
  yearLabel: string;
  googleMapsUrl: string;
  isPublished: boolean;
  sortOrder: string;
}

const emptyItem = (): Omit<PortfolioItem, "id"> => ({
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  coverImageUrl: "",
  images: [],
  location: "",
  category: "",
  yearLabel: new Date().getFullYear().toString(),
  googleMapsUrl: "",
  isPublished: true,
  sortOrder: "0",
});


function toEmbedUrl(url: string): string {
  if (!url.trim()) return "";
  if (url.includes("maps/embed")) return url;
  try {
    const u = new URL(url);
    if (u.hostname.includes("google.com")) {
      u.searchParams.set("output", "embed");
      return u.toString();
    }
  } catch {}
  return url;
}

export function PortfolioPanel() {
  const [items, setItems] = useState<PortfolioItem[] | null>(null);
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyItem());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const multiGalleryRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function load() {
    try {
      const d = (await apiFetch("/api/admin/portfolio")) as { items: PortfolioItem[] };
      setItems(d.items);
    } catch { setItems([]); }
  }

  useEffect(() => { void load(); }, []);

  function startNew() {
    setForm(emptyItem());
    setEditId("new");
  }

  function startEdit(item: PortfolioItem) {
    setForm({
      titleAr: item.titleAr,
      titleEn: item.titleEn,
      descriptionAr: item.descriptionAr,
      descriptionEn: item.descriptionEn,
      coverImageUrl: item.coverImageUrl ?? "",
      images: item.images ?? [],
      location: item.location ?? "",
      category: item.category ?? "",
      yearLabel: item.yearLabel ?? "",
      googleMapsUrl: item.googleMapsUrl ?? "",
      isPublished: item.isPublished,
      sortOrder: item.sortOrder ?? "0",
    });
    setEditId(item.id);
  }

  async function save() {
    if (!form.titleAr.trim()) {
      toast({ title: "العنوان بالعربي مطلوب", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editId === "new") {
        await apiFetch("/api/admin/portfolio", { method: "POST", body: JSON.stringify(form) });
      } else {
        await apiFetch(`/api/admin/portfolio/${editId}`, { method: "PUT", body: JSON.stringify(form) });
      }
      toast({ title: "✅ تم الحفظ" });
      setEditId(null);
      void load();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "خطأ في الحفظ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/admin/portfolio/${deleteId}`, { method: "DELETE" });
      toast({ title: "✅ تم الحذف" });
      setDeleteId(null);
      void load();
    } catch {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  }

  async function handleCoverUpload(file: File) {
    setCoverUploading(true);
    try {
      const path = await uploadFile(file);
      setForm((f) => ({ ...f, coverImageUrl: path }));
      toast({ title: "✅ تم رفع صورة الغلاف" });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "فشل الرفع", variant: "destructive" });
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleGalleryUpload(files: FileList) {
    setGalleryUploading(true);
    let uploaded = 0;
    for (const file of Array.from(files)) {
      try {
        const path = await uploadFile(file);
        setForm((f) => ({ ...f, images: [...f.images, path] }));
        uploaded++;
      } catch (e) {
        toast({ title: e instanceof Error ? e.message : "فشل رفع صورة", variant: "destructive" });
      }
    }
    if (uploaded > 0) toast({ title: `✅ تم رفع ${uploaded} صورة` });
    setGalleryUploading(false);
  }

  function removeGalleryImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  const embedUrl = toEmbedUrl(form.googleMapsUrl);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: "var(--gold)" }}>إدارة سابقة الأعمال</h2>
        <Button onClick={startNew} className="rounded-xl text-black gap-1.5" style={{ background: "var(--gold)" }}>
          <Plus className="h-4 w-4" /> مشروع جديد
        </Button>
      </div>

      {editId && (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5 space-y-6">
            <h3 className="font-bold text-base">{editId === "new" ? "➕ مشروع جديد" : "✏️ تعديل مشروع"}</h3>

            {/* ── الأسماء ── */}
            <div className="grid gap-2">
              <Label>اسم المشروع *</Label>
              <Input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} placeholder="مشروع باشاك ريزيدنس" />
            </div>

            {/* ── بيانات إضافية ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label>الموقع</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="القاهرة الجديدة" />
              </div>
              <div className="grid gap-2">
                <Label>التصنيف</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="سكني / تجاري" />
              </div>
              <div className="grid gap-2">
                <Label>السنة</Label>
                <Input value={form.yearLabel} onChange={(e) => setForm({ ...form, yearLabel: e.target.value })} placeholder="2024" />
              </div>
              <div className="grid gap-2">
                <Label>الترتيب</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
            </div>

            {/* ── رابط جوجل ماب ── */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: "var(--gold)" }} />
                رابط جوجل ماب
              </Label>
              <Input
                dir="ltr"
                placeholder="https://maps.google.com/maps?q=..."
                value={form.googleMapsUrl}
                onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
              />
              <p className="text-xs text-foreground/50">
                افتح جوجل ماب → اضغط "مشاركة" → انسخ الرابط والصقه هنا
              </p>
              {embedUrl && (
                <div className="flex justify-center py-2">
                  <div
                    className="relative overflow-hidden"
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: "50%",
                      border: "4px solid var(--gold)",
                      boxShadow: "0 0 0 2px var(--gold-dark), 0 0 20px rgba(212,175,55,0.3)",
                    }}
                  >
                    <iframe
                      src={embedUrl}
                      title="موقع المشروع"
                      className="w-full h-full border-0 pointer-events-none"
                      style={{ width: "100%", height: "100%", transform: "scale(1.1)", transformOrigin: "center" }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── صورة الغلاف ── */}
            <div className="space-y-2">
              <Label>صورة الغلاف</Label>
              <div className="flex items-start gap-3 flex-wrap">
                {form.coverImageUrl && (
                  <div className="relative shrink-0">
                    <img src={resolveImageUrl(form.coverImageUrl)} alt="غلاف" className="h-24 w-36 object-cover rounded-lg border border-border/40" />
                    <button type="button" className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center" onClick={() => setForm({ ...form, coverImageUrl: "" })}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                  <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1.5 w-fit" disabled={coverUploading} onClick={() => coverInputRef.current?.click()}>
                    {coverUploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> جاري الرفع...</> : <><Upload className="h-3.5 w-3.5" /> رفع من الجهاز</>}
                  </Button>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleCoverUpload(f); e.target.value = ""; }} />
                  <Input dir="ltr" placeholder="أو الصق رابط https://..." value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="text-xs" />
                </div>
              </div>
            </div>

            {/* ── معرض الصور ── */}
            <div className="space-y-3">
              <Label>معرض الصور</Label>
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={resolveImageUrl(img)} alt="" className="h-24 w-32 object-cover rounded-xl border border-border/40 transition-opacity group-hover:opacity-80" />
                      <button
                        type="button"
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeGalleryImage(idx)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-center flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg gap-1.5"
                  disabled={galleryUploading}
                  onClick={() => multiGalleryRef.current?.click()}
                >
                  {galleryUploading
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> جاري الرفع...</>
                    : <><Upload className="h-3.5 w-3.5" /> رفع صور من الجهاز (متعددة)</>}
                </Button>
                <input
                  ref={multiGalleryRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.length) void handleGalleryUpload(e.target.files); e.target.value = ""; }}
                />
              </div>
            </div>

            {/* ── النشر والحفظ ── */}
            <div className="flex items-center gap-2 pt-1">
              <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} id="portfolio-published" />
              <Label htmlFor="portfolio-published">نشر المشروع (سيظهر للزوار)</Label>
            </div>

            <div className="flex gap-2 flex-wrap pt-1 border-t border-border/30">
              <Button onClick={save} disabled={saving} className="rounded-xl text-black gap-1.5" style={{ background: "var(--gold)" }}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...</> : <><Save className="h-4 w-4" /> حفظ المشروع</>}
              </Button>
              <Button variant="outline" onClick={() => setEditId(null)} className="rounded-xl">إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {items === null ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--gold)" }} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-foreground/50 border border-dashed border-border/40 rounded-2xl">
          <p className="text-lg mb-2">مفيش مشاريع مضافة لحد دلوقتي</p>
          <p className="text-sm">اضغط "مشروع جديد" لإضافة أول مشروع</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className="border-border/40 bg-card/40 hover:border-[var(--gold)]/30 transition-colors">
              <CardContent className="p-4 flex items-start gap-3">
                {item.coverImageUrl ? (
                  <img src={resolveImageUrl(item.coverImageUrl)} alt={item.titleAr} className="w-16 h-14 rounded-lg object-cover shrink-0 border border-border/30" />
                ) : (
                  <div className="w-16 h-14 rounded-lg shrink-0 border border-border/30 bg-foreground/5 flex items-center justify-center text-foreground/20 text-xl">🏗️</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.titleAr}</p>
                  {item.titleEn && <p className="text-xs text-foreground/40 truncate" dir="ltr">{item.titleEn}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isPublished ? "bg-green-500/20 text-green-500" : "bg-foreground/10 text-foreground/50"}`}>
                      {item.isPublished ? "منشور" : "مخفي"}
                    </span>
                    {item.category && <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/8 text-foreground/50">{item.category}</span>}
                    {item.yearLabel && <span className="text-xs text-foreground/40">{item.yearLabel}</span>}
                    {item.location && <span className="text-xs text-foreground/40 flex items-center gap-0.5"><MapPin className="h-3 w-3" />{item.location}</span>}
                    {item.googleMapsUrl && <span className="text-xs text-[var(--gold-light)] flex items-center gap-0.5"><MapPin className="h-3 w-3" />خريطة</span>}
                    {item.images?.length > 0 && <span className="text-xs text-foreground/40">{item.images.length} صورة</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(item)} className="h-8 w-8 p-0" title="تعديل"><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(item.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="حذف"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف المشروع</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد؟ لا يمكن التراجع عن هذا الحذف.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
