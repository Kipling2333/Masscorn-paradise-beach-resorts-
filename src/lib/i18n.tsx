"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "fr" | "ar";

const dict: Record<string, Record<Lang, string>> = {
  "nav.accommodations": { en: "Accommodations", fr: "Hébergements", ar: "الإقامات" },
  "nav.experiences": { en: "Experiences", fr: "Expériences", ar: "التجارب" },
  "nav.dining": { en: "Dining", fr: "Gastronomie", ar: "المطاعم" },
  "nav.spa": { en: "Spa & Wellness", fr: "Spa & Bien-être", ar: "السبا والعافية" },
  "nav.weddings": { en: "Weddings", fr: "Mariages", ar: "حفلات الزفاف" },
  "nav.events": { en: "Events", fr: "Événements", ar: "الفعاليات" },
  "nav.gallery": { en: "Gallery", fr: "Galerie", ar: "المعرض" },
  "nav.about": { en: "About", fr: "À propos", ar: "من نحن" },
  "nav.contact": { en: "Contact", fr: "Contact", ar: "اتصل بنا" },
  "nav.signin": { en: "Sign In", fr: "Connexion", ar: "تسجيل الدخول" },
  "nav.portal": { en: "My Portal", fr: "Mon Espace", ar: "بوابتي" },
  "nav.admin": { en: "Admin", fr: "Admin", ar: "الإدارة" },
  "nav.signout": { en: "Sign Out", fr: "Déconnexion", ar: "تسجيل الخروج" },
  "cta.book": { en: "Reserve", fr: "Réserver", ar: "احجز الآن" },
  "cta.explore": { en: "Explore", fr: "Découvrir", ar: "استكشف" },
  "widget.checkin": { en: "Check-in", fr: "Arrivée", ar: "تسجيل الوصول" },
  "widget.checkout": { en: "Check-out", fr: "Départ", ar: "تسجيل المغادرة" },
  "widget.guests": { en: "Guests", fr: "Invités", ar: "الضيوف" },
  "widget.search": { en: "Check Availability", fr: "Vérifier la disponibilité", ar: "تحقق من التوفر" },
  "common.from": { en: "From", fr: "À partir de", ar: "ابتداءً من" },
  "common.perNight": { en: "per night", fr: "par nuit", ar: "لليلة الواحدة" },
  "hero.eyebrow": { en: "A private sanctuary on the edge of the Indian Ocean", fr: "Un sanctuaire privé au bord de l'océan Indien", ar: "ملاذ خاص على ضفاف المحيط الهندي" },
  "hero.title": { en: "Where the horizon becomes your own", fr: "Là où l'horizon vous appartient", ar: "حيث يصبح الأفق ملكك" },
  "concierge.title": { en: "Aurelia — AI Concierge", fr: "Aurelia — Concierge IA", ar: "أوريليا — المساعد الذكي" },
  "concierge.greeting": { en: "Good day. I am Aurelia, your private concierge at Masscorn Paradise. How may I assist you?", fr: "Bonjour. Je suis Aurelia, votre concierge privée. Comment puis-je vous aider ?", ar: "مرحباً. أنا أوريليا، مساعدتك الشخصية في ماساكورن بارادايس. كيف يمكنني مساعدتك؟" },
  "concierge.placeholder": { en: "Ask about rooms, dining, spa…", fr: "Demandez chambres, restaurants, spa…", ar: "اسأل عن الغرف والمطاعم والسبا…" },
  "footer.tagline": { en: "Barefoot luxury, redefined", fr: "Le luxe pieds nus, redéfini", ar: "الفخامة الهادئة، بمفهوم جديد" },
};

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("mp-lang")) as Lang | null;
    if (saved && ["en", "fr", "ar"].includes(saved)) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("mp-lang", l);
    } catch {}
  };

  const t = (key: string) => dict[key]?.[lang] ?? dict[key]?.en ?? key;

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function tStatic(lang: Lang, key: string): string {
  return dict[key]?.[lang] ?? dict[key]?.en ?? key;
}
