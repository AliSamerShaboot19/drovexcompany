import { Suspense, lazy } from 'react';

// three.js is the single heaviest dependency in this app, so it is never
// part of the main bundle: this wrapper pulls it in as its own chunk, only
// once a Logo3D is actually about to render, and shows the flat logo image
// (already needed as the WebGL-less fallback) until that chunk is ready.
const Logo3D = lazy(() => import('./Logo3D'));

export default function Logo3DLazy(props) {
  return (
    <Suspense fallback={<img className="logo3d-fallback logo3d-fallback-loading" src="/logo-light.jpg" alt="drovex" />}>
      <Logo3D {...props} />
    </Suspense>
  );
}
