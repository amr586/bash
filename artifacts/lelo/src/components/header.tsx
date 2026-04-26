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
import { ChevronDown, LayoutDashboard, LogOut, Settings, ShieldCheck, User as UserIcon } from "lucide-react"
import { NotificationBell } from "./notification-bell"

type NavChild = { label: string; href: string }
type NavItem = { label: string; href: string; children?: NavChild[] }

type Lang = "ar" | "en"

const NAV_BY_LANG: Record<Lang, NavItem[]> = {
  ar: [
    { label: "الرئيسية", href: "/" },
    { label: "العقارات", href: "/#projects" },
    { label: "خدماتنا", href: "/#services" },
    { label: "الأسئلة الشائعة", href: "/#faq" },
    { label: "تواصل معنا", href: "/#contact" },
  ],
  en: [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/#projects" },
    { label: "Services", href: "/#services" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/#contact" },
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
  if (!link.children || link.children.length === 0) {
    return (
      <a
        href={link.href}
        className="relative text-sm text-foreground/80 hover:text-foreground transition-all duration-300 group px-2 xl:px-3 py-1 rounded-lg hover:bg-foreground/5 whitespace-nowrap"
      >
        {link.label}
        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-4"></span>
      </a>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground transition-all duration-300 group px-2 xl:px-3 py-1 rounded-lg hover:bg-foreground/5 whitespace-nowrap focus:outline-none"
        >
          {link.label}
          <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-4"></span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[10rem]">
        {link.children.map((child) => (
          <DropdownMenuItem key={child.label} asChild>
            <a href={child.href} className="cursor-pointer">
              {child.label}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
        {user.isAdmin && (
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
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null)
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [, navigate] = useLocation()
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ar"
    return (localStorage.getItem("bashak.lang") as Lang) || "ar"
  })
  const navLinks = NAV_BY_LANG[lang]
  const t = T[lang]
  const toggleLang = () => {
    const next: Lang = lang === "ar" ? "en" : "ar"
    setLang(next)
    if (typeof window !== "undefined") {
      localStorage.setItem("bashak.lang", next)
      document.documentElement.dir = next === "ar" ? "rtl" : "ltr"
      document.documentElement.lang = next
    }
  }

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
          flex items-center justify-between gap-4 px-4 lg:px-6 py-3 rounded-2xl border transition-all duration-300
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
          <button
            type="button"
            onClick={toggleLang}
            data-testid="button-lang-toggle"
            aria-label="Toggle language"
            className="ml-1 inline-flex items-center justify-center w-10 h-9 rounded-xl border border-border/40 text-xs font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-colors"
          >
            {lang === "ar" ? "EN" : "ع"}
          </button>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={isMobileOpen}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border/40 text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-colors"
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
            {navLinks.map((link) => {
              if (!link.children || link.children.length === 0) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="text-foreground/80 hover:text-foreground hover:bg-foreground/5 px-3 py-2 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                )
              }
              const open = openMobileGroup === link.label
              return (
                <div key={link.label} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMobileGroup(open ? null : link.label)
                    }
                    className="flex items-center justify-between text-foreground/80 hover:text-foreground hover:bg-foreground/5 px-3 py-2 rounded-lg transition-colors"
                  >
                    <span>{link.label}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="ml-4 mt-1 flex flex-col border-l border-border/40 pl-3">
                      {link.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          onClick={() => {
                            setIsMobileOpen(false)
                            setOpenMobileGroup(null)
                          }}
                          className="text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 px-3 py-2 rounded-lg transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
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
                {user.isAdmin && (
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
                  Login
                </Button>
                <Button
                  className="w-full justify-center rounded-xl text-black font-semibold"
                  style={{ background: "var(--gold)" }}
                  onClick={() => {
                    setIsMobileOpen(false)
                    navigate("/login")
                  }}
                >
                  Create Account
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
