"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "wouter"
import { useAuth, type AuthUser } from "@workspace/replit-auth-web"
import { LeLoLogo } from "./lelo-logo"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { ChevronDown, LayoutDashboard, LogOut, Moon, Settings, ShieldCheck, Sun, User as UserIcon } from "lucide-react"
import { NotificationBell } from "./notification-bell"
import { useTheme } from "@/lib/theme"
import { useLang, type Lang } from "@/lib/i18n"
import { isStaff } from "@/lib/roles"

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const size = compact ? "w-8 h-8" : "w-9 h-9"
  const isDark = theme === "dark"
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      data-testid="button-theme-toggle"
      className={`relative inline-flex ${size} items-center justify-center rounded-xl border border-[var(--gold-dark)]/60 bg-background/80 text-[var(--gold-light)] transition-all duration-300 hover:scale-110 hover:bg-[var(--gold)]/10 overflow-hidden`}
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-500 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-500 ${
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
    </button>
  )
}

type NavChild = { label: string; href: string }
type NavItem = { label: string; href: string; children?: NavChild[] }

const NAV_BY_LANG: Record<Lang, NavItem[]> = {
  ar: [
    {
      label: "الرئيسية",
      href: "/",
      children: [
        { label: "عننا", href: "/about" },
        { label: "الإعلام", href: "/media" },
        { label: "المدوّنة", href: "/blogs" },
        { label: "آخر المشاريع", href: "/projects" },
      ],
    },
    { label: "العقارات", href: "/properties" },
    {
      label: "الخدمات",
      href: "/services",
      children: [
        { label: "خدماتنا", href: "/services" },
        { label: "الوظائف", href: "/jobs" },
      ],
    },
    { label: "تواصل معنا", href: "/contact" },
  ],
  en: [
    {
      label: "Home",
      href: "/",
      children: [
        { label: "About", href: "/about" },
        { label: "Media", href: "/media" },
        { label: "Blogs", href: "/blogs" },
        { label: "Last Projects", href: "/projects" },
      ],
    },
    { label: "Properties", href: "/properties" },
    {
      label: "Services",
      href: "/services",
      children: [
        { label: "Our Services", href: "/services" },
        { label: "Jobs", href: "/jobs" },
      ],
    },
    { label: "Contact", href: "/contact" },
  ],
}

const T = {
  ar: { login: "دخول", signup: "تسجيل", dashboard: "حسابي", admin: "لوحة الأدمن", logout: "خروج" },
  en: { login: "Login", signup: "Sign Up", dashboard: "Dashboard", admin: "Admin", logout: "Logout" },
} as const

function initials(u: AuthUser): string {
  const f = u.firstName?.[0] ?? ""
  const l = u.lastName?.[0] ?? ""
  return (f + l).toUpperCase() || (u.email?.[0]?.toUpperCase() ?? "U")
}

