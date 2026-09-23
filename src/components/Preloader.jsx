import { motion } from 'framer-motion';
import AuraBackground from './AuraBackground';
import Logo3D from './Logo3DLazy';
import { useLang } from '../i18n/LanguageContext';

export default function Preloader() {
  const { t } = useLang();
  return (
    <motion.div
      className="preloader"
      role="status"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <AuraBackground fixed={false} />
      <div className="pre-stage">
        <div className="pre-orb" />
        <div className="pre-ring" />
        <div className="pre-ring pre-ring-2" />
        <Logo3D pulse className="pre-3d" />
      </div>
      <div className="pre-word">drovex</div>
      <div className="pre-status">
        <span className="pre-bar" />
        <span>{t('preloader.status')}</span>
      </div>
    </motion.div>
  );
}
