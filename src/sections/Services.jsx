import Reveal from '../components/Reveal';
import Tilt from '../components/Tilt';
import { IconWeb, IconDesktop, IconBot, IconPipeline } from '../components/Icons';
import { useLang } from '../i18n/LanguageContext';

const ICONS = [IconWeb, IconDesktop, IconBot, IconPipeline];

/* Small decorative illustrations (no text, purely visual). */
function VizWeb() {
  return (
    <div className="viz viz-web" aria-hidden="true">
      <div className="vw-bar">
        <i />
        <i />
        <i />
        <b />
      </div>
      <div className="vw-body">
        <div className="vw-hero" />
        <div className="vw-row">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
function VizDesktop() {
  return (
    <div className="viz viz-desk" aria-hidden="true">
      <div className="vd-side">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="vd-main">
        <div className="vd-line" />
        <div className="vd-line" />
        <div className="vd-line short" />
        <div className="vd-chart">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}
function VizBot() {
  return (
    <div className="viz viz-bot" aria-hidden="true">
      <div className="bubble in" />
      <div className="bubble out" />
      <div className="bubble in typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
function VizPipe() {
  return (
    <div className="viz viz-pipe" aria-hidden="true">
      <span className="pn" />
      <span className="pl" />
      <span className="pn pn-mid" />
      <span className="pl" />
      <span className="pn" />
    </div>
  );
}
const VIZ = [VizWeb, VizDesktop, VizBot, VizPipe];

export default function Services() {
  const { t, dict } = useLang();

  return (
    <section id="services" className="section section-tint">
      <div className="container">
        <Reveal className="section-head">
          <h2>{t('services.title')}</h2>
          <p>{t('services.sub')}</p>
        </Reveal>

        <div className="bento">
          {dict.services.items.map((s, i) => {
            const Icon = ICONS[i];
            const Viz = VIZ[i];
            return (
              <Reveal key={s.title} delay={i * 0.07} className={`bento-${i + 1}`}>
                <Tilt className="glass card service" max={4}>
                  <span className="service-icon">
                    <Icon size={26} />
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <Viz />
                </Tilt>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
