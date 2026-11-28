// Vanilla three.js host for the cartoon world: one WebGLRenderer + one postprocessing EffectComposer per layer,
// driven directly from Remotion's frame (no React Three Fiber frame loop). Each frame: pose the world, render the
// whole post chain synchronously, then release the delayRender handle so the screenshot sees the finished frame.
// Why: in this render environment the R3F <EffectComposer> never presented its output (the still showed only the
// page background), while a plain renderer.render() worked. Owning the loop removes that ordering problem and keeps
// the same scene code usable from a HyperFrames hf-seek listener.
import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, getInputProps, useCurrentFrame, useVideoConfig } from "remotion";
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, noInkFallback } from "./ink";
import { LensBlur, GrainEffect } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";

/** what a world must offer to be hosted here */
export interface HostedWorld {
  root: THREE.Object3D;
  /** pose everything for frame f; returns the camera's look target (default focus point) */
  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene): THREE.Vector3;
  /** lens blur for frame f: cInf in px at 1080 wide (0 = sharp) and an optional focus point */
  dof(f: number): { cInf: number; focus?: THREE.Vector3 };
  /** colour grade family for frame f */
  grade(f: number): "day" | "golden";
}

type PostToggles = { ink: boolean; lens: boolean; pre: boolean; bloom: boolean; grade: boolean; grain: boolean };
const toggles = (): PostToggles => ({ ink: true, lens: true, pre: true, bloom: true, grade: true, grain: false, ...((getInputProps() as { post?: Partial<PostToggles> }).post ?? {}) });

/** bloom whose MIP chain always starts at 540x960-relative size (see the bridge notes) */
const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

class Host {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.2, 1500);
  composer: EffectComposer;
  lens: LensBlur; grade: GradeEffect; grain: GrainEffect; ink: InkPass;
  private fwd = new THREE.Vector3(); private fpt = new THREE.Vector3();
  constructor(public canvas: HTMLCanvasElement, w: number, h: number, public world: HostedWorld) {
    const on = toggles();
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, stencil: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(w, h, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping; // the composer's ToneMappingEffect does it
    this.scene.add(world.root);
    this.ink = new InkPass(this.scene, this.cam);
    this.lens = new LensBlur({ maxCoC: 24, nearScale: 1.2 });
    this.grade = new GradeEffect(GRADES.day, GRADE_STRENGTH.day);
    this.grain = new GrainEffect({ amount: 0.025, cellPx: 1.5 });
    const ms = (getInputProps() as { msaa?: number }).msaa ?? 4;
    this.composer = new EffectComposer(this.renderer, { multisampling: ms, frameBufferType: THREE.HalfFloatType });
    this.composer.addPass(new RenderPass(this.scene, this.cam));
    if (on.ink) this.composer.addPass(this.ink);
    if (on.lens && on.pre) this.composer.addPass(new EffectPass(this.cam, this.lens.pre));
    if (on.lens) this.composer.addPass(new EffectPass(this.cam, this.lens.main));
    const tail = [on.bloom ? makeBloom() : null, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), on.grade ? this.grade : null, on.grain ? this.grain : null]
      .filter((e): e is NonNullable<typeof e> => !!e);
    this.composer.addPass(new EffectPass(this.cam, ...tail));
    this.composer.setSize(w, h, false);
  }
  draw(f: number) {
    const target = this.world.update(f, this.cam, this.scene);
    noInkFallback(this.world.root);
    const d = this.world.dof(f);
    this.cam.getWorldDirection(this.fwd);
    this.fpt.copy(d.focus ?? target);
    this.lens.focus = Math.max(0.3, this.fpt.sub(this.cam.position).dot(this.fwd));
    this.lens.cInf = d.cInf;
    gradeFor(this.grade, this.world.grade(f));
    this.grain.seed = f;
    this.composer.render();
  }
}

/** one full-frame layer; `make` builds the world once (it may be async: assets) */
export const StageLayer: React.FC<{ make: () => Promise<HostedWorld>; alpha?: number }> = ({ make, alpha = 1 }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const host = useRef<Host | null>(null);
  const ready = useMemo(() => ({ p: null as Promise<HostedWorld> | null }), []);
  useLayoutEffect(() => {
    const h = delayRender("stage frame " + f);
    let alive = true;
    (ready.p ??= make()).then((world) => {
      if (!alive) return;
      if (!host.current) host.current = new Host(ref.current!, width, height, world);
      host.current.draw(f);
      continueRender(h);
    }).catch((e) => { console.error(e); throw e; });
    return () => { alive = false; continueRender(h); };
  }, [f, width, height, make, ready]);
  return (
    <AbsoluteFill style={{ opacity: alpha }}>
      <canvas ref={ref} width={width} height={height} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
