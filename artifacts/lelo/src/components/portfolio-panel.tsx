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
import { Loader2, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, resolveImageUrl } from "@/lib/api";

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
  isPublished: true,
  sortOrder: "0",
});

async function uploadImage(file: File): Promise<string> {
  const metaRes = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }),
  });
  if (!metaRes.ok) {
    const err = (await metaRes.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "تعذّر بدء الرفع");
  }
  const { uploadURL, objectPath } = (await metaRes.json()) as { uploadURL: string; objectPath: string };
  const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
  if (!putRes.ok) throw new Error("فشل رفع الصورة");
  return objectPath;
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
      const path = await uploadImage(file);
      setForm((f) => ({ ...f, coverImageUrl: path }));
      toast({ title: "✅ تم رفع صورة الغلاف" });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "فشل الرفع", variant: "destructive" });
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleGalleryUpload(file: File) {
    setGalleryUploading(true);
    try {
      const path = await uploadImage(file);
      setForm((f) => ({ ...f, images: [...f.images, path] }));
      toast({ title: "✅ تم رفع الصورة" });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "فشل الرفع", variant: "destructive" });
    } finally {
      setGalleryUploading(false);
    }
  }

  function removeGalleryImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: "var(--gold)" }}>إدارة سابقة الأعمال</h2>
        <Button onClick={startNew} className="rounded-xl text-black gap-1.5" style={{ background: "var(--gold)" }}>
          <Plus className="h-4 w-4" /> مشروع جديد
        </Button>
      </div>

      {editId && (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5 space-y-5">
            <h3 className="font-bold">{editId === "new" ? "➕ مشروع جديد" : "✏️ تعديل مشروع"}</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>اسم المشروع — عربي *</Label>
                <Input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>اسم المشروع — English</Label>
                <Input dir="ltr" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>الموقع</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="القاهرة الجديدة، مصر" />
              </div>
              <div className="grid gap-2">
                <Label>التصنيف</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="سكني / تجاري / إداري" />
              </div>
              <div className="grid gap-2">
                <Label>السنة</Label>
                <Input value={form.yearLabel} onChange={(e) => setForm({ ...form, yearLabel: e.target.value })} placeholder="2024" />
              </div>
              <div className="grid gap-2">
                <Label>ترتيب العرض (رقم، الأقل أولاً)</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>الوصف — عربي</Label>
                <Textarea rows={4} value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>الوصف — English</Label>
                <Textarea rows={4} dir="ltr" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label>صورة الغلاف</Label>
                <div className="flex items-start gap-3 flex-wrap">
                  {form.coverImageUrl && (
                    <img src={resolveImageUrl(form.coverImageUrl)} alt="غلاف" className="h-24 w-36 object-cover rounded-lg border border-border/40 shrink-0" />
                  )}
                  <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                    <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1.5 w-fit" disabled={coverUploading} onClick={() => coverInputRef.current?.click()}>
                      {coverUploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> جاري الرفع...</> : <><Upload className="h-3.5 w-3.5" /> رفع صورة</>}
                    </Button>
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleCoverUpload(f); e.target.value = ""; }} />
                    <Input dir="ltr" placeholder="أو الصق رابط https://..." value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="text-xs" />
                  </div>
                </div>
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label>معرض الصور</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={resolveImageUrl(img)} alt="" className="h-20 w-28 object-cover rounded-lg border border-border/40" />
                      <button type="button" className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs" onClick={() => removeGalleryImage(idx)}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <Button type="button" variant="outline" size="sm" className="rounded-lg gap-1.5 w-fit" disabled={galleryUploading} onClick={() => galleryInputRef.current?.click()}>
                    {galleryUploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> جاري الرفع...</> : <><Upload className="h-3.5 w-3.5" /> إضافة صورة</>}
                  </Button>
                  <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleGalleryUpload(f); e.target.value = ""; }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} id="portfolio-published" />
              <Label htmlFor="portfolio-published">نشر المشروع (سيظهر للزوار)</Label>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={save} disabled={saving} className="rounded-xl text-black" style={{ background: "var(--gold)" }}>
                {saving ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري...</> : <><Save className="ml-2 h-4 w-4" /> حفظ</>}
              </Button>
              <Button variant="outline" onClick={() => setEditId(null)} className="rounded-xl">إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {items === null ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--gold)" }} /></div>
      ) : items.length === 0 ? (
        <p className="text-center text-foreground/50 py-10">مفيش مشاريع مضافة لحد دلوقتي.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className="border-border/40 bg-card/40">
              <CardContent className="p-4 flex items-start gap-3">
                {item.coverImageUrl && (
                  <img src={resolveImageUrl(item.coverImageUrl)} alt={item.titleAr} className="w-16 h-12 rounded-lg object-cover shrink-0 border border-border/30" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.titleAr}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isPublished ? "bg-green-500/20 text-green-500" : "bg-foreground/10 text-foreground/50"}`}>
                      {item.isPublished ? "منشور" : "مخفي"}
                    </span>
                    {item.category && <span className="text-xs text-foreground/40">{item.category}</span>}
                    {item.yearLabel && <span className="text-xs text-foreground/40">{item.yearLabel}</span>}
                    {item.location && <span className="text-xs text-foreground/40">{item.location}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(item)} className="h-8 w-8 p-0"><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(item.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
