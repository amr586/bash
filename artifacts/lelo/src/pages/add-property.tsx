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
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, propertyTypeLabels, listingTypeLabels } from "@/lib/api";

export default function AddPropertyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("apartment");
  const [listingType, setListingType] = useState("sale");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login");
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
    setSaving(true);
    try {
      await apiFetch("/api/properties", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
          listingType,
          price: Number(price) || 0,
          location: location.trim(),
          bedrooms: bedrooms ? Number(bedrooms) : null,
          bathrooms: bathrooms ? Number(bathrooms) : null,
          area: area ? Number(area) : null,
          mainImageUrl: mainImageUrl.trim() || null,
          contactPhone: contactPhone.trim() || null,
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
            <form onSubmit={onSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="title">عنوان العقار *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: شقة 3 غرف بالتجمع الخامس"
                  maxLength={200}
                  required
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
                  <Label>نوع العرض *</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">السعر (جنيه)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    dir="ltr"
                    className="text-right"
                    placeholder="مثال: 3500000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">المنطقة</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="مثال: التجمع الخامس"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bedrooms">غرف</Label>
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
                  <Label htmlFor="bathrooms">حمامات</Label>
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
                  <Label htmlFor="area">المساحة (م²)</Label>
                  <Input
                    id="area"
                    type="number"
                    min="0"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    dir="ltr"
                    className="text-right"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">رابط الصورة الرئيسية</Label>
                <Input
                  id="image"
                  value={mainImageUrl}
                  onChange={(e) => setMainImageUrl(e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                  className="text-right"
                  maxLength={1000}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">رقم تواصل</Label>
                <Input
                  id="phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="مثال: 01151313999"
                  dir="ltr"
                  className="text-right"
                  maxLength={30}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="desc">وصف العقار</Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب تفاصيل العقار، التشطيب، المميزات..."
                  rows={5}
                  maxLength={5000}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl text-black font-semibold"
                  style={{ background: "var(--gold)" }}
                >
                  {saving ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="ml-2 h-4 w-4" />
                  )}
                  {user?.isAdmin ? "نشر العقار" : "إرسال للمراجعة"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
