import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'drovex_lang'; // UI preference only

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {}
  return (navigator.language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

function applyToDocument(lang) {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Keep the tab title and the meta description (what a browser's own
  // "share" action or a bookmark picks up) in step with the active
  // language. The pre-rendered <title>/<meta> in index.html — what search
  // engines and link-preview crawlers see before any JS runs — stay in
  // English by design; see the SEO note in README.md.
  const seo = translations[lang].seo;
  if (seo) {
    document.title = seo.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description);
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  // Apply before first paint so there is no LTR→RTL flash.
  useLayoutEffect(() => {
    applyToDocument(lang);
  }, [lang]);

  const setLang = useCallback((next) => {
    if (next === lang) return;
    const root = document.documentElement;
    root.classList.add('lang-switching');
    window.setTimeout(() => {
      setLangState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      window.setTimeout(() => root.classList.remove('lang-switching'), 60);
    }, 180);
  }, [lang]);

  const toggle = useCallback(() => setLang(lang === 'en' ? 'ar' : 'en'), [lang, setLang]);

  const value = useMemo(() => {
    const dict = translations[lang];
    const t = (path) => {
      const found = path.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
      return found == null ? path : found;
    };
    // Pick the Arabic column when the UI is Arabic, falling back to English.
    const pick = (en, ar) => (lang === 'ar' ? ar || en : en || ar);
    return { lang, dir: lang === 'ar' ? 'rtl' : 'ltr', isRtl: lang === 'ar', dict, t, pick, setLang, toggle };
  }, [lang, setLang, toggle]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
};
