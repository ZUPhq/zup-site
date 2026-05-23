"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as THREE from "three";

const SVG_PATH = "/lightning.svg";

function LightningMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const data = useLoader(SVGLoader, SVG_PATH);

  const { geometry, scale } = useMemo(() => {
    const shapes: THREE.Shape[] = [];
    data.paths.forEach((p) => {
      p.toShapes(true).forEach((s) => shapes.push(s));
    });

    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 30,
      bevelEnabled: true,
      bevelThickness: 4,
      bevelSize: 2,
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
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 2.2 / maxDim;

    return { geometry: geo, scale: s };
  }, [data]);

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3;
    if (materialRef.current) {
      const t = state.clock.elapsedTime;
      // Two overlapping sine waves → irregular flicker (not robotic pulse)
      const flicker =
        0.35 +
        Math.sin(t * 2.1) * 0.15 +
        Math.sin(t * 5.7) * 0.07;
      materialRef.current.emissiveIntensity = Math.max(0.1, flicker);
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
        />
      </mesh>
    </group>
  );
}

export default function LightningModel() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -3, -5]} intensity={0.4} />

      <Suspense fallback={null}>
        <LightningMesh />
        <Environment preset="city" />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.5}
        rotateSpeed={0.8}
      />

      <EffectComposer>
        <Bloom
          intensity={0.3}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.6}
          mipmapBlur
          radius={0.6}
        />
      </EffectComposer>
    </Canvas>
  );
}
