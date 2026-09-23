import Reveal from '../components/Reveal';
import Tilt from '../components/Tilt';
import { useLang } from '../i18n/LanguageContext';

function initials(name) {
  return name
    .split(' ')
    .filter((w) => /[A-Za-z\u0600-\u06FF]/.test(w[0]))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

export default function Team() {
  const { t, dict } = useLang();
  const members = dict.team.members;

  return (
    <section id="team" className="section">
      <div className="container">
        <Reveal className="section-head">
          <h2>{t('team.title')}</h2>
          <p>{t('team.sub')}</p>
        </Reveal>

        <div className="team-grid">
          {members.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <Tilt className="glass card member">
                <div className="avatar" aria-hidden="true">
                  <span>{initials(m.name)}</span>
                </div>
                <div className="member-name">
                  <h3>{m.name}</h3>
                  {m.admin && <span className="admin-badge">[{t('team.admin')}]</span>}
                </div>
                <p className="member-role">{m.role}</p>
                {m.skills.length > 0 && (
                  <ul className="chips">
                    {m.skills.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                )}
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
