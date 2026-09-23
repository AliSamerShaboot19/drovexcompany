import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang } from '../i18n/LanguageContext';
import { IconGlobe } from './Icons';
import { goTo } from '../lib/utils';

const LINKS = [
  { key: 'platform', target: 'services' },
  { key: 'solutions', target: 'portfolio' },
  { key: 'resources', target: 'team' },
  { key: 'docs', target: 'contact' },
  { key: 'enterprise', target: 'top' },
  { key: 'pricing', target: 'contact' },
];

export function Brand({ onClick }) {
  return (
    <a
      className="brand"
      href="/"
      aria-label="drovex"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        goTo('top');
      }}
    >
      <img src="/logo-light-sm.jpg" alt="" width="38" height="38" decoding="async" />
      <span>drovex</span>
    </a>
  );
}

export function LangToggle({ className = '' }) {
  const { t, toggle } = useLang();
  return (
    <button type="button" className={`lang-toggle ${className}`} onClick={toggle} aria-label={t('langAria')}>
      <IconGlobe size={16} />
      <span>{t('langLabel')}</span>
    </button>
  );
}

export default function Navbar() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll while the full-screen menu is open; close on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (target, fromMenu) => (e) => {
    e.preventDefault();
    if (fromMenu) {
      setOpen(false);
      window.setTimeout(() => goTo(target), 260);
    } else {
      goTo(target);
    }
  };

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
        <div className="container">
          <div className="nav-inner">
            <Brand onClick={() => setOpen(false)} />

            <nav className="nav-links" aria-label="Primary">
              {LINKS.map((l) => (
                <a key={l.key} href={`#${l.target}`} onClick={go(l.target)}>
                  {t(`nav.${l.key}`)}
                </a>
              ))}
            </nav>

            <div className="nav-actions">
              <LangToggle />
              <a className="btn btn-dark btn-sm nav-cta" href="#contact" onClick={go('contact')}>
                {t('nav.demo')}
              </a>
              <button
                type="button"
                className={`burger ${open ? 'open' : ''}`}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
                onClick={() => setOpen((v) => !v)}
              >
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <nav className="menu-links" aria-label="Mobile">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.key}
                  href={`#${l.target}`}
                  onClick={go(l.target, true)}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.045, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {t(`nav.${l.key}`)}
                </motion.a>
              ))}
            </nav>
            <motion.a
              className="btn btn-dark btn-lg menu-cta"
              href="#contact"
              onClick={go('contact', true)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.45 }}
            >
              {t('nav.demo')}
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
