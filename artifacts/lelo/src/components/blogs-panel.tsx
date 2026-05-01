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

interface BlogPost {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  coverImageUrl: string;
  bodyAr: { heading?: string; text: string; image?: string }[];
  bodyEn: { heading?: string; text: string; image?: string }[];
  dateLabel: string;
  isPublished: boolean;
}

const emptyBlog = (): Omit<BlogPost, "id"> => ({
  slug: "",
  titleAr: "",
  titleEn: "",
  excerptAr: "",
  excerptEn: "",
  coverImageUrl: "",
  bodyAr: [{ text: "" }],
  bodyEn: [{ text: "" }],
  dateLabel: new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long" }),
  isPublished: false,
});

async function uploadBlogImage(file: File): Promise<string> {
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

export function BlogsPanel() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyBlog());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [blockUploading, setBlockUploading] = useState<{ lang: "ar" | "en"; idx: number } | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const blockInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const { toast } = useToast();

  async function load() {
    try {
      const d = (await apiFetch("/api/admin/blog-posts")) as { posts: BlogPost[] };
      setPosts(d.posts);
    } catch { setPosts([]); }
  }

  useEffect(() => { void load(); }, []);

  function startNew() {
    setForm(emptyBlog());
    setEditId("new");
  }

  function startEdit(p: BlogPost) {
    setForm({
      slug: p.slug, titleAr: p.titleAr, titleEn: p.titleEn,
      excerptAr: p.excerptAr, excerptEn: p.excerptEn,
      coverImageUrl: p.coverImageUrl ?? "",
      bodyAr: p.bodyAr?.length ? p.bodyAr : [{ text: "" }],
      bodyEn: p.bodyEn?.length ? p.bodyEn : [{ text: "" }],
      dateLabel: p.dateLabel ?? "",
      isPublished: p.isPublished,
    });
    setEditId(p.id);
  }

  async function save() {
    if (!form.titleAr.trim()) { toast({ title: "العنوان بالعربي مطلوب", variant: "destructive" }); return; }
    if (!form.slug.trim()) { toast({ title: "الـ slug مطلوب (أحرف إنجليزية وشرطات فقط)", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editId === "new") {
        await apiFetch("/api/admin/blog-posts", { method: "POST", body: JSON.stringify(form) });
      } else {
        await apiFetch(`/api/admin/blog-posts/${editId}`, { method: "PUT", body: JSON.stringify(form) });
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
      await apiFetch(`/api/admin/blog-posts/${deleteId}`, { method: "DELETE" });
      toast({ title: "✅ تم الحذف" });
      setDeleteId(null);
      void load();
    } catch {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  }

  function updateBodyBlock(lang: "ar" | "en", idx: number, field: "heading" | "text" | "image", val: string) {
    const key = lang === "ar" ? "bodyAr" : "bodyEn";
    const arr = [...form[key]];
    arr[idx] = { ...arr[idx], [field]: val };
    setForm({ ...form, [key]: arr });
  }

  function addBlock(lang: "ar" | "en") {
    const key = lang === "ar" ? "bodyAr" : "bodyEn";
    setForm({ ...form, [key]: [...form[key], { text: "" }] });
  }

  function removeBlock(lang: "ar" | "en", idx: number) {
    const key = lang === "ar" ? "bodyAr" : "bodyEn";
    const arr = form[key].filter((_, i) => i !== idx);
    setForm({ ...form, [key]: arr.length ? arr : [{ text: "" }] });
  }

  async function handleCoverUpload(file: File) {
    setCoverUploading(true);
    try {
      const path = await uploadBlogImage(file);
      setForm((f) => ({ ...f, coverImageUrl: path }));
      toast({ title: "✅ تم رفع صورة الغلاف" });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "فشل الرفع", variant: "destructive" });
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleBlockImageUpload(lang: "ar" | "en", idx: number, file: File) {
    setBlockUploading({ lang, idx });
    try {
      const path = await uploadBlogImage(file);
      updateBodyBlock(lang, idx, "image", path);
      toast({ title: "✅ تم رفع صورة الفقرة" });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "فشل الرفع", variant: "destructive" });
    } finally {
      setBlockUploading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: "var(--gold)" }}>إدارة المقالات</h2>
        <Button onClick={startNew} className="rounded-xl text-black gap-1.5" style={{ background: "var(--gold)" }}><Plus className="h-4 w-4" /> مقال جديد</Button>
      </div>

      {editId && (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5 space-y-5">
            <h3 className="font-bold">{editId === "new" ? "➕ مقال جديد" : "✏️ تعديل مقال"}</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>slug (للرابط، إنجليزي وشرطات فقط) *</Label>
                <Input dir="ltr" placeholder="my-article-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
              </div>
              <div className="grid gap-2">
                <Label>تاريخ النشر (نص حر)</Label>
                <Input placeholder="مايو ٢٠٢٥" value={form.dateLabel} onChange={(e) => setForm({ ...form, dateLabel: e.target.value })} />
              </div>
              <div className="grid gap-2"><Label>العنوان — عربي *</Label><Input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} /></div>
              <div className="grid gap-2"><Label>العنوان — English</Label><Input dir="ltr" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} /></div>
              <div className="grid gap-2"><Label>المقتطف — عربي</Label><Textarea rows={2} value={form.excerptAr} onChange={(e) => setForm({ ...form, excerptAr: e.target.value })} /></div>
              <div className="grid gap-2"><Label>المقتطف — English</Label><Textarea rows={2} dir="ltr" value={form.excerptEn} onChange={(e) => setForm({ ...form, excerptEn: e.target.value })} /></div>
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
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {(["ar", "en"] as const).map((lng) => {
                const key = lng === "ar" ? "bodyAr" : "bodyEn";
                const blocks = form[key];
                return (
                  <div key={lng} className="space-y-3">
                    <p className="text-sm font-semibold text-foreground/70">{lng === "ar" ? "محتوى المقال — عربي" : "محتوى المقال — English"}</p>
                    {blocks.map((block, idx) => (
                      <div key={idx} className="border border-border/40 rounded-xl p-3 space-y-2 bg-background/40">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground/40">فقرة {idx + 1}</span>
                          <Button type="button" size="sm" variant="ghost" onClick={() => removeBlock(lng, idx)} className="h-6 w-6 p-0 text-destructive"><X className="h-3 w-3" /></Button>
                        </div>
                        <Input placeholder="عنوان فرعي (اختياري)" dir={lng === "ar" ? "rtl" : "ltr"} value={block.heading ?? ""} onChange={(e) => updateBodyBlock(lng, idx, "heading", e.target.value)} />
                        <Textarea placeholder="النص" rows={3} dir={lng === "ar" ? "rtl" : "ltr"} value={block.text} onChange={(e) => updateBodyBlock(lng, idx, "text", e.target.value)} />
                        <div className="space-y-1.5">
                          {block.image && (
                            <div className="relative w-fit">
                              <img src={resolveImageUrl(block.image)} alt="" className="h-20 w-32 object-cover rounded-lg border border-border/40" />
                              <button type="button" className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs" onClick={() => updateBodyBlock(lng, idx, "image", "")}>×</button>
                            </div>
                          )}
                          <div className="flex gap-2 items-center flex-wrap">
                            <Button
                              type="button" variant="outline" size="sm" className="rounded-lg gap-1 h-7 text-xs"
                              disabled={blockUploading?.lang === lng && blockUploading?.idx === idx}
                              onClick={() => { const key = `${lng}-${idx}`; blockInputRefs.current.get(key)?.click(); }}
                            >
                              {blockUploading?.lang === lng && blockUploading?.idx === idx
                                ? <><Loader2 className="h-3 w-3 animate-spin" /> رفع...</>
                                : <><Upload className="h-3 w-3" /> رفع صورة</>}
                            </Button>
                            <input
                              type="file" accept="image/*" className="hidden"
                              ref={(el) => { const key = `${lng}-${idx}`; if (el) blockInputRefs.current.set(key, el); else blockInputRefs.current.delete(key); }}
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleBlockImageUpload(lng, idx, f); e.target.value = ""; }}
                            />
                            <Input placeholder="أو رابط صورة https://..." dir="ltr" value={block.image ?? ""} onChange={(e) => updateBodyBlock(lng, idx, "image", e.target.value)} className="text-xs h-7 flex-1 min-w-[150px]" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button type="button" size="sm" variant="outline" onClick={() => addBlock(lng)} className="rounded-lg w-full gap-1"><Plus className="h-3 w-3" /> إضافة فقرة</Button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} id="blog-published" />
              <Label htmlFor="blog-published">نشر المقال (سيظهر للزوار)</Label>
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

      {posts === null ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--gold)" }} /></div>
      ) : posts.length === 0 ? (
        <p className="text-center text-foreground/50 py-10">مفيش مقالات مضافة لحد دلوقتي.</p>
      ) : (
        <div className="grid gap-3">
          {posts.map((p) => (
            <Card key={p.id} className="border-border/40 bg-card/40">
              <CardContent className="p-4 flex items-start gap-3">
                {p.coverImageUrl && (
                  <img src={resolveImageUrl(p.coverImageUrl)} alt={p.titleAr} className="w-16 h-12 rounded-lg object-cover shrink-0 border border-border/30" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.titleAr}</p>
                  <p className="text-xs text-foreground/40 font-mono">{p.slug}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isPublished ? "bg-green-500/20 text-green-500" : "bg-foreground/10 text-foreground/50"}`}>{p.isPublished ? "منشور" : "مسودة"}</span>
                    {p.dateLabel && <span className="text-xs text-foreground/40">{p.dateLabel}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(p)} className="h-8 w-8 p-0"><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(p.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>تأكيد حذف المقال</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد؟ لا يمكن التراجع عن هذا الحذف.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
