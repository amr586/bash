import { useEffect, useState } from "react";
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
import { Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

interface JobListing {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  requirementsAr: string;
  requirementsEn: string;
  location: string;
  isActive: boolean;
}

const emptyJob = (): Omit<JobListing, "id"> => ({
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  requirementsAr: "",
  requirementsEn: "",
  location: "التجمع الخامس، القاهرة الجديدة",
  isActive: true,
});

export function JobsPanel() {
  const [jobs, setJobs] = useState<JobListing[] | null>(null);
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyJob());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  async function load() {
    try {
      const d = (await apiFetch("/api/admin/job-listings")) as { jobs: JobListing[] };
      setJobs(d.jobs);
    } catch { setJobs([]); }
  }

  useEffect(() => { void load(); }, []);

  function startNew() {
    setForm(emptyJob());
    setEditId("new");
  }

  function startEdit(j: JobListing) {
    setForm({
      titleAr: j.titleAr,
      titleEn: j.titleEn,
      descriptionAr: j.descriptionAr,
      descriptionEn: j.descriptionEn,
      requirementsAr: j.requirementsAr ?? "",
      requirementsEn: j.requirementsEn ?? "",
      location: j.location ?? "",
      isActive: j.isActive,
    });
    setEditId(j.id);
  }

  async function save() {
    if (!form.titleAr.trim()) {
      toast({ title: "العنوان بالعربي مطلوب", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editId === "new") {
        await apiFetch("/api/admin/job-listings", { method: "POST", body: JSON.stringify(form) });
      } else {
        await apiFetch(`/api/admin/job-listings/${editId}`, { method: "PUT", body: JSON.stringify(form) });
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
      await apiFetch(`/api/admin/job-listings/${deleteId}`, { method: "DELETE" });
      toast({ title: "✅ تم الحذف" });
      setDeleteId(null);
      void load();
    } catch {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: "var(--gold)" }}>إدارة الوظائف</h2>
        <Button onClick={startNew} className="rounded-xl text-black gap-1.5" style={{ background: "var(--gold)" }}>
          <Plus className="h-4 w-4" /> وظيفة جديدة
        </Button>
      </div>

      {editId && (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5 space-y-5">
            <h3 className="font-bold">{editId === "new" ? "➕ وظيفة جديدة" : "✏️ تعديل وظيفة"}</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>المسمى الوظيفي — عربي *</Label>
                <Input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>المسمى الوظيفي — English</Label>
                <Input dir="ltr" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>الموقع</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>الوصف — عربي</Label>
                <Textarea rows={4} value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>الوصف — English</Label>
                <Textarea rows={4} dir="ltr" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>المتطلبات — عربي</Label>
                <Textarea rows={4} value={form.requirementsAr} onChange={(e) => setForm({ ...form, requirementsAr: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>المتطلبات — English</Label>
                <Textarea rows={4} dir="ltr" value={form.requirementsEn} onChange={(e) => setForm({ ...form, requirementsEn: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} id="job-active" />
              <Label htmlFor="job-active">الوظيفة نشطة (ستظهر في صفحة الوظائف)</Label>
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

      {jobs === null ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--gold)" }} /></div>
      ) : jobs.length === 0 ? (
        <p className="text-center text-foreground/50 py-10">مفيش وظائف مضافة لحد دلوقتي.</p>
      ) : (
        <div className="grid gap-3">
          {jobs.map((j) => (
            <Card key={j.id} className="border-border/40 bg-card/40">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{j.titleAr}</p>
                  {j.titleEn && <p className="text-xs text-foreground/50 truncate" dir="ltr">{j.titleEn}</p>}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${j.isActive ? "bg-green-500/20 text-green-500" : "bg-foreground/10 text-foreground/50"}`}>
                      {j.isActive ? "نشطة" : "غير نشطة"}
                    </span>
                    {j.location && <span className="text-xs text-foreground/40">{j.location}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(j)} className="h-8 w-8 p-0"><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(j.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الوظيفة</AlertDialogTitle>
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
