import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Save,
  Star,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  apiFetch,
  propertyTypeLabels,
  listingTypeLabels,
  finishingLabels,
  type Property,
  type PropertyFinishing,
} from "@/lib/api";
import { isStaff } from "@/lib/roles";
import { MultiImageUploader } from "@/components/multi-image-uploader";

const AMENITIES: Array<{ key: string; label: string }> = [
  { key: "furnished", label: "مفروش" },
  { key: "parking", label: "موقف سيارات" },
  { key: "elevator", label: "مصعد" },
  { key: "pool", label: "حمام سباحة" },
  { key: "garden", label: "حديقة" },
  { key: "basement", label: "بيزمنت" },
];

export default function EditPropertyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, params] = useRoute<{ id: string }>("/edit-property/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("apartment");
  const [listingType, setListingType] = useState("sale");
  const [featured, setFeatured] = useState(false);
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [floor, setFloor] = useState("");
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    furnished: false,
    parking: false,
    elevator: false,
    pool: false,
    garden: false,
    basement: false,
  });
  const [finishing, setFinishing] = useState<PropertyFinishing | "">("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [floorPlanUrls, setFloorPlanUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [ownerId, setOwnerId] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [saving, setSaving] = useState(false);

  const canEdit = isStaff(user);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate(`/login?next=${encodeURIComponent(`/edit-property/${id ?? ""}`)}`);
      } else if (!canEdit) {
        navigate("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, canEdit, navigate, id]);

  useEffect(() => {
    if (!id || !canEdit) return;
    setLoading(true);
    apiFetch<{ property: Property }>(`/api/properties/${id}`)
      .then((d) => {
        const p = d.property;
        setTitle(p.title);
        setDescription(p.description ?? "");
        setType(p.type);
        setListingType(p.listingType);
        setFeatured(p.featured ?? false);
        setPrice(p.price > 0 ? String(p.price) : "");
        setArea(p.area != null ? String(p.area) : "");
        setLocation(p.location ?? "");
        setAddressDetails(p.addressDetails ?? "");
        setContactPhone(p.contactPhone ?? "");
        setDownPayment(p.downPayment ?? "");
        setDeliveryStatus(p.deliveryStatus ?? "");
        setMapsLink(p.mapsLink ?? "");
        setBedrooms(p.bedrooms != null ? String(p.bedrooms) : "");
        setBathrooms(p.bathrooms != null ? String(p.bathrooms) : "");
        setFloor(p.floor != null ? String(p.floor) : "");
        setAmenities({
          furnished: p.furnished ?? false,
          parking: p.parking ?? false,
          elevator: p.elevator ?? false,
          pool: p.pool ?? false,
          garden: p.garden ?? false,
          basement: p.basement ?? false,
        });
        setFinishing(p.finishing ?? "");
        setImageUrls(p.imageUrls ?? []);
        setFloorPlanUrls(p.floorPlanUrls ?? []);
        setStatus(p.status);
        setOwnerId(p.ownerId);
        setCreatedAt(p.createdAt);
        setUpdatedAt(p.updatedAt);
        setNotFound(false);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, canEdit]);

  if (isLoading || !isAuthenticated || !canEdit || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-background px-4"
        dir="rtl"
      >
        <h1 className="text-2xl font-bold mb-3">العقار غير موجود</h1>
        <Button
          onClick={() => navigate("/admin?tab=properties")}
          className="rounded-xl text-black font-semibold"
          style={{ background: "var(--gold)" }}
        >
          العودة للوحة الأدمن
        </Button>
      </div>
    );
  }

  function isValidMapsLink(v: string): boolean {
    if (!v) return true;
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }

  function toggleAmenity(key: string, val: boolean) {
    setAmenities((prev) => ({ ...prev, [key]: val }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!title.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "العنوان مطلوب.",
        variant: "destructive",
      });
      return;
    }
    if (!isValidMapsLink(mapsLink.trim())) {
      toast({
        title: "رابط الخريطة غير صحيح",
        description: "ابعت لينك يبدأ بـ https://",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/api/admin/properties/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
          listingType,
          featured,
          price: Number(price) || 0,
          location: location.trim(),
          addressDetails: addressDetails.trim() || null,
          downPayment: downPayment.trim() || null,
          deliveryStatus: deliveryStatus.trim() || null,
          bedrooms: bedrooms ? Number(bedrooms) : null,
          bathrooms: bathrooms ? Number(bathrooms) : null,
          area: area ? Number(area) : null,
          floor: floor ? Number(floor) : null,
          furnished: amenities.furnished,
          parking: amenities.parking,
          elevator: amenities.elevator,
          pool: amenities.pool,
          garden: amenities.garden,
          basement: amenities.basement,
          finishing: finishing || null,
          mainImageUrl: imageUrls[0] ?? null,
          imageUrls,
          floorPlanUrls,
          mapsLink: mapsLink.trim() || null,
          contactPhone: contactPhone.trim() || null,
          status,
        }),
      });
      toast({
        title: "تم الحفظ",
        description: "اتعدّل العقار بنجاح.",
      });
      navigate("/admin?tab=properties");
    } catch (err) {
      toast({
        title: "خطأ",
        description: err instanceof Error ? err.message : "فشل الحفظ.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-24" dir="rtl">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">تعديل العقار</h1>
        <p className="text-sm text-foreground/60 mb-6">
          عدّل أي بيانات عن العقار من هنا.
        </p>

        <Card className="border-border/40 bg-background/60 backdrop-blur">
          <CardContent className="pt-6 pb-6 px-6">
            <form onSubmit={onSubmit} className="grid gap-6">
              {/* status block */}
              <div
                className="grid gap-2 p-4 rounded-xl border"
                style={{
                  borderColor: "var(--gold-dark)",
                }}
              >
                <Label htmlFor="status" className="font-semibold">
                  حالة العقار
                </Label>
                <Select
                  value={status}
                  onValueChange={(v) =>
                    setStatus(v as "pending" | "approved" | "rejected")
                  }
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <span className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        قيد المراجعة
                      </span>
                    </SelectItem>
                    <SelectItem value="approved">
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        معتمد ومنشور
                      </span>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <span className="inline-flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        مرفوض
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-foreground/60">
                  لما تختار "معتمد" العقار هيظهر للزوار في صفحة العقارات
                  وصاحبه هيوصله إشعار.
                </p>
              </div>

              {/* basic */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">العنوان (عربي/إنجليزي) *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    required
                    data-testid="input-edit-title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>نوع العقار *</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(propertyTypeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>الغرض *</Label>
                    <Select value={listingType} onValueChange={setListingType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(listingTypeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div
                  className="grid gap-2 p-4 rounded-xl border"
                  style={{ borderColor: "var(--gold-dark)" }}
                >
                  <Label className="font-semibold inline-flex items-center gap-2">
                    <Star
                      className="h-4 w-4"
                      style={{ color: "var(--gold)" }}
                    />
                    حالة العقار / إضافة في صفحة الهوم
                  </Label>
                  <Select
                    value={featured ? "featured" : "normal"}
                    onValueChange={(v) => setFeatured(v === "featured")}
                  >
                    <SelectTrigger data-testid="select-featured">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">
                        صفحة العقارات فقط (غير مميز)
                      </SelectItem>
                      <SelectItem value="featured">
                        مميز - يظهر في الصفحة الرئيسية
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="desc">الوصف</Label>
                  <Textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={5000}
                  />
                </div>
              </div>

              {/* price + location */}
              <div className="grid gap-4">
                <h2 className="text-lg font-bold text-foreground border-b border-border/40 pb-2">
                  السعر والموقع
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">السعر (جنيه) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      dir="ltr"
                      className="text-right"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="area">المساحة (م²) *</Label>
                    <Input
                      id="area"
                      type="number"
                      min="0"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      dir="ltr"
                      className="text-right"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">المنطقة *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="مثال: التجمع الخامس، جولدن سكوير، ميفيدا..."
                    maxLength={200}
                    required
                  />
                  <p className="text-xs text-foreground/60">
                    باشاك متخصصة في عقارات قلب التجمع الخامس بالقاهرة الجديدة فقط.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">العنوان التفصيلي</Label>
                  <Input
                    id="address"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    maxLength={200}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">رقم تواصل *</Label>
                  <Input
                    id="phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    dir="ltr"
                    className="text-right"
                    maxLength={30}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="down">المقدم</Label>
                    <Input
                      id="down"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      placeholder="مثال: مقدم 750,000 جنيه"
                      maxLength={100}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="delivery">حالة التسليم</Label>
                    <Input
                      id="delivery"
                      value={deliveryStatus}
                      onChange={(e) => setDeliveryStatus(e.target.value)}
                      placeholder="مثال: استلام فوري"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maps">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin
                        className="h-4 w-4"
                        style={{ color: "var(--gold)" }}
                      />
                      رابط جوجل ماب (اختياري)
                    </span>
                  </Label>
                  <Input
                    id="maps"
                    value={mapsLink}
                    onChange={(e) => setMapsLink(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    dir="ltr"
                    className="text-right"
                    maxLength={1000}
                    data-testid="input-edit-maps-link"
                  />
                </div>
              </div>

              {/* details */}
              <div className="grid gap-4">
                <h2 className="text-lg font-bold text-foreground border-b border-border/40 pb-2">
                  التفاصيل
                </h2>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bedrooms">عدد الغرف</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bathrooms">عدد الحمامات</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="floor">رقم الطابق</Label>
                    <Input
                      id="floor"
                      type="number"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl border border-border/40 bg-foreground/5">
                  {AMENITIES.map((a) => (
                    <label
                      key={a.key}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={amenities[a.key] ?? false}
                        onCheckedChange={(v) =>
                          toggleAmenity(a.key, v === true)
                        }
                        data-testid={`checkbox-edit-${a.key}`}
                      />
                      <span>{a.label}</span>
                    </label>
                  ))}
                </div>

                <div className="grid gap-2 p-4 rounded-xl border border-border/40 bg-foreground/5">
                  <Label className="font-semibold">التشطيب</Label>
                  <RadioGroup
                    value={finishing || ""}
                    onValueChange={(v) =>
                      setFinishing(v as PropertyFinishing)
                    }
                    className="grid grid-cols-2 md:grid-cols-4 gap-2"
                  >
                    {(Object.keys(finishingLabels) as PropertyFinishing[]).map(
                      (k) => (
                        <label
                          key={k}
                          className="flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <RadioGroupItem
                            value={k}
                            data-testid={`radio-edit-finishing-${k}`}
                          />
                          <span>{finishingLabels[k]}</span>
                        </label>
                      ),
                    )}
                  </RadioGroup>
                </div>
              </div>

              {/* images */}
              <MultiImageUploader
                values={imageUrls}
                onChange={setImageUrls}
                label="صور العقار"
                description="أضف صور جديدة أو احذف الموجود. الصورة الأولى هتبقى الصورة الرئيسية."
                buttonLabel="ارفع صور إضافية"
                max={30}
                testId="edit-property-images"
              />

              <MultiImageUploader
                values={floorPlanUrls}
                onChange={setFloorPlanUrls}
                label="مسقط أفقي (2D)"
                description="أضف أو احذف صور المخطط."
                buttonLabel="ارفع صور المخطط"
                max={10}
                testId="edit-property-floorplans"
              />

              {/* admin info */}
              <div className="grid gap-2 p-4 rounded-xl border border-border/40 bg-foreground/5">
                <Label className="font-semibold text-sm">
                  بيانات إدارية (للقراءة فقط)
                </Label>
                <div className="grid gap-1.5 text-xs text-foreground/70">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground/50">رقم العقار:</span>
                    <code
                      className="text-[10px] font-mono truncate max-w-[260px]"
                      dir="ltr"
                    >
                      {id}
                    </code>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground/50">رقم صاحب العقار:</span>
                    <code
                      className="text-[10px] font-mono truncate max-w-[260px]"
                      dir="ltr"
                    >
                      {ownerId}
                    </code>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground/50">تاريخ الإضافة:</span>
                    <span dir="ltr">
                      {createdAt
                        ? new Date(createdAt).toLocaleString("ar-EG")
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground/50">آخر تعديل:</span>
                    <span dir="ltr">
                      {updatedAt
                        ? new Date(updatedAt).toLocaleString("ar-EG")
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground/50">الحالة الحالية:</span>
                    <Badge
                      variant="outline"
                      className={
                        status === "approved"
                          ? "border-green-500/40 text-green-400"
                          : status === "rejected"
                            ? "border-red-500/40 text-red-400"
                            : "border-yellow-500/40 text-yellow-400"
                      }
                    >
                      {status === "approved"
                        ? "معتمد ومنشور"
                        : status === "rejected"
                          ? "مرفوض"
                          : "قيد المراجعة"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/admin?tab=properties")}
                  disabled={saving}
                  className="rounded-xl"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl text-black font-semibold"
                  style={{ background: "var(--gold)" }}
                  data-testid="button-save-edit-property"
                >
                  {saving ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="ml-2 h-4 w-4" />
                  )}
                  حفظ التعديلات
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
