// Smoke test: the bridge template's world hosted by the vanilla Stage (no React Three Fiber loop).
import React, { useCallback } from "react";
import * as THREE from "three";
import { Composition, registerRoot, useCurrentFrame } from "remotion";
import { StageLayer, HostedWorld } from "../../videos/ep01/Stage";
import { World, loadKit } from "../../videos/ep01/world";
import { SHOTS, TOTAL, dofAt, shotAt } from "../../videos/ep01/story";

const makeBridge = async (): Promise<HostedWorld> => {
  const w = new World(await loadKit());
  return {
    root: w.root,
    update: (f, cam, scene) => w.update(shotAt(f).id, f, cam, scene),
    dof: (f) => { const d = dofAt(f); return { cInf: d.cInf, focus: d.focus ? new THREE.Vector3(...d.focus(f)) : undefined }; },
    grade: (f) => SHOTS[shotAt(f).id - 1].light,
  };
};
const Check: React.FC = () => {
  useCurrentFrame();
  const make = useCallback(makeBridge, []);
  return <StageLayer make={make} />;
};
const Root: React.FC = () => <Composition id="BridgeCheck" component={Check} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />;
registerRoot(Root);
