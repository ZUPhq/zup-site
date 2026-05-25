"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as THREE from "three";
import { heroScrollState } from "@/hooks/useHeroScroll";
import { useIsMobile } from "@/hooks/useIsMobile";

const LIGHTNING_SVG = "/lightning.svg";
const LOGO_REST_SVG = "/logo-rest.svg";

// Per-orientation layout. Side-by-side wordmark on both, but portrait shrinks
// the bolt as it joins so the pair fits the narrower viewport.
type Layout = {
  lightningStartHeight: number;
  lightningEndHeight: number;
  upHeight: number;
  lightningX: number;
  lightningY: number;
  upX: number;
  upY: number;
  upStartOffsetX: number;
  upStartOffsetY: number;
};

const LANDSCAPE: Layout = {
  lightningStartHeight: 1.65,
  lightningEndHeight: 1.65,
  upHeight: 1.65,
  lightningX: -1.7,
  lightningY: 0,
  upX: 0.65,
  upY: 0,
  upStartOffsetX: 1.5,
  upStartOffsetY: 0,
};

const PORTRAIT: Layout = {
  lightningStartHeight: 1.4,
  lightningEndHeight: 0.65,
  upHeight: 0.65,
  lightningX: -0.68,
  lightningY: 0,
  upX: 0.26,
  upY: 0,
  upStartOffsetX: 0.6,
  upStartOffsetY: 0,
};

