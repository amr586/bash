import logoUrl from "../assets/bashak-logo.png"
import { useSiteSettings } from "@/lib/site-settings"
import { resolveImageUrl } from "@/lib/api"
import { useTheme } from "@/lib/theme"

export function LeLoLogo({ className = "" }: { className?: string }) {
  const { settings } = useSiteSettings()
  const { theme } = useTheme()
  const src = settings.logoUrl ? resolveImageUrl(settings.logoUrl) : logoUrl
  const isLight = theme === "light"

  return (
    <div
      className={`flex items-center justify-center w-[120px] h-[44px] sm:w-[160px] sm:h-[56px] transition-colors ${
        isLight
          ? "rounded-lg bg-black/90 px-2 py-1 ring-1 ring-[var(--gold)]/40"
          : ""
      } ${className}`}
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
