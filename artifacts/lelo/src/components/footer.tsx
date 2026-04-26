import { LeLoLogo } from "./lelo-logo"
import { Phone, MapPin, MessageCircle, Mail, ChevronLeft } from "lucide-react"

const quickLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "جميع العقارات", href: "/#projects" },
  { label: "عقارات للبيع", href: "/#projects?listing=sale" },
  { label: "عقارات للإيجار", href: "/#projects?listing=rent" },
  { label: "أضف عقارك", href: "/#add-property" },
  { label: "تواصل معنا", href: "/#contact" },
]

const propertyTypes = [
  { label: "شقة", href: "/#projects?type=apartment" },
  { label: "فيلا", href: "/#projects?type=villa" },
  { label: "مكتب", href: "/#projects?type=office" },
  { label: "شاليه", href: "/#projects?type=chalet" },
  { label: "محل تجاري", href: "/#projects?type=shop" },
  { label: "أرض", href: "/#projects?type=land" },
]

const socials = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/BashakDevelopments",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/bashakdevelopments",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@bashakdevelopments",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.94a8.16 8.16 0 004.77 1.52V7.04a4.85 4.85 0 01-1.84-.35z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@bashakdevelopments",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/bashakdevelopments/",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer
      className="border-t py-12 px-4"
      style={{ background: "#000", borderColor: "var(--border)" }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="col-span-1 md:col-span-2">
            <LeLoLogo className="mb-4" />
            <p
              dir="rtl"
              lang="ar"
              className="text-white/70 mb-4 max-w-md leading-relaxed"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              شركة بشاك للتطوير العقاري بخبرة تمتد لأكثر من 10 أعوام في تقديم حلول عقارية مبتكرة وموثوقة.
              نسعى دائمًا لتحويل رؤاكم إلى واقع ملموس بمعايير عالية من الجودة والمصداقية.
            </p>
            <div className="flex gap-3 mt-6">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all hover:scale-110"
                  style={{
                    borderColor: "var(--gold-dark)",
                    color: "var(--gold-light)",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            <h3
              className="font-semibold mb-4"
              style={{ color: "var(--gold-light)" }}
            >
              تواصل معنا
            </h3>
            <ul className="space-y-3 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <Phone
                  className="h-4 w-4 mt-1 flex-shrink-0"
                  style={{ color: "var(--gold)" }}
                />
                <a href="tel:17327" className="hover:text-white transition-colors">
                  الخط الساخن: <span style={{ color: "var(--gold-light)" }}>17327</span>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone
                  className="h-4 w-4 mt-1 flex-shrink-0"
                  style={{ color: "var(--gold)" }}
                />
                <a
                  href="tel:+201151313999"
                  className="hover:text-white transition-colors"
                  dir="ltr"
                >
                  +20 11 5131 3999
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle
                  className="h-4 w-4 mt-1 flex-shrink-0"
                  style={{ color: "var(--gold)" }}
                />
                <a
                  href="https://wa.me/201151313999"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  واتساب
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail
                  className="h-4 w-4 mt-1 flex-shrink-0"
                  style={{ color: "var(--gold)" }}
                />
                <a
                  href="mailto:info@bashakdevelopments.com"
                  className="hover:text-white transition-colors"
                  dir="ltr"
                >
                  info@bashakdevelopments.com
                </a>
              </li>
            </ul>
          </div>

          <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            <h3
              className="font-semibold mb-4"
              style={{ color: "var(--gold-light)" }}
            >
              روابط سريعة
            </h3>
            <ul className="space-y-2 text-white/70 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="inline-flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <ChevronLeft
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--gold)" }}
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            <h3
              className="font-semibold mb-4"
              style={{ color: "var(--gold-light)" }}
            >
              أنواع العقارات
            </h3>
            <ul className="space-y-2 text-white/70 text-sm">
              {propertyTypes.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="inline-flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <ChevronLeft
                      className="h-3.5 w-3.5"
                      style={{ color: "var(--gold)" }}
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div
            dir="rtl"
            className="md:col-span-2 lg:col-span-6"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            <h3
              className="font-semibold mb-4"
              style={{ color: "var(--gold-light)" }}
            >
              العنوان
            </h3>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Bashak+Developments+Villa+99+First+District+Street+90+Fifth+Settlement+New+Cairo+Egypt"
              target="_blank"
              rel="noreferrer"
              aria-label="افتح العنوان على خريطة جوجل"
              className="group inline-flex items-start gap-2 text-white/70 text-sm leading-relaxed hover:text-white transition-colors"
              data-testid="link-address-map"
            >
              <MapPin
                className="h-4 w-4 mt-1 flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ color: "var(--gold)" }}
              />
              <span className="border-b border-transparent group-hover:border-[var(--gold)]/60">
                فيلا 99، الحي الأول، شارع 90،
                <br />
                التجمع الخامس، القاهرة الجديدة 1،
                <br />
                محافظة القاهرة، مصر، 11835
              </span>
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Bashak+Developments+Villa+99+First+District+Street+90+Fifth+Settlement+New+Cairo+Egypt"
              target="_blank"
              rel="noreferrer"
              data-testid="link-map-embed"
              className="block mt-4 rounded-xl overflow-hidden border hover:shadow-lg transition-shadow"
              style={{ borderColor: "var(--gold-dark)" }}
              aria-label="افتح موقع باشاك على خرائط جوجل"
            >
              <iframe
                title="موقع شركة باشاك على الخريطة"
                src="https://www.google.com/maps?q=Fifth+Settlement+New+Cairo+Egypt&output=embed"
                width="100%"
                height="220"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, display: "block", pointerEvents: "none" }}
              />
            </a>
          </div>
        </div>

        <div
          className="border-t mt-8 pt-8 text-center text-white/50 text-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <p>&copy; 2026 Bashak Developments. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
