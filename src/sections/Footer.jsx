import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { Brand } from '../components/Navbar';
import { useLang } from '../i18n/LanguageContext';
import { goTo } from '../lib/utils';

const LINKS = [
  { key: 'services', target: 'services' },
  { key: 'process', target: 'process' },
  { key: 'team', target: 'team' },
  { key: 'projects', target: 'portfolio' },
  { key: 'contact', target: 'contact' },
];

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="container">
        <Reveal className="cta-band">
          <img src="/logo-dark-sm.jpg" alt="" width="120" height="120" className="cta-logo" loading="lazy" decoding="async" />
          <div className="cta-copy">
            <h2>{t('footer.ctaTitle')}</h2>
            <p>{t('footer.ctaSub')}</p>
          </div>
          <a
            className="btn btn-light btn-lg"
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              goTo('contact');
            }}
          >
            {t('nav.demo')}
          </a>
        </Reveal>

        <div className="footer-main">
          <div className="footer-brand">
            <Brand />
            <p>{t('footer.tagline')}</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            {LINKS.map((l) => (
              <a
                key={l.key}
                href={`#${l.target}`}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(l.target);
                }}
              >
                {t(`footer.links.${l.key}`)}
              </a>
            ))}
            <Link to="/admin">{t('footer.admin')}</Link>
          </nav>
        </div>

        <div className="footer-bar">
          <span>
            © {new Date().getFullYear()} drovex. {t('footer.rights')}
          </span>
        </div>
      </div>
    </footer>
  );
}
