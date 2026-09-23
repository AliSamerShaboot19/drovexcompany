import Reveal from '../components/Reveal';
import Tilt from '../components/Tilt';
import { IconExternal } from '../components/Icons';
import { useData } from '../context/DataContext';
import { useLang } from '../i18n/LanguageContext';
import { safeUrl } from '../lib/utils';

const PALETTES = [
  ['#22d3ee', '#7c3aed'],
  ['#fde047', '#f472b6'],
  ['#f472b6', '#7c3aed'],
  ['#22d3ee', '#fde047'],
];
function palette(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

function SkeletonCard() {
  return (
    <div className="glass card project skeleton-card" aria-hidden="true">
      <div className="sk sk-title" />
      <div className="sk sk-line" />
      <div className="sk sk-line sk-short" />
      <div className="sk-chips">
        <span className="sk sk-chip" />
        <span className="sk sk-chip" />
        <span className="sk sk-chip" />
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { t, pick } = useLang();
  const { projects, loading, error, refetch } = useData();

  return (
    <section id="portfolio" className="section">
      <div className="container">
        <Reveal className="section-head">
          <h2>{t('portfolio.title')}</h2>
          <p>{t('portfolio.sub')}</p>
        </Reveal>

        {loading ? (
          <div className="projects-grid">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error && projects.length === 0 ? (
          <div className="glass card state-card">
            <p>{error === 'not-configured' ? t('portfolio.notConfigured') : t('portfolio.error')}</p>
            {error !== 'not-configured' && (
              <button type="button" className="btn btn-dark btn-sm" onClick={refetch}>
                {t('portfolio.retry')}
              </button>
            )}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass card state-card">
            <p>{t('portfolio.empty')}</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((p, i) => {
              const link = safeUrl(p.live_link);
              return (
                <Reveal key={p.id} delay={(i % 3) * 0.07}>
                  <Tilt className="glass card project">
                    <div
                      className="project-cover"
                      style={{ background: `linear-gradient(135deg, ${palette(p.name)[0]}, ${palette(p.name)[1]})` }}
                      aria-hidden="true"
                    >
                      {p.tech_used?.[0] && <span>{p.tech_used[0]}</span>}
                    </div>
                    <h3>{pick(p.name, p.name_ar)}</h3>
                    <p>{pick(p.description, p.description_ar)}</p>
                    {p.tech_used?.length > 0 && (
                      <ul className="chips">
                        {p.tech_used.map((tech) => (
                          <li key={tech}>{tech}</li>
                        ))}
                      </ul>
                    )}
                    {link && (
                      <a className="project-link" href={link} target="_blank" rel="noopener noreferrer">
                        {t('portfolio.live')}
                        <IconExternal size={16} />
                      </a>
                    )}
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
