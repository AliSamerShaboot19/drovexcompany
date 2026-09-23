import Reveal from '../components/Reveal';
import Tilt from '../components/Tilt';
import { IconLink, PLATFORM_ICONS } from '../components/Icons';
import { useData } from '../context/DataContext';
import { useLang } from '../i18n/LanguageContext';
import { hostOf, safeUrl } from '../lib/utils';

export default function Socials() {
  const { t } = useLang();
  const { social, loading } = useData();
  const links = social.filter((s) => safeUrl(s.url));

  return (
    <section id="contact" className="section section-tint">
      <div className="container">
        <Reveal className="section-head">
          <h2>{t('social.title')}</h2>
          <p>{t('social.sub')}</p>
        </Reveal>

        {loading ? (
          <div className="social-grid" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="glass card social-card skeleton-card">
                <div className="sk sk-icon" />
                <div className="sk sk-line sk-short" />
              </div>
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="glass card state-card">
            <p>{t('social.empty')}</p>
          </div>
        ) : (
          <div className="social-grid">
            {links.map((s, i) => {
              const Icon = PLATFORM_ICONS[s.platform.toLowerCase()] || IconLink;
              return (
                <Reveal key={s.id || s.platform} delay={i * 0.06}>
                  <Tilt
                    as="a"
                    max={9}
                    className="glass card social-card"
                    href={safeUrl(s.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                  >
                    <span className="social-icon">
                      <Icon size={26} />
                    </span>
                    <span className="social-name">{s.platform}</span>
                    <span className="social-host">{hostOf(s.url)}</span>
                  </Tilt>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
