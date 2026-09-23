import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useLang } from '../i18n/LanguageContext';

/*
  The drovex mark, rebuilt as a real 3D object:
    • a silver-white open cube frame
    • a glossy black extruded "D" standing on the left face
    • a burst of thin black rods radiating across the right face (with two diagonal braces)
  It sways gently, floats, and leans toward the cursor.
*/
export default function Logo3D({ pulse = false, className = '' }) {
  const { t } = useLang();
  const mountRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      setFailed(true); // no WebGL: fall back to the flat logo image
      return undefined;
    }
    const isNarrow = window.innerWidth < 640;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isNarrow ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

    const disposables = [];
    const track = (o) => {
      disposables.push(o);
      return o;
    };

    /* Reflections: a neutral studio environment gives the chrome and gloss */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(3, 6, 7);
    scene.add(key);
    const rim = new THREE.PointLight(0x22d3ee, 14, 24);
    rim.position.set(-6, 1, 4);
    scene.add(rim);
    const rim2 = new THREE.PointLight(0xf472b6, 12, 24);
    rim2.position.set(6, -2, 5);
    scene.add(rim2);

    /* Materials */
    const beamMat = track(
      new THREE.MeshPhysicalMaterial({ color: 0xf4f5f7, roughness: 0.3, metalness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.25 })
    );
    const blackMat = track(
      new THREE.MeshPhysicalMaterial({ color: 0x060606, roughness: 0.14, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.06 })
    );
    const rodMat = track(new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.35, metalness: 0.5 }));

    const root = new THREE.Group(); // orientation + interaction
    const logo = new THREE.Group(); // float
    root.add(logo);
    scene.add(root);

    /* 1. Cube frame: 12 square beams */
    const T = 0.1;
    const H = 1;
    const L = 2 + T;
    const gx = track(new RoundedBoxGeometry(L, T, T, 3, 0.025));
    const gy = track(new RoundedBoxGeometry(T, L, T, 3, 0.025));
    const gz = track(new RoundedBoxGeometry(T, T, L, 3, 0.025));
    [-1, 1].forEach((a) =>
      [-1, 1].forEach((b) => {
        const mx = new THREE.Mesh(gx, beamMat);
        mx.position.set(0, a * H, b * H);
        const my = new THREE.Mesh(gy, beamMat);
        my.position.set(a * H, 0, b * H);
        const mz = new THREE.Mesh(gz, beamMat);
        mz.position.set(a * H, b * H, 0);
        logo.add(mx, my, mz);
      })
    );

    /* 2. Right face (+x): diagonal braces + radiating rods */
    const braceGeo = track(new RoundedBoxGeometry(0.05, 0.06, Math.SQRT2 * 2, 2, 0.015));
    [Math.PI / 4, -Math.PI / 4].forEach((ang) => {
      const brace = new THREE.Mesh(braceGeo, beamMat);
      brace.position.set(0.92, 0, 0);
      brace.rotation.x = ang;
      logo.add(brace);
    });

    const rodGeo = track(new THREE.CylinderGeometry(0.012, 0.012, 1, 8));
    const RODS = 30;
    for (let i = 0; i < RODS; i++) {
      const jitter = Math.sin(i * 12.9898) * 0.09; // deterministic, uneven spacing
      const a = (i / RODS) * Math.PI * 2 + jitter;
      const dy = Math.sin(a);
      const dz = Math.cos(a);
      const reach = 0.97 / Math.max(Math.abs(dy), Math.abs(dz));
      const rod = new THREE.Mesh(rodGeo, rodMat);
      const w = 0.8 + (i % 3) * 0.35;
      rod.scale.set(w, reach, w);
      rod.position.set(0.985, (dy * reach) / 2, (dz * reach) / 2);
      rod.rotation.x = Math.atan2(dz, dy);
      logo.add(rod);
    }
    const hubGeo = track(new THREE.SphereGeometry(0.06, 20, 20));
    const hub = new THREE.Mesh(hubGeo, blackMat);
    hub.position.set(0.985, 0, 0);
    logo.add(hub);

    /* 3. The "D": extruded, bevelled, glossy black, standing on the left face (+z) */
    const S = 0.22; // stroke thickness
    const D = new THREE.Shape();
    D.moveTo(-0.65, -0.85);
    D.lineTo(-0.65, 0.85);
    D.lineTo(-0.05, 0.85);
    D.absellipse(-0.05, 0, 0.7, 0.85, Math.PI / 2, -Math.PI / 2, true, 0);
    D.lineTo(-0.65, -0.85);
    const hole = new THREE.Path();
    hole.moveTo(-0.65 + S, -0.85 + S);
    hole.lineTo(-0.65 + S, 0.85 - S);
    hole.lineTo(-0.05, 0.85 - S);
    hole.absellipse(-0.05, 0, 0.7 - S, 0.85 - S, Math.PI / 2, -Math.PI / 2, true, 0);
    hole.lineTo(-0.65 + S, -0.85 + S);
    D.holes.push(hole);

    const dGeo = track(
      new THREE.ExtrudeGeometry(D, {
        depth: 0.4,
        curveSegments: 48,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.04,
        bevelSegments: 6,
      })
    );
    const dMesh = new THREE.Mesh(dGeo, blackMat);
    dMesh.position.set(-0.1, 0, 0.95);
    logo.add(dMesh);

    /* Soft floor shadow */
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const g = cv.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(0,0,0,0.38)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const shadowTex = track(new THREE.CanvasTexture(cv));
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowMat = track(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    const shadow = new THREE.Mesh(track(new THREE.PlaneGeometry(5, 5)), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -2.35;
    scene.add(shadow);

    /* Sizing */
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.position.set(0, 0, 10.4 / Math.min(1, camera.aspect));
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    /* Pointer → lean */
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onPointer = (e) => {
      target.y = (e.clientX / window.innerWidth - 0.5) * 0.9;
      target.x = (e.clientY / window.innerHeight - 0.5) * 0.5;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(mount);

    const BASE_X = 0.6155; // isometric tilt: shows the open top
    const BASE_Y = -Math.PI / 4; // D on the left face, burst on the right
    const clock = new THREE.Clock();
    let raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      clock.getDelta();
      const time = clock.elapsedTime;

      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;

      const sway = reduceMotion ? 0 : Math.sin(time * 0.5) * 0.14;
      const bob = reduceMotion ? 0 : Math.sin(time * 0.9);
      root.rotation.y = BASE_Y + sway + current.y;
      root.rotation.x = BASE_X + current.x;
      logo.position.y = bob * 0.07;
      const s = pulse && !reduceMotion ? 1 + Math.sin(time * 2.4) * 0.035 : 1;
      root.scale.setScalar(s);
      shadowMat.opacity = 1 - bob * 0.12;

      renderer.render(scene, camera);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      ro.disconnect();
      io.disconnect();
      disposables.forEach((d) => d.dispose());
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [pulse]);

  return (
    <div ref={mountRef} className={`logo3d ${className}`} role="img" aria-label={t('hero.canvasLabel')}>
      {failed && <img className="logo3d-fallback" src="/logo-light.jpg" alt="drovex" />}
    </div>
  );
}
