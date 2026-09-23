import { useLang } from '../i18n/LanguageContext';

const ITEMS = [
  'React',
  'Node.js',
  'TypeScript',
  'Express',
  'PostgreSQL',
  'Supabase',
  'MongoDB',
  'TailwindCSS',
  'C#',
  'ASP.NET',
  'SQL Server',
  'Telegram Bot API',
];

export default function Marquee() {
  const { t } = useLang();
  const row = [...ITEMS, ...ITEMS];
  return (
    <section className="marquee-section" aria-label={t('marquee.label')}>
      <p className="marquee-label">{t('marquee.label')}</p>
      <div className="marquee">
        <ul className="marquee-track">
          {row.map((name, i) => (
            <li key={i} aria-hidden={i >= ITEMS.length ? 'true' : undefined}>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
