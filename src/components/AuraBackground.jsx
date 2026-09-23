import { useEffect, useRef } from 'react';

// Four soft colour blobs (cyan, yellow, pink, purple). Each has an outer
// wrapper that follows the cursor (parallax) and an inner blob that drifts
// on its own CSS animation.
const BLOBS = [
  { cls: 'b-cyan', depth: 70 },
  { cls: 'b-yellow', depth: -50 },
  { cls: 'b-pink', depth: 40 },
  { cls: 'b-purple', depth: -80 },
];

export default function AuraBackground({ fixed = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return; // save the GPU/battery on background tabs
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      el.style.setProperty('--px', cx.toFixed(3));
      el.style.setProperty('--py', cy.toFixed(3));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={`aura ${fixed ? 'aura-fixed' : 'aura-abs'}`} aria-hidden="true">
      {BLOBS.map((b) => (
        <span key={b.cls} className="blob-wrap" style={{ '--depth': b.depth }}>
          <span className={`blob ${b.cls}`} />
        </span>
      ))}
    </div>
  );
}
