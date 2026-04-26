import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/api";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

interface UploadResponse {
  uploadURL: string;
  objectPath: string;
}

async function uploadOne(file: File): Promise<string> {
  const metaRes = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    }),
  });
  if (!metaRes.ok) {
    const err = (await metaRes.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "تعذّر بدء الرفع");
  }
  const { uploadURL, objectPath } = (await metaRes.json()) as UploadResponse;

  const putRes = await fetch(uploadURL, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!putRes.ok) throw new Error("فشل رفع الصورة لخدمة التخزين");

  return objectPath;
}

export function MultiImageUploader({
  values,
  onChange,
  label,
  description,
  buttonLabel = "أضف صور",
  max = 30,
  testId,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  label: string;
  description?: string;
  buttonLabel?: string;
  max?: number;
  testId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const { toast } = useToast();

  async function onPick(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = max - values.length;
    if (remaining <= 0) {
      toast({
        title: "وصلت للحد الأقصى",
        description: `الحد الأقصى ${max} صورة.`,
        variant: "destructive",
      });
      return;
    }
    const picked = Array.from(files).slice(0, remaining);
    const tooBig = picked.find((f) => f.size > MAX_FILE_SIZE);
    if (tooBig) {
      toast({
        title: "حجم كبير",
        description: `كل صورة لازم تبقى أصغر من 15 ميجا (${tooBig.name}).`,
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    setProgress({ done: 0, total: picked.length });
    const uploaded: string[] = [];
    let failed = 0;
    for (const file of picked) {
      try {
        const path = await uploadOne(file);
        uploaded.push(path);
      } catch (err) {
        failed += 1;
        toast({
          title: "فشل رفع صورة",
          description:
            err instanceof Error ? err.message : `${file.name} لم يتم رفعه.`,
          variant: "destructive",
        });
      } finally {
        setProgress((p) => ({ done: p.done + 1, total: p.total }));
      }
    }
    if (uploaded.length > 0) {
      onChange([...values, ...uploaded]);
      toast({
        title: "تم الرفع",
        description: `تم رفع ${uploaded.length} صورة${failed ? ` (فشل ${failed})` : ""}.`,
      });
    }
    setBusy(false);
    setProgress({ done: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(idx: number) {
    onChange(values.filter((_, i) => i !== idx));
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          {description && (
            <div className="text-xs text-foreground/60 mt-0.5">{description}</div>
          )}
        </div>
        <div className="text-xs text-foreground/50">
          {values.length} / {max}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
        data-testid={testId ? `${testId}-input` : undefined}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={busy || values.length >= max}
        className="rounded-xl border-dashed h-auto py-4"
        style={{ borderColor: "var(--gold)", color: "var(--gold-light)" }}
        data-testid={testId ? `${testId}-button` : undefined}
      >
        {busy ? (
          <>
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            جاري الرفع... {progress.done}/{progress.total}
          </>
        ) : (
          <>
            <ImagePlus className="ml-2 h-5 w-5" />
            {buttonLabel}
          </>
        )}
      </Button>

      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-1">
          {values.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border/40 bg-foreground/5"
            >
              <img
                src={resolveImageUrl(url)}
                alt={`${label} ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1 left-1 rounded-full bg-black/70 hover:bg-red-600 text-white p-1 transition-colors"
                aria-label="حذف الصورة"
                data-testid={testId ? `${testId}-remove-${idx}` : undefined}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
