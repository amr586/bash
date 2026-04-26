import { useEffect, useState, type FormEvent } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Loader2,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  apiFetch,
  formatPrice,
  listingTypeLabels,
  propertyTypeLabels,
  type Property,
} from "@/lib/api";

const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: "viewing", label: "حجز معاينة" },
  { value: "price", label: "استفسار عن السعر والتقسيط" },
  { value: "availability", label: "التأكد من توفّر الوحدة" },
  { value: "negotiation", label: "تفاوض / عرض" },
  { value: "other", label: "سبب آخر" },
];

export default function PropertyDetailPage() {
  const [, params] = useRoute<{ id: string }>("/properties/:id");
  const [, navigate] = useLocation();
  const id = params?.id;

  const [property, setProperty] = useState<Property | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<{ property: Property }>(`/api/properties/${id}`)
      .then((d) => {
        setProperty(d.property);
        setError(null);
      })
      .catch((e) => {
        setProperty(null);
        setError(e instanceof Error ? e.message : "تعذّر تحميل العقار.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main dir="rtl" className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6"
          >
            <ArrowRight className="h-4 w-4" />
            رجوع
          </button>

          {loading ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
            </div>
          ) : error || !property ? (
            <div className="max-w-xl mx-auto text-center py-24">
              <h1 className="text-2xl font-bold mb-3">العقار غير متاح</h1>
              <p className="text-foreground/70 mb-6">
                {error ?? "العقار اللي بتدور عليه مش موجود أو لسه تحت المراجعة."}
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/">العودة للرئيسية</Link>
              </Button>
            </div>
          ) : (
            <PropertyDetail property={property} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PropertyDetail({ property }: { property: Property }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-5">
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border/40 bg-foreground/5">
          {property.mainImageUrl ? (
            <img
              src={property.mainImageUrl}
              alt={property.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-foreground/30">
              بدون صورة
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge
              className="text-black font-semibold border-0"
              style={{ background: "var(--gold)" }}
            >
              {listingTypeLabels[property.listingType] ?? property.listingType}
            </Badge>
            <Badge variant="outline" className="bg-background/70 border-border/60">
              {propertyTypeLabels[property.type] ?? property.type}
            </Badge>
          </div>
        </div>

        <Card className="border-border/40 bg-background/60 backdrop-blur">
          <CardContent className="p-6 space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {property.title}
              </h1>
              {property.location && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-foreground/70">
                  <MapPin className="h-4 w-4" style={{ color: "var(--gold)" }} />
                  {property.location}
                </div>
              )}
            </div>

            <div
              className="text-3xl font-bold"
              style={{ color: "var(--gold-light)" }}
            >
              {formatPrice(property.price)}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <DetailStat
                icon={<BedDouble className="h-4 w-4" />}
                label="غرف"
                value={property.bedrooms != null ? String(property.bedrooms) : "—"}
              />
              <DetailStat
                icon={<Bath className="h-4 w-4" />}
                label="حمامات"
                value={
                  property.bathrooms != null ? String(property.bathrooms) : "—"
                }
              />
              <DetailStat
                icon={<Maximize2 className="h-4 w-4" />}
                label="المساحة"
                value={property.area != null ? `${property.area} م²` : "—"}
              />
            </div>

            {property.description && (
              <div>
                <h2 className="font-semibold mb-2">وصف العقار</h2>
                <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {property.description}
                </p>
              </div>
            )}

            {property.contactPhone && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                <Button
                  asChild
                  className="rounded-xl text-black font-semibold"
                  style={{ background: "var(--gold)" }}
                >
                  <a href={`tel:${property.contactPhone}`}>
                    <Phone className="ml-2 h-4 w-4" />
                    اتصال مباشر
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl"
                  style={{ borderColor: "var(--gold)", color: "var(--gold-light)" }}
                >
                  <a
                    href={`https://wa.me/${property.contactPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="ml-2 h-4 w-4" />
                    واتساب
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <ContactPropertyForm property={property} />
      </div>
    </div>
  );
}

function DetailStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-lg p-3 border border-border/40"
      style={{ background: "rgba(212, 175, 55, 0.04)" }}
    >
      <div
        className="flex items-center gap-1.5 text-xs"
        style={{ color: "var(--gold)" }}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-lg font-semibold text-foreground mt-1">{value}</div>
    </div>
  );
}

function ContactPropertyForm({ property }: { property: Property }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("viewing");
  const [extra, setExtra] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
      if (full && !name) setName(full);
      if (user.email && !email) setEmail(user.email);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [isAuthenticated, user, name, email, phone]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast({
        title: "بيانات ناقصة",
        description: "اكتب اسمك على الأقل.",
        variant: "destructive",
      });
      return;
    }
    const reasonLabel =
      REASON_OPTIONS.find((r) => r.value === reason)?.label ?? "استفسار";
    const composedMessage = extra.trim()
      ? `[${reasonLabel}] ${extra.trim()}`
      : `[${reasonLabel}]`;

    setSending(true);
    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          message: composedMessage,
          propertyId: property.id,
        }),
      });
      toast({
        title: "تم إرسال طلبك",
        description: "هنرجعلك على بياناتك في أقرب وقت.",
      });
      setExtra("");
    } catch (err) {
      toast({
        title: "خطأ",
        description: err instanceof Error ? err.message : "تعذّر الإرسال.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <Card
      className="border-border/40 bg-background/60 backdrop-blur sticky top-24"
      dir="rtl"
    >
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-1">تواصل معنا</h2>
        <p className="text-xs text-foreground/60 mb-5">
          ابعتلنا بياناتك وهنرجعلك بخصوص "{property.title}".
        </p>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cd-name">الاسم *</Label>
            <Input
              id="cd-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cd-phone">رقم الهاتف</Label>
            <Input
              id="cd-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className="text-right"
              maxLength={30}
              placeholder="مثال: 01151313999"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cd-email">الإيميل</Label>
            <Input
              id="cd-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="text-right"
              maxLength={255}
              placeholder="you@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label>سبب التواصل *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cd-extra">إضافة أخرى</Label>
            <Textarea
              id="cd-extra"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="أي تفاصيل إضافية تحب توضحها..."
            />
          </div>
          <Button
            type="submit"
            disabled={sending}
            className="rounded-xl text-black font-semibold w-full"
            style={{ background: "var(--gold)" }}
          >
            {sending ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="ml-2 h-4 w-4" />
            )}
            إرسال الطلب
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
