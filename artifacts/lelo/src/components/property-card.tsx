import { Link } from "wouter";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Bath, BedDouble, MapPin, Maximize2 } from "lucide-react";
import {
  formatPrice,
  listingTypeLabels,
  propertyTypeLabels,
  resolveImageUrl,
  statusLabels,
  type Property,
} from "@/lib/api";

export function PropertyCard({
  property,
  showStatus = false,
  actions,
  href,
}: {
  property: Property;
  showStatus?: boolean;
  actions?: React.ReactNode;
  href?: string;
}) {
  const status = statusLabels[property.status];
  const linkTo = href ?? `/properties/${property.id}`;
  return (
    <Card
      dir="rtl"
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
            بدون صورة
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <Badge
            className="text-black font-semibold border-0"
            style={{ background: "var(--gold)" }}
          >
            {listingTypeLabels[property.listingType] ?? property.listingType}
          </Badge>
          {showStatus && status && (
            <Badge className={`${status.color} border-0`}>{status.label}</Badge>
          )}
        </div>
      </div>
      <Link
        href={linkTo}
        aria-label={`عرض تفاصيل ${property.title}`}
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
              {property.location || "بدون منطقة"} ·{" "}
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
              {property.area} م²
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
