import Reveal from '../components/Reveal';
import { useLang } from '../i18n/LanguageContext';

export default function Process() {
  const { t, dict } = useLang();
  return (
    <section id="process" className="section">
      <div className="container">
        <Reveal className="section-head">
          <h2>{t('process.title')}</h2>
          <p>{t('process.sub')}</p>
        </Reveal>
        <ol className="process-grid">
          {dict.process.steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="process-step">
              <div className="glass card">
                <span className="step-no">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