// World-unit depth + bevels applied to every extruded SVG so they all read
// with the same 3D thickness regardless of the source SVG dimensions.
const WORLD_DEPTH = 0.03;
const WORLD_BEVEL_THICKNESS = 0.004;
const WORLD_BEVEL_SIZE = 0.002;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function useLayout(): Layout {
  const [isPortrait, setIsPortrait] = useState(false);
  useEffect(() => {
    const update = () => {
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      // Anything narrower than ~1.2:1 falls back to the stacked layout —
      // the side-by-side wordmark needs ~5 world units of horizontal room.
      setIsPortrait(aspect < 1.2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return isPortrait ? PORTRAIT : LANDSCAPE;
}

function useSvgExtrudeGeometry(svgPath: string, targetHeight: number) {
  const data = useLoader(SVGLoader, svgPath);
  const result = useMemo(() => {
    const shapes: THREE.Shape[] = [];
    data.paths.forEach((p) => {
      p.toShapes(true).forEach((s) => shapes.push(s));
    });

    // SVG-space height drives depth/bevel values so they map to fixed
    // world-unit thickness after uniform scaling.
    let minY = Infinity;
    let maxY = -Infinity;
    for (const shape of shapes) {
      for (const p of shape.getPoints()) {
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }
    const svgHeight = Math.max(1, maxY - minY);
    const est = targetHeight / svgHeight;

    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: WORLD_DEPTH / est,
      bevelEnabled: true,
      bevelThickness: WORLD_BEVEL_THICKNESS / est,
      bevelSize: WORLD_BEVEL_SIZE / est,
      bevelSegments: 6,
      curveSegments: 24,
    });
    geo.scale(1, -1, 1);
    geo.computeBoundingBox();

    const box = geo.boundingBox!;
    const c = new THREE.Vector3();
    box.getCenter(c);
    geo.translate(-c.x, -c.y, -c.z);

    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = targetHeight / size.y;

    return { geometry: geo, scale };
  }, [data, targetHeight]);

  // Free the previous geometry's GPU buffers when targetHeight changes.
  useEffect(() => {
    const geo = result.geometry;
    return () => {
      geo.dispose();
    };
  }, [result.geometry]);

  return result;
}

function LightningMesh({ layout }: { layout: Layout }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  // Build the geometry at the END size; the group scales up at p=0 so the
  // bolt is big while spinning, then shrinks to its final size as p→1. This
  // keeps the joined-state depth matching UP!'s depth exactly.
  const { geometry, scale: baseScale } = useSvgExtrudeGeometry(
    LIGHTNING_SVG,
    layout.lightningEndHeight
  );
  const startScaleFactor =
    layout.lightningStartHeight / layout.lightningEndHeight;

  const freeAngleRef = useRef(0);
  const settleStartRef = useRef<number | null>(null);

  useFrame((state, delta) => {
    const p = heroScrollState.progress;
    const grp = groupRef.current;
    if (grp) {
      if (p <= 0.001) {
        freeAngleRef.current += delta * 0.6;
        settleStartRef.current = null;
        grp.rotation.y = freeAngleRef.current;
      } else {
        if (settleStartRef.current === null) {
          const a =
            ((freeAngleRef.current + Math.PI) % (Math.PI * 2)) - Math.PI;
          settleStartRef.current = a;
        }
        const eased = easeInOutCubic(p);
        grp.rotation.y = settleStartRef.current * (1 - eased);
        freeAngleRef.current = grp.rotation.y;
      }
      const eased = easeInOutCubic(p);
      grp.position.x = layout.lightningX * eased;
      grp.position.y = layout.lightningY * eased;
      const sf = startScaleFactor + (1 - startScaleFactor) * eased;
      grp.scale.setScalar(baseScale * sf);
    }

    if (materialRef.current) {
      const t = state.clock.elapsedTime;
      const flicker =
        0.35 + Math.sin(t * 2.1) * 0.15 + Math.sin(t * 5.7) * 0.07;
      materialRef.current.emissiveIntensity = Math.max(0.1, flicker);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          ref={materialRef}
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.4}
          metalness={0.3}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function UpMesh({ layout }: { layout: Layout }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const { geometry, scale } = useSvgExtrudeGeometry(
    LOGO_REST_SVG,
    layout.upHeight
  );

  useFrame((state) => {
    const p = heroScrollState.progress;
    const grp = groupRef.current;
    if (grp) {
      const eased = easeInOutCubic(p);
      const startX = layout.upX + layout.upStartOffsetX;
      const startY = layout.upY + layout.upStartOffsetY;
      grp.position.x = startX + (layout.upX - startX) * eased;
      grp.position.y = startY + (layout.upY - startY) * eased;
    }
    if (materialRef.current) {
      const t = state.clock.elapsedTime;
      // Phase-shifted flicker so bolt and letters don't pulse in lockstep.
      const flicker =
        0.35 +
        Math.sin(t * 2.1 + 1.2) * 0.15 +
        Math.sin(t * 5.7 + 0.7) * 0.07;
      materialRef.current.emissiveIntensity = Math.max(0.1, flicker);
      const visibility = Math.max(0, Math.min(1, (p - 0.15) / 0.6));
      materialRef.current.opacity = visibility;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          ref={materialRef}
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.4}
          metalness={0.3}
          roughness={0.3}
          toneMapped={false}
          transparent
        />
      </mesh>
    </group>
  );
}

// Navbar target — combined logo center moves here and shrinks down so it
// reads as a small wordmark pinned to the top of the viewport.
// NAVBAR_Y must stay in sync with the value used by NavbarChip so the
// glass pill wraps the projected 3D logo position exactly.
const NAVBAR_Y = 1.85;
const NAVBAR_SCALE = 0.1;

function Logo({ layout }: { layout: Layout }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const grp = groupRef.current;
    if (!grp) return;

    const t = heroScrollState.transit;
    const eased = easeInOutCubic(t);
    const scale = 1 - eased * (1 - NAVBAR_SCALE);

    // The visual center of the assembled logo sits between the two meshes.
    const assemblyCenterX = (layout.lightningX + layout.upX) / 2;
    const assemblyCenterY = (layout.lightningY + layout.upY) / 2;

    // Where we want that visual center to land in world space — lerps from
    // the assembled center (transit=0) to (0, NAVBAR_Y) at transit=1.
    const targetX = assemblyCenterX * (1 - eased);
    const targetY = assemblyCenterY * (1 - eased) + NAVBAR_Y * eased;

    // Because the parent group is scaled, mesh-local positions are scaled
    // too. Subtracting scale*assemblyCenter cancels that so the visual center
    // ends up exactly at (targetX, targetY).
    grp.position.x = targetX - scale * assemblyCenterX;
    grp.position.y = targetY - scale * assemblyCenterY;
    grp.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef}>
      <LightningMesh layout={layout} />
      <UpMesh layout={layout} />
    </group>
  );
}

export default function LightningModel() {
  const layout = useLayout();
  const isMobile = useIsMobile();

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      // Cap dpr lower on mobile: high-density phone screens (dpr=3) would
      // otherwise render ~9x as many pixels per frame as a 1x desktop.
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{
        alpha: true,
        antialias: !isMobile,
        powerPreference: "high-performance",
      }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        background: "transparent",
        zIndex: 40,
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -3, -5]} intensity={0.4} />

      <Suspense fallback={null}>
        <Logo layout={layout} />
        <Environment preset="city" />
      </Suspense>

      {/* Bloom is multi-pass full-screen postprocessing — fine on desktop,
          a major frame-time hit on mobile GPUs. Skip it on touch devices. */}
      {!isMobile && (
        <EffectComposer>
          <Bloom
            intensity={0.3}
            luminanceThreshold={0.7}
            luminanceSmoothing={0.6}
            mipmapBlur
            radius={0.6}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
