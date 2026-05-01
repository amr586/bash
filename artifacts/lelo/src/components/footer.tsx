import { Link } from "wouter"
import { LeLoLogo } from "./lelo-logo"
import { Phone, MapPin, Mail } from "lucide-react"
import { useSiteSettings } from "@/lib/site-settings"
import { useLang } from "@/lib/i18n"

const buildSocials = (s: {
  facebookUrl: string
  instagramUrl: string
  tiktokUrl: string
  youtubeUrl: string
  linkedinUrl: string
}) => [
  {
    name: "Facebook",
    href: s.facebookUrl,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: s.instagramUrl,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: s.tiktokUrl,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.94a8.16 8.16 0 004.77 1.52V7.04a4.85 4.85 0 01-1.84-.35z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: s.youtubeUrl,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: s.linkedinUrl,
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-base font-bold mb-5"
      style={{ color: "var(--gold-light)" }}
    >
      {children}
    </h3>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isInternal = href.startsWith("/") && !href.startsWith("/#")
  if (isInternal) {
    return (
      <Link
        href={href}
        className="block text-foreground/70 hover:text-[var(--gold-light)] transition-colors py-1.5 text-sm"
      >
        • {children}
      </Link>
    )
  }
  return (
    <a
      href={href}
      className="block text-foreground/70 hover:text-[var(--gold-light)] transition-colors py-1.5 text-sm"
    >
      • {children}
    </a>
  )
}

function ContactItem({
  href,
  icon,
  children,
  ltr,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  ltr?: boolean
}) {
  const { lang } = useLang()
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="flex items-center gap-3 text-foreground/75 hover:text-foreground transition-colors py-2 text-sm"
    >
      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded-full shrink-0 bg-[var(--gold)]/10"
        style={{
          border: "1px solid rgba(198,155,27,0.35)",
          color: "var(--gold-light)",
        }}
      >
        {icon}
      </span>
      <span dir={ltr ? "ltr" : lang === "ar" ? "rtl" : "ltr"} className={`leading-snug ${lang === "ar" ? "text-right" : "text-left"} flex-1`}>
        {children}
      </span>
    </a>
  )
}

export function Footer() {
  const { lang, t } = useLang()
  const { settings } = useSiteSettings()
  const socials = buildSocials(settings)
  const addressMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    settings.address,
  )}`

  const quickLinks = [
    { label: t("الرئيسية", "Home"), href: "/" },
    { label: t("جميع العقارات", "All Properties"), href: "/properties" },
    { label: t("آخر المشاريع", "Last Projects"), href: "/projects" },
    { label: t("عننا", "About Us"), href: "/about" },
    { label: t("الخدمات", "Services"), href: "/services" },
    { label: t("الوظائف", "Jobs"), href: "/jobs" },
    { label: t("الإعلام", "Media"), href: "/media" },
    { label: t("المدوّنة", "Blog"), href: "/blogs" },
    { label: t("تواصل معنا", "Contact Us"), href: "/contact" },
  ]

  const propertyTypes = [
    { label: t("شقة", "Apartment"), href: "/properties?type=apartment" },
    { label: t("فيلا", "Villa"), href: "/properties?type=villa" },
    { label: t("مكتب", "Office"), href: "/properties?type=office" },
    { label: t("شاليه", "Chalet"), href: "/properties?type=chalet" },
    { label: t("محل تجاري", "Shop"), href: "/properties?type=shop" },
    { label: t("أرض", "Land"), href: "/properties?type=land" },
  ]

  return (
    <footer
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="border-t pt-14 pb-8 px-4 bg-background text-foreground"
      style={{
        borderColor: "var(--border)",
        fontFamily: "'Tajawal', sans-serif",
      }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link
              href="/"
              aria-label="Home"
              className="inline-block mb-4 transform transition-transform duration-200 hover:scale-105"
              data-testid="link-footer-logo-home"
            >
              <LeLoLogo />
            </Link>
            <p className="text-foreground/70 text-sm leading-relaxed mb-5">
              {t(
                "شركة باشاك للتطوير العقاري — شركة مصرية متخصصة في تقديم خدمات عقارية شاملة في مجالات متعددة بخبرة تمتد لأكثر من 10 أعوام.",
                "Bashak Developments — an Egyptian company specialised in comprehensive real estate services across multiple fields, with over 10 years of experience.",
              )}
            </p>
            <div className="flex gap-2 flex-wrap">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  data-testid={`link-social-${s.name.toLowerCase()}`}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all hover:scale-110 hover:brightness-110 bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20"
                  style={{
                    color: "var(--gold-light)",
                    border: "1px solid rgba(198,155,27,0.3)",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <ColumnTitle>{t("روابط سريعة", "Quick Links")}</ColumnTitle>
            <nav className="flex flex-col">
              {quickLinks.map((link) => (
                <FooterLink key={link.label} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </nav>
          </div>

          <div>
            <ColumnTitle>{t("أنواع العقارات", "Property Types")}</ColumnTitle>
            <nav className="flex flex-col">
              {propertyTypes.map((link) => (
                <FooterLink key={link.label} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </nav>
          </div>

          <div>
            <ColumnTitle>{t("معلومات التواصل", "Contact Info")}</ColumnTitle>
            <div className="flex flex-col">
              <ContactItem href={addressMapsUrl} icon={<MapPin className="h-4 w-4" />}>
                {settings.address}
              </ContactItem>
              <ContactItem
                href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}
                icon={<Phone className="h-4 w-4" />}
                ltr
              >
                {settings.contactPhone}
              </ContactItem>
              <ContactItem
                href={`tel:${settings.hotlineNumber}`}
                icon={<Phone className="h-4 w-4" />}
                ltr
              >
                {settings.hotlineNumber}
              </ContactItem>
              <ContactItem
                href={`mailto:${settings.contactEmail}`}
                icon={<Mail className="h-4 w-4" />}
                ltr
              >
                {settings.contactEmail}
              </ContactItem>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href={addressMapsUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="link-map-embed"
            aria-label={t("افتح موقع باشاك على خرائط جوجل", "Open Bashak's location on Google Maps")}
            className="relative block rounded-full overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96"
            style={{
              border: "4px solid var(--gold)",
              boxShadow:
                "0 0 0 2px rgba(198,155,27,0.25), 0 10px 30px -10px rgba(198,155,27,0.45)",
            }}
          >
            <iframe
              title={t("موقع شركة باشاك على الخريطة", "Bashak's location on the map")}
              src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
              style={{ border: 0, pointerEvents: "none" }}
            />
          </a>
        </div>

        <div
          className="border-t mt-10 pt-6 text-center text-foreground/55 text-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-3">
            <a
              href="https://drive.google.com/file/d/1g5_TQhDRrct9d-WLCIMN-5ivEODXAeNz/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              data-testid="link-privacy-policy"
              className="hover:text-[var(--gold-light)] transition-colors"
            >
              {t("سياسة الخصوصية", "Privacy Policy")}
            </a>
            <span aria-hidden="true" className="text-foreground/30">•</span>
            <a
              href="https://drive.google.com/file/d/15sNdLZObdiZTjjDYMC-sNgjUo5ehZTAW/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              data-testid="link-terms-conditions"
              className="hover:text-[var(--gold-light)] transition-colors"
            >
              {t("الشروط والأحكام", "Terms & Conditions")}
            </a>
          </nav>
          <p>{t("© 2026 Bashak Developments. جميع الحقوق محفوظة.", "© 2026 Bashak Developments. All rights reserved.")}</p>
        </div>
      </div>
    </footer>
  )
}
