import logoUrl from "../assets/bashak-logo.png"
import { useSiteSettings } from "@/lib/site-settings"
import { resolveImageUrl } from "@/lib/api"

export function LeLoLogo({ className = "" }: { className?: string }) {
  const { settings } = useSiteSettings()
  const src = settings.logoUrl ? resolveImageUrl(settings.logoUrl) : logoUrl

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ width: 160, height: 56 }}
    >
      <img
        src={src}
        alt="Bashak Developments"
        loading="eager"
        decoding="sync"
        style={{ width: 160, height: 56, objectFit: "contain", display: "block" }}
      />
    </div>
  )
}
