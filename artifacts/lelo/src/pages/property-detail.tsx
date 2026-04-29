import { useEffect, useState, type FormEvent } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
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
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  ExternalLink,
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
  resolveImageUrl,
  useFormatPrice,
  useListingTypeLabels,
  usePropertyTypeLabels,
  type Property,
} from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function PropertyDetailPage() {
  const { lang, t } = useLang();
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
        setError(e instanceof Error ? e.message : t("تعذّر تحميل العقار.", "Couldn't load this property."));
      })
      .finally(() => setLoading(false));
  }, [id, t]);

  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-background">
      <main dir={isAr ? "rtl" : "ltr"} className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground mb-6"
          >
            {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {t("رجوع", "Back")}
          </button>

          {loading ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
            </div>
          ) : error || !property ? (
            <div className="max-w-xl mx-auto text-center py-24">
              <h1 className="text-2xl font-bold mb-3">
                {t("العقار غير متاح", "Property unavailable")}
              </h1>
              <p className="text-foreground/70 mb-6">
                {error ?? t(
                  "العقار اللي بتدور عليه مش موجود أو لسه تحت المراجعة.",
                  "The property you're looking for doesn't exist or is still under review.",
                )}
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/">{t("العودة للرئيسية", "Back to Home")}</Link>
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
  const { lang, t } = useLang();
  const formatPrice = useFormatPrice();
  const listingTypeLabels = useListingTypeLabels();
  const propertyTypeLabels = usePropertyTypeLabels();
  const isAr = lang === "ar";

  const gallery: string[] = (() => {
    const list = [...(property.imageUrls ?? [])];
    if (
      property.mainImageUrl &&
      !list.includes(property.mainImageUrl)
    ) {
      list.unshift(property.mainImageUrl);
    }
    return list;
  })();
  const [activeIdx, setActiveIdx] = useState(0);
  const heroSrc = gallery[activeIdx] ?? property.mainImageUrl ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-5">
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-border/40 bg-foreground/5">
          {heroSrc ? (
            <img
              src={resolveImageUrl(heroSrc)}
              alt={property.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-foreground/30">
              {t("بدون صورة", "No image")}
            </div>
          )}
          <div className={`absolute top-4 ${isAr ? "right-4" : "left-4"} flex gap-2`}>
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

        {gallery.length > 1 && (
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {gallery.map((url, idx) => (
              <button
                type="button"
                key={`${url}-${idx}`}
                onClick={() => setActiveIdx(idx)}
                className={`relative aspect-square rounded-md overflow-hidden border transition-all ${
                  idx === activeIdx
                    ? "ring-2 ring-[var(--gold)] border-transparent"
                    : "border-border/40 opacity-80 hover:opacity-100"
                }`}
                aria-label={t(`الصورة ${idx + 1}`, `Image ${idx + 1}`)}
                data-testid={`thumb-image-${idx}`}
              >
                <img
                  src={resolveImageUrl(url)}
                  alt={`${property.title} ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {property.floorPlanUrls && property.floorPlanUrls.length > 0 && (
          <Card className="border-border/40 bg-background/60 backdrop-blur">
            <CardContent className="p-6 space-y-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Maximize2 className="h-4 w-4" style={{ color: "var(--gold)" }} />
                {t("المخطط (2D)", "Floor plan (2D)")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.floorPlanUrls.map((url, idx) => (
                  <a
                    key={`${url}-${idx}`}
                    href={resolveImageUrl(url)}
                    target="_blank"
                    rel="noreferrer"
                    className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border/40 bg-foreground/5 group"
                    data-testid={`floorplan-${idx}`}
                  >
                    <img
                      src={resolveImageUrl(url)}
                      alt={t(`مخطط ${idx + 1}`, `Plan ${idx + 1}`)}
                      className="absolute inset-0 w-full h-full object-contain group-hover:scale-[1.02] transition-transform"
                    />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                label={t("غرف", "Bedrooms")}
                value={property.bedrooms != null ? String(property.bedrooms) : "—"}
              />
              <DetailStat
                icon={<Bath className="h-4 w-4" />}
                label={t("حمامات", "Bathrooms")}
                value={
                  property.bathrooms != null ? String(property.bathrooms) : "—"
                }
              />
              <DetailStat
                icon={<Maximize2 className="h-4 w-4" />}
                label={t("المساحة", "Area")}
                value={
                  property.area != null
                    ? t(`${property.area} م²`, `${property.area} m²`)
                    : "—"
                }
              />
            </div>

            {property.description && (
              <div>
                <h2 className="font-semibold mb-2">{t("وصف العقار", "About this property")}</h2>
                <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {property.description}
                </p>
              </div>
            )}

            {property.mapsLink && (
              <div className="pt-2 border-t border-border/30">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl"
                  style={{ borderColor: "var(--gold)", color: "var(--gold-light)" }}
                  data-testid="link-maps"
                >
                  <a href={property.mapsLink} target="_blank" rel="noreferrer">
                    <MapPin className={`${isAr ? "ml-2" : "mr-2"} h-4 w-4`} />
                    {t("افتح الموقع على جوجل ماب", "Open location on Google Maps")}
                    <ExternalLink className={`${isAr ? "mr-2" : "ml-2"} h-3.5 w-3.5 opacity-60`} />
                  </a>
                </Button>
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
                    <Phone className={`${isAr ? "ml-2" : "mr-2"} h-4 w-4`} />
                    {t("اتصال مباشر", "Call now")}
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
                    <MessageCircle className={`${isAr ? "ml-2" : "mr-2"} h-4 w-4`} />
                    {t("واتساب", "WhatsApp")}
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
  const { lang, t } = useLang();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("buy");
  const [extra, setExtra] = useState("");
  const [sending, setSending] = useState(false);

  const REASON_OPTIONS = [
    { value: "buy", label: t("شراء عقار", "Buying a property") },
    { value: "general", label: t("استفسار", "General enquiry") },
    { value: "partner", label: t("طلب شراكة", "Partnership request") },
  ];

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
        title: t("بيانات ناقصة", "Missing details"),
        description: t("اكتب اسمك على الأقل.", "Please add your name."),
        variant: "destructive",
      });
      return;
    }
    const reasonLabel =
      REASON_OPTIONS.find((r) => r.value === reason)?.label ?? t("استفسار", "Enquiry");
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
        title: t("تم إرسال طلبك", "Your request has been sent"),
        description: t(
          "هنرجعلك على بياناتك في أقرب وقت.",
          "We'll get back to you as soon as possible.",
        ),
      });
      setExtra("");
    } catch (err) {
      toast({
        title: t("خطأ", "Error"),
        description:
          err instanceof Error ? err.message : t("تعذّر الإرسال.", "Couldn't send your request."),
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  const isAr = lang === "ar";

  return (
    <Card
      className="border-border/40 bg-background/60 backdrop-blur sticky top-24"
      dir={isAr ? "rtl" : "ltr"}
    >
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-1">{t("تواصل معنا", "Contact Us")}</h2>
        <p className="text-xs text-foreground/60 mb-5">
          {t(
            <>ابعتلنا بياناتك وهنرجعلك بخصوص "{property.title}".</>,
            <>Send us your details and we'll get back to you about "{property.title}".</>,
          )}
        </p>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cd-name">{t("الاسم *", "Name *")}</Label>
            <Input
              id="cd-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cd-phone">{t("رقم الهاتف", "Phone Number")}</Label>
            <Input
              id="cd-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              className={isAr ? "text-right" : ""}
              maxLength={30}
              placeholder={t("مثال: 01151313999", "e.g. 01151313999")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cd-email">{t("الإيميل", "Email")}</Label>
            <Input
              id="cd-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className={isAr ? "text-right" : ""}
              maxLength={255}
              placeholder="you@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label>{t("سبب التواصل *", "Reason for contact *")}</Label>
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
            <Label htmlFor="cd-extra">{t("إضافة أخرى", "Additional notes")}</Label>
            <Textarea
              id="cd-extra"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder={t(
                "أي تفاصيل إضافية تحب توضحها...",
                "Any extra details you'd like to share…",
              )}
            />
          </div>
          <Button
            type="submit"
            disabled={sending}
            className="rounded-xl text-black font-semibold w-full"
            style={{ background: "var(--gold)" }}
          >
            {sending ? (
              <Loader2 className={`${isAr ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`} />
            ) : (
              <Send className={`${isAr ? "ml-2" : "mr-2"} h-4 w-4`} />
            )}
            {t("إرسال الطلب", "Send Request")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
