"use client";

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { useIsMobile } from "@/hooks/useIsMobile";

// ShaderGradient props are valid at runtime but the library's TS types are incomplete.
const shaderProps = {
  animate: "on",
  axesHelper: "off",
  brightness: 1,
  cAzimuthAngle: 270,
  cDistance: 0.5,
  cPolarAngle: 180,
  cameraZoom: 25.39,
  color1: "#ffd500",
  color2: "#000000",
  color3: "#ffd500",
  destination: "onCanvas",
  embedMode: "off",
  envPreset: "city",
  format: "gif",
  fov: 45,
  frameRate: 10,
  gizmoHelper: "hide",
  grain: "on",
  lightType: "env",
  pixelDensity: 1,
  positionX: -0.1,
  positionY: 0,
  positionZ: 0,
  range: "disabled",
  rangeEnd: 17.4,
  rangeStart: 8.1,
  reflection: 0.3,
  rotationX: 0,
  rotationY: 130,
  rotationZ: 70,
  shader: "defaults",
  type: "sphere",
  uAmplitude: 3.2,
  uDensity: 1.7,
  uFrequency: 5.5,
  uSpeed: 0.4,
  uStrength: 0.2,
  uTime: 8.1,
  wireframe: false,
};

// Static CSS gradient that approximates the shader's mood (yellow halos on
// near-black) without spinning up a second full-screen WebGL context on
// mobile, where the live shader plus the 3D logo canvas would tank framerate.
const MOBILE_FALLBACK_STYLE: React.CSSProperties = {
  background: [
    "radial-gradient(ellipse 80% 60% at 25% 25%, rgba(255, 213, 0, 0.22), transparent 60%)",
    "radial-gradient(ellipse 70% 65% at 75% 75%, rgba(255, 213, 0, 0.14), transparent 60%)",
    "#0a0a0a",
  ].join(", "),
};

export default function ShaderBackground() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={MOBILE_FALLBACK_STYLE}
      />
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <ShaderGradientCanvas
        style={{ width: "100%", height: "100%" }}
        pixelDensity={1}
        fov={45}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ShaderGradient {...(shaderProps as any)} />
      </ShaderGradientCanvas>
    </div>
  );
}