function NavLinkItem({ link }: { link: NavItem }) {
  const [location] = useLocation()
  const isActive = link.href === "/" ? location === "/" : location.startsWith(link.href)
  const baseClass = `relative text-sm transition-all duration-300 group px-2 xl:px-3 py-1 rounded-lg hover:bg-foreground/5 whitespace-nowrap ${
    isActive ? "text-[var(--gold-light)] font-semibold" : "text-foreground/80 hover:text-foreground"
  }`

  if (!link.children || link.children.length === 0) {
    return (
      <Link href={link.href} className={baseClass}>
        {link.label}
        <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 transition-all duration-200 ${isActive ? "w-4 bg-[var(--gold)]" : "w-0 bg-primary group-hover:w-4"}`} />
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={`${baseClass} inline-flex items-center gap-1 focus:outline-none`}>
          {link.label}
          <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 transition-all duration-200 ${isActive ? "w-4 bg-[var(--gold)]" : "w-0 bg-primary group-hover:w-4"}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[11rem]">
        <DropdownMenuItem asChild>
          <Link href={link.href} className="cursor-pointer font-medium" style={{ color: "var(--gold-light)" }}>
            {link.label}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {link.children.map((child) => (
          <DropdownMenuItem key={child.href} asChild>
            <Link href={child.href} className="cursor-pointer">
              {child.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function LangPill({
  lang,
  setLang,
  compact = false,
}: {
  lang: Lang
  setLang: (l: Lang) => void
  compact?: boolean
}) {
  const apply = (next: Lang) => {
    if (next === lang) return
    setLang(next)
  }
  const sizes = compact ? "h-8 text-[11px]" : "h-9 text-xs"
  const padX = compact ? "px-2" : "px-3"
  return (
    <div
      role="group"
      aria-label="Language switcher"
      data-testid="lang-switcher"
      className={`inline-flex ${sizes} items-stretch rounded-xl overflow-hidden border border-[var(--gold-dark)]/60 bg-background/80`}
    >
      <button
        type="button"
        onClick={() => apply("ar")}
        aria-pressed={lang === "ar"}
        data-testid="button-lang-ar"
        className={`${padX} font-bold inline-flex items-center justify-center transition-colors ${
          lang === "ar"
            ? "bg-[var(--gold)] text-black"
            : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
        }`}
      >
        ع
      </button>
      <button
        type="button"
        onClick={() => apply("en")}
        aria-pressed={lang === "en"}
        data-testid="button-lang-en"
        className={`${padX} font-bold inline-flex items-center justify-center border-r border-[var(--gold-dark)]/40 transition-colors ${
          lang === "en"
            ? "bg-[var(--gold)] text-black"
            : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
        }`}
      >
        EN
      </button>
    </div>
  )
}

function UserMenu({ user, logout }: { user: AuthUser; logout: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="User menu"
          className="flex items-center gap-2 rounded-full pl-2 pr-1 py-1 hover:bg-foreground/5 transition-colors"
        >
          <span className="hidden sm:block text-sm text-foreground/80 max-w-[120px] truncate">
            {user.firstName || user.email || "User"}
          </span>
          <Avatar className="h-8 w-8 border border-[var(--gold)]/40">
            <AvatarImage src={user.profileImageUrl ?? undefined} alt="me" />
            <AvatarFallback
              className="text-xs font-bold text-black"
              style={{ background: "var(--gold)" }}
            >
              {initials(user)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" dir="rtl">
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium truncate">
            {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
              "بدون اسم"}
            {user.isAdmin && (
              <ShieldCheck className="inline-block mr-1 h-3.5 w-3.5 text-[var(--gold)]" />
            )}
          </div>
          <div className="text-xs text-foreground/60 truncate">
            {user.email ?? ""}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <LayoutDashboard className="ml-2 h-4 w-4" />
            داشبورد
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserIcon className="ml-2 h-4 w-4" />
            بروفايلي
          </Link>
        </DropdownMenuItem>
        {isStaff(user) && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <Settings className="ml-2 h-4 w-4" />
              لوحة الأدمن
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          <LogOut className="ml-2 h-4 w-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [, navigate] = useLocation()
  const { lang, setLang } = useLang()
  const navLinks = NAV_BY_LANG[lang]
  const showAddProperty = isStaff(user)
  const t = T[lang]

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      setIsScrolled(currentScrollY > 50)

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
        setIsMobileOpen(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <header
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out w-[min(96vw,1200px)]
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
      `}
    >
      <div
        className={`
          flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 rounded-2xl border transition-all duration-300
          ${
            isScrolled
              ? "bg-background/90 backdrop-blur-xl border-border/40 shadow-2xl"
              : "bg-background/95 backdrop-blur-lg border-border/30 shadow-lg"
          }
        `}
      >
        <Link
          href="/"
          aria-label="Home"
          className="transform transition-transform duration-200 hover:scale-105 shrink-0"
        >
          <LeLoLogo />
        </Link>

        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => (
            <NavLinkItem key={link.label} link={link} />
          ))}
          {showAddProperty && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/add-property")}
              className="rounded-xl border-[var(--gold-dark)] text-[var(--gold-light)] hover:bg-[var(--gold)]/10 hover:text-[var(--gold-light)] font-semibold whitespace-nowrap mr-1 xl:mr-2"
              data-testid="button-header-add-property"
            >
              {lang === "ar" ? "أضف عقار" : "Add Property"}
            </Button>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-foreground/10 animate-pulse" />
          ) : isAuthenticated && user ? (
            <>
              <NotificationBell />
              <UserMenu user={user} logout={logout} />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-all duration-200 rounded-xl"
                data-testid="button-header-login"
              >
                {t.login}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/login")}
                className="text-black transform transition-all duration-200 hover:scale-105 hover:shadow-lg rounded-xl font-semibold"
                style={{ background: "var(--gold)" }}
                data-testid="button-header-signup"
              >
                {t.signup}
              </Button>
            </>
          )}
          <ThemeToggle />
          <LangPill lang={lang} setLang={setLang} />
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle compact />
          <LangPill lang={lang} setLang={setLang} compact />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMobileOpen}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border/40 text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-colors"
            onClick={() => setIsMobileOpen((v) => !v)}
          >
          <span className="sr-only">Menu</span>
          {isMobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div
          className={`
            lg:hidden mt-2 rounded-2xl border p-4 shadow-2xl
            ${
              isScrolled
                ? "bg-background/95 backdrop-blur-xl border-border/40"
                : "bg-background/95 backdrop-blur-lg border-border/30"
            }
          `}
        >
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block font-medium text-foreground/90 hover:text-foreground hover:bg-foreground/5 px-3 py-2 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
                {link.children && link.children.length > 0 && (
                  <div className="ms-4 flex flex-col border-s border-border/40 ps-3 mb-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 border border-border/40 rounded-xl">
                  <Avatar className="h-9 w-9 border border-[var(--gold)]/40">
                    <AvatarImage src={user.profileImageUrl ?? undefined} />
                    <AvatarFallback
                      className="text-xs font-bold text-black"
                      style={{ background: "var(--gold)" }}
                    >
                      {initials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {[user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(" ") || "بدون اسم"}
                    </div>
                    <div className="text-xs text-foreground/60 truncate">
                      {user.email ?? ""}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl"
                  onClick={() => {
                    setIsMobileOpen(false)
                    navigate("/dashboard")
                  }}
                >
                  <LayoutDashboard className="ml-2 h-4 w-4" />
                  الداشبورد
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl"
                  onClick={() => {
                    setIsMobileOpen(false)
                    navigate("/profile")
                  }}
                >
                  <UserIcon className="ml-2 h-4 w-4" />
                  بروفايلي
                </Button>
                {isStaff(user) && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-xl"
                    onClick={() => {
                      setIsMobileOpen(false)
                      navigate("/admin")
                    }}
                  >
                    <Settings className="ml-2 h-4 w-4" />
                    لوحة الأدمن
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl text-foreground/80"
                  onClick={() => {
                    setIsMobileOpen(false)
                    logout()
                  }}
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-center rounded-xl text-foreground/80 hover:text-foreground hover:bg-foreground/10"
                  onClick={() => {
                    setIsMobileOpen(false)
                    navigate("/login")
                  }}
                >
                  {t.login}
                </Button>
                <Button
                  className="w-full justify-center rounded-xl text-black font-semibold"
                  style={{ background: "var(--gold)" }}
                  onClick={() => {
                    setIsMobileOpen(false)
                    navigate("/login")
                  }}
                >
                  {t.signup}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
