import logoUrl from "../assets/bashak-logo.png"

export function LeLoLogo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center ${className}`}
      style={{ width: 160, height: 56 }}
    >
      <img
        src={logoUrl}
        alt="Bashak Developments"
        loading="eager"
        decoding="sync"
        style={{ width: 160, height: 56, objectFit: "contain", display: "block" }}
      />
    </div>
  )
}
