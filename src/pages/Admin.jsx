import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase, PLATFORMS } from '../lib/supabase';
import { normalizeUrl } from '../lib/utils';
import { useLang } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { LangToggle } from '../components/Navbar';
import {
  IconArrow,
  IconEdit,
  IconLock,
  IconLogout,
  IconPlus,
  IconSpinner,
  IconTrash,
  IconCheck,
  PLATFORM_ICONS,
  IconLink,
} from '../components/Icons';

const SESSION_KEY = 'drovex_admin_session';

/* Every write goes through a passphrase-checked Postgres function (see supabase/schema.sql). */
async function callAdmin(fn, pass, args = {}) {
  const { data, error } = await supabase.rpc(fn, { p_passphrase: pass, ...args });
  if (error) throw error;
  return data;
}

/* ------------------------------ Gate ------------------------------ */

function Gate({ onUnlock }) {
  const { t } = useLang();
  const toast = useToast();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    if (!value || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('admin_verify', { p_passphrase: value });
      if (error) throw error;
      if (data === true) {
        toast.success(t('admin.welcome'));
        onUnlock(value);
      } else {
        toast.error(t('admin.invalid'));
        setShake((n) => n + 1);
      }
    } catch (err) {
      toast.error(`${t('admin.connError')}: ${err.message || ''}`.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-gate">
      <motion.form
        key={shake}
        className="glass card gate-card"
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={shake ? { opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, y: 0 }}
        transition={{ duration: shake ? 0.4 : 0.6 }}
      >
        <span className="gate-icon">
          <IconLock size={26} />
        </span>
        <h1>{t('admin.gateTitle')}</h1>
        <p>{t('admin.gateHint')}</p>
        <label className="field">
          <span className="sr-only">{t('admin.passphrase')}</span>
          <input
            className="input"
            type="password"
            autoFocus
            autoComplete="current-password"
            placeholder={t('admin.passphrase')}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button className="btn btn-dark btn-lg btn-block" type="submit" disabled={busy || !value}>
          {busy ? <IconSpinner /> : null}
          {t('admin.unlock')}
        </button>
        <Link className="gate-back" to="/">
          <IconArrow size={16} />
          {t('admin.back')}
        </Link>
      </motion.form>
    </div>
  );
}

/* --------------------------- Projects panel --------------------------- */

const EMPTY = { id: null, name: '', name_ar: '', description: '', description_ar: '', tech: '', live_link: '' };

function ProjectsPanel({ pass }) {
  const { t, pick } = useLang();
  const toast = useToast();
  const { projects, loading, refetch } = useData();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const formRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const editing = Boolean(form.id);

  const startEdit = (p) => {
    setForm({
      id: p.id,
      name: p.name || '',
      name_ar: p.name_ar || '',
      description: p.description || '',
      description_ar: p.description_ar || '',
      tech: (p.tech_used || []).join(', '),
      live_link: p.live_link || '',
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error(t('admin.projects.nameRequired'));
    setSaving(true);
    try {
      await callAdmin('admin_save_project', pass, {
        p_id: form.id,
        p_name: form.name,
        p_name_ar: form.name_ar,
        p_description: form.description,
        p_description_ar: form.description_ar,
        p_tech_used: form.tech.split(',').map((s) => s.trim()).filter(Boolean),
        p_live_link: normalizeUrl(form.live_link),
      });
      toast.success(t('admin.projects.saved'));
      setForm(EMPTY);
      await refetch();
    } catch (err) {
      toast.error(err.message || t('admin.generic'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (confirmId !== id) {
      setConfirmId(id);
      window.setTimeout(() => setConfirmId((cur) => (cur === id ? null : cur)), 4000);
      return;
    }
    setBusyId(id);
    try {
      await callAdmin('admin_delete_project', pass, { p_id: id });
      toast.success(t('admin.projects.deleted'));
      if (form.id === id) setForm(EMPTY);
      await refetch();
    } catch (err) {
      toast.error(err.message || t('admin.generic'));
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  const P = 'admin.projects.';

  return (
    <div className="admin-split">
      <form ref={formRef} className="glass card admin-form" onSubmit={submit}>
        <h2>{editing ? t(`${P}editTitle`) : t(`${P}createTitle`)}</h2>

        <div className="form-grid">
          <label className="field">
            <span>{t(`${P}name`)}</span>
            <input className="input" value={form.name} onChange={set('name')} dir="ltr" required />
          </label>
          <label className="field">
            <span>{t(`${P}nameAr`)}</span>
            <input className="input" value={form.name_ar} onChange={set('name_ar')} dir="rtl" />
          </label>
          <label className="field">
            <span>{t(`${P}desc`)}</span>
            <textarea className="input" rows={4} value={form.description} onChange={set('description')} dir="ltr" />
          </label>
          <label className="field">
            <span>{t(`${P}descAr`)}</span>
            <textarea className="input" rows={4} value={form.description_ar} onChange={set('description_ar')} dir="rtl" />
          </label>
          <label className="field">
            <span>{t(`${P}tech`)}</span>
            <input className="input" value={form.tech} onChange={set('tech')} dir="ltr" placeholder="React, Node.js" />
            <small>{t(`${P}techHint`)}</small>
          </label>
          <label className="field">
            <span>{t(`${P}link`)}</span>
            <input className="input" value={form.live_link} onChange={set('live_link')} dir="ltr" placeholder="https://" inputMode="url" />
          </label>
        </div>

        <div className="form-actions">
          <button className="btn btn-dark" type="submit" disabled={saving}>
            {saving ? <IconSpinner /> : editing ? <IconCheck size={18} /> : <IconPlus size={18} />}
            {editing ? t(`${P}update`) : t(`${P}create`)}
          </button>
          {editing && (
            <button className="btn btn-glass" type="button" onClick={() => setForm(EMPTY)} disabled={saving}>
              {t(`${P}cancel`)}
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        <h2>{t(`${P}listTitle`)}</h2>
        {loading ? (
          <div className="list-loading">
            <IconSpinner size={22} />
          </div>
        ) : projects.length === 0 ? (
          <div className="glass card state-card">
            <p>{t(`${P}empty`)}</p>
          </div>
        ) : (
          <ul className="rows">
            <AnimatePresence initial={false}>
              {projects.map((p) => (
                <motion.li
                  key={p.id}
                  layout
                  className={`glass row ${form.id === p.id ? 'is-editing' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                >
                  <div className="row-main">
                    <strong>{pick(p.name, p.name_ar)}</strong>
                    <span>{(p.tech_used || []).join(' · ') || '—'}</span>
                  </div>
                  <div className="row-actions">
                    <button className="btn btn-glass btn-sm" type="button" onClick={() => startEdit(p)} disabled={busyId === p.id}>
                      <IconEdit size={16} />
                      {t(`${P}edit`)}
                    </button>
                    <button
                      className={`btn btn-sm ${confirmId === p.id ? 'btn-danger' : 'btn-glass'}`}
                      type="button"
                      onClick={() => remove(p.id)}
                      disabled={busyId === p.id}
                    >
                      {busyId === p.id ? <IconSpinner size={16} /> : <IconTrash size={16} />}
                      {confirmId === p.id ? t(`${P}confirm`) : t(`${P}delete`)}
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Social panel ---------------------------- */

function SocialRow({ platform, stored, pass, onSaved }) {
  const { t } = useLang();
  const toast = useToast();
  const [draft, setDraft] = useState(null); // null = untouched
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const Icon = PLATFORM_ICONS[platform.toLowerCase()] || IconLink;
  const value = draft ?? stored;

  const save = useCallback(async () => {
    if (draft === null || saving) return;
    const next = normalizeUrl(draft);
    if (next === (stored || '')) {
      setDraft(null);
      return;
    }
    setSaving(true);
    try {
      await callAdmin('admin_update_social', pass, { p_platform: platform, p_url: next });
      toast.success(`${platform}: ${t('admin.social.saved')}`);
      setDraft(null);
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1600);
      await onSaved();
    } catch (err) {
      toast.error(err.message || t('admin.generic'));
    } finally {
      setSaving(false);
    }
  }, [draft, saving, stored, pass, platform, toast, t, onSaved]);

  return (
    <form
      className="glass row social-row"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <span className="social-icon">
        <Icon size={22} />
      </span>
      <label className="social-field">
        <span>{platform}</span>
        <input
          className="input"
          dir="ltr"
          inputMode="url"
          value={value}
          placeholder={t('admin.social.placeholder')}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
        />
      </label>
      <span className="row-status" aria-hidden="true">
        {saving ? <IconSpinner size={18} /> : justSaved ? <IconCheck size={18} /> : null}
      </span>
    </form>
  );
}

function SocialPanel({ pass }) {
  const { t } = useLang();
  const { social, refetch } = useData();
  const byPlatform = Object.fromEntries(social.map((s) => [s.platform, s.url]));
  const platforms = [...PLATFORMS, ...social.map((s) => s.platform).filter((p) => !PLATFORMS.includes(p))];

  return (
    <div className="admin-narrow">
      <h2>{t('admin.social.title')}</h2>
      <p className="hint">{t('admin.social.hint')}</p>
      <div className="rows">
        {platforms.map((p) => (
          <SocialRow key={p} platform={p} stored={byPlatform[p] || ''} pass={pass} onSaved={refetch} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Page ------------------------------ */

export default function Admin() {
  const { t } = useLang();
  const [pass, setPass] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(sessionStorage.getItem(SESSION_KEY)));
  const [tab, setTab] = useState('projects');

  // Restore a session that was already verified in this browser tab.
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return;
    supabase
      .rpc('admin_verify', { p_passphrase: saved })
      .then(({ data }) => {
        if (data === true) setPass(saved);
        else sessionStorage.removeItem(SESSION_KEY);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const unlock = (value) => {
    sessionStorage.setItem(SESSION_KEY, value);
    setPass(value);
  };
  const lock = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setPass(null);
  };

  if (checking) {
    return (
      <div className="admin-gate">
        <IconSpinner size={28} />
      </div>
    );
  }
  if (!pass) return <Gate onUnlock={unlock} />;

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="container admin-bar-inner">
          <div className="admin-title">
            <img src="/logo-light-sm.jpg" alt="" width="38" height="38" loading="lazy" decoding="async" />
            <div>
              <strong>{t('admin.title')}</strong>
              <span>{t('admin.subtitle')}</span>
            </div>
          </div>
          <div className="admin-bar-actions">
            <LangToggle />
            <Link className="btn btn-glass btn-sm" to="/">
              {t('admin.back')}
            </Link>
            <button className="btn btn-dark btn-sm" type="button" onClick={lock}>
              <IconLogout size={16} />
              {t('admin.lock')}
            </button>
          </div>
        </div>
      </header>

      <main className="container admin-main">
        <div className="tabs" role="tablist">
          {['projects', 'social'].map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              className={`tab ${tab === k ? 'is-active' : ''}`}
              onClick={() => setTab(k)}
            >
              {t(`admin.tabs.${k}`)}
            </button>
          ))}
        </div>
        {tab === 'projects' ? <ProjectsPanel pass={pass} /> : <SocialPanel pass={pass} />}
      </main>
    </div>
  );
}
