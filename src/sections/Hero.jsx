import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo3D from '../components/Logo3DLazy';
import Tilt from '../components/Tilt';
import { IconArrow, IconCheck, IconStar } from '../components/Icons';
import { useLang } from '../i18n/LanguageContext';
import { goTo } from '../lib/utils';

const CHIPS = [
  { label: 'React', color: '#22d3ee', cls: 'chip-a' },
  { label: 'Node.js', color: '#fde047', cls: 'chip-b' },
  { label: 'C#', color: '#7c3aed', cls: 'chip-c' },
  { label: 'Telegram Bot API', color: '#f472b6', cls: 'chip-d' },
];

function Stars({ value = 4.5 }) {
  const row = (
    <span className="stars-row">
      {[0, 1, 2, 3, 4].map((i) => (
        <IconStar key={i} size={16} />
      ))}
    </span>
  );
  return (
    <span className="stars" aria-hidden="true">
      <span className="stars-base">{row}</span>
      <span className="stars-fill" style={{ width: `${(value / 5) * 100}%` }}>
        {row}
      </span>
    </span>
  );
}

export default function Hero() {
  const { t, lang } = useLang();
  const words = t('hero.title').split(' ');

  return (
    <section id="top" className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1 className="hero-title" key={lang}>
            {words.map((w, i) => (
              <Fragment key={`${w}-${i}`}>
                <span className="word">
                  <motion.span
                    initial={{ y: '105%' }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.05 + i * 0.07, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {w}
                  </motion.span>
                </span>{' '}
              </Fragment>
            ))}
          </h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
          >
            {t('hero.sub')}
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
          >
            <Tilt max={6} className="tilt-btn">
              <a
                className="btn btn-dark btn-lg"
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  goTo('services');
                }}
              >
                {t('hero.primary')}
                <IconArrow size={18} />
              </a>
            </Tilt>
            <Tilt max={6} className="tilt-btn">
              <Link className="btn btn-glass btn-lg" to="/admin">
                {t('hero.secondary')}
              </Link>
            </Tilt>
          </motion.div>

          <motion.ul
            className="hero-trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <li>
              <span className="tick">
                <IconCheck size={14} />
              </span>
              {t('hero.enterprise')}
            </li>
            <li>
              <span className="tick">
                <IconCheck size={14} />
              </span>
              {t('hero.soc2')}
            </li>
            <li className="rating">
              <Stars value={4.5} />
              <strong>{t('hero.rating')}</strong>
            </li>
          </motion.ul>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Logo3D />
          {CHIPS.map((c) => (
            <span key={c.label} className={`float-chip ${c.cls}`} style={{ '--dot': c.color }} aria-hidden="true">
              {c.label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
