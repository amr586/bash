import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";
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
import { Loader2, MapPin, Send, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  apiFetch,
  propertyTypeLabels,
  listingTypeLabels,
  finishingLabels,
  type PropertyFinishing,
} from "@/lib/api";
import { MultiImageUploader } from "@/components/multi-image-uploader";

const AMENITIES: Array<{ key: string; label: string }> = [
  { key: "furnished", label: "مفروش" },
  { key: "parking", label: "موقف سيارات" },
  { key: "elevator", label: "مصعد" },
  { key: "pool", label: "حمام سباحة" },
  { key: "garden", label: "حديقة" },
  { key: "basement", label: "بيزمنت" },
];

export default function AddPropertyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // basic
  const [title, setTitle] = useState("");
  const [type, setType] = useState("apartment");
  const [listingType, setListingType] = useState("sale");
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState("");

  // price + location
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [mapsLink, setMapsLink] = useState("");

  // details
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

  // images
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [floorPlanUrls, setFloorPlanUrls] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent("/add-property")}`);
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.phone && !contactPhone) setContactPhone(user.phone);
  }, [user, contactPhone]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !type || !listingType) {
      toast({
        title: "بيانات ناقصة",
        description: "املأ العنوان ونوع العقار ونوع العرض.",
        variant: "destructive",
      });
      return;
    }
    if (!price || Number(price) <= 0) {
      toast({
        title: "السعر مطلوب",
        description: "ادخل سعر العقار بالجنيه.",
        variant: "destructive",
      });
      return;
    }
    if (!area || Number(area) <= 0) {
      toast({
        title: "المساحة مطلوبة",
        description: "ادخل مساحة العقار بالمتر المربع.",
        variant: "destructive",
      });
      return;
    }
    if (!location.trim()) {
      toast({
        title: "المنطقة مطلوبة",
        description: "حدد منطقة العقار.",
        variant: "destructive",
      });
      return;
    }
    if (!contactPhone.trim()) {
      toast({
        title: "رقم التواصل مطلوب",
        description: "محتاجين رقم نتواصل بيك عليه للتحقق من الطلب.",
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
      await apiFetch("/api/properties", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
          listingType,
          featured: user?.isAdmin ? featured : false,
          price: Number(price),
          location: location.trim(),
          addressDetails: addressDetails.trim() || null,
          downPayment: downPayment.trim() || null,
          deliveryStatus: deliveryStatus.trim() || null,
          bedrooms: bedrooms ? Number(bedrooms) : null,
          bathrooms: bathrooms ? Number(bathrooms) : null,
          area: Number(area),
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
          contactPhone: contactPhone.trim(),
        }),
      });
      toast({
        title: user?.isAdmin ? "تم النشر" : "تم الإرسال",
        description: user?.isAdmin
          ? "تم نشر العقار وإشعار اليوزرز."
          : "هنراجع العقار ونشعرك لما يتوافق.",
      });
      navigate("/dashboard?tab=my-properties");
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

  function toggleAmenity(key: string, val: boolean) {
    setAmenities((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <div className="min-h-screen bg-background px-4 py-24" dir="rtl">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">أضف عقارك</h1>
        <p className="text-sm text-foreground/60 mb-6">
          {user?.isAdmin
            ? "إنت سوبر أدمن، عقارك هيتنشر مباشرة."
            : "هنراجع العقار وهيظهر للناس بعد الموافقة."}
        </p>

        <Card className="border-border/40 bg-background/60 backdrop-blur">
          <CardContent className="pt-6 pb-6 px-6">
            <form onSubmit={onSubmit} className="grid gap-6">
              {/* === Basic === */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">العنوان (عربي/إنجليزي) *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: شقة 3 غرف في التجمع الخامس"
                    maxLength={200}
                    required
                    data-testid="input-title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>نوع العقار *</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger data-testid="select-type">
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
                      <SelectTrigger data-testid="select-listing-type">
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

                {user?.isAdmin && (
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
                    <p className="text-xs text-foreground/60">
                      {featured
                        ? "هيظهر في قسم العقارات بالصفحة الرئيسية وكمان في صفحة العقارات."
                        : "سيظهر في صفحة العقارات العادية فقط."}
                    </p>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="desc">الوصف</Label>
                  <Textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف تفصيلي للعقار — المميزات، الحالة، التفاصيل..."
                    rows={4}
                    maxLength={5000}
                    data-testid="textarea-description"
                  />
                </div>
              </div>

              {/* === Price + Location === */}
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
                      placeholder="مثال: 3500000"
                      required
                      data-testid="input-price"
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
                      placeholder="مثال: 150"
                      required
                      data-testid="input-area"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">المنطقة *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="مثال: التجمع الخامس، العاصمة الإدارية..."
                    maxLength={200}
                    required
                    data-testid="input-location"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">العنوان التفصيلي</Label>
                  <Input
                    id="address"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    placeholder="مثال: شارع النيل، المبنى 5"
                    maxLength={200}
                    data-testid="input-address-details"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">رقم تواصلك *</Label>
                  <Input
                    id="phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="مثال: 01151313999"
                    dir="ltr"
                    className="text-right"
                    maxLength={30}
                    required
                    data-testid="input-contact-phone"
                  />
                  <p className="text-xs text-foreground/60">
                    سيتواصل معك فريقنا على هذا الرقم للتحقق من الطلب.
                  </p>
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
                      data-testid="input-down-payment"
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
                      data-testid="input-delivery-status"
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
                      رابط موقع جوجل ماب (اختياري)
                    </span>
                  </Label>
                  <Input
                    id="maps"
                    value={mapsLink}
                    onChange={(e) => setMapsLink(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    dir="ltr"
                    className="text-right"
                    maxLength={1000}
                    data-testid="input-maps-link"
                  />
                </div>
              </div>

              {/* === Details === */}
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
                      data-testid="input-bedrooms"
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
                      data-testid="input-bathrooms"
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
                      data-testid="input-floor"
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
                        data-testid={`checkbox-${a.key}`}
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
                            data-testid={`radio-finishing-${k}`}
                          />
                          <span>{finishingLabels[k]}</span>
                        </label>
                      ),
                    )}
                  </RadioGroup>
                </div>
              </div>

              {/* === Images === */}
              <MultiImageUploader
                values={imageUrls}
                onChange={setImageUrls}
                label="صور العقار"
                description="اضغط لرفع صور العقار. يمكنك اختيار أكثر من صورة دفعة واحدة. الصورة الأولى هي الرئيسية."
                buttonLabel="ارفع صور من الجهاز"
                max={30}
                testId="property-images"
              />

              <MultiImageUploader
                values={floorPlanUrls}
                onChange={setFloorPlanUrls}
                label="مسقط أفقي (2D) - اختياري"
                description="ارفع صورة التقسيم الداخلي (مسقط أفقي / Floor Plan)."
                buttonLabel="ارفع صور المخطط"
                max={10}
                testId="property-floorplans"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/dashboard?tab=my-properties")}
                  disabled={saving}
                  className="rounded-xl"
                  data-testid="button-cancel"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl text-black font-semibold"
                  style={{ background: "var(--gold)" }}
                  data-testid="button-submit-property"
                >
                  {saving ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="ml-2 h-4 w-4" />
                  )}
                  {user?.isAdmin ? "نشر العقار" : "إرسال العقار للمراجعة"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
