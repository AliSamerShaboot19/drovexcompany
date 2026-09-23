import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured, PLATFORMS } from '../lib/supabase';
import { sleep, withTimeout } from '../lib/utils';

const DataContext = createContext(null);
const MIN_PRELOAD_MS = 1400;

function sortSocial(rows) {
  const rank = (p) => {
    const i = PLATFORMS.indexOf(p);
    return i === -1 ? 99 : i;
  };
  return [...rows].sort((a, b) => rank(a.platform) - rank(b.platform));
}

export function DataProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [social, setSocial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booted, setBooted] = useState(false);
  const firstLoad = useRef(true);

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('not-configured');
      setLoading(false);
      return;
    }
    if (firstLoad.current) setLoading(true);
    try {
      const [p, s] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('social_links').select('*'),
      ]);
      if (p.error) throw p.error;
      if (s.error) throw s.error;
      setProjects(p.data || []);
      setSocial(sortSocial(s.data || []));
      setError(null);
    } catch (e) {
      console.error('[drovex] data fetch failed', e);
      setError(e?.message || 'fetch-failed');
    } finally {
      firstLoad.current = false;
      setLoading(false);
    }
  }, []);

  // Boot sequence: the preloader waits for a lightweight connection check
  // (max 4s) plus a minimum display time; data continues loading behind it.
  useEffect(() => {
    let alive = true;
    const ping = isSupabaseConfigured
      ? withTimeout(supabase.from('projects').select('id', { count: 'exact', head: true }), 4000).catch(() => null)
      : Promise.resolve(null);
    Promise.all([ping, sleep(MIN_PRELOAD_MS)]).then(() => alive && setBooted(true));
    refetch();
    return () => {
      alive = false;
    };
  }, [refetch]);

  // Live updates whenever rows change in Supabase.
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let channel;
    try {
      channel = supabase
        .channel('drovex-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, refetch)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'social_links' }, refetch)
        .subscribe();
    } catch (e) {
      console.warn('[drovex] realtime unavailable', e);
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [refetch]);

  const value = useMemo(
    () => ({ projects, social, loading, error, booted, refetch }),
    [projects, social, loading, error, booted, refetch]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
};
