import logoUrl from "../assets/bashak-logo.png"
import { useSiteSettings } from "@/lib/site-settings"
import { resolveImageUrl } from "@/lib/api"

export function LeLoLogo({ className = "" }: { className?: string }) {
  const { settings } = useSiteSettings()
  const src = settings.logoUrl ? resolveImageUrl(settings.logoUrl) : logoUrl

  return (
    <div
      className={`flex items-center w-[120px] h-[44px] sm:w-[160px] sm:h-[56px] ${className}`}
    >
      <img
        src={src}
        alt="Bashak Developments"
        loading="eager"
        decoding="sync"
        className="w-full h-full"
        style={{ objectFit: "contain", display: "block" }}
      />
    </div>
  )
}
