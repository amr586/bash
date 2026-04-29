import { useState } from "react";
import { Phone, MessageCircle, UserPlus, X, Headphones } from "lucide-react";
import { RegisterNowDialog } from "./register-now-dialog";
import { useSiteSettings } from "@/lib/site-settings";
import { useLang } from "@/lib/i18n";

export function ContactWidget() {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const { settings } = useSiteSettings();
  const whatsapp = settings.whatsappNumber;
  const hotline = settings.hotlineNumber;

  return (
    <div
      className={`fixed bottom-6 ${lang === "ar" ? "right-6 items-end" : "left-6 items-start"} z-50 flex flex-col gap-3`}
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      {open && (
        <div className={`flex flex-col gap-3 ${lang === "ar" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-4 duration-200`}>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            data-testid="link-contact-whatsapp"
            className="group flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-full bg-[#25D366] text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <span className="text-sm">{t(`واتساب ${whatsapp}`, `WhatsApp ${whatsapp}`)}</span>
            <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </span>
          </a>

          <a
            href={`tel:${hotline}`}
            data-testid="link-contact-hotline"
            className="group flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-full text-black font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
            }}
          >
            <span className="text-sm">{t(`الخط الساخن ${hotline}`, `Hotline ${hotline}`)}</span>
            <span className="w-9 h-9 rounded-full bg-black/15 flex items-center justify-center">
              <Headphones className="h-5 w-5" />
            </span>
          </a>

          <RegisterNowDialog
            trigger={
              <button
                type="button"
                data-testid="button-contact-register"
                className="group flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-full bg-foreground text-background font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                <span className="text-sm">{t("سجّل الآن", "Register Now")}</span>
                <span className="w-9 h-9 rounded-full bg-background/15 flex items-center justify-center">
                  <UserPlus className="h-5 w-5" />
                </span>
              </button>
            }
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("إغلاق التواصل", "Close contact menu") : t("تواصل معنا", "Contact us")}
        data-testid="button-contact-toggle"
        className="w-14 h-14 rounded-full text-black shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        style={{
          background: open
            ? "var(--foreground)"
            : "linear-gradient(135deg, var(--gold), var(--gold-light))",
          color: open ? "var(--background)" : "#000",
          boxShadow: "0 12px 32px rgba(212,175,55,0.45)",
        }}
      >
        {open ? <X className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
      </button>
    </div>
  );
}
