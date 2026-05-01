import { Link } from "wouter";
import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Bath, BedDouble, Building2, Heart, MapPin, Maximize2 } from "lucide-react";
import {
  addFavorite,
  removeFavorite,
  resolveImageUrl,
  useFormatPrice,
  useListingTypeLabels,
  usePropertyTypeLabels,
  useStatusLabels,
  type Property,
} from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { translateLocation } from "@/lib/locations";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation } from "wouter";

export function PropertyCard({
  property,
  showStatus = false,
  actions,
  href,
  isFavorite,
  onFavoriteChange,
  hideFavorite = false,
}: {
  property: Property;
  showStatus?: boolean;
  actions?: React.ReactNode;
  href?: string;
  isFavorite?: boolean;
  onFavoriteChange?: (next: boolean) => void;
  hideFavorite?: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [favPending, setFavPending] = useState(false);
  const [favLocal, setFavLocal] = useState<boolean>(!!isFavorite);
  const fav = isFavorite ?? favLocal;

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (favPending) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setFavPending(true);
    const next = !fav;
    try {
      if (next) await addFavorite(property.id);
      else await removeFavorite(property.id);
      setFavLocal(next);
      onFavoriteChange?.(next);
    } catch {
      // ignore — keep previous state
    } finally {
      setFavPending(false);
    }
  }

  const { lang, t } = useLang();
  const formatPrice = useFormatPrice();
  const propertyTypeLabels = usePropertyTypeLabels();
  const listingTypeLabels = useListingTypeLabels();
  const statusLabels = useStatusLabels();
  const status = statusLabels[property.status];
  const linkTo = href ?? `/properties/${property.id}`;
  const cornerPos = lang === "ar" ? "right-2" : "left-2";
  return (
    <Card
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="overflow-hidden border-border/40 bg-background/60 backdrop-blur hover:shadow-xl transition-shadow group"
    >
      <div className="relative aspect-[4/3] bg-foreground/5">
        {property.mainImageUrl || property.imageUrls?.[0] ? (
          <img
            src={resolveImageUrl(property.mainImageUrl ?? property.imageUrls[0])}
            alt={property.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-foreground/30 text-sm">
            {t("بدون صورة", "No image")}
          </div>
        )}
        <div className={`absolute top-2 ${cornerPos} flex gap-1.5`}>
          <Badge
            className="text-black font-semibold border-0"
            style={{ background: "var(--gold)" }}
          >
            {listingTypeLabels[property.listingType] ?? property.listingType}
          </Badge>
          {property.era === "past" && (
            <Badge className="bg-slate-600 text-white border-0 font-semibold">
              {t("سابق", "Past")}
            </Badge>
          )}
          {showStatus && status && (
            <Badge className={`${status.color} border-0`}>{status.label}</Badge>
          )}
        </div>
        {!hideFavorite && (
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={favPending}
            aria-label={
              fav
                ? t("إزالة من المفضلة", "Remove from favorites")
                : t("أضف للمفضلة", "Add to favorites")
            }
            className={`absolute top-2 ${
              lang === "ar" ? "left-2" : "right-2"
            } z-[3] h-9 w-9 rounded-full flex items-center justify-center bg-black/55 hover:bg-black/75 backdrop-blur transition-colors`}
            data-testid={`button-favorite-${property.id}`}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                fav ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </button>
        )}
      </div>
      <Link
        href={linkTo}
        aria-label={t(`عرض تفاصيل ${property.title}`, `View details for ${property.title}`)}
        className="absolute inset-0 z-[1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
      />
      <div className="p-4 flex flex-col gap-3 relative">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-[var(--gold-light)] transition-colors">
            {property.title}
          </h3>
          <div className="text-xs text-foreground/60 mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {translateLocation(property.location, lang) ||
                t("بدون منطقة", "No location")}{" "}
              ·{" "}
              {propertyTypeLabels[property.type] ?? property.type}
            </span>
          </div>
        </div>
        <div
          className="text-lg font-bold"
          style={{ color: "var(--gold-light)" }}
        >
          {formatPrice(property.price)}
        </div>
        <div className="flex items-center gap-3 text-xs text-foreground/70">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms}
            </span>
          )}
          {property.area != null && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" />
              {t(`${property.area} م²`, `${property.area} m²`)}
            </span>
          )}
          {property.floor != null && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {property.floor === 0
                ? t("أرضي", "GF")
                : property.floor < 0
                  ? t(`ب${Math.abs(property.floor)}`, `B${Math.abs(property.floor)}`)
                  : t(`د${property.floor}`, `F${property.floor}`)}
            </span>
          )}
        </div>
        {actions && (
          <div className="pt-2 border-t border-border/30 relative z-[2]">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
}
